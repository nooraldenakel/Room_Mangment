"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, AlertCircle } from "lucide-react"
import { login, signup } from "@/app/actions/auth"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <form className="space-y-5 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both" action={login}>
            {error && (
                <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 backdrop-blur-md border border-red-100 dark:border-red-800/50">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span className="leading-snug">{error}</span>
                </div>
            )}

            <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <Input type="email" name="email" placeholder="admin@housing.edu" defaultValue="admin@housing.edu" className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl" required />
            </div>
            <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                </div>
                <Input type="password" name="password" defaultValue="password123" className="h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl" required />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold mt-8 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5">
                Sign In to Dashboard
            </Button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden relative">

            {/* Left Decorative Section */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-end p-12 justify-start bg-slate-900">
                {/* Peaceful Management Gradient Background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 animate-in fade-in duration-1000">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.15),transparent_50%)]" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.15),transparent_50%)]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent z-10" />
                <div className="relative z-20 w-fit animate-in fade-in slide-in-from-left-8 duration-1000 delay-500 fill-mode-both">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md mb-4 px-3 py-1 text-sm">
                        Premium Housing Portal
                    </Badge>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Seamless living.<br className="hidden md:block" /> Effortless management.
                    </h2>
                    <p className="text-lg text-slate-200 font-medium max-w-md drop-shadow">
                        An integrated ecosystem designed to perfect the resident experience and optimize faculty workflows.
                    </p>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative animate-in fade-in duration-700">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-left mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 shadow-lg shadow-black/10 bg-blue-600">
                                <Image src="/alayen_logo.png" alt="University Logo" fill className="object-contain p-1.5" />
                            </div>
                            <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Housing Admin</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Enter your credentials to access the secure administrative dashboard.</p>
                    </div>

                    <div className="p-8 sm:p-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
                        <Suspense fallback={<div className="h-[250px] flex items-center justify-center text-sm text-slate-500 animate-pulse">Initializing securing connection...</div>}>
                            <LoginForm />
                        </Suspense>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-400 animate-in fade-in duration-1000 delay-700 fill-mode-both">
                        <p>Housing Management System &copy; {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
