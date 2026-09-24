import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, FileText, Smartphone, CheckCircle, Sparkles, Building, KeyRound } from 'lucide-react';

export const VerificationModal: React.FC = () => {
  const { isVerificationModalOpen, setIsVerificationModalOpen, completeVerification, user, currentNeighborhood } = useApp();

  const [step, setStep] = useState<number>(1);
  const [building, setBuilding] = useState<string>(user?.building || 'Дом 12');
  const [entrance, setEntrance] = useState<number>(user?.entrance || 2);
  const [apartment, setApartment] = useState<number>(user?.apartment || 48);
  const [method, setMethod] = useState<'neighbor' | 'receipt' | 'code'>('neighbor');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isVerificationModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      completeVerification(
        `${currentNeighborhood.name}, ${building}`,
        building,
        Number(entrance),
        Number(apartment)
      );
      setIsSubmitting(false);
      setStep(3); // Success step
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsVerificationModalOpen(false)}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsVerificationModalOpen(false)}>
          <X size={20} />
        </button>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="modal-header">
              <div className="icon-badge">
                <ShieldCheck size={28} color="#059669" />
              </div>
              <h2>Подтверждение адреса в доме</h2>
              <p>Подтверждённые соседи получают отметку жильца, доступ к закрытым чатам подъезда и голосованиям.</p>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label>Ваш корпус / Дом</label>
                <input 
                  type="text" 
                  value={building} 
                  onChange={(e) => setBuilding(e.target.value)} 
                  placeholder="Дом 12"
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Подъезд</label>
                  <input 
                    type="number" 
                    value={entrance} 
                    onChange={(e) => setEntrance(Number(e.target.value))} 
                    min={1} 
                    max={20}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Квартира</label>
                  <input 
                    type="number" 
                    value={apartment} 
                    onChange={(e) => setApartment(Number(e.target.value))} 
                    min={1} 
                    max={999}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Способ подтверждения</label>
                <div className="methods-grid">
                  <div 
                    className={`method-card ${method === 'neighbor' ? 'selected' : ''}`}
                    onClick={() => setMethod('neighbor')}
                  >
                    <Building size={20} className="text-emerald" />
                    <div>
                      <div className="method-title">Подтверждение соседом</div>
                      <div className="method-sub">Любой подтверждённый жилец вашего подъезда одобряет заявку</div>
                    </div>
                  </div>

                  <div 
                    className={`method-card ${method === 'receipt' ? 'selected' : ''}`}
                    onClick={() => setMethod('receipt')}
                  >
                    <FileText size={20} className="text-blue" />
                    <div>
                      <div className="method-title">Квитанция / Жировка ЖКХ</div>
                      <div className="method-sub">Загрузка фото квитанции за последний месяц (ручная модерация)</div>
                    </div>
                  </div>

                  <div 
                    className={`method-card ${method === 'code' ? 'selected' : ''}`}
                    onClick={() => setMethod('code')}
                  >
                    <KeyRound size={20} className="text-amber" />
                    <div>
                      <div className="method-title">Код от ТС / Домофона</div>
                      <div className="method-sub">Ввод кода жильца от председателя или Товарищества собственников</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-full">
                Продолжить →
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{method === 'neighbor' ? 'Подтверждение через соседа' : method === 'receipt' ? 'Подтверждение по квитанции' : 'Ввод кода от ТС'}</h2>
              <p>Адрес: <strong>{building}, Подъезд {entrance}, Кв. {apartment}</strong></p>
            </div>

            <div className="form-body">
              {method === 'neighbor' && (
                <div className="verify-box gosuslugi-box">
                  <Sparkles size={24} className="text-emerald" />
                  <p>Запрос отправлен соседям из вашего подъезда. Как только один из жильцов подтвердит ваше проживание, статус обновится автоматически.</p>
                  <div className="simulated-badge">✓ Заявка сформирована</div>
                </div>
              )}

              {method === 'receipt' && (
                <div className="form-group">
                  <label>Прикрепите фото или скриншот квитанции ЖКХ</label>
                  <div className="upload-dropzone">
                    <FileText size={32} className="text-muted" />
                    <span>Перетащите файл сюда или выберите на устройстве</span>
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} id="file-up" />
                    <label htmlFor="file-up" className="btn btn-secondary btn-sm">Обзор файлов</label>
                  </div>
                </div>
              )}

              {method === 'code' && (
                <div className="form-group">
                  <label>Введите 6-значный код из квитанции или СМС от УК</label>
                  <input type="text" placeholder="123-456" defaultValue="884-912" required />
                </div>
              )}
            </div>

            <div className="modal-footer flex-row">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Назад
              </button>
              <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Проверка адреса...' : 'Подтвердить адрес'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="success-step">
            <CheckCircle size={56} color="#059669" className="animate-bounce" />
            <h2>Поздравляем! Ваш адрес подтверждён!</h2>
            <p>Вам присвоен статус <strong>Проверенный сосед</strong>. Теперь вам доступны закрытые чаты вашего дома и подъезда.</p>

            <div className="reward-card">
              <Sparkles size={20} className="text-amber" />
              <span>+10 баллов репутации за верификацию</span>
            </div>

            <button className="btn btn-primary w-full" onClick={() => setIsVerificationModalOpen(false)}>
              Отлично, перейти в ленту
            </button>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-content {
          background: #ffffff;
          border-radius: var(--radius-lg);
          max-width: 520px;
          width: 100%;
          padding: 24px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #94a3b8;
          padding: 4px;
          border-radius: 50%;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .icon-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ecfdf5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .modal-header p {
          font-size: 0.85rem;
          color: #64748b;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }

        .form-group input {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .methods-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .method-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .method-card:hover {
          background: #f8fafc;
        }

        .method-card.selected {
          border-color: #059669;
          background: #ecfdf5;
        }

        .method-title {
          font-weight: 600;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .method-sub {
          font-size: 0.76rem;
          color: #64748b;
        }

        .modal-footer {
          margin-top: 24px;
        }

        .flex-row {
          display: flex;
          gap: 12px;
        }

        .flex-1 { flex: 1; }
        .w-full { width: 100%; }

        .verify-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .simulated-badge {
          background: #059669;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .upload-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          font-size: 0.82rem;
          color: #64748b;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .success-step {
          text-align: center;
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .reward-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 10px 16px;
          border-radius: 20px;
          color: #92400e;
          font-weight: 600;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
