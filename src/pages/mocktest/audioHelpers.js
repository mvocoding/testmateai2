export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
};

export const getPreferredVoice = (voices) =>
  Array.isArray(voices)
    ? voices.find(
        (voice) =>
          voice &&
          typeof voice.lang === 'string' &&
          voice.lang.includes('en') &&
          (voice.name?.includes('Google') ||
            voice.name?.includes('Natural') ||
            voice.name?.includes('Premium'))
      )
    : undefined;


