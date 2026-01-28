import { useState, useEffect } from "react";
import { useLanguage } from "utils/translationContext";

export const Translate = ({ children, lang }: { children: string; lang?: string }) => {
  const { currentLanguage, translate } = useLanguage();
  const [translated, setTranslated] = useState(children);
  const targetLang = lang || currentLanguage;

  useEffect(() => {
    if (targetLang === "en") {
      setTranslated(children);
      return;
    }
    
    let isMounted = true;
    
    // Reset to original while loading/if language changes back to en
    // But we already handled 'en' above.
    
    translate(children, targetLang).then(res => {
      if (isMounted) setTranslated(res);
    });
    
    return () => { isMounted = false; };
  }, [children, targetLang, translate]);

  return <>{translated}</>;
};
