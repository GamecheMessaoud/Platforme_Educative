import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, BookOpen, TrendingUp, Star } from 'lucide-react';
import { getTeacherStudents } from '../../services/teacherService';
import { useTheme } from '../../context/ThemeContext';
import Loading from '../Loading';

const StudentsTab: React.FC = () => {
    const { isDark } = useTheme();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await getTeacherStudents();

                // Group students by email
                const groupedStudents = data.reduce((acc: any[], curr: any) => {
                    const existing = acc.find(s => s.email === curr.email);
                    if (existing) {
                        existing.courses.push({ name: curr.course, progress: curr.progress });
                        // Recalculate average progress and total XP
                        existing.xp += curr.xp;
                        existing.progress = Math.round(
                            existing.courses.reduce((sum: number, c: any) => sum + parseInt(c.progress || '0', 10), 0) / existing.courses.length
                        );
                    } else {
                        acc.push({
                            ...curr,
                            courses: [{ name: curr.course, progress: curr.progress }]
                        });
                    }
                    return acc;
                }, []);

                setStudents(groupedStudents);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courses.some((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading && students.length === 0) return <Loading />;

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            {/* Header */}
            <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100/50 rounded-xl">
                        <Users className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${textMain}`}>قائمة الطلاب</h2>
                        <p className={`text-sm ${muted} font-medium`}>تابع تقدم طلابك في جميع دوراتك</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="بحث عن طالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 text-sm border outline-none rounded-xl focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                    />
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={16} />
                </div>
            </div>

            {/* Students List */}
            <div className={`rounded-[2.5rem] border overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                <th className={`p-5 text-sm font-black ${textMain}`}>الطالب</th>
                                <th className={`p-5 text-sm font-black ${textMain}`}>الدورة</th>
                                <th className={`p-5 text-sm font-black ${textMain}`}>التقدم</th>
                                <th className={`p-5 text-sm font-black ${textMain}`}>XP</th>
                                <th className={`p-5 text-sm font-black ${textMain}`}>الحالة</th>
                                <th className={`p-5 text-sm font-black ${textMain}`}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-500 font-bold">
                                        لا يوجد طلاب مطابقين للبحث.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.enrollment_id} className={`${isDark ? 'hover:bg-slate-700/20' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black">
                                                    {student.name[0]}
                                                </div>
                                                <div>
                                                    <div className={`font-black text-sm ${textMain}`}>{student.name}</div>
                                                    <div className={`text-[10px] ${muted} flex items-center gap-1`}>
                                                        <Mail size={10} /> {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} className="text-emerald-500" />
                                                {student.courses.length > 1 ? (
                                                    <select className={`text-xs font-bold border rounded-lg p-1 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                        {student.courses.map((c: any, idx: number) => (
                                                            <option key={idx} value={c.name}>{c.name} ({c.progress || 0}%)</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`text-xs font-bold ${textMain}`}>{student.courses[0].name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1 w-24">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-emerald-500">{student.progress}%</span>
                                                </div>
                                                <div className={`h-1.5 w-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-xs font-black text-amber-500 flex items-center gap-1">
                                                <Star size={14} fill="currentColor" /> {student.xp}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${student.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : student.status === 'completed'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {student.status === 'active' ? 'نشط' : student.status === 'completed' ? 'مكتمل' : 'منقطع'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button className={`p-2 rounded-xl border ${isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-400' : 'border-slate-100 hover:bg-slate-100 text-slate-500'} transition-all`}>
                                                <TrendingUp size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentsTab;
