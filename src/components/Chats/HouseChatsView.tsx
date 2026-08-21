import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, DoorOpen, Car, Dog, Send, 
  CheckCircle2, Users, ShieldAlert, Sparkles, MessageSquare, ArrowLeft
} from 'lucide-react';

export const HouseChatsView: React.FC = () => {
  const { chats, activeChatId, setActiveChatId, sendMessageToChat, user, setIsVerificationModalOpen } = useApp();
  const [inputText, setInputText] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileShowChat(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessageToChat(activeChat.id, inputText);
    setInputText('');

    // Simulate neighbor reply after 1.5 seconds if sending in entrance chat or auto chat
    setTimeout(() => {
      if (activeChat.id === 'chat_entrance') {
        sendMessageToChat(activeChat.id, 'Спасибо за сообщение! Соседи в курсе👍');
      }
    }, 1500);
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'house': return <Building2 size={20} className="text-emerald" />;
      case 'entrance': return <DoorOpen size={20} className="text-blue" />;
      case 'auto': return <Car size={20} className="text-amber" />;
      case 'pets': return <Dog size={20} className="text-purple" />;
      default: return <MessageSquare size={20} />;
    }
  };

  return (
    <div className="chats-view-container card animate-fade-in">
      {/* Left Chat List Sidebar */}
      <div className={`chats-sidebar ${mobileShowChat ? 'mobile-hidden' : 'mobile-active'}`}>
        <div className="chats-sidebar-header">
          <h3>Чаты нашего ЖК</h3>
          <span className="members-total">{user.building}</span>
        </div>

        <div className="chats-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-item-btn ${chat.id === activeChat.id ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="chat-item-icon">{getChatIcon(chat.type)}</div>
              <div className="chat-item-info">
                <div className="chat-item-name">{chat.name}</div>
                <div className="chat-item-sub">{chat.membersCount} участников</div>
              </div>
              {chat.unreadCount > 0 && (
                <span className="unread-badge">{chat.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Chat Main Area */}
      <div className={`chat-main-area ${mobileShowChat ? 'mobile-active' : 'mobile-hidden'}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <button className="mobile-back-btn" onClick={() => setMobileShowChat(false)}>
              <ArrowLeft size={18} />
              <span>Чаты</span>
            </button>
            <div className="chat-title-row">
              {getChatIcon(activeChat.type)}
              <h2>{activeChat.name}</h2>
            </div>
            <p className="chat-desc">{activeChat.description}</p>
          </div>
          <div className="members-badge">
            <Users size={14} /> <span>{activeChat.membersCount}</span>
          </div>
        </div>

        {/* Unverified prompt banner for entrance chats */}
        {!user.verified && activeChat.type === 'entrance' && (
          <div className="chat-unverified-warning">
            <ShieldAlert size={18} className="text-amber" />
            <span>Это закрытый чат вашего подъезда. Подтвердите адрес для участия.</span>
            <button className="btn btn-primary btn-sm" onClick={() => setIsVerificationModalOpen(true)}>
              Подтвердить
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="messages-thread">
          {activeChat.messages.map((msg) => {
            const isMe = msg.senderId === user.id;

            return (
              <div key={msg.id} className={`message-wrapper ${isMe ? 'my-message' : 'other-message'}`}>
                {!isMe && <img src={msg.senderAvatar} alt={msg.senderName} className="msg-avatar" />}
                <div className="msg-bubble">
                  {!isMe && (
                    <div className="msg-sender-meta">
                      <span className="msg-sender-name">{msg.senderName}</span>
                      {msg.verified && <CheckCircle2 size={12} className="text-blue" />}
                      <span className="msg-sender-addr">• {msg.senderAddress}</span>
                    </div>
                  )}
                  <p className="msg-text">{msg.text}</p>
                  <span className="msg-time">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="chat-input-form">
          <input 
            type="text" 
            placeholder={`Написать в ${activeChat.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary send-btn" disabled={!inputText.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        .chats-view-container {
          padding: 0;
          display: flex;
          height: 640px;
          overflow: hidden;
        }

        .chats-sidebar {
          width: 300px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          flex-shrink: 0;
        }

        .chats-sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .chats-sidebar-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .members-total {
          font-size: 0.76rem;
          color: #64748b;
        }

        .chats-list {
          display: flex;
          flex-direction: column;
          padding: 8px;
          gap: 4px;
          overflow-y: auto;
        }

        .chat-item-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          text-align: left;
          transition: background 0.15s ease;
        }

        .chat-item-btn:hover { background: #e2e8f0; }
        .chat-item-btn.active { background: #ffffff; box-shadow: var(--shadow-sm); }

        .chat-item-info { flex: 1; min-width: 0; }
        .chat-item-name { font-weight: 700; font-size: 0.88rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-item-sub { font-size: 0.74rem; color: #64748b; }

        .unread-badge {
          background: #ef4444;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .chat-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          min-width: 0;
        }

        .mobile-back-btn {
          display: none;
          align-items: center;
          gap: 4px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 4px 10px;
          border-radius: 16px;
          margin-bottom: 6px;
        }

        .chat-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-title-row h2 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .chat-desc {
          font-size: 0.76rem;
          color: #64748b;
        }

        .members-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #475569;
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 20px;
          font-weight: 600;
          white-space: nowrap;
        }

        .chat-unverified-warning {
          background: #fffbeb;
          border-bottom: 1px solid #fde68a;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.78rem;
          color: #92400e;
        }

        .messages-thread {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8fafc;
        }

        .message-wrapper {
          display: flex;
          gap: 8px;
          max-width: 85%;
        }

        .my-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .other-message {
          align-self: flex-start;
        }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .msg-bubble {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 8px 12px;
          box-shadow: var(--shadow-sm);
        }

        .my-message .msg-bubble {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        .msg-sender-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          margin-bottom: 4px;
        }

        .msg-sender-name { font-weight: 700; color: #0f172a; }
        .msg-sender-addr { color: #94a3b8; }
        .msg-text { font-size: 0.88rem; line-height: 1.4; }

        .msg-time {
          display: block;
          font-size: 0.65rem;
          color: #94a3b8;
          text-align: right;
          margin-top: 4px;
        }

        .my-message .msg-time {
          color: rgba(255, 255, 255, 0.8);
        }

        .chat-input-form {
          padding: 12px 14px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 8px;
          background: #ffffff;
        }

        .chat-input-form input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 24px;
          font-size: 0.88rem;
        }

        .send-btn {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          padding: 0;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .chats-view-container {
            height: calc(100vh - 140px);
            border-radius: 0;
          }

          .chats-sidebar {
            width: 100%;
          }

          .chats-sidebar.mobile-hidden {
            display: none;
          }

          .chat-main-area.mobile-hidden {
            display: none;
          }

          .chat-main-area.mobile-active {
            display: flex;
            width: 100%;
          }

          .mobile-back-btn {
            display: inline-flex;
          }
        }
      `}</style>
    </div>
  );
};
