import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ArrowLeft, ArrowUpRight, Clock3, Compass, Info, MapPin, Navigation, Utensils, Users } from 'lucide-react';

type Language = 'en' | 'zh';
type Dish = { name: string; zh: string; description: string; zhDescription: string; price: number; rating: number; available: boolean; tags: string[] };
type Stall = { id: string; label: string; zh: string; queue: number; menu: Dish[] };
type Seat = 'vacant' | 'reserved' | 'occupied';
type Table = { id: string; seats: number; states: Seat[] };
type Cluster = { id: string; label: string; occupancy: number; capacity: number; tables: Table[]; x: number; y: number };
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
const isSuitable = (venue: Canteen, dietary: string[], budget: number) =>
  (!dietary.length || dietary.every((tag) => venue.tags.includes(tag))) && venue.price[0] <= budget;

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
  const [selectedId, setSelectedId] = useState('guanchouyuan');
  const activeVenue = venues.find((venue) => venue.id === selectedId) ?? venues[0];
  const times = [t('Now', '现在'), '+15', '+30'];
  const toggleDiet = (tag: string) => setDietary((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  const locationLabels = useMemo(() => venues, []);

  return <main className="home-layout">
    <aside className="side-panel">
      <div>
        <div className="eyebrow">{t('Your next meal, sorted', '下一餐，轻松安排')}</div>
        <h1 className="hero-title">{t('Beat the lunch rush.', '错峰吃饭，刚刚好。')}</h1>
        <p className="hero-copy">{t('Find a calmer canteen, then find your seat and something good to eat.', '先挑人少的食堂，再找座位、选好吃的。')}</p>
      </div>
      <div className="sample-banner" data-testid="status-sample-data">
        <Info size={15} strokeWidth={1.8} />
        <div><strong>{t('Illustrative campus preview', '校园示意数据')}</strong>{t('Crowds, routes, seats and menus are sample estimates — not a live university feed.', '人流、路线、座位与菜单均为示例估算，并非实时校方数据。')}</div>
      </div>
      <section className="control-block">
        <div className="control-label">{t('Crowd outlook', '人流时段')}</div>
        <div className="segmented" role="group" aria-label="Crowd forecast">
          {times.map((label, i) => <button key={label} data-testid={`button-time-${i}`} className={time === i ? 'active' : ''} onClick={() => setTime(i)}>{label}</button>)}
        </div>
      </section>
      <section className="control-block">
        <div className="control-label">{t('Dietary preference', '饮食偏好')}</div>
        <div className="filter-row">
          {['Vegetarian', 'Vegan', 'Halal'].map((tag) => <button key={tag} data-testid={`filter-${tag.toLowerCase()}`} className={`filter-chip ${dietary.includes(tag) ? 'active' : ''}`} aria-pressed={dietary.includes(tag)} onClick={() => toggleDiet(tag)}>{t(tag, tag === 'Vegetarian' ? '素食' : tag === 'Vegan' ? '纯素' : '清真')}</button>)}
        </div>
      </section>
      <section className="control-block">
        <label className="control-label" htmlFor="budget">{t('Price per person', '人均预算')}</label>
        <select id="budget" data-testid="select-budget" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="budget-select">
          <option value={20}>{t('Up to ¥20', '¥20 以内')}</option>
          <option value={30}>{t('Up to ¥30', '¥30 以内')}</option>
          <option value={50}>{t('Up to ¥50', '¥50 以内')}</option>
        </select>
      </section>
      <div className="foot-note" style={{ marginTop: 'auto', fontSize: 10, color: '#849085', lineHeight: 1.5 }}><Clock3 size={13} /><a className="source-link" href="https://www.tsinghua.edu.cn/en/Visitor/Experience_Tsinghua/Dining_Options.htm" target="_blank" rel="noreferrer">{t('Official names & hours · Tsinghua University', '官方名称与营业时间 · 清华大学')} <ArrowUpRight size={11} /></a></div>
    </aside>
    <section className="map-area">
      <div className="map-head">
        <div><h2>{t('Tsinghua · campus dining map', '清华 · 校园餐饮地图')}</h2><p>{t('Tap a pin for directions · double tap to open its floor plan.', '单击查看路线 · 双击打开楼层布局。')}</p></div>
        <div className="legend">
          {[[ '#61a777', t('Quieter', '较空闲') ], ['#d5ae3c', t('Building', '渐忙')], ['#ca6259', t('Busy', '较拥挤')]].map(([color, label]) => <span className="legend-item" key={label}><i className="legend-dot" style={{ background: color }} />{label}</span>)}
        </div>
      </div>
      <div className="map-canvas" data-testid="map-campus">
        <div className="map-grid" />
        <div className="campus-lawn" style={{ left: '13%', top: '18%', width: '28%', height: '26%' }} />
        <div className="campus-lawn" style={{ right: '13%', bottom: '14%', width: '26%', height: '30%' }} />
        <div className="map-water" style={{ left: '35%', top: '65%', width: '29%', height: '12%', transform: 'rotate(-12deg)' }} />
        <div className="map-path" />
        <span className="campus-label" style={{ left: '18%', top: '16%' }}>{t('North campus', '校园北区')}</span>
        <span className="campus-label" style={{ right: '18%', bottom: '18%' }}>{t('Zijing residential area', '紫荆生活区')}</span>
        <span className="campus-label" style={{ left: '45%', top: '53%' }}>{t('Central green', '中央绿地')}</span>
        <span className="map-compass">N ↑</span>
        <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={`M 8 86 C 20 82, ${Math.max(20, activeVenue.x - 18)} 78, ${Math.max(20, activeVenue.x - 8)} ${activeVenue.y + 8} S ${activeVenue.x - 2} ${activeVenue.y + 3}, ${activeVenue.x} ${activeVenue.y}`} />
        </svg>
        <span className="map-you" aria-hidden="true"><i />{t('You', '当前位置')}</span>
        {locationLabels.map((item) => {
          const occupancy = item.occ[time];
          const suitable = isSuitable(item, dietary, budget);
          return <button key={item.id} className={`map-pin ${selectedId === item.id ? 'selected' : ''} ${suitable ? '' : 'dim'}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} data-testid={`pin-canteen-${item.id}`} aria-pressed={selectedId === item.id} aria-label={`${item.name}: ${occupancy}% occupancy`} onClick={() => setSelectedId(item.id)} onDoubleClick={() => onOpenFloor(item.id)}>
            <span className="pin-dot" style={{ color: occupancyTone(occupancy) }}><i className="pin-pulse" /><i className="pin-core" style={{ background: occupancyTone(occupancy) }} /></span>
            <span className="pin-card"><span className="pin-name">{language === 'en' ? item.name.replace(' Dining Hall', '') : item.zh}</span><span className="pin-cn">{language === 'en' ? item.zh : item.name.replace(' Dining Hall', '')}</span><span className="pin-status">{occupancy}% · {item.walk} {t('min walk', '分钟步行')}</span></span>
          </button>;
        })}
        <div className="map-scale"><i /> 500 m</div>
      </div>
      <div className="map-footer">
        <span className="foot-note"><MapPin size={13} />{t('Approximate walking routes · illustrative only', '步行路线为近似示意')}</span>
        <div className="route-summary" aria-live="polite">
          <span><Navigation size={12} /> {t('You are here', '当前位置')} → <strong>{language === 'en' ? activeVenue.name.replace(' Dining Hall', '') : activeVenue.zh}</strong> · {t(`about ${activeVenue.walk} min`, `约 ${activeVenue.walk} 分钟`)}</span>
          <button className="route-open-button" data-testid="button-open-floor" onClick={() => onOpenFloor(activeVenue.id)}>{t('Open floor plan', '打开楼层布局')} <ArrowUpRight size={12} /></button>
        </div>
      </div>
    </section>
  </main>;
}

function CanteenPage({ venue, language, t, groupSize, onGroupSize, onBack }: { venue: Canteen; language: Language; t: (en: string, zh: string) => string; groupSize: number; onGroupSize: (size: number) => void; onBack: () => void }) {
  const [floorId, setFloorId] = useState(venue.floors[0].id);
  const [clusterId, setClusterId] = useState('a');
  const [stallId, setStallId] = useState(venue.stalls[0]?.id ?? '');
  const [showRoute, setShowRoute] = useState(false);
  const floorIndex = Math.max(0, venue.floors.findIndex((floor) => floor.id === floorId));
  const currentFloor = venue.floors[floorIndex];
  const clusters: Cluster[] = [
    { id: 'a', label: 'Garden tables', occupancy: (currentFloor.occupancy + 13) % 100, capacity: 32, x: 17 + floorIndex * 3, y: 21 + floorIndex * 4, tables: [{ id: `${floorId}-A01`, seats: 2, states: ['vacant', 'vacant'] }, { id: `${floorId}-A02`, seats: 4, states: ['occupied', 'vacant', 'reserved', 'vacant'] }, { id: `${floorId}-A03`, seats: 4, states: ['occupied', 'occupied', 'vacant', 'vacant'] }] },
    { id: 'b', label: 'Window side', occupancy: (currentFloor.occupancy + 28) % 100, capacity: 24, x: 57 - floorIndex * 4, y: 19 + floorIndex * 5, tables: [{ id: `${floorId}-B01`, seats: 2, states: ['occupied', 'vacant'] }, { id: `${floorId}-B02`, seats: 4, states: ['vacant', 'vacant', 'vacant', 'vacant'] }, { id: `${floorId}-B03`, seats: 4, states: ['occupied', 'occupied', 'occupied', 'vacant'] }] },
    { id: 'c', label: 'Open dining', occupancy: (currentFloor.occupancy + 47) % 100, capacity: 40, x: 32 + floorIndex * 2, y: 57 - floorIndex * 3, tables: [{ id: `${floorId}-C01`, seats: 4, states: ['vacant', 'vacant', 'occupied', 'vacant'] }, { id: `${floorId}-C02`, seats: 2, states: ['reserved', 'vacant'] }, { id: `${floorId}-C03`, seats: 4, states: ['occupied', 'occupied', 'occupied', 'occupied'] }] },
    { id: 'd', label: 'Quiet corner', occupancy: (currentFloor.occupancy + 3) % 100, capacity: 16, x: 69 - floorIndex * 3, y: 59 + floorIndex * 2, tables: [{ id: `${floorId}-D01`, seats: 2, states: ['vacant', 'vacant'] }, { id: `${floorId}-D02`, seats: 2, states: ['occupied', 'vacant'] }] },
  ];
  const selectedCluster = clusters.find((cluster) => cluster.id === clusterId) ?? clusters[0];
  const selectedStall = venue.stalls.find((stall) => stall.id === stallId) ?? venue.stalls[0];
  const selectedName = language === 'en' ? venue.name : venue.zh;
  const occupancy = venue.occ[0];
  const filteredGroups = selectedCluster.tables.filter((table) => table.states.filter((state) => state === 'vacant').length < groupSize);

  return <main className="detail-shell">
    <div className="breadcrumb"><button onClick={onBack} data-testid="button-back-map"><ArrowLeft size={13} style={{ verticalAlign: '-2px' }} /> {t('Campus map', '校园地图')}</button><span>/</span><span>{selectedName}</span></div>
    <div className="detail-header">
      <div>
        <div className="eyebrow">{t('Canteen · sample interior', '食堂 · 室内示意')}</div>
        <h1>{selectedName}</h1>
        <p className="detail-sub">{language === 'en' ? venue.officialLocation : venue.zhLocation}</p>
        <div className="header-meta"><span className="meta-chip">{t('Official hours', '官方营业时间')} · {language === 'en' ? venue.hours : venue.zhHours}</span><span className="meta-chip">{t('Sample crowd', '示例人流')} · {occupancy}%</span><span className="meta-chip">¥{venue.price[0]}–{venue.price[1]} {t('typical', '参考')}</span></div>
      </div>
      <button className="directions-button" data-testid="button-directions" onClick={() => setShowRoute((shown) => !shown)}><Navigation size={15} />{showRoute ? t('Hide directions', '收起路线') : t(`Approx. ${venue.walk} min walk`, `约 ${venue.walk} 分钟步行`)}<ArrowUpRight size={14} /></button>
    </div>
    {showRoute && <div className="route-box" data-testid="status-directions"><Compass size={19} /><span><strong>{t('Approximate route from your current campus area', '从当前校园区域出发的近似路线')}</strong>{t(`Follow the central campus path east, then continue toward ${venue.name.replace(' Dining Hall', '')}. About ${venue.walk} minutes on foot. Route is illustrative, not turn-by-turn navigation.`, `沿校园中央步道向东，再前往${venue.zh}，步行约 ${venue.walk} 分钟。路线为示意，并非实时导航。`)}</span></div>}
    <div className="detail-grid">
      <section className="floor-card">
        <div className="floor-toolbar">
          <div className="floor-tabs" role="tablist" aria-label="Canteen floor">
            {venue.floors.map((floor) => <button key={floor.id} role="tab" aria-selected={floor.id === floorId} data-testid={`button-floor-${floor.id}`} className={floor.id === floorId ? 'active' : ''} onClick={() => { setFloorId(floor.id); setClusterId('a'); }}>{floor.label}</button>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span className="floor-status">{t('Sample floor occupancy', '示例楼层人流')} · {currentFloor.occupancy}%</span>
            <div className="stepper"><button aria-label="Decrease group size" data-testid="button-floor-group-decrease" onClick={() => onGroupSize(Math.max(1, groupSize - 1))}>−</button><strong>{groupSize}</strong><button aria-label="Increase group size" data-testid="button-floor-group-increase" onClick={() => onGroupSize(Math.min(4, groupSize + 1))}>+</button></div>
          </div>
        </div>
        <div className="floor-map" data-testid={`map-floor-${floorId}`}>
          <div className="floor-grid" />
          <div className="floor-zone" style={{ left: '4%', top: '8%', width: '92%', height: '77%' }}><span className="zone-label">{t('Dining hall · illustrative layout', '餐厅 · 示意布局')}</span></div>
          <div className="floor-zone" style={{ left: '5%', bottom: '5%', width: '25%', height: '10%', background: '#e4e9db' }}><span className="zone-label">{t('Counter', '取餐区')}</span></div>
          <div className="floor-zone" style={{ right: '5%', bottom: '5%', width: '24%', height: '10%', background: '#e4e9db' }}><span className="zone-label">{t('Entry', '入口')}</span></div>
          {clusters.map((cluster) => {
            const fits = cluster.tables.some((table) => table.states.filter((state) => state === 'vacant').length >= groupSize);
            return <button key={cluster.id} className={`cluster-button ${clusterId === cluster.id ? 'selected' : ''} ${fits ? '' : 'dim'}`} style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }} data-testid={`button-cluster-${cluster.id}`} onClick={() => setClusterId(cluster.id)}>
              <span className="cluster-name">{t(cluster.label, ['花园座位', '窗边座位', '开放用餐区', '安静角落'][['a', 'b', 'c', 'd'].indexOf(cluster.id)])}</span>
              <span className="cluster-meta"><i className="occupancy-dot" style={{ background: occupancyTone(cluster.occupancy) }} />{cluster.occupancy}% · {cluster.capacity} {t('seats', '座')}</span>
            </button>;
          })}
        </div>
        <div className="table-detail" data-testid="panel-seat-states">
          <div className="table-detail-head">
            <div><h3>{t(selectedCluster.label, ['花园座位', '窗边座位', '开放用餐区', '安静角落'][['a', 'b', 'c', 'd'].indexOf(selectedCluster.id)])}</h3><p>{t('Demo table-level seating · group of', '示例桌位 ·')} {groupSize}</p></div>
            <div className="seat-legend">{(['vacant', 'reserved', 'occupied'] as Seat[]).map((state) => <span key={state} className="seat-state"><i className={`seat ${state}`} />{t(state === 'vacant' ? 'Vacant' : state === 'reserved' ? 'Reserved' : 'Occupied', state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')}</span>)}</div>
          </div>
          <div className="table-row">{selectedCluster.tables.map((table) => {
            const fits = table.states.filter((state) => state === 'vacant').length >= groupSize;
            return <div key={table.id} className="table-chip" style={{ opacity: fits ? 1 : .36 }} data-testid={`table-${table.id}`}><strong>{table.id} · {table.seats} {t('seats', '座')}</strong><div className="seat-dots">{table.states.map((state, index) => <i title={t(state, state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')} key={`${table.id}-${index}`} className={`seat ${state}`} />)}</div></div>;
          })}</div>
          {filteredGroups.length > 0 && <div style={{ fontSize: 9, color: '#8c8d78', marginTop: 10 }}>{t(`${filteredGroups.length} table${filteredGroups.length > 1 ? 's' : ''} faded: not enough open seats for your group.`, `${filteredGroups.length} 张桌位因空位不足以容纳同行人数而淡化显示。`)}</div>}
        </div>
      </section>
      <aside className="stall-card">
        <div className="stall-heading"><div><h2>{t('Stalls & queues', '档口与排队')}</h2><p>{t('Queue estimates are illustrative', '排队时间为示例估算')}</p></div><Utensils size={17} color="#64806a" /></div>
        <div className="stall-list">
          {venue.stalls.map((stall) => <button key={stall.id} className={`stall-button ${stallId === stall.id ? 'active' : ''}`} data-testid={`button-stall-${stall.id}`} onClick={() => setStallId(stall.id)}>
            <span><span className="stall-title">{language === 'en' ? stall.label : stall.zh}</span><span className="stall-mini">{t('Sample queue estimate', '示例等候时间')}</span></span>
            <span className="queue-badge">{stall.queue} {t('min', '分钟')}</span>
          </button>)}
        </div>
        {selectedStall && <div className="dish-list" data-testid={`menu-${selectedStall.id}`}>
          <div className="dish-heading"><strong>{t('Today at this counter', '本档口菜品')}</strong><span className="stall-mini">{t('Sample menu', '示例菜单')}</span></div>
          {selectedStall.menu.map((dish) => <article key={dish.name} className="dish-item">
            <div className="dish-top"><span className="dish-name">{language === 'en' ? dish.name : dish.zh}</span><span className="dish-price">¥{dish.price}</span></div>
            <p className="dish-desc">{language === 'en' ? dish.description : dish.zhDescription}</p>
            <div className="dish-foot"><span>★ {dish.rating.toFixed(1)}</span><span className={dish.available ? 'availability' : 'unavailable'}>{dish.available ? t('Available', '供应中') : t('Sold out', '售罄')}</span>{dish.tags.map((tag) => <span className="dish-tag" key={tag}>{t(tag, tag === 'Vegetarian' ? '素食' : '纯素')}</span>)}</div>
          </article>)}
        </div>}
        <div className="privacy-note"><strong>{t('Privacy first.', '隐私优先。')}</strong> {t('Seat states are anonymous demo signals; no names, profiles or personal location are shown.', '座位状态仅为匿名示例信息；不展示姓名、个人资料或个人位置。')}</div>
      </aside>
    </div>
  </main>;
}

function NotFound({ t }: { t: (en: string, zh: string) => string }) {
  const [, setLocation] = useLocation();
  return <main className="not-found"><div><div className="eyebrow">404 · {t('Not on the map', '不在地图上')}</div><h1 className="hero-title">{t('This path wandered off.', '这条路走远了。')}</h1><button className="directions-button" onClick={() => setLocation('/')}><ArrowLeft size={14} />{t('Back to dining map', '返回餐饮地图')}</button></div></main>;
}

export default App;
