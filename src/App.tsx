import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VerificationModal } from './components/VerificationModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateMarketModal } from './components/CreateMarketModal';
import { RegistrationModal } from './components/Auth/RegistrationModal';

import { FeedView } from './components/Feed/FeedView';
import { MarketplaceView } from './components/Market/MarketplaceView';
import { MastersView } from './components/Masters/MastersView';
import { NeighborhoodMap } from './components/Map/NeighborhoodMap';
import { HouseChatsView } from './components/Chats/HouseChatsView';
import { ProfileView } from './components/Profile/ProfileView';

import { Newspaper, ShoppingBag, Wrench, MapPin, MessageSquare, User } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isRegisteringView, setIsRegisteringView } = useApp();

  // If user clicked Registration, render dedicated Registration Page screen!
  if (isRegisteringView) {
    return (
      <RegistrationModal 
        isOpen={true} 
        onClose={() => setIsRegisteringView(false)} 
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'market':
        return <MarketplaceView />;
      case 'masters':
        return <MastersView />;
      case 'map':
        return <NeighborhoodMap />;
      case 'chats':
        return <HouseChatsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="app-layout">
      <Header />

      <main className="main-container">
        <Sidebar />
        <div className="content-area">
          {renderActiveTab()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className={activeTab === 'feed' ? 'active' : ''} onClick={() => setActiveTab('feed')}>
          <Newspaper size={20} />
          <span>Лента</span>
        </button>
        <button className={activeTab === 'market' ? 'active' : ''} onClick={() => setActiveTab('market')}>
          <ShoppingBag size={20} />
          <span>Даром</span>
        </button>
        <button className={activeTab === 'masters' ? 'active' : ''} onClick={() => setActiveTab('masters')}>
          <Wrench size={20} />
          <span>Мастера</span>
        </button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>
          <MapPin size={20} />
          <span>Карта</span>
        </button>
        <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}>
          <MessageSquare size={20} />
          <span>Чаты</span>
        </button>
      </nav>

      {/* Modals */}
      <VerificationModal />
      <CreatePostModal />
      <CreateMarketModal />

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-main);
        }

        .main-container {
          max-width: 1320px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px 40px;
          display: flex;
          gap: 24px;
          flex: 1;
        }

        .content-area {
          flex: 1;
          min-width: 0;
        }

        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: 8px 12px;
          justify-content: space-around;
          z-index: 900;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
        }

        .mobile-bottom-nav button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
        }

        .mobile-bottom-nav button.active {
          color: #059669;
        }

        @media (max-width: 900px) {
          .main-container {
            flex-direction: column;
            padding: 16px 12px 80px;
          }
          .mobile-bottom-nav {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Произошла ошибка при загрузке страницы</h2>
          <p>Мы очистили устаревший кэш. Перезагрузите страницу для продолжения.</p>
          <button 
            style={{ padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => {
              try { localStorage.clear(); } catch(e){}
              window.location.reload();
            }}
          >
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
