import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryType } from '../types';
import { X, Image, BarChart2, AlertTriangle, Send } from 'lucide-react';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, addPost, user } = useApp();

  const [category, setCategory] = useState<CategoryType>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Да, поддерживаю', 'Нет, против', 'Уточнить детали']);

  if (!isCreatePostModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let pollData;
    if (showPoll && pollQuestion.trim()) {
      pollData = {
        id: `poll_${Date.now()}`,
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((opt, i) => ({
          id: `opt_${i}`,
          text: opt,
          votes: 0,
        })),
        totalVotes: 0,
      };
    }

    addPost({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorAddress: `${user.building}, Подъезд ${user.entrance}`,
      verified: user.verified,
      category,
      title: title.trim() || undefined,
      content,
      images: imageUrl ? [imageUrl] : undefined,
      poll: pollData,
      tags: category === 'urgent' ? ['Срочно', 'Внимание'] : undefined,
    });

    setIsCreatePostModalOpen(false);
    // Reset form
    setTitle('');
    setContent('');
    setImageUrl('');
    setShowPoll(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreatePostModalOpen(false)}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsCreatePostModalOpen(false)}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>Создать запись во дворе</h2>
          <p>Ваше сообщение увидят соседи вашего дома и ЖК</p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-group">
            <label>Категория сообщения</label>
            <div className="category-chips">
              <button 
                type="button"
                className={`chip ${category === 'general' ? 'active' : ''}`}
                onClick={() => setCategory('general')}
              >
                💬 Общение
              </button>
              <button 
                type="button"
                className={`chip urgent ${category === 'urgent' ? 'active' : ''}`}
                onClick={() => setCategory('urgent')}
              >
                🚨 Срочно / Инцидент
              </button>
              <button 
                type="button"
                className={`chip ${category === 'improvements' ? 'active' : ''}`}
                onClick={() => setCategory('improvements')}
              >
                🌿 Благоустройство
              </button>
              <button 
                type="button"
                className={`chip ${category === 'uk_news' ? 'active' : ''}`}
                onClick={() => setCategory('uk_news')}
              >
                📢 Объявление УК
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Заголовок (необязательно)</label>
            <input 
              type="text" 
              placeholder="Например: Пропал кот / Затопление / Вопрос про парковку"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Текст сообщения *</label>
            <textarea 
              rows={4}
              placeholder="Расскажите подробнее соседям..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Ссылка на фото (или прикрепите изображение)</label>
            <div className="image-input-row">
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" onClick={() => setImageUrl('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800')}>
                Пример
              </button>
            </div>
          </div>

          {/* Poll section toggle */}
          {!showPoll ? (
            <button 
              type="button" 
              className="add-feature-btn"
              onClick={() => setShowPoll(true)}
            >
              <BarChart2 size={16} />
              <span>Добавить опрос для соседей</span>
            </button>
          ) : (
            <div className="poll-builder">
              <div className="poll-header">
                <span>📊 Опрос соседей</span>
                <button type="button" onClick={() => setShowPoll(false)} className="text-red">Удалить</button>
              </div>
              <input 
                type="text" 
                placeholder="Вопрос (например: Нужен ли шлагбаум?)" 
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              {pollOptions.map((opt, idx) => (
                <input 
                  key={idx}
                  type="text"
                  placeholder={`Вариант ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                />
              ))}
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary w-full">
              <Send size={16} />
              <span>Опубликовать во дворе</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
        }

        .chip.active {
          background: #ecfdf5;
          border-color: #059669;
          color: #059669;
        }

        .chip.urgent.active {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }

        .image-input-row {
          display: flex;
          gap: 8px;
        }

        .image-input-row input { flex: 1; }

        .add-feature-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #059669;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 0;
        }

        .poll-builder {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .poll-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .text-red { color: #ef4444; font-size: 0.78rem; }
      `}</style>
    </div>
  );
};
