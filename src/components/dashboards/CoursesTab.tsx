import React, { useState, useEffect } from 'react';
import { BookOpen, Search, PlusCircle, Edit, Trash2, Users, Star, List } from 'lucide-react';
import { getTeacherCourses, deleteCourse } from '../../services/courseService';
import { useTheme } from '../../context/ThemeContext';
import type { Course } from '../../types';
import CourseModal from './CourseModal';
import LessonManagerModal from './LessonManagerModal';
import Notification from '../Notification';
import Loading from '../Loading';

const CoursesTab: React.FC = () => {
    const { isDark } = useTheme();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [lessonMgmtCourse, setLessonMgmtCourse] = useState<Course | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await getTeacherCourses();
            setCourses(data);
        } catch (error: any) {
            setNotification({ message: 'حدث خطأ أثناء تحميل الدورات', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`هل أنت متأكد من حذف دورة "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

        try {
            await deleteCourse(id);
            setNotification({ message: 'تم حذف الدورة بنجاح', type: 'success' });
            loadCourses();
        } catch (error: any) {
            setNotification({ message: 'حدث خطأ أثناء الحذف', type: 'error' });
        }
    };

    const handleAddClick = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleModalClose = (wasSaved: boolean) => {
        setIsModalOpen(false);
        if (wasSaved) {
            loadCourses();
            setNotification({
                message: editingCourse ? 'تم تحديث الدورة بنجاح' : 'تم إنشاء الدورة بنجاح',
                type: 'success'
            });
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && courses.length === 0) return <Loading />;

    const cardBg = isDark ? 'bg-[#1c2128] border-[#30363d]' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-800';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';

    const getEmojiForCategory = (cat: string) => {
        if (cat.includes('scratch')) return '🎨';
        if (cat.includes('python')) return '🐍';
        return '📚';
    };

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            {/* Header & Controls */}
            <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100/50 rounded-xl">
                        <BookOpen className="text-emerald-600 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-black ${textMain}`}>إدارة الدورات</h2>
                        <p className={`text-sm ${muted} font-medium`}>قم بإنشاء وتعديل دوراتك التعليمية</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder="ابحث عن دورة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 text-sm border outline-none rounded-xl focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        />
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={16} />
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition whitespace-nowrap"
                    >
                        <PlusCircle size={18} />إضافة دورة
                    </button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className={`col-span-full p-12 text-center rounded-3xl border ${cardBg}`}>
                        <div className="text-5xl mb-4 opacity-50">📂</div>
                        <h3 className={`text-xl font-black ${textMain} mb-2`}>لا توجد دورات</h3>
                        <p className={muted}>قم بإضافة دورتك الأولى للبدء في التدريس.</p>
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <div key={course.id} className={`flex flex-col rounded-3xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${cardBg}`}>
                            {/* Course Image / Thumbnail Placeholder */}
                            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-[#0d1117] flex items-center justify-center relative">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl">{getEmojiForCategory(course.category)}</span>
                                )}
                                <span className={`absolute top-4 right-4 px-3 py-1.5 text-[10px] font-black rounded-xl border shadow-lg backdrop-blur-md transition-all ${course.status === 'published'
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                    }`}>
                                    {course.status === 'published' ? '✅ منشور للطلاب' : '✏️ مسودة (خاص)'}
                                </span>
                            </div>

                            {/* Course Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className={`font-black text-lg ${textMain} mb-1 line-clamp-1`}>{course.title}</h3>
                                <p className={`text-xs ${muted} mb-4 line-clamp-2 min-h-[32px]`}>{course.description || 'لا يوجد وصف متاح.'}</p>

                                <div className={`flex items-center gap-4 text-xs font-bold mb-5 pb-5 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                    <span className={`flex items-center gap-1 ${muted}`}><Users size={14} />{course.studentsCount || 0}</span>
                                    {course.rating > 0 && <span className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" />{course.rating}</span>}
                                    <span className={`mr-auto px-2 border rounded-md uppercase tracking-wider text-[10px] ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                                        {course.category}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <button
                                        onClick={() => handleEditClick(course)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                            }`}
                                    >
                                        <Edit size={16} /> تعديل
                                    </button>
                                    <button
                                        onClick={() => setLessonMgmtCourse(course)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <List size={16} /> الدروس
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id, course.title)}
                                        className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                                            }`}
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CourseModal
                    course={editingCourse}
                    onClose={handleModalClose}
                />
            )}

            {lessonMgmtCourse && (
                <LessonManagerModal
                    courseId={lessonMgmtCourse.id}
                    courseTitle={lessonMgmtCourse.title}
                    onClose={() => setLessonMgmtCourse(null)}
                />
            )}

            {/* Notification */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-[110]">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default CoursesTab;
