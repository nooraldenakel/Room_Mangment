import { cookies } from 'next/headers';
import enTranslations from './en.json';
import arTranslations from './ar.json';

type Language = 'en' | 'ar';

const translations: Record<Language, any> = {
    en: enTranslations,
    ar: arTranslations,
};

function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export async function getTranslation() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('NEXT_LOCALE')?.value as Language) || 'en';

    const t = (key: string): string => {
        const val = getNestedValue(translations[lang], key);
        if (typeof val === 'string') return val;

        const fallback = getNestedValue(translations['en'], key);
        if (typeof fallback === 'string') return fallback;

        return key;
    };

    return { t, lang };
}
