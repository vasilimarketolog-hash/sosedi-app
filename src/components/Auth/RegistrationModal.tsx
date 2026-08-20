import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Phone, ShieldCheck, CheckCircle2, MapPin, 
  Building, KeyRound, Sparkles, ArrowRight, ArrowLeft, User as UserIcon,
  Dog, Baby, Car, Wrench, Trophy, Lock, Eye, Building2, Layers, Map, Check
} from 'lucide-react';
import { User, NeighborhoodInfo } from '../../types';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dictionary of city coordinates for auto-centering map
const CITY_COORDS: Record<string, [number, number]> = {
  // Belarus 🇧🇾
  'Минск': [53.9006, 27.5590],
  'Брест': [52.0976, 23.7341],
  'Гродно': [53.6694, 23.8131],
  'Гомель': [52.4345, 30.9754],
  'Витебск': [55.1848, 30.2016],
  'Могилёв': [53.9007, 30.3314],
  'Борисов': [54.2276, 28.5047],
  'Солигорск': [52.7876, 27.5415],
  'Барановичи': [53.1327, 26.0139],
  'Пинск': [52.1153, 26.0950],
  'Орша': [54.5074, 30.4190],
  'Мозырь': [52.0494, 29.2456],
  'Жодино': [54.0970, 28.3475],
  'Лида': [53.8917, 25.3022],
  'Новополоцк': [55.5317, 28.6019],
  'Бобруйск': [53.1446, 29.2244],

  // Kazakhstan 🇰🇿
  'Алматы': [43.2389, 76.8897],
  'Астана': [51.1694, 71.4491],
  'Шымкент': [42.3417, 69.5901],
  'Караганда': [49.8019, 73.1021],
  'Актобе': [50.2839, 57.1670],
  'Тараз': [42.9000, 71.3667],
  'Павлодар': [52.2873, 76.9674],
  'Усть-Каменогорск': [49.9500, 82.6167],
  'Семей': [50.4111, 80.2275],
  'Атырау': [47.1167, 51.8833],
  'Костанай': [53.2144, 63.6246],
  'Кызылорда': [44.8488, 65.5092],
  'Уральск': [51.2333, 51.3667],
  'Петропавловск': [54.8667, 69.1500],
  'Актау': [43.6500, 51.1667],
  'Темиртау': [50.0547, 72.9644],
};

// Map Fly-To City Controller
const MapCityFlyTo: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
};

// Map Click Picker with Nominatim Reverse Geocoding
const LocationPicker: React.FC<{ 
  onSelectBuilding: (buildingName: string, lat: number, lng: number) => void 
}> = ({ onSelectBuilding }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition(e.latlng);

      // Instant fallback address calculation
      const houseNum = Math.floor(Math.abs(lat * 100) % 45) + 1;
      const streetNames = ['ул. Центральная', 'ул. Ленина', 'ул. Мира', 'пр. Независимости', 'ул. Абая', 'ул. Авиационная', 'ул. Сатпаева'];
      const randomStreet = streetNames[Math.floor((lat + lng) * 100) % streetNames.length];
      let resolvedAddress = `${randomStreet}, д. ${houseNum}`;

      // Try fetching real address from Nominatim API
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`);
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            const road = data.address.road || data.address.street || data.address.pedestrian || randomStreet;
            const house = data.address.house_number || data.address.building || `${houseNum}`;
            resolvedAddress = `${road}, д. ${house}`;
          }
        }
      } catch (err) {
        // use fallback resolvedAddress
      }

      onSelectBuilding(resolvedAddress, lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>📍 Выбранный дом подтянулся в форму!</Popup>
    </Marker>
  );
};

export const RegistrationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setUser, setCurrentNeighborhood } = useApp();

  const [step, setStep] = useState<number>(1);
  const [country, setCountry] = useState<'BY' | 'KZ'>('BY');
  const [phone, setPhone] = useState<string>('');
  const [smsCode, setSmsCode] = useState<string>('5588');

  // Address info
  const [city, setCity] = useState<string>('Минск');
  const [complexName, setComplexName] = useState<string>('ЖК «Новая Боровая»');
  const [building, setBuilding] = useState<string>('ул. Авиационная, д. 12');
  const [entrance, setEntrance] = useState<number>(1);
  const [apartment, setApartment] = useState<string>(''); // Optional format!
  const [isAddressFromMap, setIsAddressFromMap] = useState<boolean>(false);

  // Map coordinates
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>(CITY_COORDS['Минск']);

  // Verification method
  const [verifMethod, setVerifMethod] = useState<string>('msi');

  // Profile details
  const [fullName, setFullName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  );
  const [roleInBuilding, setRoleInBuilding] = useState<string>('owner');

  // Tags
  const [hasPet, setHasPet] = useState<boolean>(true);
  const [hasKids, setHasKids] = useState<boolean>(true);
  const [isDriver, setIsDriver] = useState<boolean>(true);
  const [carPlate, setCarPlate] = useState<string>('');
  const [hasTools, setHasTools] = useState<boolean>(true);
  const [sportsLover, setSportsLover] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCountryChange = (c: 'BY' | 'KZ') => {
    setCountry(c);
    setIsAddressFromMap(false);
    if (c === 'BY') {
      setPhone('+375 29 ');
      setCity('Минск');
      setComplexName('ЖК «Новая Боровая»');
      setBuilding('ул. Авиационная, д. 12');
      setVerifMethod('msi');
      setSelectedCoords(CITY_COORDS['Минск']);
    } else {
      setPhone('+7 777 ');
      setCity('Алматы');
      setComplexName('ЖК «Нурлы Тау»');
      setBuilding('пр. Аль-Фараби, д. 19');
      setVerifMethod('egov');
      setSelectedCoords(CITY_COORDS['Алматы']);
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setIsAddressFromMap(false);
    if (CITY_COORDS[newCity]) {
      setSelectedCoords(CITY_COORDS[newCity]);
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = fullName.trim() || (country === 'BY' ? 'Александр Ковалёв' : 'Ерлан Сатпаев');

    const roleLabels: Record<string, string> = {
      owner: 'Собственник',
      tenant: 'Арендатор',
      family: 'Жилец дома',
      board: 'Совет дома'
    };

    const tags: string[] = [];
    if (hasPet) tags.push('🐶 Есть питомец');
    if (hasKids) tags.push('👶 Есть дети');
    if (isDriver) tags.push(`🚗 Авто ${carPlate || ''}`.trim());
    if (hasTools) tags.push('🛠 Есть инструмент');
    if (sportsLover) tags.push('⚽ Спорт во дворе');

    // Public format: Only Building and Entrance (Apartment is NOT shown publicly!)
    const publicAddress = `${building}, Подъезд ${entrance}`;

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: finalName,
      avatar: selectedAvatar,
      address: `${city}, ${publicAddress}`,
      building,
      entrance: Number(entrance),
      apartment: apartment ? Number(apartment) : 0, // Optional & Confidential!
      verified: true,
      verifiedMethod: country === 'BY' ? 'Подтверждено через МСИ РБ' : 'Подтверждено через eGov.kz',
      rating: 5.0,
      thanksCount: 10,
      joinedDate: 'Август 2026',
      bio: `${roleLabels[roleInBuilding] || 'Жилец'} в ${complexName}. ${tags.join(' • ')}`,
      phone,
      country,
      city,
    };

    const newNeighborhood: NeighborhoodInfo = {
      id: `n_${Date.now()}`,
      name: complexName,
      city,
      district: country === 'BY' ? 'Минский район' : 'Бостандыкский район',
      housesCount: 6,
      residentsCount: 1240,
      activeAnnouncements: 18,
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    };

    setUser(newUser);
    setCurrentNeighborhood(newNeighborhood);
    setStep(5);
  };

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  ];

  return (
    <div className="fullscreen-reg-window animate-fade-in">
      {/* Top Header Bar */}
      <header className="reg-header-bar">
        <div className="logo-box">
          <div className="logo-icon">
            <Building2 size={24} color="#ffffff" />
          </div>
          <span className="logo-title">Соседи<span className="logo-accent">.Онлайн</span></span>
        </div>

        <button className="btn btn-secondary exit-btn" onClick={onClose}>
          <X size={18} />
          <span>Вернуться на главную</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="reg-center-container">
        <div className="reg-card card">
          {/* Progress Bar */}
          {step < 5 && (
            <div className="reg-progress-bar">
              <div className="progress-step-labels">
                <span className={step >= 1 ? 'active' : ''}>1. Страна</span>
                <span className={step >= 2 ? 'active' : ''}>2. SMS</span>
                <span className={step >= 3 ? 'active' : ''}>3. Карта & Дом</span>
                <span className={step >= 4 ? 'active' : ''}>4. Профиль</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
              </div>
            </div>
          )}

          {/* Step 1: Country & Phone */}
          {step === 1 && (
            <div className="step-body">
              <div className="modal-header text-left">
                <h2>Регистрация в «Соседи.Онлайн»</h2>
                <p>Единая система жильцов для Беларуси 🇧🇾 и Казахстана 🇰🇿</p>
              </div>

              <div className="form-group">
                <label>Выберите страну проживания</label>
                <div className="country-toggle-grid">
                  <button
                    type="button"
                    className={`country-btn ${country === 'BY' ? 'selected' : ''}`}
                    onClick={() => handleCountryChange('BY')}
                  >
                    <span className="flag">🇧🇾</span>
                    <div className="country-info">
                      <span className="country-name">Беларусь</span>
                      <span className="country-code">+375 (Минск, Брест, Гродно, Солигорск...)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`country-btn ${country === 'KZ' ? 'selected' : ''}`}
                    onClick={() => handleCountryChange('KZ')}
                  >
                    <span className="flag">🇰🇿</span>
                    <div className="country-info">
                      <span className="country-name">Казахстан</span>
                      <span className="country-code">+7 (7XX) (Алматы, Астана, Караганда...)</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Номер мобильного телефона</label>
                <div className="phone-input-row">
                  <Phone size={18} className="text-muted" />
                  <input
                    type="tel"
                    placeholder={country === 'BY' ? '+375 (29) 123-45-67' : '+7 (777) 123-45-67'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => setStep(2)}
              >
                <span>Получить SMS с кодом →</span>
              </button>
            </div>
          )}

          {/* Step 2: SMS Verification */}
          {step === 2 && (
            <div className="step-body">
              <div className="modal-header text-left">
                <h2>Введите код из SMS</h2>
                <p>Мы отправили проверочный код на номер <strong>{phone || (country === 'BY' ? '+375 29 ***-**-**' : '+7 777 ***-**-**')}</strong></p>
              </div>

              <div className="form-group">
                <label>4-значный код верификации (тестовый код: 5588)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="sms-code-input"
                />
              </div>

              <div className="flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <button type="button" className="btn btn-primary flex-1" onClick={() => setStep(3)}>
                  Подтвердить код →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Interactive Map & Auto-fill Address */}
          {step === 3 && (
            <div className="step-body">
              <div className="modal-header text-left">
                <h2>Выбор города и дома на карте</h2>
                <p>Карта автоматически переходит на выбранный город. Кликните по зданию — адрес подтянется сам!</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Город / Региональный центр</label>
                  <select value={city} onChange={(e) => handleCityChange(e.target.value)}>
                    {country === 'BY' ? (
                      <>
                        <optgroup label="Крупные города РБ">
                          <option value="Минск">Минск</option>
                          <option value="Брест">Брест</option>
                          <option value="Гродно">Гродно</option>
                          <option value="Гомель">Гомель</option>
                          <option value="Витебск">Витебск</option>
                          <option value="Могилёв">Могилёв</option>
                        </optgroup>
                        <optgroup label="Региональные города РБ">
                          <option value="Борисов">Борисов</option>
                          <option value="Солигорск">Солигорск</option>
                          <option value="Барановичи">Барановичи</option>
                          <option value="Пинск">Пинск</option>
                          <option value="Орша">Орша</option>
                          <option value="Мозырь">Мозырь</option>
                          <option value="Жодино">Жодино</option>
                          <option value="Лида">Лида</option>
                          <option value="Новополоцк">Новополоцк</option>
                          <option value="Бобруйск">Бобруйск</option>
                        </optgroup>
                      </>
                    ) : (
                      <>
                        <optgroup label="Крупные города РК">
                          <option value="Алматы">Алматы</option>
                          <option value="Астана">Астана</option>
                          <option value="Шымкент">Шымкент</option>
                          <option value="Караганда">Караганда</option>
                          <option value="Актобе">Актобе</option>
                        </optgroup>
                        <optgroup label="Региональные города РК">
                          <option value="Тараз">Тараз</option>
                          <option value="Павлодар">Павлодар</option>
                          <option value="Усть-Каменогорск">Усть-Каменогорск</option>
                          <option value="Семей">Семей</option>
                          <option value="Атырау">Атырау</option>
                          <option value="Костанай">Костанай</option>
                          <option value="Кызылорда">Кызылорда</option>
                          <option value="Уральск">Уральск</option>
                          <option value="Петропавловск">Петропавловск</option>
                          <option value="Актау">Актау</option>
                          <option value="Темиртау">Темиртау</option>
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Наименование ЖК / Микрорайона</label>
                  <input
                    type="text"
                    value={complexName}
                    onChange={(e) => setComplexName(e.target.value)}
                    placeholder={country === 'BY' ? 'ЖК Новая Боровая' : 'ЖК Нурлы Тау'}
                    required
                  />
                </div>
              </div>

              {/* Interactive Leaflet Map with FlyTo & Real Reverse Geocoding */}
              <div className="form-group">
                <label>Интерактивная карта {city} (Кликните мышкой по дому)</label>
                <div className="reg-map-wrapper">
                  <MapContainer
                    center={selectedCoords}
                    zoom={14}
                    style={{ width: '100%', height: '220px', borderRadius: '12px' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCityFlyTo center={selectedCoords} />
                    <LocationPicker 
                      onSelectBuilding={(autoAddr, lat, lng) => {
                        setBuilding(autoAddr);
                        setSelectedCoords([lat, lng]);
                        setIsAddressFromMap(true);
                      }} 
                    />
                  </MapContainer>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="label-with-status">
                    <label>Улица и Номер дома</label>
                    {isAddressFromMap && (
                      <span className="address-autofill-badge">
                        <Check size={12} /> Подтянуто с карты
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => {
                      setBuilding(e.target.value);
                      setIsAddressFromMap(false);
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Подъезд</label>
                  <input
                    type="number"
                    value={entrance}
                    onChange={(e) => setEntrance(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Optional & Private Apartment Field (Nextdoor privacy format) */}
              <div className="form-group">
                <label>Квартира <span className="optional-lbl">(необязательно • не публикуется)</span></label>
                <div className="apt-privacy-input-box">
                  <input
                    type="number"
                    value={apartment}
                    placeholder="Например: 42"
                    onChange={(e) => setApartment(e.target.value)}
                    min={1}
                  />
                  <div className="privacy-hint-pill">
                    <Lock size={13} className="text-emerald" />
                    <span><strong>Формат Nextdoor:</strong> Квартира не публична! Соседи видят только ваш дом и подъезд. Квартира нужна только для личных извещений ЖКХ (жировки, отключения газа/света).</span>
                  </div>
                </div>
              </div>

              <div className="flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <button type="button" className="btn btn-primary flex-1" onClick={() => setStep(4)}>
                  Далее: Создание профиля →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Profile Details, Roles, Tags & Privacy */}
          {step === 4 && (
            <form onSubmit={handleCompleteRegistration} className="step-body">
              <div className="modal-header text-left">
                <h2>Создание профиля соседа</h2>
                <p>Настройка данных и интересов в <strong>{complexName}</strong></p>
              </div>

              <div className="form-group">
                <label>Ваше Имя и Фамилия *</label>
                <input
                  type="text"
                  placeholder={country === 'BY' ? 'Ольга Ковалёва' : 'Ерлан Ахметов'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Выберите фото профиля</label>
                <div className="avatars-picker-row">
                  {avatarOptions.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="avatar option"
                      className={`avatar-option ${selectedAvatar === url ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(url)}
                    />
                  ))}
                </div>
              </div>

              {/* Resident Role */}
              <div className="form-group">
                <label>Ваш статус в доме</label>
                <div className="role-grid">
                  <button
                    type="button"
                    className={`role-btn ${roleInBuilding === 'owner' ? 'selected' : ''}`}
                    onClick={() => setRoleInBuilding('owner')}
                  >
                    👑 Собственник
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${roleInBuilding === 'tenant' ? 'selected' : ''}`}
                    onClick={() => setRoleInBuilding('tenant')}
                  >
                    🔑 Арендатор
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${roleInBuilding === 'family' ? 'selected' : ''}`}
                    onClick={() => setRoleInBuilding('family')}
                  >
                    👨‍👩‍👧 Член семьи
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${roleInBuilding === 'board' ? 'selected' : ''}`}
                    onClick={() => setRoleInBuilding('board')}
                  >
                    🏢 Совет дома
                  </button>
                </div>
              </div>

              {/* Interests & Neighborhood Tags */}
              <div className="form-group">
                <label>Интересы и взаимопомощь (теги для соседей)</label>
                <div className="tags-checkboxes-grid">
                  <label className={`tag-checkbox ${hasPet ? 'checked' : ''}`}>
                    <input type="checkbox" checked={hasPet} onChange={(e) => setHasPet(e.target.checked)} />
                    <span>🐶 Есть питомец</span>
                  </label>

                  <label className={`tag-checkbox ${hasKids ? 'checked' : ''}`}>
                    <input type="checkbox" checked={hasKids} onChange={(e) => setHasKids(e.target.checked)} />
                    <span>👶 Есть дети</span>
                  </label>

                  <label className={`tag-checkbox ${isDriver ? 'checked' : ''}`}>
                    <input type="checkbox" checked={isDriver} onChange={(e) => setIsDriver(e.target.checked)} />
                    <span>🚗 Автомобилист</span>
                  </label>

                  <label className={`tag-checkbox ${hasTools ? 'checked' : ''}`}>
                    <input type="checkbox" checked={hasTools} onChange={(e) => setHasTools(e.target.checked)} />
                    <span>🛠 Есть инструмент</span>
                  </label>

                  <label className={`tag-checkbox ${sportsLover ? 'checked' : ''}`}>
                    <input type="checkbox" checked={sportsLover} onChange={(e) => setSportsLover(e.target.checked)} />
                    <span>⚽ Спорт во дворе</span>
                  </label>
                </div>
              </div>

              {isDriver && (
                <div className="form-group">
                  <label>Номер автомобиля (для Авто-чата перепарковки)</label>
                  <input
                    type="text"
                    placeholder={country === 'BY' ? '7777 AB-7' : '777 AAA 02'}
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value)}
                  />
                </div>
              )}

              <div className="flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(3)}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Сохранить и войти в ЖК 🎉
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Welcome Bonus & Success */}
          {step === 5 && (
            <div className="success-step">
              <Trophy size={60} color="#059669" className="animate-bounce" />
              <h2>Добро пожаловать в сообщество {complexName}!</h2>
              <p>Ваш профиль верифицирован. Номер квартиры скрыт ради вашей приватности.</p>

              <div className="welcome-perks-card">
                <div className="perk-item">
                  <Sparkles size={20} className="text-amber" />
                  <span>+10 баллов репутации за верификацию</span>
                </div>
                <div className="perk-item">
                  <ShieldCheck size={20} className="text-blue" />
                  <span>Бейдж проверенного соседа {country === 'BY' ? '🇧🇾 Беларуси' : '🇰🇿 Казахстана'}</span>
                </div>
                <div className="perk-item">
                  <Lock size={20} className="text-emerald" />
                  <span>Личные извещения ЖКХ включены для вашей квартиры</span>
                </div>
              </div>

              <button className="btn btn-primary w-full" onClick={onClose}>
                Перейти в ленту двора 🚀
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fullscreen-reg-window {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .reg-header-bar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-title {
          font-weight: 800;
          font-size: 1.2rem;
          color: #0f172a;
        }

        .logo-accent { color: #059669; }

        .reg-center-container {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 16px 60px;
        }

        .reg-card {
          max-width: 640px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          background: #ffffff;
          border-radius: var(--radius-lg);
        }

        .text-left { text-align: left; margin-bottom: 20px; }
        .text-left h2 { font-size: 1.35rem; color: #0f172a; margin-bottom: 4px; }
        .text-left p { font-size: 0.88rem; color: #64748b; }

        .reg-progress-bar {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 24px;
        }

        .progress-step-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .progress-step-labels .active {
          color: #059669;
        }

        .progress-track {
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #059669;
          transition: width 0.3s ease;
        }

        .step-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .country-toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .country-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          background: #ffffff;
          text-align: left;
          transition: all 0.2s ease;
        }

        .country-btn.selected {
          border-color: #059669;
          background: #ecfdf5;
        }

        .country-btn .flag {
          font-size: 1.8rem;
        }

        .country-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: #0f172a;
          display: block;
        }

        .country-code {
          font-size: 0.74rem;
          color: #64748b;
        }

        .phone-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
        }

        .phone-input-row input {
          border: none !important;
          padding: 8px 0 !important;
          box-shadow: none !important;
        }

        .sms-code-input {
          font-size: 1.4rem !important;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-align: center;
        }

        .reg-map-wrapper {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
        }

        .label-with-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .address-autofill-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .optional-lbl {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .apt-privacy-input-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .privacy-hint-pill {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.76rem;
          color: #166534;
          line-height: 1.35;
        }

        .verif-options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .verif-opt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .verif-opt.selected {
          border-color: #059669;
          background: #f0fdf4;
          color: #047857;
        }

        .avatars-picker-row {
          display: flex;
          gap: 12px;
        }

        .avatar-option {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .avatar-option.selected {
          border-color: #059669;
          transform: scale(1.1);
        }

        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .role-btn {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          text-align: center;
        }

        .role-btn.selected {
          background: #ecfdf5;
          border-color: #059669;
          color: #059669;
        }

        .tags-checkboxes-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }

        .tag-checkbox.checked {
          background: #ecfdf5;
          border-color: #059669;
          color: #059669;
        }

        .success-step {
          text-align: center;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .welcome-perks-card {
          background: #f0fdf4;
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          padding: 16px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #065f46;
        }
      `}</style>
    </div>
  );
};
