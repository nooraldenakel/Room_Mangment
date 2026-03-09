import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center flex-1">
                {/* Search removed by user request */}
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggle />
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-950"></span>
                </button>
            </div>
        </header>
    )
}
