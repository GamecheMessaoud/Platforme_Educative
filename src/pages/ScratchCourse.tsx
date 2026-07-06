import React from 'react';
import ScratchCourse from '../components/ScratchCourse';
import { ThemeProvider } from '../context/ThemeContext';

const ScratchCoursePage: React.FC = () => {
    // Keep the course out of the global dark theme root, or let it inherit. It has its own styling but we wrap it for consistency.
    return (
        <ThemeProvider>
            <div dir="rtl" className="w-full text-right">
                <ScratchCourse />
            </div>
        </ThemeProvider>
    );
};

export default ScratchCoursePage;
