import React, { useEffect, useState } from 'react';

export default function Confetti() {
    const [pieces, setPieces] = useState<any[]>([]);

    useEffect(() => {
        const colors = ['#6366f1', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];
        const newPieces = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            delay: Math.random() * 3 + 's',
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5 + 'px',
            duration: Math.random() * 2 + 3 + 's'
        }));
        setPieces(newPieces);

        const timer = setTimeout(() => setPieces([]), 6000);
        return () => clearTimeout(timer);
    }, []);

    if (pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="absolute top-[-10px] rounded-sm opacity-80"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        animation: `confettiFall ${p.duration} ease-in forwards`,
                        animationDelay: p.delay
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}
