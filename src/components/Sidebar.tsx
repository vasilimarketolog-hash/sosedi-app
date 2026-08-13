import React from 'react';
import { useApp, TabType } from '../context/AppContext';
import { 
  Newspaper, ShoppingBag, Wrench, MapPin, 
  MessageSquare, User, ShieldCheck, HeartHandshake,
  Users, Share2, Sparkles, CheckCircle2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentNeighborhood, user, chats, setIsVerificationModalOpen } = useApp();

  const totalUnreadChats = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'feed', label: 'Лента двора', icon: <Newspaper size={20} /> },
    { id: 'market', label: 'Барахолка & Даром', icon: <ShoppingBag size={20} />, badge: '🔥 Даром' },
    { id: 'masters', label: 'Проверенные мастера', icon: <Wrench size={20} /> },
    { id: 'map', label: 'Карта района', icon: <MapPin size={20} /> },
    { id: 'chats', label: 'Чаты дома', icon: <MessageSquare size={20} />, badge: totalUnreadChats > 0 ? totalUnreadChats : undefined },
    { id: 'profile', label: 'Мой профиль', icon: <User size={20} /> },
  ];

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Присоединяйся к «Соседи.Онлайн»',
        text: `Привет! Заходи в общую сеть нашего ЖК ${currentNeighborhood.name}, здесь отдают бесплатные вещи, находят мастеров и общаются соседи!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка-приглашение скопирована в буфер обмена!');
    }
  };

  return (
    <aside className="sidebar-container">
      {/* Navigation Links */}
      <nav className="nav-group">
        <div className="nav-title">Разделы двора</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile Mini Widget */}
      <div className="user-mini-widget">
        <div className="user-header">
          <img src={user.avatar} alt={user.name} className="user-avatar" />
          <div className="user-info">
            <div className="user-name-row">
              <span className="user-name">{user.name}</span>
              {user.verified && <CheckCircle2 size={15} className="text-blue" />}
            </div>
            <span className="user-address">{user.building}, кв. {user.apartment}</span>
          </div>
        </div>

        {!user.verified ? (
          <div className="verify-prompt">
            <p>Вы пока не подтвердили адрес проживания.</p>
            <button className="btn-verify-action" onClick={() => setIsVerificationModalOpen(true)}>
              <ShieldCheck size={14} />
              <span>Верифицировать</span>
            </button>
          </div>
        ) : (
          <div className="karma-row">
            <div className="karma-item">
              <span className="karma-val">⭐ {user.rating}</span>
              <span className="karma-lbl">Рейтинг</span>
            </div>
            <div className="karma-divider"></div>
            <div className="karma-item">
              <span className="karma-val">❤️ {user.thanksCount}</span>
              <span className="karma-lbl">Спасибо</span>
            </div>
          </div>
        )}
      </div>

      {/* Neighborhood Stats Card */}
      <div className="neighborhood-stats-card">
        <div className="card-header">
          <Users size={18} className="text-emerald" />
          <span>Наш ЖК сегодня</span>
        </div>
        <div className="stats-list">
          <div className="stat-row">
            <span className="stat-label">Жителей в сети</span>
            <span className="stat-value">{currentNeighborhood.residentsCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Активных корпусов</span>
            <span className="stat-value">{currentNeighborhood.housesCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Объявлений</span>
            <span className="stat-value">{currentNeighborhood.activeAnnouncements}</span>
          </div>
        </div>

        <button className="invite-btn" onClick={handleShareInvite}>
          <Share2 size={15} />
          <span>Пригласить соседа по ЖК</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex-shrink: 0;
        }

        .nav-group {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-title {
          padding: 6px 12px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #475569;
          transition: all 0.15s ease;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .nav-item.active {
          background: #ecfdf5;
          color: #059669;
        }

        .nav-icon {
          display: flex;
          align-items: center;
        }

        .nav-label {
          flex: 1;
          text-align: left;
        }

        .nav-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          background: #ef4444;
          color: #ffffff;
        }

        .nav-item.active .nav-badge {
          background: #059669;
        }

        .user-mini-widget {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: #0f172a;
        }

        .user-address {
          font-size: 0.76rem;
          color: #64748b;
        }

        .verify-prompt {
          background: #fffbeb;
          border: 1px dashed #fde68a;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.78rem;
          color: #92400e;
        }

        .btn-verify-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px;
          background: #d97706;
          color: #ffffff;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .karma-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: #f8fafc;
          padding: 8px;
          border-radius: 8px;
        }

        .karma-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .karma-val {
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f172a;
        }

        .karma-lbl {
          font-size: 0.7rem;
          color: #64748b;
        }

        .karma-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
        }

        .neighborhood-stats-card {
          background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          color: #166534;
        }

        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .stat-label { color: #475569; }
        .stat-value { font-weight: 700; color: #0f172a; }

        .invite-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #86efac;
          border-radius: 8px;
          color: #15803d;
          font-weight: 600;
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .invite-btn:hover {
          background: #dcfce7;
        }

        @media (max-width: 900px) {
          .sidebar-container {
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
};
