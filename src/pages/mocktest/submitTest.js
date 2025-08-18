import {
  generateSpeakingFeedback,
  generateWritingFeedback,
  generateListeningFeedback,
  generateReadingFeedback,
} from '../../utils';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const derivedPercentageFromBand = (band) => clamp(band * 10, 0, 100);

const buildListeningTasks = (listeningPassages, answers) =>
  listeningPassages
    .filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0)
    .map((p) => {
      const userAnswersById = {};
      p.questions.forEach((q, idx) => {
        const key = `${p.id}-${idx}`;
        const val = answers?.listening?.[key];
        if (val !== undefined) {
          if (Array.isArray(q.options) && q.options.length > 0 && typeof val === 'number') {
            userAnswersById[q.id] = q.options[val];
          } else {
            userAnswersById[q.id] = val;
          }
        }
      });
      const passageMeta = {
        text: p.passage || p.passageText || '',
        title: p.passageTitle || p.title || '',
      };
      const normalizedQs = p.questions.map((q) => ({
        ...q,
        question: q.question || q.text || '',
      }));
      return generateListeningFeedback(passageMeta, normalizedQs, userAnswersById);
    });

const buildReadingTasks = (readingPassages, answers) =>
  readingPassages
    .filter((p) => p && Array.isArray(p.questions) && p.questions.length > 0)
    .map((p) => {
      const userAnswersByIndex = p.questions.map((q, idx) => {
        const key = `${p.id}-${idx}`;
        return answers?.reading?.[key];
      });
      const passageMeta = {
        text: p.passage || p.passageText || '',
        title: p.passageTitle || p.title || '',
      };
      const normalizedQs = p.questions.map((q) => ({
        ...q,
        text: q.text || q.question || '',
        question: q.question || q.text || '',
      }));
      return generateReadingFeedback(passageMeta, normalizedQs, userAnswersByIndex);
    });

const buildSpeakingTasks = (speakingItems, answers) =>
  speakingItems.map((q) => {
    const transcript = (answers?.speaking?.[q.id] || '').toString();
    return generateSpeakingFeedback(q.question || '', transcript);
  });

const buildWritingTasks = (writingItems, answers) =>
  writingItems.map((q) => {
    const essay = (answers?.writing?.[q.id] || '').toString();
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
    return generateWritingFeedback(q.question || q.title || '', essay, wordCount);
  });

const analyzeListening = (feedbacks) => {
  const bands = [];
  const percents = [];
  feedbacks.forEach((fb) => {
    if (!fb) return;
    const bandVal = typeof fb?.overall_score === 'number' ? fb.overall_score : Number(fb?.overall_score) || 0;
    if (!isNaN(bandVal) && bandVal > 0) bands.push(bandVal);
    if (Array.isArray(fb?.question_analysis)) {
      const totalQ = fb.question_analysis.length;
      const correct = fb.question_analysis.filter((qa) => qa.is_correct).length;
      percents.push(totalQ > 0 ? (correct / totalQ) * 100 : 0);
    }
  });
  const band = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : 0;
  const percentage = percents.length > 0 ? percents.reduce((a, b) => a + b, 0) / percents.length : 0;
  return { band, percentage };
};

const averageBand = (feedbacks, key = 'band') => {
  const bands = [];
  feedbacks.forEach((fb) => {
    if (!fb) return;
    const bandVal = typeof fb?.[key] === 'number' ? fb[key] : Number(fb?.[key]) || 0;
    if (!isNaN(bandVal) && bandVal > 0) bands.push(bandVal);
  });
  return bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : 0;
};

const submitMockTest = async ({ questions, answers, onProgress }) => {
  const listeningPassages = Array.isArray(questions.listening) ? questions.listening : [];
  const readingPassages = Array.isArray(questions.reading) ? questions.reading : [];
  const speakingItems = Array.isArray(questions.speaking) ? questions.speaking : [];
  const writingItems = Array.isArray(questions.writing) ? questions.writing : [];

  const listeningTasks = buildListeningTasks(listeningPassages, answers);
  const readingTasks = buildReadingTasks(readingPassages, answers);
  const speakingTasks = buildSpeakingTasks(speakingItems, answers);
  const writingTasks = buildWritingTasks(writingItems, answers);

  const totalTasks =
    listeningTasks.length + readingTasks.length + speakingTasks.length + writingTasks.length;

  const track = (p) =>
    p
      .then((res) => {
        if (onProgress) onProgress();
        return res;
      })
      .catch(() => {
        if (onProgress) onProgress();
        return null;
      });

  const [listeningFbs, readingFbs, speakingFbs, writingFbs] = await Promise.all([
    Promise.all(listeningTasks.map(track)),
    Promise.all(readingTasks.map(track)),
    Promise.all(speakingTasks.map(track)),
    Promise.all(writingTasks.map(track)),
  ]);

  const aiFeedback = {
    listening: (listeningFbs || []).filter(Boolean),
    reading: (readingFbs || []).filter(Boolean),
    speaking: (speakingFbs || []).filter(Boolean),
    writing: (writingFbs || []).filter(Boolean),
  };

  const listeningMetrics = analyzeListening(aiFeedback.listening);
  const readingMetrics = analyzeListening(aiFeedback.reading);
  const speakingBand = averageBand(aiFeedback.speaking, 'band');
  const writingBand = averageBand(aiFeedback.writing, 'overall_score') || averageBand(aiFeedback.writing, 'band');

  const results = {
    listening: {
      percentage: listeningMetrics.percentage || derivedPercentageFromBand(listeningMetrics.band),
      band: listeningMetrics.band || 1.0,
    },
    reading: {
      percentage: readingMetrics.percentage || derivedPercentageFromBand(readingMetrics.band),
      band: readingMetrics.band || 1.0,
    },
    writing: {
      percentage: derivedPercentageFromBand(writingBand),
      band: writingBand || 1.0,
    },
    speaking: {
      percentage: derivedPercentageFromBand(speakingBand),
      band: speakingBand || 1.0,
    },
  };

  results.overall = {
    band: Math.round(((results.listening.band + results.reading.band + results.writing.band + results.speaking.band) / 4) * 2) / 2,
  };

  return { aiFeedback, results, totalTasks };
};

export default submitMockTest;


