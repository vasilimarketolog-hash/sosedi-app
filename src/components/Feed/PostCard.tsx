import React, { useState } from 'react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Heart, MessageCircle, Share2, Pin, ShieldCheck, 
  CheckCircle2, Send, AlertTriangle, Sparkles, MoreHorizontal 
} from 'lucide-react';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { toggleLikePost, addComment, votePoll, user } = useApp();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const getCategoryBadge = () => {
    switch (post.category) {
      case 'urgent':
        return <span className="badge badge-urgent">🚨 Срочно & Инцидент</span>;
      case 'events':
        return <span className="badge badge-verified" style={{ background: '#f0fdf4', color: '#047857', borderColor: '#a7f3d0' }}>🎉 Событие & Праздник</span>;
      case 'improvements':
        return <span className="badge badge-primary">🌿 Благоустройство</span>;
      case 'uk_news':
        return <span className="badge badge-verified">📢 УК «Лиговский Сервис»</span>;
      default:
        return <span className="badge badge-primary">💬 Дворовые обсуждения</span>;
    }
  };

  return (
    <article className={`card post-card ${post.pinned ? 'pinned-post' : ''}`}>
      {/* Pinned label if applicable */}
      {post.pinned && (
        <div className="pinned-header">
          <Pin size={14} className="text-emerald" />
          <span>Закреплённое сообщение от инициативной группы</span>
        </div>
      )}

      {/* Author Header */}
      <div className="post-author-row">
        <div className="author-info">
          <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
          <div>
            <div className="author-name-group">
              <span className="author-name">{post.authorName}</span>
              <span title="Проверенный жилец дома"><CheckCircle2 size={15} className="text-blue" /></span>
            </div>
            <div className="author-address">{post.authorAddress} • {post.timestamp}</div>
          </div>
        </div>

        <div className="post-meta-actions">
          {getCategoryBadge()}
        </div>
      </div>

      {/* Title */}
      {post.title && <h3 className="post-title">{post.title}</h3>}

      {/* Content Body */}
      <p className="post-content">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((img, idx) => (
            <img key={idx} src={img} alt="Post attachment" className="post-img" />
          ))}
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll && (
        <div className="poll-container">
          <div className="poll-question">📊 {post.poll.question}</div>
          <div className="poll-options">
            {post.poll.options.map((opt) => {
              const percentage = post.poll!.totalVotes > 0 
                ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                : 0;
              const isUserVoted = post.poll!.userVotedOptionId === opt.id;

              return (
                <button 
                  key={opt.id}
                  className={`poll-option-btn ${isUserVoted ? 'voted' : ''}`}
                  onClick={() => votePoll(post.id, opt.id)}
                >
                  <div className="poll-fill" style={{ width: `${percentage}%` }}></div>
                  <div className="poll-option-content">
                    <span className="poll-opt-text">{opt.text}</span>
                    <span className="poll-opt-percent">{percentage}% ({opt.votes})</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="poll-footer-info">Проголосовали: {post.poll.totalVotes} соседей</div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="post-actions-bar">
        <button 
          className={`action-btn ${post.userLiked ? 'liked' : ''}`}
          onClick={() => toggleLikePost(post.id)}
        >
          <Heart size={18} fill={post.userLiked ? '#ef4444' : 'none'} color={post.userLiked ? '#ef4444' : 'currentColor'} />
          <span>{post.likes}</span>
        </button>

        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{post.comments.length} комментариев</span>
        </button>

        <button 
          className="action-btn"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Ссылка на запись скопирована!');
          }}
        >
          <Share2 size={18} />
          <span>Поделиться</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.map((c) => (
              <div key={c.id} className="comment-item">
                <img src={c.authorAvatar} alt={c.authorName} className="comment-avatar" />
                <div className="comment-bubble">
                  <div className="comment-meta">
                    <span className="comment-author">{c.authorName}</span>
                    {c.verified && <CheckCircle2 size={13} className="text-blue" />}
                    <span className="comment-addr">• {c.authorAddress}</span>
                    <span className="comment-time">• {c.timestamp}</span>
                  </div>
                  <p className="comment-text">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="add-comment-form">
            <img src={user.avatar} alt={user.name} className="comment-avatar" />
            <input 
              type="text" 
              placeholder="Написать ответ соседям..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="send-comment-btn" disabled={!commentText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .post-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pinned-post {
          border-color: #a7f3d0;
          background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
        }

        .pinned-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #047857;
        }

        .post-author-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }

        .author-name-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .author-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
        }

        .author-address {
          font-size: 0.78rem;
          color: #64748b;
        }

        .post-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
        }

        .post-content {
          font-size: 0.95rem;
          color: #334155;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .post-images {
          border-radius: 12px;
          overflow: hidden;
          max-height: 340px;
        }

        .post-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .poll-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .poll-question {
          font-weight: 700;
          font-size: 0.92rem;
          color: #0f172a;
        }

        .poll-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .poll-option-btn {
          position: relative;
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          overflow: hidden;
          text-align: left;
          transition: border-color 0.15s ease;
        }

        .poll-option-btn.voted {
          border-color: #059669;
          font-weight: 600;
        }

        .poll-fill {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          background: linear-gradient(90deg, #dcfce7 0%, #a7f3d0 100%);
          z-index: 0;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .poll-option-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .poll-footer-info {
          font-size: 0.75rem;
          color: #64748b;
        }

        .post-actions-bar {
          display: flex;
          gap: 16px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          transition: color 0.15s ease;
        }

        .action-btn:hover {
          color: #0f172a;
        }

        .action-btn.liked {
          color: #ef4444;
        }

        .comments-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 10px;
          background: #f8fafc;
          margin: 0 -20px -20px -20px;
          padding: 16px 20px;
          border-bottom-left-radius: var(--radius-lg);
          border-bottom-right-radius: var(--radius-lg);
          border-top: 1px solid #e2e8f0;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .comment-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .comment-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-bubble {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          flex: 1;
        }

        .comment-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          margin-bottom: 2px;
        }

        .comment-author { font-weight: 700; color: #0f172a; }
        .comment-addr, .comment-time { color: #94a3b8; }
        .comment-text { font-size: 0.88rem; color: #334155; }

        .add-comment-form {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .add-comment-form input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .send-comment-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #059669;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-comment-btn:disabled {
          background: #cbd5e1;
        }
      `}</style>
    </article>
  );
};
