import { useState, useEffect } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';
import api from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function MessagesTab() {
    const { isDark } = useTheme();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeUser, setActiveUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);

    useEffect(() => {
        loadConversations();
        loadTeachers();
    }, []);

    useEffect(() => {
        if (activeUser) {
            loadMessages(activeUser.id);
            // Simple polling for real-time feel
            const interval = setInterval(() => loadMessages(activeUser.id), 5000);
            return () => clearInterval(interval);
        }
    }, [activeUser]);

    const loadConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTeachers = async () => {
        try {
            const res = await api.get('/messages/teachers');
            setAvailableTeachers(res.data);
        } catch (error) {
            console.error('Failed to load teachers', error);
        }
    };

    const loadMessages = async (userId: string) => {
        try {
            const res = await api.get(`/messages/conversations/${userId}`);
            setMessages(res.data);
            
            // Re-fetch conversations to update unread counts
            const convRes = await api.get('/messages/conversations');
            setConversations(convRes.data);
        } catch (error) {
            console.error('Failed to load messages', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeUser) return;

        try {
            const res = await api.post('/messages', {
                receiverId: activeUser.id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            loadConversations(); // update last message
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const startNewChat = (teacher: any) => {
        setActiveUser(teacher);
        setShowNewChat(false);
    };

    const bg = isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-slate-200';
    const msgBgLeft = isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800';
    const msgBgRight = 'bg-primary text-white';

    return (
        <div className={`flex h-[600px] ${bg} border-2 rounded-[2rem] overflow-hidden`} dir="rtl">
            {/* Sidebar */}
            <div className={`w-1/3 border-l ${isDark ? 'border-[#30363d]' : 'border-slate-200'} flex flex-col`}>
                <div className="p-6 border-b border-inherit bg-primary/5">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <MessageSquare className="text-primary" /> الرسائل
                    </h2>
                    <button 
                        onClick={() => setShowNewChat(true)}
                        className="mt-4 w-full py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-md"
                    >
                        مراسلة أستاذ جديد
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                    {loading ? (
                        <div className="text-center p-4">جاري التحميل...</div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-4 text-slate-400">لا توجد محادثات</div>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.user.id} 
                                onClick={() => setActiveUser(conv.user)}
                                className={`p-4 rounded-2xl cursor-pointer transition-colors flex items-center gap-3 relative ${activeUser?.id === conv.user.id ? 'bg-primary/10 border-primary/30 border' : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}`}
                            >
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {conv.user.avatar_url ? (
                                        <img src={conv.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{conv.user.first_name} {conv.user.last_name}</div>
                                    <div className="text-sm text-slate-400 truncate">{conv.lastMessage?.content}</div>
                                </div>
                                {conv.unreadCount > 0 && activeUser?.id !== conv.user.id && (
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative w-2/3">
                {showNewChat ? (
                    <div className="absolute inset-0 z-10 bg-inherit p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">اختر أستاذاً للمراسلة</h3>
                            <button onClick={() => setShowNewChat(false)} className="text-red-500 font-bold p-2 bg-red-50 rounded-lg">إلغاء</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {availableTeachers.map(teacher => (
                                <div key={teacher.id} onClick={() => startNewChat(teacher)} className={`p-4 rounded-2xl cursor-pointer ${isDark ? 'bg-slate-800' : 'bg-slate-50'} flex items-center gap-3 border border-transparent hover:border-primary`}>
                                   <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {teacher.avatar_url ? <img src={teacher.avatar_url} className="w-full h-full object-cover" /> : <User />}
                                    </div>
                                    <span className="font-bold">أ/ {teacher.first_name} {teacher.last_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {activeUser ? (
                    <>
                        <div className="p-6 border-b border-inherit flex items-center gap-4 bg-primary/5">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                {activeUser.avatar_url ? (
                                    <img src={activeUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-slate-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-lg">{activeUser.first_name} {activeUser.last_name}</h3>
                                <p className="text-sm text-primary font-bold">{activeUser.role === 'TEACHER' ? 'أستاذ' : 'طالب'}</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                            {messages.map((msg: any) => {
                                const isMe = msg.sender_id !== activeUser.id;
                                return (
                                    <div key={msg.id} className={`max-w-[70%] p-4 rounded-2xl ${isMe ? `self-end rounded-br-none ${msgBgRight}` : `self-start rounded-bl-none ${msgBgLeft}`}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-4 border-t border-inherit">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    className={`flex-1 p-4 rounded-2xl pr-12 outline-none ${isDark ? 'bg-[#0d1117]' : 'bg-slate-100'}`}
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors">
                                    <Send size={18} className="rotate-180" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={64} className="opacity-20 mb-4" />
                        <p className="font-bold text-xl">اختر محادثة للبدء</p>
                    </div>
                )}
            </div>
        </div>
    );
}
