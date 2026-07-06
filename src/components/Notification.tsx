import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: { icon: CheckCircle, colors: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        error: { icon: XCircle, colors: 'bg-red-50 text-red-800 border-red-200' },
        info: { icon: Info, colors: 'bg-blue-50 text-blue-800 border-blue-200' },
        warning: { icon: AlertCircle, colors: 'bg-amber-50 text-amber-800 border-amber-200' }
    };

    const { icon: Icon, colors } = config[type];

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 shadow-lg animate-fade-in ${colors}`} dir="rtl">
            <Icon size={24} />
            <p className="font-bold flex-1">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X size={18} />
            </button>
        </div>
    );
};

export default Notification;
