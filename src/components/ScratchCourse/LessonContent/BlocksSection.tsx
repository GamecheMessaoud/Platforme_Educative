import React from 'react';
import { Puzzle } from 'lucide-react';
import { getBlockCategory, blockCategoryColors } from '../../../utils/blockCategories';

interface props {
    blocks: string[];
}

const BlocksSection: React.FC<props> = ({ blocks }) => {
    return (
        <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-100 shadow-sm" dir="rtl">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Puzzle className="text-fuchsia-500" /> الكتل البرمجية الجديدة
            </h3>
            <div className="flex flex-wrap gap-4">
                {blocks.map((block, index) => {
                    const category = getBlockCategory(block);
                    const color = blockCategoryColors[category] || '#4C97FF';

                    return (
                        <div
                            key={index}
                            className="px-5 py-2.5 rounded-xl font-bold text-white shadow-sm flex items-center gap-2"
                            style={{ backgroundColor: color }}
                        >
                            <div className="w-2 h-2 rounded-full bg-white/50" />
                            {block}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BlocksSection;
