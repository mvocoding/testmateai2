import React, { useState } from 'react';

const READING_PASSAGES = {
  multipleChoice: {
    name: 'Multiple Choice',
    description: 'Choose the best answer from given options',
    passages: [
      {
        id: 1,
        title: 'Honeybees',
        passage: `The honeybee is a remarkable insect known for its role in pollination and for producing honey and beeswax. Honeybees live in well-organized colonies and communicate with each other through a unique dance language. Their work is essential for the growth of many crops and wild plants. These social insects have a complex hierarchy with a queen, workers, and drones, each playing specific roles in the colony's survival.`,
        questions: [
          {
            text: 'What is one important role of the honeybee?',
            options: [
              'They make silk for clothing.',
              'They pollinate plants and crops.',
              'They eat harmful insects.',
              'They live alone in the wild.',
            ],
            correct: 1,
          },
          {
            text: 'How do honeybees communicate with each other?',
            options: [
              'Through vocal sounds',
              'Through a unique dance language',
              'Through chemical signals only',
              'Through physical contact',
            ],
            correct: 1,
          },
        ],
      },
      {
        id: 2,
        title: 'Solar Energy',
        passage: `Solar energy is one of the most abundant and clean sources of renewable energy available on Earth. Solar panels convert sunlight directly into electricity through a process called the photovoltaic effect. This technology has advanced significantly over the past few decades, making solar power more efficient and affordable. Many countries are now investing heavily in solar infrastructure to reduce their dependence on fossil fuels and combat climate change.`,
        questions: [
          {
            text: 'How do solar panels generate electricity?',
            options: [
              'By burning fossil fuels',
              'Through the photovoltaic effect',
              'By using wind power',
              'Through nuclear reactions',
            ],
            correct: 1,
          },
          {
            text: 'Why are countries investing in solar energy?',
            options: [
              'To increase fossil fuel use',
              'To reduce dependence on fossil fuels',
              'To create more pollution',
              'To make energy more expensive',
            ],
            correct: 1,
          },
        ],
      },
      {
        id: 3,
        title: 'Ocean Conservation',
        passage: `The world's oceans cover more than 70% of the Earth's surface and are home to millions of species. However, marine ecosystems are facing unprecedented threats from pollution, overfishing, and climate change. Plastic waste in particular has become a major problem, with millions of tons entering the ocean each year. Conservation efforts are crucial to protect these vital ecosystems and the species that depend on them.`,
        questions: [
          {
            text: 'What percentage of Earth is covered by oceans?',
            options: [
              'More than 50%',
              'More than 70%',
              'More than 90%',
              'Less than 30%',
            ],
            correct: 1,
          },
          {
            text: 'What is a major threat to marine ecosystems?',
            options: [
              'Too much sunlight',
              'Plastic waste pollution',
              'Too many fish',
              'Clean water',
            ],
            correct: 1,
          },
        ],
      },
    ],
  },
  trueFalse: {
    name: 'True / False / Not Given',
    description: 'Determine if statements are true, false, or not mentioned',
    passages: [
      {
        id: 1,
        title: 'Climate Change',
        passage: `Climate change is affecting global weather patterns. Scientists have observed increased temperatures worldwide, leading to more extreme weather events. Some regions are experiencing longer droughts, while others face increased rainfall and flooding. The melting of polar ice caps is contributing to rising sea levels, which threatens coastal communities around the world. Research indicates that human activities, particularly the burning of fossil fuels, are the primary drivers of these changes.`,
        questions: [
          {
            text: 'Global temperatures have increased in recent years.',
            options: ['True', 'False', 'Not Given'],
            correct: 0,
          },
          {
            text: 'All regions are experiencing drought conditions.',
            options: ['True', 'False', 'Not Given'],
            correct: 1,
          },
          {
            text: 'Scientists use satellites to monitor climate change.',
            options: ['True', 'False', 'Not Given'],
            correct: 2,
          },
        ],
      },
      {
        id: 2,
        title: 'Space Exploration',
        passage: `Space exploration has advanced significantly since the first moon landing in 1969. Modern spacecraft can travel much faster and carry more sophisticated equipment than early missions. Private companies are now developing reusable rockets that can land vertically, reducing the cost of space travel. Scientists believe that Mars could potentially support human life in the future, though significant challenges remain.`,
        questions: [
          {
            text: 'The first moon landing occurred in 1969.',
            options: ['True', 'False', 'Not Given'],
            correct: 0,
          },
          {
            text: 'All modern spacecraft are reusable.',
            options: ['True', 'False', 'Not Given'],
            correct: 1,
          },
          {
            text: 'Mars has been confirmed to support human life.',
            options: ['True', 'False', 'Not Given'],
            correct: 1,
          },
        ],
      },
      {
        id: 3,
        title: 'Artificial Intelligence',
        passage: `Artificial intelligence has become increasingly prevalent in modern technology. AI systems can now perform tasks that were once thought to require human intelligence, such as recognizing speech, translating languages, and playing complex games. However, concerns have been raised about the potential impact of AI on employment and privacy. Many experts believe that AI will create new job opportunities while eliminating others.`,
        questions: [
          {
            text: 'AI can recognize human speech.',
            options: ['True', 'False', 'Not Given'],
            correct: 0,
          },
          {
            text: 'AI has completely replaced human workers in all industries.',
            options: ['True', 'False', 'Not Given'],
            correct: 1,
          },
          {
            text: 'AI will only eliminate jobs, not create new ones.',
            options: ['True', 'False', 'Not Given'],
            correct: 1,
          },
        ],
      },
    ],
  },
  yesNo: {
    name: 'Yes / No / Not Given',
    description: 'Answer yes, no, or not given based on the passage',
    passages: [
      {
        id: 1,
        title: 'Great Barrier Reef',
        passage: `The Great Barrier Reef is the world's largest coral reef system. It is home to thousands of marine species and is a popular tourist destination. However, it faces threats from climate change and pollution. Conservation efforts are ongoing to protect this natural wonder.`,
        questions: [
          {
            text: 'Is the Great Barrier Reef the largest coral reef system?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 0,
          },
          {
            text: 'Are there conservation efforts to protect the reef?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 0,
          },
          {
            text: 'Is the reef located in the Pacific Ocean?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 2,
          },
        ],
      },
      {
        id: 2,
        title: 'Electric Vehicles',
        passage: `Electric vehicles are becoming increasingly popular as people seek more environmentally friendly transportation options. These vehicles produce zero emissions during operation and can be charged using renewable energy sources. Many governments are offering incentives to encourage the adoption of electric vehicles.`,
        questions: [
          {
            text: 'Do electric vehicles produce emissions during operation?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 1,
          },
          {
            text: 'Are governments providing incentives for electric vehicles?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 0,
          },
          {
            text: 'Are all electric vehicles more expensive than gasoline cars?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 2,
          },
        ],
      },
      {
        id: 3,
        title: 'Remote Work',
        passage: `Remote work has become much more common since the COVID-19 pandemic. Many companies have found that employees can be just as productive when working from home. This shift has led to changes in office space requirements and commuting patterns.`,
        questions: [
          {
            text: 'Did remote work become more common after COVID-19?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 0,
          },
          {
            text: 'Are all companies requiring employees to return to offices?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 2,
          },
          {
            text: 'Has remote work affected commuting patterns?',
            options: ['Yes', 'No', 'Not Given'],
            correct: 0,
          },
        ],
      },
    ],
  },
  matching: {
    name: 'Matching',
    description: 'Match headings, information, or features',
    passages: [
      {
        id: 1,
        title: 'Energy Sources',
        passage: `A) Solar energy is renewable and environmentally friendly. B) Wind power requires large turbines and open spaces. C) Hydroelectric power uses flowing water to generate electricity. D) Nuclear power produces large amounts of energy but creates radioactive waste.`,
        questions: [
          {
            text: 'Match each energy source with its main characteristic:',
            options: [
              'Solar - Renewable and clean',
              'Wind - Requires turbines',
              'Hydroelectric - Uses water flow',
              'Nuclear - Produces waste',
            ],
            correct: [0, 1, 2, 3],
            matching: true,
          },
        ],
      },
      {
        id: 2,
        title: 'Transportation Methods',
        passage: `A) Bicycles are human-powered and environmentally friendly. B) Trains can carry many passengers efficiently. C) Airplanes travel at high speeds over long distances. D) Ships transport large cargo across oceans.`,
        questions: [
          {
            text: 'Match each transportation method with its main feature:',
            options: [
              'Bicycle - Human-powered',
              'Train - Carries many passengers',
              'Airplane - High speed',
              'Ship - Large cargo transport',
            ],
            correct: [0, 1, 2, 3],
            matching: true,
          },
        ],
      },
      {
        id: 3,
        title: 'Food Groups',
        passage: `A) Fruits provide vitamins and natural sugars. B) Vegetables are rich in fiber and minerals. C) Proteins help build and repair body tissues. D) Grains provide carbohydrates for energy.`,
        questions: [
          {
            text: 'Match each food group with its main benefit:',
            options: [
              'Fruits - Vitamins and sugars',
              'Vegetables - Fiber and minerals',
              'Proteins - Tissue building',
              'Grains - Energy from carbs',
            ],
            correct: [0, 1, 2, 3],
            matching: true,
          },
        ],
      },
    ],
  },
  completion: {
    name: 'Sentence Completion',
    description: 'Complete sentences with words from the passage',
    passages: [
      {
        id: 1,
        title: 'Human Brain',
        passage: `The human brain contains approximately 86 billion neurons. These neurons communicate through electrical and chemical signals. The brain is responsible for all our thoughts, emotions, and actions. It continues to develop throughout our lives.`,
        questions: [
          {
            text: 'Complete the sentence: The human brain contains about _____ billion neurons.',
            answer: '86',
            type: 'completion',
          },
          {
            text: 'Neurons communicate through _____ and chemical signals.',
            answer: 'electrical',
            type: 'completion',
          },
        ],
      },
      {
        id: 2,
        title: 'Photosynthesis',
        passage: `Photosynthesis is the process by which plants convert sunlight into energy. During this process, plants take in carbon dioxide and release oxygen. The green pigment chlorophyll captures light energy and converts it into chemical energy. This process is essential for life on Earth.`,
        questions: [
          {
            text: 'Plants convert _____ into energy during photosynthesis.',
            answer: 'sunlight',
            type: 'completion',
          },
          {
            text: 'The green pigment _____ captures light energy.',
            answer: 'chlorophyll',
            type: 'completion',
          },
        ],
      },
      {
        id: 3,
        title: 'Water Cycle',
        passage: `The water cycle is a continuous process that moves water around the Earth. Water evaporates from oceans and lakes, forming clouds in the atmosphere. When conditions are right, the water falls back to Earth as precipitation. This cycle is crucial for maintaining life on our planet.`,
        questions: [
          {
            text: 'Water _____ from oceans and lakes to form clouds.',
            answer: 'evaporates',
            type: 'completion',
          },
          {
            text: 'Water falls back to Earth as _____.',
            answer: 'precipitation',
            type: 'completion',
          },
        ],
      },
    ],
  },
  diagram: {
    name: 'Diagram Labeling',
    description: 'Label parts of a diagram using information from the text',
    passages: [
      {
        id: 1,
        title: 'Water Cycle',
        passage: `The water cycle consists of four main stages: evaporation, condensation, precipitation, and collection. Water evaporates from oceans and lakes, condenses into clouds, falls as rain or snow, and collects back into water bodies.`,
        questions: [
          {
            text: 'Label the water cycle stages:',
            options: [
              'Evaporation',
              'Condensation',
              'Precipitation',
              'Collection',
            ],
            correct: [0, 1, 2, 3],
            type: 'diagram',
          },
        ],
      },
      {
        id: 2,
        title: 'Plant Structure',
        passage: `A typical plant has several main parts: roots anchor the plant and absorb water, stems provide support and transport nutrients, leaves perform photosynthesis, and flowers produce seeds for reproduction.`,
        questions: [
          {
            text: 'Label the plant parts:',
            options: ['Roots', 'Stems', 'Leaves', 'Flowers'],
            correct: [0, 1, 2, 3],
            type: 'diagram',
          },
        ],
      },
      {
        id: 3,
        title: 'Solar System',
        passage: `The solar system consists of the Sun at the center, with planets orbiting around it. The inner planets are Mercury, Venus, Earth, and Mars. The outer planets are Jupiter, Saturn, Uranus, and Neptune.`,
        questions: [
          {
            text: 'Label the inner planets:',
            options: ['Mercury', 'Venus', 'Earth', 'Mars'],
            correct: [0, 1, 2, 3],
            type: 'diagram',
          },
        ],
      },
    ],
  },
  shortAnswer: {
    name: 'Short Answer Questions',
    description: 'Answer questions briefly using words from the passage',
    passages: [
      {
        id: 1,
        title: 'Internet History',
        passage: `The Internet was developed in the 1960s as a military project called ARPANET. It was designed to allow computers to communicate even if some connections were destroyed. Today, the Internet connects billions of people worldwide.`,
        questions: [
          {
            text: 'What was the original name of the Internet?',
            answer: 'ARPANET',
            type: 'shortAnswer',
          },
          {
            text: 'When was the Internet first developed?',
            answer: '1960s',
            type: 'shortAnswer',
          },
        ],
      },
      {
        id: 2,
        title: 'DNA Structure',
        passage: `DNA, or deoxyribonucleic acid, is the molecule that carries genetic information in living organisms. It was discovered by James Watson and Francis Crick in 1953. DNA has a double helix structure and contains four nucleotide bases: adenine, thymine, guanine, and cytosine.`,
        questions: [
          {
            text: 'Who discovered the structure of DNA?',
            answer: 'James Watson and Francis Crick',
            type: 'shortAnswer',
          },
          {
            text: 'What year was DNA structure discovered?',
            answer: '1953',
            type: 'shortAnswer',
          },
        ],
      },
      {
        id: 3,
        title: 'Mount Everest',
        passage: `Mount Everest is the highest peak in the world, standing at 8,848 meters above sea level. It is located in the Himalayas on the border between Nepal and China. The first successful ascent was made by Sir Edmund Hillary and Tenzing Norgay in 1953.`,
        questions: [
          {
            text: 'What is the height of Mount Everest?',
            answer: '8,848 meters',
            type: 'shortAnswer',
          },
          {
            text: 'Who made the first successful ascent?',
            answer: 'Sir Edmund Hillary and Tenzing Norgay',
            type: 'shortAnswer',
          },
        ],
      },
    ],
  },
};

const Reading = () => {
  const [selectedType, setSelectedType] = useState('multipleChoice');
  const [selectedPassage, setSelectedPassage] = useState(0); // Index of current passage
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const currentType = READING_PASSAGES[selectedType];
  const currentPassage = currentType.passages[selectedPassage];
  const currentQuestions = currentPassage.questions;

  // Debug logging to see if state is changing
  console.log('Selected type:', selectedType);
  console.log('Selected passage:', selectedPassage);
  console.log('Current passage title:', currentPassage.title);
  console.log('Current questions:', currentQuestions.length);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setAnswers({});
    setSubmitted(false);
  };

  // Removed handleNextQuestion and all references to currentQuestion and setSelected

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Reading Test
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(READING_PASSAGES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => {
                  console.log('Button clicked:', key);
                  setSelectedType(key);
                  setSelectedPassage(0); // Reset to first passage
                  setAnswers({});
                  setSubmitted(false);
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                  selectedType === key
                    ? 'bg-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{type.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex gap-8">
        {/* Main content: passage and questions */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 min-h-[500px] flex flex-col md:flex-row gap-8">
          {/* Passage on the left */}
          <div className="md:w-2/5 w-full flex flex-col justify-start">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-teal-700 mb-2 transition-all duration-300">
                {currentPassage.title}
              </h2>
              <p className="text-gray-600 text-sm">{currentType.description}</p>
            </div>
            <div
              key={`${selectedType}-${selectedPassage}`}
              className="text-gray-800 text-lg leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 animate-pulse"
            >
              {currentPassage.passage}
            </div>
          </div>
          {/* Questions in the center */}
          <div
            key={`${selectedType}-${selectedPassage}`}
            className="md:w-3/5 w-full flex flex-col justify-start"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {currentQuestions.map((q, idx) => (
                <div key={idx} id={`question-${idx}`} className="mb-4">
                  <div className="font-semibold text-gray-700 mb-2">
                    {q.text}
                  </div>
                  <div className="flex flex-col gap-3">
                    {q.options ? (
                      q.options.map((option, oidx) => (
                        <label
                          key={oidx}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                            answers[idx] === oidx
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-gray-50 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`reading-question-${idx}`}
                            value={oidx}
                            checked={answers[idx] === oidx}
                            onChange={() =>
                              setAnswers({ ...answers, [idx]: oidx })
                            }
                            className="accent-primary-600 w-5 h-5"
                            required
                          />
                          <span className="text-gray-800 text-base">
                            {option}
                          </span>
                        </label>
                      ))
                    ) : (
                      <input
                        type="text"
                        value={answers[idx] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
                        placeholder="Type your answer..."
                        required
                      />
                    )}
                  </div>
                  {/* Show feedback if submitted */}
                  {submitted &&
                    q.options &&
                    (answers[idx] === q.correct ? (
                      <div className="text-green-700 font-bold text-lg mt-2">
                        Correct! 🎉
                      </div>
                    ) : (
                      <div className="text-red-600 font-bold text-lg mt-2">
                        Incorrect. The correct answer is:{' '}
                        <span className="underline">
                          {q.options[q.correct]}
                        </span>
                      </div>
                    ))}
                  {submitted && !q.options && (
                    <div className="text-green-700 font-bold text-lg mt-2">
                      Answer submitted! Check with your teacher or study
                      materials.
                    </div>
                  )}
                </div>
              ))}
              {!submitted && (
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
                  disabled={currentQuestions.some((q, idx) =>
                    q.options ? answers[idx] == null : !answers[idx]
                  )}
                >
                  Submit All
                </button>
              )}
              {submitted && (
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
                >
                  Try Again
                </button>
              )}
            </form>
          </div>
        </div>
        {/* Sidebar for passage navigation on the right */}
        <div key={`sidebar-${selectedType}`} className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">
              {currentType.name} Passages
            </div>
            {currentType.passages.map((passage, idx) => (
              <button
                key={`${selectedType}-passage-${idx}`}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                  selectedPassage === idx
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                }`}
                onClick={() => {
                  setSelectedPassage(idx);
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                {passage.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reading;
