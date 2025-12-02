"use client";

import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const menuItems = [
        { label: 'Projects', href: '/dashboard' },
        { label: 'Messages', href: '/dashboard' }, // Placeholder
        { label: 'Finances', href: '/finances' },
        { label: 'Settings', href: '/profile' },
    ];

    if (user?.role === 'ADMIN') {
        menuItems.push({ label: 'Admin Panel', href: '/admin' });
    }

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6"
                    >
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6 items-center justify-center flex-1">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-3xl font-bold text-white hover:text-blue-400 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: menuItems.length * 0.1 }}
                                onClick={() => auth.signOut().then(() => window.location.href = '/login')}
                                className="text-xl font-medium text-red-400 hover:text-red-300 transition-colors mt-8"
                            >
                                Sign Out
                            </motion.button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
