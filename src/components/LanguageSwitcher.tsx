import { useLanguage, SUPPORTED_LANGUAGES } from "utils/translationContext";
import { Globe } from "lucide-react"; 

export const LanguageSwitcher = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div className="relative group z-50 inline-block">
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 transition-colors">
        <Globe size={16} />
        <span className="uppercase">{currentLanguage}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-lg border bg-white shadow-lg group-hover:block max-h-80 overflow-y-auto">
        <div className="py-1">
            {SUPPORTED_LANGUAGES.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${currentLanguage === lang.code ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
