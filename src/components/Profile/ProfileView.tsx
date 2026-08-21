import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2, Heart, Award, MapPin, Calendar, Edit3, Sparkles, Camera, Save, X } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, setUser, posts, setIsVerificationModalOpen, currentNeighborhood } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const userPosts = posts.filter(p => p.authorId === user.id);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAvatarUrl = event.target.result as string;
        setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name: editName.trim() || prev.name,
      bio: editBio.trim() || prev.bio,
    }));
    setIsEditing(false);
  };

  return (
    <div className="profile-view animate-fade-in">
      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={avatarInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* Profile Header Card */}
      <div className="profile-card card">
        <div className="profile-hero-bg"></div>
        <div className="profile-body">
          <div className="avatar-wrapper" onClick={() => avatarInputRef.current?.click()} title="Нажмите, чтобы загрузить новое фото профиля">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
            <div className="avatar-upload-overlay">
              <Camera size={20} color="#ffffff" />
            </div>
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

              <button 
                className="btn btn-secondary btn-sm edit-profile-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Отмена' : 'Изменить'}</span>
              </button>
            </div>

            <div className="profile-address">
              <MapPin size={16} className="text-emerald" />
              <span>{user.address} (Подъезд {user.entrance}, кв. {user.apartment})</span>
            </div>

            {/* Edit Form or Bio Text */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="edit-profile-form">
                <div className="form-group">
                  <label>Ваше Имя и Фамилия</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Загрузка фото профиля</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm upload-photo-btn"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    <span>Выбрать фото из галереи</span>
                  </button>
                </div>

                <div className="form-group">
                  <label>О себе / Описание профиля</label>
                  <textarea 
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>

                <div className="flex-row">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={14} /> Сохранить изменения
                  </button>
                </div>
              </form>
            ) : (
              <p className="profile-bio">{user.bio}</p>
            )}

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
          cursor: pointer;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #ffffff;
          box-shadow: var(--shadow-md);
          display: block;
        }

        .avatar-upload-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .avatar-wrapper:hover .avatar-upload-overlay {
          opacity: 1;
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
          flex-wrap: wrap;
        }

        .profile-name-row h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .edit-profile-btn {
          margin-left: auto;
        }

        .edit-profile-form {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 8px 0;
        }

        .upload-photo-btn {
          width: fit-content;
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

        @media (max-width: 640px) {
          .profile-body {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .profile-name-row {
            justify-content: center;
          }
          .edit-profile-btn {
            margin-left: 0;
          }
          .profile-address, .profile-joined {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
