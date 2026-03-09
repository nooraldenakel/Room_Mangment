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
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function Sidebar() {
    const { t } = useLanguage();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("sidebar_collapsed");
        if (stored) {
            setIsCollapsed(stored === "true");
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem("sidebar_collapsed", String(newState));
            return newState;
        });
    };

    const links = [
        { name: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("common.students"), href: "/dashboard/students", icon: Users },
        { name: t("common.rooms"), href: "/dashboard/rooms", icon: Bed },
        { name: t("common.payments"), href: "/dashboard/payments", icon: CreditCard },
        { name: t("common.reports"), href: "/dashboard/reports", icon: PieChart },
        { name: t("common.settings"), href: "/dashboard/settings", icon: Settings },
    ]

    return (
        <aside className={`border-r border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 flex-shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-20" : "w-64"}`}>
            {isMounted && (
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3.5 top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:text-slate-100 transition-transform hover:scale-105 active:scale-95"
                    title={isCollapsed ? t("common.expand", "Expand") : t("common.collapse", "Collapse")}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            )}

            <div className={`p-6 border-b border-slate-200 dark:border-slate-800 flex items-center h-[81px] overflow-hidden ${isCollapsed ? "justify-center px-0" : ""}`}>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
                    <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0 bg-blue-600">
                        <Image src="/alayen_logo.png" alt="University Logo" fill className="object-contain p-1" />
                    </div>
                    <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                        <span>Housing Admin</span>
                        <span className="text-xs font-normal text-slate-500 mt-0.5">Management System</span>
                    </div>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        title={isCollapsed ? link.name : undefined}
                        className={`group flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-slate-700 border border-transparent hover:bg-slate-50 hover:border-slate-200/60 hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:border-slate-800/60 dark:hover:text-slate-50 transition-all duration-200 active:scale-[0.98] ${isCollapsed ? "px-0 justify-center" : "px-3"}`}
                    >
                        <link.icon className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} />
                        <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                            {link.name}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className={`p-4 border-t border-slate-200 dark:border-slate-800 flex items-center ${isCollapsed ? "flex-col justify-center gap-4" : "justify-between"}`}>
                <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm flex-shrink-0">
                        AD
                    </div>
                    <div className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                        <p className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">Admin</p>
                    </div>
                </div>
                <form action={logout}>
                    <Button 
                        variant="ghost" 
                        size={isCollapsed ? "default" : "sm"}
                        type="submit" 
                        title={isCollapsed ? t("common.logout", "Log out") : undefined}
                        className={`text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 ${isCollapsed ? "p-2 h-10 w-10 rounded-full" : "px-2"}`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                    </Button>
                </form>
            </div>
        </aside>
    )
}
