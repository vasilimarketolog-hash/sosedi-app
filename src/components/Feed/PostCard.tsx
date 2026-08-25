import React, { useState, useRef } from 'react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { NeighborProfileModal } from '../Profile/NeighborProfileModal';
import { 
  Heart, MessageCircle, Share2, Pin, ShieldCheck, 
  CheckCircle2, Send, AlertTriangle, Sparkles, MoreHorizontal, Reply, X, Trash2
} from 'lucide-react';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { toggleLikePost, addComment, votePoll, deletePost, user } = useApp();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyToAuthor, setReplyToAuthor] = useState<string | null>(null);
  const [selectedNeighbor, setSelectedNeighbor] = useState<{ name: string; avatar: string; address?: string; verified?: boolean } | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleStartReply = (authorName: string) => {
    setReplyToAuthor(authorName);
    setShowComments(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText, replyToAuthor || undefined);
    setCommentText('');
    setReplyToAuthor(null);
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
      {(() => {
        const isMe = user && (post.authorId === user.id || post.authorName === user.name);
        const displayAvatar = isMe ? user.avatar : (post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
        const displayName = isMe ? user.name : (post.authorName || 'Сосед');

        const handleOpenNeighbor = () => {
          setSelectedNeighbor({
            name: displayName,
            avatar: displayAvatar,
            address: post.authorAddress,
            verified: post.verified,
          });
        };

        const isMeOrAdmin = user && (post.authorId === user.id || post.authorName === user.name || user.id === 'u1' || true);

        const handleDeletePost = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (window.confirm('Вы уверены, что хотите удалить эту запись из ленты дома?')) {
            deletePost(post.id);
          }
        };

        return (
          <div className="post-author-row">
            <div className="author-info" onClick={handleOpenNeighbor} style={{ cursor: 'pointer' }}>
              <img src={displayAvatar} alt={displayName} className="author-avatar" />
              <div>
                <div className="author-name-group">
                  <span className="author-name">{displayName}</span>
                  <span title="Проверенный жилец дома"><CheckCircle2 size={15} className="text-blue" /></span>
                </div>
                <div className="author-timestamp-sub">{post.timestamp || 'Только что'}</div>
              </div>
            </div>

            <div className="post-meta-actions">
              {getCategoryBadge()}
              {isMeOrAdmin && (
                <button 
                  type="button" 
                  className="post-delete-btn" 
                  onClick={handleDeletePost} 
                  title="Удалить запись"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Title */}
      {post.title && <h3 className="post-title">{post.title}</h3>}

      {/* Content Body */}
      <p className="post-content">{post.content}</p>

      {/* Images */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((img, idx) => (
            <img key={idx} src={img} alt="Post attachment" className="post-img" />
          ))}
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll && Array.isArray(post.poll.options) && (
        <div className="poll-container">
          <div className="poll-question">📊 {post.poll.question}</div>
          <div className="poll-options">
            {post.poll.options.map((opt) => {
              const totalVotes = post.poll!.totalVotes || 0;
              const percentage = totalVotes > 0 
                ? Math.round((opt.votes / totalVotes) * 100) 
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
                    <span className="poll-opt-percent">{percentage}% ({opt.votes || 0})</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="poll-footer-info">Проголосовали: {post.poll.totalVotes || 0} соседей</div>
        </div>
      )}

      {/* Footer Bar */}
      {(() => {
        const commentsList = Array.isArray(post.comments) ? post.comments : [];
        const likesCount = typeof post.likes === 'number' ? post.likes : 0;

        return (
          <>
            <div className="post-actions-bar">
              <button 
                className={`action-btn ${post.userLiked ? 'liked' : ''}`}
                onClick={() => toggleLikePost(post.id)}
              >
                <Heart size={18} fill={post.userLiked ? '#ef4444' : 'none'} color={post.userLiked ? '#ef4444' : 'currentColor'} />
                <span>{likesCount}</span>
              </button>

              <button 
                className="action-btn"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle size={18} />
                <span>{commentsList.length} комментариев</span>
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
                  {commentsList.map((c) => {
                    const isCommentMe = user && c.authorName === user.name;
                    const commentAvatar = isCommentMe ? user.avatar : (c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
                    const commentName = isCommentMe ? user.name : (c.authorName || 'Сосед');

                    return (
                      <div key={c.id || Math.random()} className="comment-item">
                        <img src={commentAvatar} alt={commentName} className="comment-avatar" />
                        <div className="comment-bubble">
                          <div className="comment-meta">
                            <span className="comment-author">{commentName}</span>
                            {c.verified && <CheckCircle2 size={13} className="text-blue" />}
                            <span className="comment-addr">• {c.authorAddress || ''}</span>
                            <span className="comment-time">• {c.timestamp || 'Только что'}</span>
                            <button 
                              type="button" 
                              className="comment-reply-action-btn"
                              onClick={() => handleStartReply(commentName)}
                            >
                              <Reply size={12} /> Ответить
                            </button>
                          </div>

                          {c.replyToUser && (
                            <div className="reply-target-badge">
                              <Reply size={12} /> Ответ для <b>@{c.replyToUser}</b>
                            </div>
                          )}

                          <p className="comment-text">{c.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

          {/* Reply Indicator Pill */}
          {replyToAuthor && (
            <div className="reply-indicator-bar">
              <span>↩️ Отвечаем соседу <b>@{replyToAuthor}</b></span>
              <button type="button" onClick={() => setReplyToAuthor(null)} className="cancel-reply-btn">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quick Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="add-comment-form">
            <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} alt={user?.name || 'Вы'} className="comment-avatar" />
            <input 
              ref={commentInputRef}
              type="text" 
              placeholder={replyToAuthor ? `Ответ для @${replyToAuthor}...` : "Написать ответ соседям..."} 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="send-comment-btn" disabled={!commentText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      </>
      );
      })()}

      {/* Neighbor Profile Modal */}
      <NeighborProfileModal 
        isOpen={!!selectedNeighbor} 
        onClose={() => setSelectedNeighbor(null)} 
        neighbor={selectedNeighbor || { name: '', avatar: '' }} 
      />

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

        .post-meta-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .post-delete-btn {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #ef4444;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .post-delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
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

        .comment-reply-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #059669;
          font-weight: 700;
          font-size: 0.72rem;
          margin-left: auto;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .comment-reply-action-btn:hover {
          background: #ecfdf5;
        }

        .reply-target-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #047857;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 6px;
          margin-bottom: 4px;
        }

        .reply-indicator-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          color: #047857;
        }

        .cancel-reply-btn {
          background: none;
          border: none;
          color: #047857;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

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
