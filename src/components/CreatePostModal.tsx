import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryType } from '../types';
import { X, Image as ImageIcon, Video, BarChart2, AlertTriangle, Send, Plus, Trash2, Calendar, Paperclip, Check } from 'lucide-react';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, addPost, user } = useApp();

  const [category, setCategory] = useState<CategoryType>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ url: string; isVideo: boolean }[]>([]);
  
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Да, поддерживаю', 'Нет, против', 'Уточнить детали']);
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreatePostModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedFiles(prev => [...prev, { url: event.target!.result as string, isVideo }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPublishing) return;

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

    // Combine uploaded files and image URL
    const allImages = [...attachedFiles.map(f => f.url)];
    if (imageUrl.trim()) allImages.push(imageUrl.trim());

    setIsPublishing(true);

    try {
      await addPost({
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorAddress: `${user.building}, Подъезд ${user.entrance}`,
        verified: user.verified,
        category,
        title: title.trim() || undefined,
        content,
        images: allImages.length > 0 ? allImages : undefined,
        poll: pollData,
        tags: category === 'urgent' ? ['Срочно', 'Внимание'] : category === 'events' ? ['Событие во дворе'] : undefined,
      });
    } catch (err) {
      console.warn('Error publishing post:', err);
    } finally {
      setIsPublishing(false);
      setIsCreatePostModalOpen(false);
      // Reset form
      setTitle('');
      setContent('');
      setImageUrl('');
      setAttachedFiles([]);
      setShowPoll(false);
    }
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
          {/* Dropdown Category Selector */}
          <div className="form-group">
            <label>Категория публикации *</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="category-dropdown-select"
            >
              <option value="general">💬 Общение соседей</option>
              <option value="events">🎉 Событие / Праздник / Субботник</option>
              <option value="urgent">🚨 Срочно / Инцидент / Авария</option>
              <option value="improvements">🌿 Благоустройство двора</option>
              <option value="uk_news">📢 Объявление УК / ТСЖ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Заголовок (необязательно)</label>
            <input 
              type="text" 
              placeholder="Например: Праздник двора / Вопрос про парковку"
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

          {/* Media Attachments: File upload & URL */}
          <div className="form-group">
            <label>Прикрепить фото или видео</label>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,video/*" 
              multiple 
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div className="media-attach-bar">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={16} />
                <span>Загрузить фото/видео из галереи</span>
              </button>

              <div className="image-url-row">
                <input 
                  type="url" 
                  placeholder="Или вставьте ссылку на фото (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="url-input-sm"
                />
              </div>
            </div>

            {/* Attached Thumbnails Preview */}
            {attachedFiles.length > 0 && (
              <div className="attached-previews-grid">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="preview-thumb-box">
                    {file.isVideo ? (
                      <video src={file.url} className="preview-media" />
                    ) : (
                      <img src={file.url} alt="Uploaded preview" className="preview-media" />
                    )}
                    <button 
                      type="button" 
                      className="remove-thumb-btn"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <span>📊 Конструктор опроса соседей</span>
                <button type="button" onClick={() => setShowPoll(false)} className="text-red">Удалить опрос</button>
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  className="poll-question-input"
                  placeholder="Тема опроса (например: Нужен ли шлагбаум?)" 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
              </div>

              <div className="poll-options-list">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="poll-option-row">
                    <input 
                      type="text"
                      className="poll-option-input"
                      placeholder={`Вариант ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                    />
                    {pollOptions.length > 2 && (
                      <button 
                        type="button" 
                        className="poll-remove-opt-btn"
                        onClick={() => handleRemovePollOption(idx)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 6 && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm add-opt-btn"
                  onClick={handleAddPollOption}
                >
                  <Plus size={14} /> Добавить вариант ответа
                </button>
              )}
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary w-full" disabled={isPublishing}>
              <Send size={16} />
              <span>{isPublishing ? 'Публикуется...' : 'Опубликовать во дворе'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .category-dropdown-select {
          font-weight: 700 !important;
          font-size: 0.92rem !important;
          padding: 10px 14px !important;
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }

        .media-attach-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attach-file-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #334155;
          width: fit-content;
        }

        .url-input-sm {
          font-size: 0.82rem !important;
          padding: 6px 12px !important;
        }

        .attached-previews-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .preview-thumb-box {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }

        .preview-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-thumb-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .add-feature-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #059669;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 10px 14px;
          border: 1px dashed #a7f3d0;
          border-radius: 10px;
          background: #f0fdf4;
        }

        .poll-builder {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .poll-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .poll-question-input {
          font-weight: 600;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
        }

        .poll-options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .poll-option-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .poll-option-input {
          flex: 1;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 0.85rem !important;
        }

        .poll-remove-opt-btn {
          background: none;
          border: none;
          color: #ef4444;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }

        .poll-remove-opt-btn:hover {
          background: #fee2e2;
        }

        .add-opt-btn {
          align-self: flex-start;
          margin-top: 4px;
        }

        .text-red { color: #ef4444; font-size: 0.78rem; font-weight: 600; }
      `}</style>
    </div>
  );
};
