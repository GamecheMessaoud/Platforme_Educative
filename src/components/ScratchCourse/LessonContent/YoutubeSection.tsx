import React from 'react';
import { Youtube } from 'lucide-react';

interface props {
    videoUrl: string;
}

const YoutubeSection: React.FC<props> = ({ videoUrl }) => {
    // Extract video ID from URL
    const getYouTubeID = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeID(videoUrl);

    if (!videoId) {
        return (
            <div className="bg-slate-900 rounded-3xl p-8 text-center text-white mb-10 w-full border border-slate-700">
                <p>رابط YouTube غير صالح</p>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">{videoUrl}</a>
            </div>
        );
    }

    return (
        <div className="mb-10 w-full animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Youtube className="text-red-500" size={24} />
                <h3 className="text-xl font-bold">فيديو الشرح</h3>
            </div>
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border-4 border-slate-800">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default YoutubeSection;
