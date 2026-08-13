import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Gift, PlusCircle, CheckCircle2, Tag, Eye, Heart, MessageCircle, MapPin } from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { marketItems, marketFilter, setMarketFilter, setIsCreateMarketModalOpen, user } = useApp();
  const [reservedIds, setReservedIds] = useState<string[]>([]);

  const filteredItems = marketItems.filter(item => {
    if (marketFilter === 'all') return true;
    if (marketFilter === 'free') return item.price === 0;
    return item.category === marketFilter;
  });

  const handleReserve = (id: string) => {
    if (reservedIds.includes(id)) {
      setReservedIds(reservedIds.filter(i => i !== id));
    } else {
      setReservedIds([...reservedIds, id]);
    }
  };

  const categories = [
    { id: 'all', label: 'Все товары' },
    { id: 'free', label: '🎁 Отдам даром' },
    { id: 'furniture', label: '🪑 Мебель' },
    { id: 'kids', label: '🍼 Детское' },
    { id: 'electronics', label: '📱 Техника' },
    { id: 'repairs', label: '🛠 Стройматериалы' },
  ];

  return (
    <div className="marketplace-view animate-fade-in">
      {/* Banner / Header */}
      <div className="market-hero-card">
        <div className="hero-content">
          <div className="hero-badge">🛍️ Соседская Барахолка</div>
          <h2>Покупайте, продавайте и отдавайте бесплатно прямо в вашем доме</h2>
          <p>Без комиссий, без поездок на другой конец города — просто поднимитесь на нужный этаж!</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setIsCreateMarketModalOpen(true)}>
          <PlusCircle size={20} />
          <span>Отдать / Продать вещь</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="market-filters-row">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`market-filter-chip ${marketFilter === cat.id ? 'active' : ''} ${cat.id === 'free' ? 'free-chip' : ''}`}
            onClick={() => setMarketFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="market-grid">
        {filteredItems.map((item) => {
          const isReserved = reservedIds.includes(item.id);

          return (
            <div key={item.id} className="market-item-card card">
              <div className="item-image-wrapper">
                <img src={item.image} alt={item.title} className="item-img" />
                {item.price === 0 ? (
                  <span className="price-badge free-badge">🎁 Отдам даром</span>
                ) : (
                  <span className="price-badge paid-badge">{item.price.toLocaleString('ru-RU')} ₽</span>
                )}
                {isReserved && <div className="reserved-overlay">ЗАБРОНИРОВАНО</div>}
              </div>

              <div className="item-body">
                <div className="item-title">{item.title}</div>
                <p className="item-desc">{item.description}</p>

                {/* Seller info */}
                <div className="seller-row">
                  <img src={item.sellerAvatar} alt={item.sellerName} className="seller-avatar" />
                  <div className="seller-meta">
                    <div className="seller-name-group">
                      <span className="seller-name">{item.sellerName}</span>
                      {item.sellerVerified && <CheckCircle2 size={13} className="text-blue" />}
                    </div>
                    <span className="seller-addr"><MapPin size={11} /> {item.sellerAddress}</span>
                  </div>
                </div>

                {/* Footer action */}
                <div className="item-footer">
                  <button 
                    className={`btn ${isReserved ? 'btn-secondary' : 'btn-primary'} btn-sm w-full`}
                    onClick={() => handleReserve(item.id)}
                  >
                    {isReserved ? 'Отменить бронь' : 'Написать продавцу в чат'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .marketplace-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .market-hero-card {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border-radius: var(--radius-lg);
          padding: 24px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: var(--shadow-md);
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .hero-content h2 {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 6px;
        }

        .hero-content p {
          font-size: 0.88rem;
          opacity: 0.9;
        }

        .btn-lg {
          padding: 12px 24px;
          font-size: 0.95rem;
          background: #ffffff;
          color: #059669;
          flex-shrink: 0;
        }

        .btn-lg:hover {
          background: #f0fdf4;
        }

        .market-filters-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .market-filter-chip {
          padding: 8px 18px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        .market-filter-chip.active {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        .market-filter-chip.free-chip.active {
          background: #10b981;
          border-color: #10b981;
        }

        .market-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .market-item-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .item-image-wrapper {
          position: relative;
          height: 190px;
          background: #f1f5f9;
        }

        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .price-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.88rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .free-badge {
          background: #10b981;
          color: #ffffff;
        }

        .paid-badge {
          background: #0f172a;
          color: #ffffff;
        }

        .reserved-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .item-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .item-title {
          font-weight: 700;
          font-size: 1rem;
          color: #0f172a;
          line-height: 1.3;
        }

        .item-desc {
          font-size: 0.82rem;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .seller-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .seller-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
        }

        .seller-name-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .seller-name {
          font-weight: 700;
          font-size: 0.82rem;
          color: #0f172a;
        }

        .seller-addr {
          font-size: 0.74rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .item-footer {
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};
