import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, ShieldCheck, MapPin, Search, PlusCircle, 
  Bell, ChevronDown, CheckCircle2, UserCheck, AlertTriangle, Sparkles, UserPlus
} from 'lucide-react';
import { RadiusScope } from '../context/AppContext';
import { RegistrationModal } from './Auth/RegistrationModal';

export const Header: React.FC = () => {
  const { 
    user, 
    currentNeighborhood, 
    setCurrentNeighborhood, 
    availableNeighborhoods,
    radiusScope,
    setRadiusScope,
    setIsVerificationModalOpen,
    setIsCreatePostModalOpen,
    setIsCreateMarketModalOpen,
    setIsRegisteringView,
    activeTab
  } = useApp();

  const [isNeighborhoodMenuOpen, setIsNeighborhoodMenuOpen] = useState(false);
  const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(event.target as Node)) {
        setIsNeighborhoodMenuOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setIsScopeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scopeLabels: Record<RadiusScope, string> = {
    house: 'Только мой дом',
    complex: 'Мой ЖК (все корпуса)',
    district: 'Микрорайон (1.5 км)',
    city: 'Весь район'
  };

  return (
    <header className="sticky-header">
      <div className="header-container">
        {/* Brand & Neighborhood Selector */}
        <div className="brand-section">
          <div className="logo-box">
            <div className="logo-icon">
              <Building2 size={24} color="#ffffff" />
            </div>
            <div className="logo-text-group">
              <span className="logo-title">Соседи<span className="logo-accent">.Онлайн</span></span>
              <span className="logo-subtitle">🇧🇾 Беларусь • 🇰🇿 Казахстан</span>
            </div>
          </div>

          {/* Neighborhood Selector Dropdown */}
          <div className="dropdown-wrapper" ref={neighborhoodRef}>
            <button 
              className="neighborhood-selector-btn"
              onClick={() => setIsNeighborhoodMenuOpen(!isNeighborhoodMenuOpen)}
            >
              <MapPin size={16} className="text-emerald" />
              <span className="neighborhood-name">{currentNeighborhood.name}</span>
              <ChevronDown size={14} className="text-muted" />
            </button>

            {isNeighborhoodMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Выберите ваш ЖК или микрорайон</div>
                {availableNeighborhoods.map((n) => (
                  <button
                    key={n.id}
                    className={`dropdown-item ${n.id === currentNeighborhood.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentNeighborhood(n);
                      setIsNeighborhoodMenuOpen(false);
                    }}
                  >
                    <div className="item-icon">🏢</div>
                    <div className="item-content">
                      <div className="item-title">{n.name}</div>
                      <div className="item-subtitle">{n.city}, {n.district} • {n.residentsCount} соседей</div>
                    </div>
                    {n.id === currentNeighborhood.id && <CheckCircle2 size={16} className="text-emerald" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons & User Verification / Registration */}
        <div className="actions-section">
          {/* Country Flag Badge */}
          {user.country && (
            <span className="country-badge-flag" title={user.country === 'BY' ? 'Республика Беларусь' : 'Республика Казахстан'}>
              {user.country === 'BY' ? '🇧🇾 РБ' : '🇰🇿 РК'}
            </span>
          )}

          {/* Verification Status */}
          {user.verified ? (
            <div className="verified-badge-pill" title={user.verifiedMethod}>
              <ShieldCheck size={16} className="text-blue" />
              <span>Проверенный сосед</span>
            </div>
          ) : (
            <button 
              className="unverified-btn-pill"
              onClick={() => setIsVerificationModalOpen(true)}
            >
              <AlertTriangle size={15} className="text-amber" />
              <span>Подтвердить адрес</span>
            </button>
          )}

          {/* Registration Button */}
          <button 
            className="btn btn-secondary reg-nav-btn"
            onClick={() => setIsRegisteringView(true)}
          >
            <UserPlus size={16} />
            <span>Регистрация</span>
          </button>

          {/* Quick Create Buttons */}
          {activeTab === 'market' ? (
            <button className="btn btn-primary" onClick={() => setIsCreateMarketModalOpen(true)}>
              <PlusCircle size={18} />
              <span>Подать объявление</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsCreatePostModalOpen(true)}>
              <PlusCircle size={18} />
              <span>Написать соседям</span>
            </button>
          )}
        </div>
      </div>

      <RegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
      />

      <style>{`
        .sticky-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
        }

        .header-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
        }

        .logo-text-group {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-weight: 800;
          font-size: 1.25rem;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .logo-accent {
          color: #059669;
        }

        .logo-subtitle {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        .dropdown-wrapper {
          position: relative;
        }

        .neighborhood-selector-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.2s ease;
        }

        .neighborhood-selector-btn:hover {
          background: #e2e8f0;
        }

        .text-emerald { color: #059669; }
        .text-blue { color: #0284c7; }
        .text-amber { color: #d97706; }
        .text-muted { color: #94a3b8; }

        .scope-selector-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }

        .scope-selector-btn:hover {
          border-color: #059669;
        }

        .scope-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 6px rgba(5, 150, 105, 0.5);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 280px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          padding: 8px;
          z-index: 200;
          animation: fadeIn 0.2s ease;
        }

        .dropdown-header {
          padding: 6px 12px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          text-align: left;
          transition: background 0.15s ease;
        }

        .dropdown-item:hover {
          background: #f8fafc;
        }

        .dropdown-item.active {
          background: #ecfdf5;
        }

        .item-icon {
          font-size: 1.2rem;
        }

        .item-title {
          font-weight: 600;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .item-subtitle {
          font-size: 0.75rem;
          color: #64748b;
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .country-badge-flag {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
        }

        .verified-badge-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 20px;
          color: #0284c7;
          font-weight: 600;
          font-size: 0.82rem;
        }

        .unverified-btn-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 20px;
          color: #b45309;
          font-weight: 600;
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .unverified-btn-pill:hover {
          background: #fef3c7;
        }

        .reg-nav-btn {
          border-color: #059669;
          color: #059669;
        }
        .reg-nav-btn:hover {
          background: #ecfdf5;
        }

        @media (max-width: 768px) {
          .dropdown-wrapper { display: none; }
          .country-badge-flag { display: none; }
          .verified-badge-pill span, .unverified-btn-pill span { display: none; }
          .verified-badge-pill, .unverified-btn-pill { padding: 6px 8px; }
          .reg-nav-btn span { display: none; }
          .reg-nav-btn { padding: 8px 10px; }
          .header-container { padding: 8px 10px; gap: 8px; }
          .brand-section { gap: 6px; }
          .actions-section { gap: 6px; }
        }
      `}</style>
    </header>
  );
};
