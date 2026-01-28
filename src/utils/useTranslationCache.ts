export const useTranslationCache = () => {
  const getCached = (text: string, targetLang: string) => {
    try {
      const key = `trans_${targetLang}_${text}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.original === text) return data.translated;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  const setCached = (text: string, targetLang: string, translated: string) => {
    try {
      const key = `trans_${targetLang}_${text}`;
      localStorage.setItem(key, JSON.stringify({
        original: text,
        translated: translated,
        timestamp: Date.now()
      }));
    } catch (e) { console.error(e); }
  };

  return { getCached, setCached };
};
