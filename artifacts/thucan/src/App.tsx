import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ArrowLeft, Clock3, Info, MapPin, Navigation, Users, X, Search, ChevronRight, Maximize2 } from 'lucide-react';

type Language = 'en' | 'zh';
type Dish = { name: string; zh: string; description: string; zhDescription: string; price: number; rating: number; available: boolean; tags: string[] };
type Stall = { id: string; label: string; zh: string; queue: number; menu: Dish[] };
type Seat = 'vacant' | 'reserved' | 'occupied';
type Table = { id: string; seats: number; states: Seat[] };
type Cluster = { id: string; label: string; occupancy: number; capacity: number; tables: Table[] };
type Floor = { id: string; label: string; occupancy: number };
type Canteen = {
  id: string; name: string; zh: string; officialLocation: string; zhLocation: string; hours: string; zhHours: string;
  x: number; y: number; tags: string[]; price: [number, number]; occ: [number, number, number];
  walk: number; floors: Floor[]; stalls: Stall[];
};

const makeMenu = (prefix: string): Dish[] => [
  { name: `${prefix} tomato egg rice`, zh: `${prefix} 番茄鸡蛋饭`, description: 'Soft scrambled egg, slow-cooked tomato and steamed rice.', zhDescription: '嫩滑炒蛋、慢炖番茄，搭配香米。', price: 16, rating: 4.6, available: true, tags: ['Vegetarian'] },
  { name: 'Three-cup mushroom bowl', zh: '三杯菌菇饭', description: 'Basil, soy and sesame-glazed seasonal mushrooms.', zhDescription: '罗勒、酱油与芝麻裹炒时令菌菇。', price: 22, rating: 4.4, available: true, tags: ['Vegetarian', 'Vegan'] },
  { name: 'Beijing-style chicken noodles', zh: '京味鸡丝面', description: 'Shredded chicken, wheat noodles and a light sesame broth.', zhDescription: '鸡丝、小麦面条与清爽芝麻汤底。', price: 19, rating: 4.3, available: false, tags: [] },
];

const makeStalls = (prefix: string, wait: number): Stall[] => [
  { id: `${prefix}-a`, label: 'Rice & wok counter', zh: '米饭 / 小炒', queue: wait, menu: makeMenu('Garden') },
  { id: `${prefix}-b`, label: 'Noodle kitchen', zh: '面食档口', queue: Math.max(2, wait - 2), menu: makeMenu('Sesame') },
  { id: `${prefix}-c`, label: 'Fresh & vegetarian', zh: '轻食 / 素食', queue: wait + 1, menu: makeMenu('Green') },
];

const makeFloors = (count = 2): Floor[] => Array.from({ length: count }, (_, index) => ({
  id: `f${index + 1}`, label: ['1F', '2F', '3F', '4F'][index], occupancy: [48, 34, 62, 27][index % 4],
}));

const venues: Canteen[] = [
  { id: 'guanchouyuan', name: 'Guanchouyuan Dining Hall', zh: '观畴园', officialLocation: 'Guanchouyuan; Qingqing Yonghe and Campus Jazz Coffee are on level 1.', zhLocation: '观畴园；清青永和与 Campus Jazz Coffee 位于一层。', hours: '6:30–9:00 · 11:00–13:00 · 17:00–20:00', zhHours: '6:30–9:00 · 11:00–13:00 · 17:00–20:00', x: 48, y: 45, tags: ['Vegetarian', 'Vegan', 'Halal'], price: [12, 32], occ: [58, 44, 36], walk: 6, floors: makeFloors(3), stalls: makeStalls('guan', 7) },
  { id: 'taoliyuan', name: 'Taoliyuan Dining Hall', zh: '桃李园', officialLocation: 'Taoliyuan; Qingqing Xiuxian Canteen is in the basement.', zhLocation: '桃李园；清青休闲餐厅位于地下一层。', hours: '6:30–9:00 · 10:30–13:00 · 16:30–23:00', zhHours: '6:30–9:00 · 10:30–13:00 · 16:30–23:00', x: 72, y: 36, tags: ['Vegetarian', 'Vegan'], price: [10, 28], occ: [78, 63, 51], walk: 9, floors: makeFloors(3), stalls: makeStalls('tao', 11) },
  { id: 'zijingyuan', name: 'Zijingyuan Dining Hall', zh: '紫荆园', officialLocation: 'Zijingyuan Dining Hall.', zhLocation: '紫荆园餐厅。', hours: '1F 6:30–13:30 · 17:00–19:30; 2F–4F 6:30–13:00 · 17:00–19:00', zhHours: '一层 6:30–13:30 · 17:00–19:30；二至四层 6:30–13:00 · 17:00–19:00', x: 79, y: 56, tags: ['Vegetarian', 'Vegan'], price: [10, 30], occ: [42, 31, 49], walk: 8, floors: makeFloors(4), stalls: makeStalls('zi', 5) },
  { id: 'qingfenyuan', name: 'Qingfenyuan Dining Hall', zh: '清芬园', officialLocation: 'Qingfenyuan Dining Hall.', zhLocation: '清芬园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 39, y: 61, tags: ['Vegetarian'], price: [10, 26], occ: [69, 52, 40], walk: 7, floors: makeFloors(2), stalls: makeStalls('qingfen', 9) },
  { id: 'tingtaoyuan', name: 'Tingtaoyuan Dining Hall', zh: '听涛园', officialLocation: 'Tingtaoyuan Dining Hall.', zhLocation: '听涛园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 30, y: 39, tags: ['Vegetarian', 'Vegan'], price: [11, 29], occ: [34, 47, 59], walk: 12, floors: makeFloors(2), stalls: makeStalls('ting', 4) },
  { id: 'dingxiangyuan', name: 'Dingxiangyuan Dining Hall', zh: '丁香园', officialLocation: 'Dingxiangyuan Dining Hall.', zhLocation: '丁香园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 24, y: 57, tags: ['Vegetarian'], price: [10, 27], occ: [50, 38, 29], walk: 11, floors: makeFloors(2), stalls: makeStalls('ding', 6) },
  { id: 'yushuyuan', name: 'Yushuyuan Dining Hall', zh: '玉树园', officialLocation: 'Yushuyuan Dining Hall.', zhLocation: '玉树园餐厅。', hours: '6:40–8:30 · 11:00–13:00 · 17:00–20:30', zhHours: '6:40–8:30 · 11:00–13:00 · 17:00–20:30', x: 66, y: 73, tags: ['Vegetarian', 'Vegan'], price: [12, 34], occ: [65, 51, 37], walk: 10, floors: makeFloors(2), stalls: makeStalls('yu', 8) },
  { id: 'zhilanyuan', name: 'Zhilanyuan Dining Hall', zh: '芝兰园', officialLocation: 'Zhilanyuan; buffet served on the 2nd floor.', zhLocation: '芝兰园；二楼供应自助餐。', hours: '11:00–13:00 · 17:00–20:00', zhHours: '11:00–13:00 · 17:00–20:00', x: 83, y: 75, tags: ['Vegetarian'], price: [18, 48], occ: [38, 46, 33], walk: 13, floors: makeFloors(2), stalls: makeStalls('zhi', 5) },
  { id: 'muslim', name: 'Muslim Canteen', zh: '清真餐厅', officialLocation: 'West of Guanchouyuan Dining Hall.', zhLocation: '观畴园西侧。', hours: '6:30–9:00 · 11:00–13:30 · 17:00–20:00', zhHours: '6:30–9:00 · 11:00–13:30 · 17:00–20:00', x: 53, y: 28, tags: ['Halal'], price: [14, 32], occ: [26, 43, 35], walk: 5, floors: makeFloors(1), stalls: makeStalls('muslim', 3) },
  { id: 'qingqingkuaican', name: 'Qingqing Kuaican', zh: '清青快餐', officialLocation: '2nd floor of Wenxinyuan Dining Hall.', zhLocation: '闻馨园二层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 42, y: 79, tags: ['Vegetarian'], price: [12, 27], occ: [71, 55, 48], walk: 9, floors: makeFloors(1), stalls: makeStalls('kuaican', 8) },
  { id: 'qingqingpizza', name: 'Qingqing Pizza', zh: '清青比萨', officialLocation: 'Basement level of Zijingyuan Dining Hall.', zhLocation: '紫荆园地下一层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 15, y: 28, tags: ['Vegetarian'], price: [18, 42], occ: [45, 34, 41], walk: 14, floors: [{ id: 'b1', label: 'B1', occupancy: 34 }], stalls: makeStalls('pizza', 6) },
  { id: 'qingqingyonghe', name: 'Qingqing Yonghe', zh: '清青永和', officialLocation: '1st floor of Guanchouyuan Dining Hall.', zhLocation: '观畴园一层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 58, y: 39, tags: ['Vegetarian'], price: [12, 26], occ: [57, 42, 39], walk: 6, floors: makeFloors(1), stalls: makeStalls('yonghe', 5) },
  { id: 'qingqingxiuxian', name: 'Qingqing Xiuxian Canteen', zh: '清青休闲餐厅', officialLocation: 'Basement level of Taoliyuan Dining Hall.', zhLocation: '桃李园地下一层。', hours: '11:00–22:30', zhHours: '11:00–22:30', x: 63, y: 48, tags: ['Vegetarian'], price: [14, 32], occ: [44, 37, 29], walk: 8, floors: [{ id: 'b1', label: 'B1', occupancy: 37 }], stalls: makeStalls('xiuxian', 5) },
  { id: 'qingqingmianba', name: 'Qingqing Mianba', zh: '清青面吧', officialLocation: 'Campus dining location listed by Tsinghua University.', zhLocation: '清华大学官方餐饮信息所列校内餐饮点。', hours: '10:30–14:00 · 16:30–22:30', zhHours: '10:30–14:00 · 16:30–22:30', x: 90, y: 45, tags: ['Vegetarian'], price: [12, 28], occ: [31, 42, 27], walk: 15, floors: makeFloors(1), stalls: makeStalls('mianba', 3) },
];

const occupancyTone = (value: number) => value < 60 ? '#61a777' : value <= 85 ? '#d5ae3c' : '#ca6259';
const tableSeatCounts = [2, 4, 2, 4, 4, 2] as const;
const occupiedSeatsByCluster = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 0],
  [1, 1, 0, 0, 2, 1],
  [2, 2, 1, 2, 3, 1],
  [2, 4, 1, 3, 2, 2],
  [2, 4, 2, 4, 4, 2],
];
const reservedSeatsByCluster = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

function makeFloorClusters(floorId: string): Cluster[] {
  return ['a', 'b', 'c', 'd', 'e', 'f'].map((id, clusterIndex) => {
    const tables = tableSeatCounts.map((seats, tableIndex) => {
      const occupied = occupiedSeatsByCluster[clusterIndex][tableIndex];
      const reserved = reservedSeatsByCluster[clusterIndex][tableIndex];
      const states: Seat[] = Array.from({ length: seats }, (_, seatIndex) =>
        seatIndex < occupied ? 'occupied' : seatIndex < occupied + reserved ? 'reserved' : 'vacant',
      );
      return { id: `${floorId}-${id.toUpperCase()}${String(tableIndex + 1).padStart(2, '0')}`, seats, states };
    });
    return {
      id,
      label: `Cluster ${id.toUpperCase()}`,
      occupancy: [34, 48, 58, 67, 79, 86][clusterIndex],
      capacity: tables.reduce((total, table) => total + table.seats, 0),
      tables,
    };
  });
}

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [groupSize, setGroupSize] = useState(2);
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <AppRoutes language={language} setLanguage={setLanguage} groupSize={groupSize} setGroupSize={setGroupSize} />
  </WouterRouter>;
}

function AppRoutes({ language, setLanguage, groupSize, setGroupSize }: {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  groupSize: number;
  setGroupSize: Dispatch<SetStateAction<number>>;
}) {
  const [location, setLocation] = useLocation();
  const t = (english: string, chinese: string) => language === 'en' ? english : chinese;
  const venueId = location.startsWith('/canteen/') ? location.split('/')[2] : '';
  const venue = venues.find((item) => item.id === venueId);
  const header = (
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-home">
        <span className="brand-mark">THU</span>
        <span><span className="brand-name">THUCan</span><span className="brand-sub">Tsinghua dining, figured out</span></span>
      </Link>
      <div className="top-actions">
        <div className="campus-pill"><MapPin size={12} /> HAIDIAN · BEIJING</div>
        <button className="lang-btn" data-testid="button-language" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}>
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
    </header>
  );

  return <div className="app-shell">
    {header}
    <Switch>
      <Route path="/">
        <HomePage language={language} t={t} onOpenFloor={(id) => setLocation(`/canteen/${id}`)} />
      </Route>
      <Route path="/canteen/:id">
        {venue ? <CanteenPage key={venue.id} venue={venue} language={language} t={t} groupSize={groupSize} onGroupSize={setGroupSize} onBack={() => setLocation('/')} /> : <NotFound t={t} />}
      </Route>
      <Route><NotFound t={t} /></Route>
    </Switch>
  </div>;
}

function HomePage({ language, t, onOpenFloor }: { language: Language; t: (en: string, zh: string) => string; onOpenFloor: (id: string) => void }) {
  const [time, setTime] = useState(0);
  const [dietary, setDietary] = useState<string[]>([]);
  const [budget, setBudget] = useState(50);
  const [search, setSearch] = useState('');
  const [showFullMap, setShowFullMap] = useState(false);
  const times = [t('Now', '现在'), '+15', '+30'];
  const toggleDiet = (tag: string) => setDietary((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  const filteredVenues = useMemo(() => venues.filter((venue) => {
    const matchesDiet = !dietary.length || dietary.every((tag) => venue.tags.includes(tag));
    const matchesBudget = venue.price[0] <= budget;
    const matchesSearch = `${venue.name} ${venue.zh}`.toLowerCase().includes(search.toLowerCase().trim());
    return matchesDiet && matchesBudget && matchesSearch;
  }), [dietary, budget, search]);

  useEffect(() => {
    if (!showFullMap) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFullMap(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showFullMap]);

  return <main className="home-layout">
    <section className="map-area">
      <div className="home-intro">
        <div className="eyebrow">{t('Tsinghua campus dining', '清华校园餐饮')}</div>
        <h1>{t('Find your next meal.', '找一顿合适的饭。')}</h1>
        <p>{t('Choose a dining hall. Check the sample floor plan, seats and stalls.', '选择食堂，查看示意楼层、座位和档口。')}</p>
      </div>
      <figure className="campus-map-frame" data-testid="map-campus">
        <img src={`${import.meta.env.BASE_URL}tsinghua-campus-map.jpg`} alt={t('Illustrated Tsinghua University campus map', '清华大学校园地图示意')} />
        <figcaption>{t('Campus map · reference image', '校园地图 · 参考示意')}</figcaption>
        <button className="map-expand" data-testid="button-expand-map" onClick={() => setShowFullMap(true)}><Maximize2 size={13} />{t('Full map', '放大地图')}</button>
      </figure>
      {showFullMap && <div className="map-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFullMap(false); }}>
        <section className="map-modal" role="dialog" aria-modal="true" aria-label={t('Full campus map', '完整校园地图')}>
          <header className="map-modal-header"><span>{t('Tsinghua campus map', '清华校园地图')}</span><button className="close-sheet" aria-label={t('Close map', '关闭地图')} onClick={() => setShowFullMap(false)}><X size={19} /></button></header>
          <div className="map-zoom-viewport"><img src={`${import.meta.env.BASE_URL}tsinghua-campus-map.jpg`} alt={t('Full detailed Tsinghua University campus map', '清华大学详细校园地图')} /></div>
        </section>
      </div>}
      <section className="finder-panel">
        <div className="finder-heading">
          <div><h2>{t('Dining halls', '食堂')}</h2><span>{filteredVenues.length} {t('places', '处')}</span></div>
          <label className="search-box"><Search size={15} /><input aria-label={t('Search dining halls', '搜索食堂')} data-testid="input-search-canteens" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('Search by name', '按名称搜索')} /></label>
        </div>
        <div className="quick-filters">
          <div className="time-filter" role="group" aria-label={t('Crowd outlook', '人流时段')}>
            {times.map((label, i) => <button key={label} data-testid={`button-time-${i}`} className={time === i ? 'active' : ''} onClick={() => setTime(i)}>{label}</button>)}
          </div>
          <select aria-label={t('Price per person', '人均预算')} data-testid="select-budget" value={budget} onChange={(event) => setBudget(Number(event.target.value))}>
            <option value={20}>{t('≤ ¥20 / person', '人均 ≤ ¥20')}</option><option value={30}>{t('≤ ¥30 / person', '人均 ≤ ¥30')}</option><option value={50}>{t('≤ ¥50 / person', '人均 ≤ ¥50')}</option>
          </select>
        </div>
        <div className="filter-row">
          {['Vegetarian', 'Vegan', 'Halal'].map((tag) => <button key={tag} data-testid={`filter-${tag.toLowerCase()}`} className={`filter-chip ${dietary.includes(tag) ? 'active' : ''}`} aria-pressed={dietary.includes(tag)} onClick={() => toggleDiet(tag)}>{t(tag, tag === 'Vegetarian' ? '素食' : tag === 'Vegan' ? '纯素' : '清真')}</button>)}
        </div>
        {filteredVenues.length ? <div className="venue-list">
          {filteredVenues.map((venue) => {
            const crowd = venue.occ[time];
            return <button className="venue-row" key={venue.id} data-testid={`button-canteen-${venue.id}`} onClick={() => onOpenFloor(venue.id)}>
              <span className="venue-crowd" style={{ color: occupancyTone(crowd) }}>{crowd}<small>%</small></span>
              <span className="venue-copy"><strong>{language === 'en' ? venue.name.replace(' Dining Hall', '') : venue.zh}</strong><span>{language === 'en' ? venue.zh : venue.name.replace(' Dining Hall', '')} · ¥{venue.price[0]}–{venue.price[1]} · {venue.walk} {t('min walk', '分钟步行')}</span></span>
              <ChevronRight size={17} />
            </button>;
          })}
        </div> : <div className="empty-select">{t('No dining halls match these filters.', '没有符合条件的食堂。')}</div>}
        <div className="sample-banner" data-testid="status-sample-data"><Info size={15} /><span>{t('Illustrative only · crowds, routes, seats, queues and menus are sample data, not live university information.', '仅供示意 · 人流、路线、座位、排队与菜单均为示例数据，非校方实时信息。')}</span></div>
      </section>
    </section>
  </main>;
}

function CanteenPage({ venue, language, t, groupSize, onGroupSize, onBack }: { venue: Canteen; language: Language; t: (en: string, zh: string) => string; groupSize: number; onGroupSize: (size: number) => void; onBack: () => void }) {
  const [floorId, setFloorId] = useState(venue.floors[0].id);
  const [clusterId, setClusterId] = useState('a');
  const [stallId, setStallId] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const floorIndex = Math.max(0, venue.floors.findIndex((floor) => floor.id === floorId));
  const currentFloor = venue.floors[floorIndex];
  const clusters = makeFloorClusters(floorId);
  const openSeats = (cluster: Cluster) => cluster.tables.reduce((total, table) => total + table.states.filter((state) => state === 'vacant').length, 0);
  const clusterFits = (cluster: Cluster) => openSeats(cluster) >= groupSize;
  const filteredClusters = clusters.filter(clusterFits);
  const selectedCluster = filteredClusters.find((cluster) => cluster.id === clusterId) ?? filteredClusters[0];
  const floorStalls = useMemo(() => makeFloorStalls(venue.stalls), [venue.stalls]);
  const selectedStall = floorStalls.find((stall) => stall.id === stallId);
  const selectedName = language === 'en' ? venue.name : venue.zh;
  const occupancy = venue.occ[0];
  useEffect(() => {
    if (!stallId) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setStallId(''); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stallId]);

  return <main className="detail-shell">
    <div className="breadcrumb"><button onClick={onBack} data-testid="button-back-map"><ArrowLeft size={15} /> {t('Dining halls', '食堂')}</button><span>/</span><span>{selectedName}</span></div>
    <div className="detail-header">
      <div>
        <div className="eyebrow">{t('Dining hall', '食堂')}</div>
        <h1>{selectedName}</h1>
        <p className="detail-sub">{language === 'en' ? venue.officialLocation : venue.zhLocation}</p>
        <div className="header-meta"><span className="meta-chip"><Clock3 size={13} />{language === 'en' ? venue.hours : venue.zhHours}</span><span className="meta-chip">{t('Sample crowd', '示例人流')} · {occupancy}%</span><span className="meta-chip">¥{venue.price[0]}–{venue.price[1]}</span></div>
      </div>
      <button className="directions-button" data-testid="button-directions" onClick={() => setShowRoute((shown) => !shown)}><Navigation size={15} />{showRoute ? t('Hide route note', '收起路线说明') : t(`About ${venue.walk} min walk`, `步行约 ${venue.walk} 分钟`)}</button>
    </div>
    {showRoute && <div className="route-box" data-testid="status-directions"><Navigation size={17} /><span>{t(`Approximate route note · about ${venue.walk} minutes on foot. Not turn-by-turn navigation.`, `路线示意 · 步行约 ${venue.walk} 分钟，非实时导航。`)}</span></div>}
    <section className="floor-card">
      <div className="floor-toolbar">
        <div><div className="section-kicker">{t('Illustrative floor plan', '楼层示意')}</div><div className="floor-tabs" role="tablist" aria-label={t('Dining hall floor', '食堂楼层')}>
          {venue.floors.map((floor) => <button key={floor.id} role="tab" aria-selected={floor.id === floorId} data-testid={`button-floor-${floor.id}`} className={floor.id === floorId ? 'active' : ''} onClick={() => { setFloorId(floor.id); setClusterId('a'); }}>{floor.label}</button>)}
        </div></div>
        <div className="floor-status">{t('Sample crowd', '示例人流')} <b>{currentFloor.occupancy}%</b></div>
      </div>
      <div className="floor-layout" data-testid={`map-floor-${floorId}`}>
        <div className="plan-caption"><span>{t('Stalls', '档口')}</span><span>{t('Seating zones', '座位区')}</span></div>
        <div className="stall-plan">
          {floorStalls.map((stall, index) => <button key={stall.id} className="plan-stall" data-testid={`button-stall-${stall.id}`} onClick={() => setStallId(stall.id)}><span className="stall-number">{String(index + 1).padStart(2, '0')}</span><span>{language === 'en' ? stall.label : stall.zh}</span></button>)}
          <span className="plan-way plan-way-one">{t('Queue / pickup', '排队 / 取餐')}</span>
          <span className="plan-way plan-way-two">{t('Entry', '入口')}</span>
        </div>
      </div>
      <div className="seat-section">
        <div className="seat-section-head">
          <div><h2>{t('Find seats', '找座位')}</h2><p><Users size={14} />{t('How many people?', '同行人数')}</p></div>
          <div className="party-picker" role="group" aria-label={t('Party size', '同行人数')}>
            {Array.from({ length: 6 }, (_, index) => index + 1).map((size) => <button key={size} className={groupSize === size ? 'active' : ''} aria-pressed={groupSize === size} data-testid={`button-party-${size}`} onClick={() => { onGroupSize(size); if (size > groupSize) setClusterId('a'); }}><span>{size}</span></button>)}
          </div>
        </div>
        <p className="available-count" aria-live="polite">{filteredClusters.length} {t('of 6 zones fit your group', '个座位区可容纳同行人数')}</p>
        {selectedCluster ? <div className="seat-workspace">
          <div className="cluster-list">
            {clusters.map((cluster) => {
              const fits = clusterFits(cluster);
              const vacancies = openSeats(cluster);
              return <button key={cluster.id} disabled={!fits} className={`cluster-option ${selectedCluster.id === cluster.id ? 'selected' : ''} ${fits ? '' : 'unavailable'}`} data-testid={`button-cluster-${cluster.id}`} aria-pressed={selectedCluster.id === cluster.id} onClick={() => setClusterId(cluster.id)}>
                <span className="cluster-title">{t(cluster.label, `区域 ${cluster.id.toUpperCase()}`)}</span>
                <span className="cluster-summary">{vacancies}/{cluster.capacity} {t('open seats', '空位')}</span>
                <span className="cluster-preview" aria-hidden="true">{cluster.tables.map((table) => <i key={table.id}>{table.seats}</i>)}</span>
              </button>;
            })}
          </div>
          <div className="seat-detail" data-testid="panel-seat-states">
            <div className="seat-detail-title"><div><strong>{t(selectedCluster.label, `区域 ${selectedCluster.id.toUpperCase()}`)}</strong><span>{t('6 tables · sample', '6 张桌 · 示例')}</span></div><span className="seat-count">{openSeats(selectedCluster)}/{selectedCluster.capacity} {t('open seats', '空位')}</span></div>
            <div className="table-grid" aria-label={t('Six-table layout', '六桌布局')}>
              {selectedCluster.tables.map((table, index) => {
                const available = table.states.filter((state) => state === 'vacant').length;
                return <article key={table.id} className="table-card" data-testid={`table-${table.id}`}>
                  <div className="table-card-title"><strong>{t(`Table ${index + 1}`, `桌 ${index + 1}`)}</strong><span>{table.seats} {t('seats', '座')}</span></div>
                  <div className={`table-seat-layout seats-${table.seats}`} aria-label={t(`${table.seats}-seat table`, `${table.seats} 人桌`)}>
                    {table.states.map((state, seatIndex) => <i key={seatIndex} className={`seat ${state}`} role="img" aria-label={t(state === 'vacant' ? 'Vacant seat' : state === 'reserved' ? 'Reserved seat' : 'Occupied seat', state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')} title={t(state === 'vacant' ? 'Vacant' : state === 'reserved' ? 'Reserved' : 'Occupied', state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')} />)}
                  </div>
                  <span className="table-open-count">{available}/{table.seats} {t('open', '空')}</span>
                </article>;
              })}
            </div>
            <div className="seat-legend"><span><i className="seat vacant" />{t('Open', '空位')}</span><span><i className="seat reserved" />{t('Held', '已留座')}</span><span><i className="seat occupied" />{t('Taken', '有人')}</span></div>
          </div>
        </div> : <div className="empty-select">{t('No zone has enough open seats for this group.', '没有足够空位容纳同行人数。')}</div>}
      </div>
      <div className="illustrative-note"><Info size={14} />{t('All seats, queues and menus are sample data, not live university information.', '座位、排队与菜单均为示例数据，非校方实时信息。')}</div>
    </section>
    {selectedStall && <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setStallId(''); }}>
      <section className="stall-sheet" role="dialog" aria-modal="true" aria-labelledby="stall-sheet-title" data-testid={`dialog-stall-${selectedStall.id}`}>
        <div className="sheet-grip" />
        <header className="sheet-header"><div><span className="section-kicker">{t('Sample stall', '档口示例')}</span><h2 id="stall-sheet-title">{language === 'en' ? selectedStall.label : selectedStall.zh}</h2><span className="queue-badge">{selectedStall.queue} {t('min sample queue', '分钟示例等候')}</span></div><button className="close-sheet" aria-label={t('Close stall details', '关闭档口详情')} data-testid="button-close-stall" onClick={() => setStallId('')}><X size={19} /></button></header>
        <div className="sheet-menu-heading"><strong>{t('Menu', '菜单')}</strong><span>{t('Illustrative items', '示例菜品')}</span></div>
        {selectedStall.menu.map((dish) => <article key={dish.name} className="dish-item">
          <div className="dish-top"><span className="dish-name">{language === 'en' ? dish.name : dish.zh}</span><span className="dish-price">¥{dish.price}</span></div>
          <p className="dish-desc">{language === 'en' ? dish.description : dish.zhDescription}</p>
          <div className="dish-foot"><span>{dish.rating.toFixed(1)} {t('sample rating', '示例评分')}</span><span className={dish.available ? 'availability' : 'unavailable'}>{dish.available ? t('Available', '供应中') : t('Sold out', '售罄')}</span>{dish.tags.map((tag) => <span className="dish-tag" key={tag}>{t(tag, tag === 'Vegetarian' ? '素食' : '纯素')}</span>)}</div>
        </article>)}
      </section>
    </div>}
  </main>;
}

function NotFound({ t }: { t: (en: string, zh: string) => string }) {
  const [, setLocation] = useLocation();
  return <main className="not-found"><div><div className="eyebrow">404 · {t('Not found', '页面不存在')}</div><h1>{t('This page is not here.', '页面不存在。')}</h1><button className="directions-button" onClick={() => setLocation('/')}><ArrowLeft size={14} />{t('Back to dining halls', '返回食堂列表')}</button></div></main>;
}

const floorStallNames: [string, string][] = [
  ['Rice & wok', '米饭 / 小炒'], ['Noodle kitchen', '面食档口'], ['Vegetarian counter', '素食档口'],
  ['Rice bowls', '盖饭档口'], ['Soup & congee', '汤粥档口'], ['Dumpling counter', '饺子档口'],
  ['Seasonal dishes', '时令菜档口'], ['Steamed dishes', '蒸菜档口'], ['Snacks & sides', '小吃 / 配菜'],
];

function makeFloorStalls(stalls: Stall[]): Stall[] {
  return floorStallNames.map(([label, zh], index) => {
    const source = stalls[index % stalls.length];
    return { ...source, id: `floor-stall-${index + 1}`, label, zh, queue: Math.max(2, source.queue + (index % 4) - 1) };
  });
}

export default App;
