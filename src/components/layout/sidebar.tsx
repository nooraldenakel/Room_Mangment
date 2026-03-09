"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
    LayoutDashboard,
    Users,
    Bed,
    CreditCard,
    Settings,
    PieChart,
    LogOut
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const { t } = useLanguage();

    const links = [
        { name: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("common.students"), href: "/dashboard/students", icon: Users },
        { name: t("common.rooms"), href: "/dashboard/rooms", icon: Bed },
        { name: t("common.payments"), href: "/dashboard/payments", icon: CreditCard },
        { name: t("common.reports"), href: "/dashboard/reports", icon: PieChart },
        { name: t("common.settings"), href: "/dashboard/settings", icon: Settings },
    ]

    return (
        <aside className="w-64 border-r border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 flex-shrink-0 flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0 bg-blue-600">
                        <Image src="/alayen_logo.png" alt="University Logo" fill className="object-contain p-1" />
                    </div>
                    Housing Admin
                </h1>
                <p className="text-xs text-slate-500 mt-1">Management System</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:border-slate-700 dark:hover:text-slate-50 transition-all duration-200 active:scale-[0.98]"
                    >
                        <link.icon className="h-5 w-5" />
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Admin</p>
                    </div>
                </div>
                <form action={logout}>
                    <Button variant="ghost" size="sm" type="submit" className="text-slate-500 hover:text-red-600 px-2">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </aside>
    )
}
