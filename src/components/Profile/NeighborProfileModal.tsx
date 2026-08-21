import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, CheckCircle2, MessageSquare, MapPin, Star, Heart, Building2 } from 'lucide-react';

interface NeighborProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighbor: {
    name: string;
    avatar: string;
    address?: string;
    verified?: boolean;
  };
}

export const NeighborProfileModal: React.FC<NeighborProfileModalProps> = ({ isOpen, onClose, neighbor }) => {
  const { openDirectChat, user } = useApp();

  if (!isOpen) return null;

  const isMe = neighbor.name === user.name;

  const handleStartDM = () => {
    onClose();
    openDirectChat(neighbor.name, neighbor.avatar, neighbor.address);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content neighbor-profile-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="neighbor-card-body">
          <div className="neighbor-hero-bg"></div>

          <div className="neighbor-main-info">
            <div className="avatar-box">
              <img src={neighbor.avatar} alt={neighbor.name} className="neighbor-avatar-img" />
              {neighbor.verified && <CheckCircle2 size={22} className="verified-badge" />}
            </div>

            <h3 className="neighbor-name-title">{neighbor.name}</h3>

            <div className="neighbor-address-pill">
              <MapPin size={15} className="text-emerald" />
              <span>{neighbor.address || 'Проверенный жилец ЖК «Новая Боровая»'}</span>
            </div>

            {/* Rating & Karma */}
            <div className="neighbor-karma-row">
              <div className="karma-col">
                <span className="karma-num">⭐ 4.9</span>
                <span className="karma-label">Рейтинг соседа</span>
              </div>
              <div className="karma-divider"></div>
              <div className="karma-col">
                <span className="karma-num">❤️ 38</span>
                <span className="karma-label">«Спасибо» во дворе</span>
              </div>
            </div>

            {/* Direct Message Action */}
            {!isMe && (
              <button className="btn btn-primary w-full start-dm-btn" onClick={handleStartDM}>
                <MessageSquare size={18} />
                <span>Написать в личные сообщения (ЛС)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .neighbor-profile-modal {
          padding: 0 !important;
          overflow: hidden;
          max-width: 440px !important;
        }

        .neighbor-hero-bg {
          height: 100px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }

        .neighbor-main-info {
          padding: 0 20px 24px;
          margin-top: -45px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .avatar-box {
          position: relative;
        }

        .neighbor-avatar-img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #ffffff;
          box-shadow: var(--shadow-md);
        }

        .verified-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          color: #0284c7;
          background: #ffffff;
          border-radius: 50%;
        }

        .neighbor-name-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .neighbor-address-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .neighbor-karma-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px;
          margin: 4px 0;
        }

        .karma-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .karma-num {
          font-weight: 800;
          font-size: 0.95rem;
          color: #0f172a;
        }

        .karma-label {
          font-size: 0.72rem;
          color: #64748b;
        }

        .karma-divider {
          width: 1px;
          height: 28px;
          background: #cbd5e1;
        }

        .start-dm-btn {
          margin-top: 6px;
          padding: 12px;
          font-size: 0.92rem;
          border-radius: 24px;
        }
      `}</style>
    </div>
  );
};
