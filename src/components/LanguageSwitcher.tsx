"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        >
            <Globe className="h-4 w-4" />
            <span>{lang === 'en' ? 'AR' : 'EN'}</span>
            <span className="sr-only">Toggle Language</span>
        </Button>
    )
}
