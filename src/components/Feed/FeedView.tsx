import React from 'react';
import { useApp } from '../../context/AppContext';
import { PostCard } from './PostCard';
import { CategoryType } from '../../types';
import { 
  Sparkles, AlertCircle, PlusCircle, Filter, 
  MessageSquare, Flame, ShieldAlert, Heart
} from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, feedCategory, setFeedCategory, setIsCreatePostModalOpen, user, setIsVerificationModalOpen } = useApp();

  const filteredPosts = posts.filter(p => {
    if (feedCategory === 'all') return true;
    return p.category === feedCategory;
  });

  const categories: { id: CategoryType; label: string; icon: string; count?: number }[] = [
    { id: 'all', label: 'Все записи', icon: '🔥' },
    { id: 'urgent', label: '🚨 Важное и Инциденты', icon: '🚨' },
    { id: 'improvements', label: '🌿 Благоустройство', icon: '🌿' },
    { id: 'general', label: '💬 Общение соседей', icon: '💬' },
    { id: 'uk_news', label: '📢 Объявления УК / ТСЖ', icon: '📢' },
  ];

  return (
    <div className="feed-view-container animate-fade-in">
      {/* Verification Prompt Top Banner if unverified */}
      {!user.verified && (
        <div className="unverified-banner">
          <div className="banner-left">
            <ShieldAlert size={24} className="text-amber" />
            <div>
              <div className="banner-title">Подтвердите адрес жилья в ЖК</div>
              <div className="banner-desc">Получите доступ к голосованию в опросах и закрытому чату вашего подъезда.</div>
            </div>
          </div>
          <button className="btn btn-urgent btn-sm" onClick={() => setIsVerificationModalOpen(true)}>
            Подтвердить за 1 мин
          </button>
        </div>
      )}

      {/* Quick Create Post Input Trigger */}
      <div className="card quick-create-card" onClick={() => setIsCreatePostModalOpen(true)}>
        <img src={user.avatar} alt={user.name} className="user-avatar-sm" />
        <div className="fake-input">
          <span>Напишите вопрос или объявление соседям...</span>
        </div>
        <button className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>Написать</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="category-tabs-row">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${feedCategory === cat.id ? 'active' : ''} ${cat.id === 'urgent' ? 'tab-urgent' : ''}`}
            onClick={() => setFeedCategory(cat.id)}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="posts-feed-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="empty-feed-card card">
            <MessageSquare size={48} className="text-muted" />
            <h3>В этой категории пока нет записей</h3>
            <p>Будьте первым, кто создаст запись во дворе!</p>
            <button className="btn btn-primary" onClick={() => setIsCreatePostModalOpen(true)}>
              Написать сообщение
            </button>
          </div>
        )}
      </div>

      <style>{`
        .feed-view-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .unverified-banner {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .banner-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #92400e;
        }

        .banner-desc {
          font-size: 0.8rem;
          color: #b45309;
        }

        .quick-create-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
        }

        .user-avatar-sm {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .fake-input {
          flex: 1;
          background: #f1f5f9;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 0.88rem;
          color: #94a3b8;
        }

        .quick-create-card:hover .fake-input {
          background: #e2e8f0;
          color: #64748b;
        }

        .category-tabs-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .category-tab {
          padding: 8px 16px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .category-tab:hover {
          background: #f8fafc;
        }

        .category-tab.active {
          background: #059669;
          border-color: #059669;
          color: #ffffff;
        }

        .category-tab.tab-urgent.active {
          background: #ef4444;
          border-color: #ef4444;
        }

        .posts-feed-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-feed-card {
          text-align: center;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-feed-card h3 {
          font-size: 1.1rem;
          color: #0f172a;
        }

        .empty-feed-card p {
          font-size: 0.85rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};
