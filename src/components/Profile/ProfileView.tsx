import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2, Heart, Award, MapPin, Calendar, Edit3, Sparkles } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, posts, setIsVerificationModalOpen, currentNeighborhood } = useApp();

  const userPosts = posts.filter(p => p.authorId === user.id);

  return (
    <div className="profile-view animate-fade-in">
      {/* Profile Header Card */}
      <div className="profile-card card">
        <div className="profile-hero-bg"></div>
        <div className="profile-body">
          <div className="avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
            {user.verified && <CheckCircle2 size={24} className="verified-badge-icon" />}
          </div>

          <div className="profile-details">
            <div className="profile-name-row">
              <h2>{user.name}</h2>
              {user.verified ? (
                <span className="badge badge-verified"><ShieldCheck size={14} /> Проверенный жилец</span>
              ) : (
                <button className="badge badge-urgent" onClick={() => setIsVerificationModalOpen(true)}>
                  Подтвердить адрес
                </button>
              )}
            </div>

            <div className="profile-address">
              <MapPin size={16} className="text-emerald" />
              <span>{user.address} (Подъезд {user.entrance}, кв. {user.apartment})</span>
            </div>

            <p className="profile-bio">{user.bio}</p>
            <div className="profile-joined">
              <Calendar size={14} /> Участник сообщества {currentNeighborhood.name} с {user.joinedDate}
            </div>
          </div>
        </div>
      </div>

      {/* Karma & Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon-bg emerald">⭐</div>
          <div>
            <div className="stat-val">{user.rating} / 5.0</div>
            <div className="stat-lbl">Рейтинг доверия соседей</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-bg red">❤️</div>
          <div>
            <div className="stat-val">{user.thanksCount}</div>
            <div className="stat-lbl">«Спасибо» от жителей</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-bg blue">📝</div>
          <div>
            <div className="stat-val">{userPosts.length}</div>
            <div className="stat-lbl">Опубликовано записей во дворе</div>
          </div>
        </div>
      </div>

      {/* Verified Status Information Card */}
      <div className="verification-status-card card">
        <div className="verif-header">
          <ShieldCheck size={24} className="text-emerald" />
          <div>
            <div className="verif-title">Статус безопасности и верификации</div>
            <div className="verif-sub">{user.verifiedMethod || 'Адрес подтверждён через Росреестр / Госуслуги'}</div>
          </div>
        </div>

        <div className="verif-features">
          <div className="verif-feat"><CheckCircle2 size={16} className="text-emerald" /> Доступ к голосованиям по благоустройству ЖК</div>
          <div className="verif-feat"><CheckCircle2 size={16} className="text-emerald" /> Права публикации в закрытых чатах подъезда</div>
          <div className="verif-feat"><CheckCircle2 size={16} className="text-emerald" /> Синяя галочка проверенного соседа</div>
        </div>
      </div>

      <style>{`
        .profile-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .profile-card {
          padding: 0;
          overflow: hidden;
        }

        .profile-hero-bg {
          height: 120px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }

        .profile-body {
          padding: 0 24px 24px;
          margin-top: -50px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .avatar-wrapper {
          position: relative;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #ffffff;
          box-shadow: var(--shadow-md);
        }

        .verified-badge-icon {
          position: absolute;
          bottom: 4px;
          right: 4px;
          color: #0284c7;
          background: #ffffff;
          border-radius: 50%;
        }

        .profile-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 54px;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-name-row h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .profile-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .profile-bio {
          font-size: 0.88rem;
          color: #475569;
        }

        .profile-joined {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
        }

        .stat-icon-bg {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .stat-icon-bg.emerald { background: #ecfdf5; }
        .stat-icon-bg.red { background: #fef2f2; }
        .stat-icon-bg.blue { background: #f0f9ff; }

        .stat-val {
          font-weight: 800;
          font-size: 1.15rem;
          color: #0f172a;
        }

        .stat-lbl {
          font-size: 0.78rem;
          color: #64748b;
        }

        .verification-status-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
          border-color: #bbf7d0;
        }

        .verif-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .verif-title { font-weight: 700; font-size: 1rem; color: #065f46; }
        .verif-sub { font-size: 0.82rem; color: #047857; }

        .verif-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #dcfce7;
        }

        .verif-feat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #166534;
        }
      `}</style>
    </div>
  );
};
