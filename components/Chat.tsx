import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';

interface ChatProps {
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (text: string) => void;
}

function Chat({ messages, currentUser, onSendMessage }: ChatProps) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[65vh]">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()).map(msg => {
                    const isSender = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                            {!isSender && <span title={msg.senderName} className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{msg.senderName.charAt(0).toUpperCase()}</span>}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 shadow-sm ${isSender ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}>
                                {!isSender && <p className="text-xs font-bold text-indigo-500 mb-1">{msg.senderName}</p>}
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-xs mt-1 text-right ${isSender ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="メッセージを入力..."
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                    />
                    <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">送信</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;
