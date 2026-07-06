import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
    totalXP: number;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const CourseHeaderNav: React.FC<HeaderProps> = ({ totalXP, sidebarOpen, setSidebarOpen }) => {
    return (
        <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Back */}
                    <div className="flex items-center gap-4">
                        <Link to="/student-dashboard" className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors hidden md:block">
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white text-lg font-black">KT</span>
                            </div>
                            <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                                Sadeem
                            </h1>
                        </Link>
                    </div>

                    {/* Stats & Toggles */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 px-4 py-2 rounded-xl shadow-inner">
                            <Star size={18} className="text-amber-500 fill-amber-500" />
                            <span className="font-black text-amber-700">{totalXP} XP</span>
                        </div>

                        <Link
                            to="/student-dashboard"
                            className="hidden md:block bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition text-sm"
                        >
                            لوحة التحكم
                        </Link>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default CourseHeaderNav;
