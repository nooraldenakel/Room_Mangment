"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import enTranslations from './en.json';
import arTranslations from './ar.json';

type Language = 'en' | 'ar';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
    en: enTranslations,
    ar: arTranslations,
};

// Simple dot-notation object accessor
function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const LanguageProvider = ({ children, initialLang }: { children: React.ReactNode, initialLang: Language }) => {
    const [lang, setLangState] = useState<Language>(initialLang);

    useEffect(() => {
        // Apply dir and lang to html on mount and when lang changes
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        // Optionally store body font class if needed, or handle via tailwind
    }, [lang]);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        Cookies.set('NEXT_LOCALE', newLang, { expires: 365, path: '/' });
    };

    const t = (key: string): string => {
        const val = getNestedValue(translations[lang], key);
        if (typeof val === 'string') return val;
        // fallback to english if missing in arabic
        const fallback = getNestedValue(translations['en'], key);
        if (typeof fallback === 'string') return fallback;

        return key; // return the key itself if not found anywhere
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
