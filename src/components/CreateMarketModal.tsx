import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Gift, Tag, DollarSign, Send } from 'lucide-react';

export const CreateMarketModal: React.FC = () => {
  const { isCreateMarketModalOpen, setIsCreateMarketModalOpen, addMarketItem, user } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [category, setCategory] = useState<'free' | 'furniture' | 'kids' | 'electronics' | 'auto' | 'repairs' | 'other'>('free');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [condition, setCondition] = useState<'new' | 'like_new' | 'used'>('like_new');

  if (!isCreateMarketModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMarketItem({
      title,
      price: isFree ? 0 : price,
      category: isFree ? 'free' : category,
      description,
      image: imageUrl || 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=800',
      sellerName: user.name,
      sellerAvatar: user.avatar,
      sellerAddress: `${user.building}, Подъезд ${user.entrance}`,
      sellerVerified: user.verified,
      status: 'available',
      condition,
    });

    setIsCreateMarketModalOpen(false);
    setTitle('');
    setPrice(0);
    setDescription('');
    setImageUrl('');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateMarketModalOpen(false)}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsCreateMarketModalOpen(false)}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>Подать объявление на Барахолку</h2>
          <p>Обмен и продажа вещей между соседями вашего ЖК</p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* Toggle Free vs Paid */}
          <div className="type-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${isFree ? 'active-free' : ''}`}
              onClick={() => { setIsFree(true); setCategory('free'); setPrice(0); }}
            >
              <Gift size={18} />
              <span>🎁 Отдам даром соседям</span>
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${!isFree ? 'active-paid' : ''}`}
              onClick={() => { setIsFree(false); setCategory('furniture'); }}
            >
              <Tag size={18} />
              <span>💰 Продажа вещи</span>
            </button>
          </div>

          <div className="form-group">
            <label>Название товара *</label>
            <input 
              type="text" 
              placeholder="Например: Детская коляска / Диван IKEA / Торшер"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {!isFree && (
            <div className="form-group">
              <label>Цена (руб.) *</label>
              <input 
                type="number" 
                placeholder="1500"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                required
              />
            </div>
          )}

          {!isFree && (
            <div className="form-group">
              <label>Категория товара</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="furniture">🪑 Мебель и интерьер</option>
                <option value="kids">🍼 Детские товары и игрушки</option>
                <option value="electronics">📱 Бытовая техника и электроника</option>
                <option value="auto">🚗 Авто & Вело товары</option>
                <option value="repairs">🛠 Остатки стройматериалов</option>
                <option value="other">📦 Разное</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Состояние товара</label>
            <div className="radio-group">
              <label><input type="radio" name="cond" checked={condition === 'like_new'} onChange={() => setCondition('like_new')} /> Как новое</label>
              <label><input type="radio" name="cond" checked={condition === 'used'} onChange={() => setCondition('used')} /> Б/У (хорошее)</label>
              <label><input type="radio" name="cond" checked={condition === 'new'} onChange={() => setCondition('new')} /> Новое в упаковке</label>
            </div>
          </div>

          <div className="form-group">
            <label>Описание вещи</label>
            <textarea 
              rows={3}
              placeholder="Укажите размеры, особенности или условия самовывоза..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Ссылка на фото</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary w-full">
              <Send size={16} />
              <span>Опубликовать объявление</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .type-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.88rem;
          color: #475569;
        }

        .toggle-btn.active-free {
          background: #ecfdf5;
          border-color: #059669;
          color: #059669;
        }

        .toggle-btn.active-paid {
          background: #eff6ff;
          border-color: #2563eb;
          color: #2563eb;
        }

        .radio-group {
          display: flex;
          gap: 16px;
          font-size: 0.85rem;
          color: #334155;
        }

        .radio-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
