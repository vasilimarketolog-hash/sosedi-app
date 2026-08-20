import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { MapPin, AlertTriangle, Gift, Wrench, Coffee, Calendar, Info, Heart, ShoppingBag } from 'lucide-react';
import { MapMarker } from '../../types';

// Fix Leaflet marker icons default path in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (type: MapMarker['type']) => {
  let color = '#059669';
  let emoji = '📍';

  if (type === 'incident') { color = '#ef4444'; emoji = '🚨'; }
  if (type === 'lost_pet') { color = '#ec4899'; emoji = '🐱'; }
  if (type === 'free_item') { color = '#0284c7'; emoji = '🎁'; }
  if (type === 'harvest') { color = '#d97706'; emoji = '🎃'; }
  if (type === 'sale_item') { color = '#8b5cf6'; emoji = '🎹'; }
  if (type === 'event') { color = '#10b981'; emoji = '🌿'; }
  if (type === 'master') { color = '#059669'; emoji = '🛠️'; }
  if (type === 'community_spot') { color = '#6366f1'; emoji = '☕'; }

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color}; 
        color: white; 
        border-radius: 50%; 
        width: 38px; 
        height: 38px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

export const NeighborhoodMap: React.FC = () => {
  const { mapMarkers, currentNeighborhood } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(mapMarkers[0]);

  // Coordinates centered on neighborhood
  const centerLat = 59.9147;
  const centerLng = 30.3582;

  const filteredMarkers = mapMarkers.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  return (
    <div className="neighborhood-map-container animate-fade-in">
      {/* Top Map Bar */}
      <div className="map-controls-card card">
        <div className="map-info">
          <div className="map-title-row">
            <MapPin size={20} className="text-emerald" />
            <h2>Интерактивная карта {currentNeighborhood.name}</h2>
          </div>
          <p>Найдите потерянных питомцев, бесплатные вещи, урожай соседей, пианино и отключения ЖКХ рядом с вашим домом!</p>
        </div>

        <div className="map-filter-buttons">
          <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>🔥 Все метки</button>
          <button className={`filter-btn ${filterType === 'lost_pet' ? 'active' : ''}`} onClick={() => setFilterType('lost_pet')}>🐱 Потерялся кот/собака</button>
          <button className={`filter-btn ${filterType === 'free_item' ? 'active' : ''}`} onClick={() => setFilterType('free_item')}>🎁 Отдам даром</button>
          <button className={`filter-btn ${filterType === 'harvest' ? 'active' : ''}`} onClick={() => setFilterType('harvest')}>🎃 Кабачки & Урожай</button>
          <button className={`filter-btn ${filterType === 'sale_item' ? 'active' : ''}`} onClick={() => setFilterType('sale_item')}>🎹 Пианино & Вещи</button>
          <button className={`filter-btn ${filterType === 'incident' ? 'active' : ''}`} onClick={() => setFilterType('incident')}>🚨 Отключения ЖКХ</button>
          <button className={`filter-btn ${filterType === 'master' ? 'active' : ''}`} onClick={() => setFilterType('master')}>🛠 Мастера</button>
        </div>
      </div>

      {/* Map Content Box */}
      <div className="map-wrapper card">
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={16} 
          scrollWheelZoom={false}
          style={{ width: '100%', height: '540px', borderRadius: '16px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredMarkers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.type)}
              eventHandlers={{
                click: () => setSelectedMarker(marker),
              }}
            >
              <Popup>
                <div className="popup-card">
                  <div className="popup-title">{marker.title}</div>
                  <div className="popup-desc">{marker.description}</div>
                  <div className="popup-meta">Автор: {marker.author}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Marker Detail Card */}
        {selectedMarker && (
          <div className="marker-detail-panel animate-fade-in">
            <div className="detail-header">
              <span className="detail-title">{selectedMarker.title}</span>
              {selectedMarker.date && <span className="badge badge-primary">{selectedMarker.date}</span>}
            </div>
            <p className="detail-desc">{selectedMarker.description}</p>
            <div className="detail-author-row">
              <span className="detail-author">Сосед: <strong>{selectedMarker.author}</strong></span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => alert(`Связь с соседом по объявлению "${selectedMarker.title}"`)}
              >
                Связаться в чате
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .neighborhood-map-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .map-controls-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .map-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .map-title-row h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .map-info p {
          font-size: 0.82rem;
          color: #64748b;
        }

        .map-filter-buttons {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .filter-btn {
          padding: 6px 14px;
          border-radius: 20px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
        }

        .filter-btn.active {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        .map-wrapper {
          position: relative;
          padding: 8px;
          overflow: hidden;
        }

        .popup-card {
          padding: 4px;
        }

        .popup-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #0f172a;
        }

        .popup-desc {
          font-size: 0.8rem;
          color: #334155;
          margin: 4px 0;
        }

        .popup-meta {
          font-size: 0.72rem;
          color: #64748b;
        }

        .marker-detail-panel {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          z-index: 500;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-title {
          font-weight: 800;
          font-size: 0.98rem;
          color: #0f172a;
        }

        .detail-desc {
          font-size: 0.86rem;
          color: #334155;
        }

        .detail-author-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 6px;
          border-top: 1px solid #f1f5f9;
        }

        .detail-author {
          font-size: 0.78rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};
