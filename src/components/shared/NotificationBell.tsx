import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const { isDark } = useTheme();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (n: Notification) => {
        if (!n.is_read) markAsRead(n.id);
        setIsOpen(false);
        if (n.link) {
            navigate(n.link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-full transition-all ${
                    isDark 
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                    : 'hover:bg-slate-100 text-slate-600 hover:text-primary'
                }`}
            >
                <Bell size={22} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className={`absolute left-0 sm:right-0 sm:left-auto mt-3 w-[350px] sm:w-[400px] rounded-3xl shadow-luxury border overflow-hidden z-50 animate-premium-in origin-top-right ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                }`}>
                    {/* Header */}
                    <div className={`p-4 flex items-center justify-between border-b ${
                        isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50/80'
                    }`}>
                        <div className="flex items-center gap-3">
                            <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>الإشعارات</h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} جديد
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                    className={`p-1.5 rounded-xl transition-all ${
                                        isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' : 'hover:bg-slate-200 text-slate-500 hover:text-emerald-600'
                                    }`}
                                    title="تحديد الكل كمقروء"
                                >
                                    <Check size={18} />
                                </button>
                            )}
                            <button 
                                onClick={() => setIsOpen(false)}
                                className={`p-1.5 rounded-xl transition-all ${
                                    isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                }`}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                                    isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-300'
                                }`}>
                                    <Bell size={28} />
                                </div>
                                <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>لا توجد إشعارات حالياً</p>
                            </div>
                        ) : (
                            <div className="divide-y relative">
                                {isDark ? (
                                    <style>{`.divide-y > * + * { border-color: #334155; }`}</style>
                                ) : (
                                    <style>{`.divide-y > * + * { border-color: #f1f5f9; }`}</style>
                                )}
                                {notifications.map(n => (
                                    <div 
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 flex gap-4 cursor-pointer transition-all ${
                                            !n.is_read 
                                            ? isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'bg-indigo-50/50 hover:bg-indigo-50'
                                            : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                                            isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-100'
                                        }`}>
                                            {n.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm mb-1 truncate ${
                                                isDark 
                                                ? !n.is_read ? 'text-white' : 'text-slate-300'
                                                : !n.is_read ? 'text-slate-900' : 'text-slate-700'
                                            }`}>
                                                {n.title_ar}
                                            </p>
                                            <p className={`text-xs line-clamp-2 leading-relaxed ${
                                                isDark ? 'text-slate-400' : 'text-slate-500'
                                            }`}>
                                                {n.body_ar}
                                            </p>
                                            <p className={`text-[10px] font-bold mt-2 ${
                                                isDark ? 'text-slate-500' : 'text-slate-400'
                                            }`}>
                                                {new Date(n.created_at).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="flex-shrink-0 flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className={`p-3 text-center border-t border-slate-100 ${
                            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'
                        }`}>
                            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                أحدث 50 إشعار
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
