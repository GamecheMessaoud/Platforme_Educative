import Header from '../components/Header';
import Footer from '../components/Footer';
import StudentCommunityTab from '../components/dashboards/StudentCommunityTab';
import { useTheme } from '../context/ThemeContext';

export default function CommunityPage() {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} font-cairo`}>
            <Header />

            <main className="max-w-[1400px] mx-auto px-8 pt-32 pb-20">
                <div className="mb-12">
                    <h1 className="text-5xl font-black mb-4">المجتمع</h1>
                    <p className={`text-xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        تواصل، تعلم، وشارك إبداعك مع مجتمع كيد-تيك.
                    </p>
                </div>

                <StudentCommunityTab />
            </main>

            <Footer />
        </div>
    );
}
