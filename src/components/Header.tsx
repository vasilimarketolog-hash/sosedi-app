import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, MapPin, PlusCircle, MessageSquare, 
  ChevronDown, CheckCircle2, UserPlus, User
} from 'lucide-react';
import { RadiusScope } from '../context/AppContext';
import { RegistrationModal } from './Auth/RegistrationModal';

export const Header: React.FC = () => {
  const { 
    user, 
    currentNeighborhood, 
    setCurrentNeighborhood, 
    availableNeighborhoods,
    setIsVerificationModalOpen,
    setIsCreatePostModalOpen,
    setIsCreateMarketModalOpen,
    setIsRegisteringView,
    activeTab,
    setActiveTab
  } = useApp();

  const [isNeighborhoodMenuOpen, setIsNeighborhoodMenuOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const neighborhoodRef = useRef<HTMLDivElement>(null);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(event.target as Node)) {
        setIsNeighborhoodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky-header">
      <div className="header-container">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="logo-box" onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <Building2 size={24} color="#ffffff" />
            </div>
            <div className="logo-text-group">
              <span className="logo-title">Соседи<span className="logo-accent">.Онлайн</span></span>
              <span className="logo-subtitle">🇧🇾 Сообщество жильцов</span>
            </div>
          </div>

        </div>

        {/* Action Buttons & User Profile */}
        <div className="actions-section">
          {/* Registration Button */}
          <button 
            className="btn btn-secondary reg-nav-btn"
            onClick={() => setIsRegisteringView(true)}
            title="Зарегистрироваться"
          >
            <UserPlus size={16} />
            <span className="btn-label-desktop">Регистрация</span>
          </button>

          {/* Quick Create Button (Message icon on mobile, text on desktop) */}
          <button 
            className="btn btn-primary write-btn" 
            onClick={() => activeTab === 'market' ? setIsCreateMarketModalOpen(true) : setIsCreatePostModalOpen(true)}
            title="Написать сообщение соседям"
          >
            <MessageSquare size={18} />
            <span className="btn-label-desktop">Написать</span>
          </button>

          {/* User Profile Avatar Button on Far Right */}
          <button 
            className={`header-profile-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="Мой профиль и настройки"
          >
            <img src={user.avatar} alt={user.name} className="header-avatar-img" />
          </button>
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
          gap: 12px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 16px;
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
          flex-shrink: 0;
        }

        .logo-text-group {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-weight: 800;
          font-size: 1.2rem;
          color: #0f172a;
          letter-spacing: -0.02em;
          white-space: nowrap;
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
        .text-muted { color: #94a3b8; }

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
          gap: 8px;
        }

        .reg-nav-btn {
          border-color: #059669;
          color: #059669;
        }
        .reg-nav-btn:hover {
          background: #ecfdf5;
        }

        .write-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-profile-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          padding: 0;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .header-profile-btn:hover, .header-profile-btn.active {
          border-color: #059669;
          transform: scale(1.05);
        }

        .header-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .dropdown-wrapper { display: none; }
          .logo-subtitle { display: none; }
          .btn-label-desktop { display: none; }
          .reg-nav-btn { padding: 8px 10px; }
          .write-btn { padding: 8px 12px; border-radius: 20px; }
          .header-container { padding: 8px 12px; gap: 8px; }
          .brand-section { gap: 6px; }
          .actions-section { gap: 6px; }
        }
      `}</style>
    </header>
  );
};
