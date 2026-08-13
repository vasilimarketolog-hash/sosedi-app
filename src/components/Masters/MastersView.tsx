import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, Phone, Star, ShieldCheck, CheckCircle2, Search, MapPin, Award } from 'lucide-react';

export const MastersView: React.FC = () => {
  const { masters, masterCategoryFilter, setMasterCategoryFilter } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactPhone, setActiveContactPhone] = useState<string | null>(null);

  const filteredMasters = masters.filter((m) => {
    const matchesCat = masterCategoryFilter === 'all' || m.categorySlug === masterCategoryFilter;
    const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const categories = [
    { id: 'all', label: 'Все категории' },
    { id: 'plumbing', label: '🚿 Сантехника' },
    { id: 'electric', label: '⚡ Электрика' },
    { id: 'tutor', label: '📚 Репетиторы' },
    { id: 'pets', label: '🐶 Выгул и животные' },
  ];

  return (
    <div className="masters-view animate-fade-in">
      {/* Hero Header */}
      <div className="masters-hero-card">
        <div className="hero-left">
          <div className="badge badge-primary">🛠️ Проверенные мастера нашего ЖК</div>
          <h2>Нужен электрик или репетитор? Вызовите соседа!</h2>
          <p>Все специалисты проживают в нашем ЖК. Настоящие отзывы от жителей без накруток.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по услугам (например: замена смесителя, ЕГЭ, выгул)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="cats-pills">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`cat-pill ${masterCategoryFilter === c.id ? 'active' : ''}`}
              onClick={() => setMasterCategoryFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masters Cards List */}
      <div className="masters-list">
        {filteredMasters.map((m) => (
          <div key={m.id} className="card master-card">
            <div className="master-top">
              <img src={m.avatar} alt={m.name} className="master-avatar" />
              <div className="master-header-info">
                <div className="master-name-row">
                  <span className="master-name">{m.name}</span>
                  <span title="Проверенный сосед"><CheckCircle2 size={16} className="text-blue" /></span>
                </div>

                <div className="master-cat-name">{m.category}</div>

                <div className="rating-row">
                  <span className="stars">⭐ {m.rating}</span>
                  <span className="reviews-count">({m.reviewsCount} отзывов от соседей)</span>
                </div>
              </div>

              <div className="price-tag">{m.priceStarting}</div>
            </div>

            <div className="master-address-row">
              <MapPin size={14} className="text-emerald" />
              <span>{m.address}</span>
            </div>

            <p className="master-desc">{m.description}</p>

            {/* Skills & Badges */}
            <div className="skills-row">
              {m.skills.map((skill, idx) => (
                <span key={idx} className="skill-chip">{skill}</span>
              ))}
            </div>

            <div className="badges-row">
              {m.badges.map((b, idx) => (
                <span key={idx} className="badge badge-verified">
                  <Award size={12} /> {b}
                </span>
              ))}
            </div>

            {/* Action Footer */}
            <div className="master-footer">
              {activeContactPhone === m.id ? (
                <div className="phone-revealed-box">
                  <Phone size={16} />
                  <span>{m.phone}</span>
                </div>
              ) : (
                <button className="btn btn-primary w-full" onClick={() => setActiveContactPhone(m.id)}>
                  <Phone size={16} />
                  <span>Показать телефон и связаться</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .masters-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .masters-hero-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .masters-hero-card h2 {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 8px 0 4px;
        }

        .masters-hero-card p {
          font-size: 0.85rem;
          color: #64748b;
        }

        .filters-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .search-box {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .cats-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .cat-pill {
          padding: 8px 16px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        .cat-pill.active {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        .masters-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .master-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .master-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .master-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .master-header-info {
          flex: 1;
        }

        .master-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .master-name {
          font-weight: 800;
          font-size: 1.05rem;
          color: #0f172a;
        }

        .master-cat-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #059669;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          margin-top: 2px;
        }

        .stars { font-weight: 700; color: #d97706; }
        .reviews-count { color: #64748b; }

        .price-tag {
          font-weight: 800;
          font-size: 1rem;
          color: #0f172a;
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .master-address-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #475569;
          font-weight: 600;
        }

        .master-desc {
          font-size: 0.88rem;
          color: #334155;
          line-height: 1.4;
        }

        .skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-chip {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 500;
        }

        .badges-row {
          display: flex;
          gap: 8px;
        }

        .master-footer {
          margin-top: 6px;
        }

        .phone-revealed-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 12px;
          border-radius: 10px;
          color: #047857;
          font-weight: 800;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
