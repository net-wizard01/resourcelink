'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Send, MessageSquare, ArrowLeft, Search, Trash2 } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [balance, setBalance] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchChats();
    api.get('/users/me/balance').then(res => setBalance(res.data.balance));
  }, [user, router]);

  const fetchChats = () => {
    api.get('/messages/inbox').then(res => setChats(res.data)).catch(console.error);
  };

  const openChat = (chat: any) => {
    setActiveChat(chat);
    // Mark messages as read
    api.put('/messages/read', { otherUserId: chat.other_user_id, listingId: chat.listing_id }).catch(console.error);
    api.get(`/messages?otherUserId=${chat.other_user_id}&listingId=${chat.listing_id}`)
      .then(res => setMessages(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(() => {
      api.get(`/messages?otherUserId=${activeChat.other_user_id}&listingId=${activeChat.listing_id}`)
        .then(res => setMessages(res.data))
        .catch(console.error);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleDeleteChat = async (e: React.MouseEvent, chat: any) => {
    e.stopPropagation(); // Prevent opening the chat when clicking delete
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await api.delete(`/messages/${chat.other_user_id}/${chat.listing_id}`);
      if (activeChat?.other_user_id === chat.other_user_id) setActiveChat(null);
      fetchChats(); // Refresh the list
    } catch (err) {
      alert('Failed to delete chat');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      await api.post('/messages', {
        receiver_id: activeChat.other_user_id,
        listing_id: activeChat.listing_id,
        content: newMessage.trim()
      });
      setNewMessage('');
      const res = await api.get(`/messages?otherUserId=${activeChat.other_user_id}&listingId=${activeChat.listing_id}`);
      setMessages(res.data);
      fetchChats();
    } catch (err) { alert('Failed to send'); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Navbar balance={balance} />
      
      {/* Full-screen chat container */}
      <main className="flex-1 flex overflow-hidden w-full h-[calc(100vh-80px)]">
        
        {/* Left Sidebar (Chat List) - Fixed Width */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
          </div>
          
          <div className="p-3 border-b border-gray-100 dark:border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Search chats..." className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-sm">No messages yet.</p>
              </div>
            ) : chats.map((chat, i) => (
              <div 
                key={i} 
                onClick={() => openChat(chat)}
                className={`group w-full text-left px-4 py-4 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer ${activeChat?.other_user_id === chat.other_user_id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  {chat.other_user_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{chat.other_user_name}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">{new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate flex-1">{chat.last_message}</p>
                    <button 
                      onClick={(e) => handleDeleteChat(e, chat)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all ml-2"
                      title="Delete Chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate mt-0.5">Re: {chat.listing_title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Window - Takes remaining space */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-900/50">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="text-gray-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-slate-300">Your Messages</h3>
              <p className="text-sm mt-1">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 shrink-0 shadow-sm z-10">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                  {activeChat.other_user_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white leading-tight">{activeChat.other_user_name}</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC] dark:bg-slate-950/50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : null}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                        isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700 rounded-bl-sm'
                      }`}>
                        <p className="leading-relaxed break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 text-right font-medium ${isMe ? 'text-blue-200' : 'text-gray-400 dark:text-slate-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-black dark:text-white text-sm"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm">
                    <Send size={18} className="ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
