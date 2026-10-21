import { type CSSProperties, type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ArrowLeft, Clock3, Info, MapPin, Navigation, Users, X } from 'lucide-react';

type Language = 'en' | 'zh';
type Dish = { name: string; zh: string; description: string; zhDescription: string; price: number; rating: number; available: boolean; tags: string[] };
type Stall = { id: string; label: string; zh: string; queue: number; menu: Dish[] };
type Seat = 'vacant' | 'reserved' | 'occupied';
type Table = { id: string; seats: number; states: Seat[] };
type Cluster = { id: string; occupancy: number; tables: Table[] };
type Floor = { id: string; label: string; occupancy: number };
type Canteen = {
  id: string; name: string; zh: string; officialLocation: string; zhLocation: string; hours: string; zhHours: string;
  x: number; y: number; tags: string[]; price: [number, number]; occ: [number, number, number];
  floors: Floor[]; stalls: Stall[];
};

const makeMenu = (prefix: string): Dish[] => [
  { name: `${prefix} tomato egg rice`, zh: `${prefix} 番茄鸡蛋饭`, description: 'Soft egg, slow-cooked tomato and steamed rice.', zhDescription: '嫩滑炒蛋、慢炖番茄，搭配香米。', price: 16, rating: 4.6, available: true, tags: ['Vegetarian'] },
  { name: 'Three-cup mushroom bowl', zh: '三杯菌菇饭', description: 'Basil, soy and sesame-glazed seasonal mushrooms.', zhDescription: '罗勒、酱油与芝麻裹炒时令菌菇。', price: 22, rating: 4.4, available: true, tags: ['Vegetarian', 'Vegan'] },
  { name: 'Beijing-style chicken noodles', zh: '京味鸡丝面', description: 'Shredded chicken, wheat noodles and a light sesame broth.', zhDescription: '鸡丝、小麦面条与清爽芝麻汤底。', price: 19, rating: 4.3, available: false, tags: [] },
];
const makeStalls = (prefix: string, wait: number): Stall[] => [
  { id: `${prefix}-a`, label: 'Rice & wok counter', zh: '米饭 / 小炒', queue: wait, menu: makeMenu('Garden') },
  { id: `${prefix}-b`, label: 'Noodle kitchen', zh: '面食档口', queue: Math.max(2, wait - 2), menu: makeMenu('Sesame') },
  { id: `${prefix}-c`, label: 'Fresh & vegetarian', zh: '轻食 / 素食', queue: wait + 1, menu: makeMenu('Green') },
];
const makeFloors = (count = 2): Floor[] => Array.from({ length: count }, (_, i) => ({
  id: `f${i + 1}`, label: ['1F', '2F', '3F', '4F'][i], occupancy: [48, 34, 62, 27][i % 4],
}));
const venues: Canteen[] = [
  { id: 'guanchouyuan', name: 'Guanchouyuan Dining Hall', zh: '观畴园', officialLocation: 'Guanchouyuan; Qingqing Yonghe and Campus Jazz Coffee are on level 1.', zhLocation: '观畴园；清青永和与 Campus Jazz Coffee 位于一层。', hours: '6:30–9:00 · 11:00–13:00 · 17:00–20:00', zhHours: '6:30–9:00 · 11:00–13:00 · 17:00–20:00', x: 33, y: 32, tags: ['Vegetarian', 'Vegan', 'Halal'], price: [12, 32], occ: [58, 44, 36], floors: makeFloors(3), stalls: makeStalls('guan', 7) },
  { id: 'taoliyuan', name: 'Taoliyuan Dining Hall', zh: '桃李园', officialLocation: 'Taoliyuan; Qingqing Xiuxian Canteen is in the basement.', zhLocation: '桃李园；清青休闲餐厅位于地下一层。', hours: '6:30–9:00 · 10:30–13:00 · 16:30–23:00', zhHours: '6:30–9:00 · 10:30–13:00 · 16:30–23:00', x: 50, y: 14, tags: ['Vegetarian', 'Vegan'], price: [10, 28], occ: [78, 63, 51], floors: makeFloors(3), stalls: makeStalls('tao', 11) },
  { id: 'zijingyuan', name: 'Zijingyuan Dining Hall', zh: '紫荆园', officialLocation: 'Zijingyuan Dining Hall.', zhLocation: '紫荆园餐厅。', hours: '1F 6:30–13:30 · 17:00–19:30', zhHours: '一层 6:30–13:30 · 17:00–19:30', x: 61, y: 13, tags: ['Vegetarian', 'Vegan'], price: [10, 30], occ: [42, 31, 49], floors: makeFloors(4), stalls: makeStalls('zi', 5) },
  { id: 'qingfenyuan', name: 'Qingfenyuan Dining Hall', zh: '清芬园', officialLocation: 'Qingfenyuan Dining Hall.', zhLocation: '清芬园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 51, y: 41, tags: ['Vegetarian'], price: [10, 26], occ: [69, 52, 40], floors: makeFloors(2), stalls: makeStalls('qingfen', 9) },
  { id: 'tingtaoyuan', name: 'Tingtaoyuan Dining Hall', zh: '听涛园', officialLocation: 'Tingtaoyuan Dining Hall.', zhLocation: '听涛园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 53, y: 35, tags: ['Vegetarian', 'Vegan'], price: [11, 29], occ: [34, 47, 59], floors: makeFloors(2), stalls: makeStalls('ting', 4) },
  { id: 'dingxiangyuan', name: 'Dingxiangyuan Dining Hall', zh: '丁香园', officialLocation: 'Dingxiangyuan Dining Hall.', zhLocation: '丁香园餐厅。', hours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', zhHours: '6:30–9:30 · 10:40–13:00 · 16:40–19:00', x: 52, y: 30, tags: ['Vegetarian'], price: [10, 27], occ: [50, 38, 29], floors: makeFloors(2), stalls: makeStalls('ding', 6) },
  { id: 'yushuyuan', name: 'Yushuyuan Dining Hall', zh: '玉树园', officialLocation: 'Yushuyuan Dining Hall.', zhLocation: '玉树园餐厅。', hours: '6:40–8:30 · 11:00–13:00 · 17:00–20:30', zhHours: '6:40–8:30 · 11:00–13:00 · 17:00–20:30', x: 81, y: 14, tags: ['Vegetarian', 'Vegan'], price: [12, 34], occ: [65, 51, 37], floors: makeFloors(2), stalls: makeStalls('yu', 8) },
  { id: 'zhilanyuan', name: 'Zhilanyuan Dining Hall', zh: '芝兰园', officialLocation: 'Zhilanyuan; buffet served on the 2nd floor.', zhLocation: '芝兰园；二楼供应自助餐。', hours: '11:00–13:00 · 17:00–20:00', zhHours: '11:00–13:00 · 17:00–20:00', x: 87, y: 22, tags: ['Vegetarian'], price: [18, 48], occ: [38, 46, 33], floors: makeFloors(2), stalls: makeStalls('zhi', 5) },
  { id: 'muslim', name: 'Muslim Canteen', zh: '清真餐厅', officialLocation: 'West of Guanchouyuan Dining Hall.', zhLocation: '观畴园西侧。', hours: '6:30–9:00 · 11:00–13:30 · 17:00–20:00', zhHours: '6:30–9:00 · 11:00–13:30 · 17:00–20:00', x: 28, y: 32, tags: ['Halal'], price: [14, 32], occ: [26, 43, 35], floors: makeFloors(1), stalls: makeStalls('muslim', 3) },
  { id: 'qingqingkuaican', name: 'Qingqing Kuaican', zh: '清青快餐', officialLocation: '2nd floor of Wenxinyuan Dining Hall.', zhLocation: '闻馨园二层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 57, y: 65, tags: ['Vegetarian'], price: [12, 27], occ: [71, 55, 48], floors: makeFloors(1), stalls: makeStalls('kuaican', 8) },
  { id: 'qingqingpizza', name: 'Qingqing Pizza', zh: '清青比萨', officialLocation: 'Basement level of Zijingyuan Dining Hall.', zhLocation: '紫荆园地下一层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 61, y: 13, tags: ['Vegetarian'], price: [18, 42], occ: [45, 34, 41], floors: [{ id: 'b1', label: 'B1', occupancy: 34 }], stalls: makeStalls('pizza', 6) },
  { id: 'qingqingyonghe', name: 'Qingqing Yonghe', zh: '清青永和', officialLocation: '1st floor of Guanchouyuan Dining Hall.', zhLocation: '观畴园一层。', hours: '10:30–22:30', zhHours: '10:30–22:30', x: 33, y: 32, tags: ['Vegetarian'], price: [12, 26], occ: [57, 42, 39], floors: makeFloors(1), stalls: makeStalls('yonghe', 5) },
  { id: 'qingqingxiuxian', name: 'Qingqing Xiuxian Canteen', zh: '清青休闲餐厅', officialLocation: 'Basement level of Taoliyuan Dining Hall.', zhLocation: '桃李园地下一层。', hours: '11:00–22:30', zhHours: '11:00–22:30', x: 50, y: 14, tags: ['Vegetarian'], price: [14, 32], occ: [44, 37, 29], floors: [{ id: 'b1', label: 'B1', occupancy: 37 }], stalls: makeStalls('xiuxian', 5) },
  { id: 'qingqingmianba', name: 'Qingqing Mianba', zh: '清青面吧', officialLocation: 'Campus dining location listed by Tsinghua University.', zhLocation: '清华大学官方餐饮信息所列校内餐饮点。', hours: '10:30–14:00 · 16:30–22:30', zhHours: '10:30–14:00 · 16:30–22:30', x: 73, y: 52, tags: ['Vegetarian'], price: [12, 28], occ: [31, 42, 27], floors: makeFloors(1), stalls: makeStalls('mianba', 3) },
];
const occupancyTone = (value: number) => value < 60 ? 'low' : value <= 85 ? 'mid' : 'high';
const tableSeatCounts = [2, 4, 2, 4, 4, 2] as const;
const occupiedByCluster = [[0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 0], [1, 1, 0, 0, 2, 1], [2, 2, 1, 2, 3, 1], [2, 4, 1, 3, 2, 2], [2, 4, 2, 4, 4, 2]];
const reservedByCluster = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0]];
function makeFloorClusters(floorId: string): Cluster[] {
  return ['a', 'b', 'c', 'd', 'e', 'f'].map((id, index) => ({
    id, occupancy: [34, 48, 58, 67, 79, 86][(index + Number(floorId.replace(/\D/g, '') || 1) - 1) % 6],
    tables: tableSeatCounts.map((_, tableIndex) => {
      const floorOffset = Number(floorId.replace(/\D/g, '') || 1) - 1;
      const seats = tableSeatCounts[(tableIndex + floorOffset) % tableSeatCounts.length];
      const seatCluster = (index + floorOffset) % occupiedByCluster.length;
      const occupied = occupiedByCluster[seatCluster][tableIndex], reserved = reservedByCluster[seatCluster][tableIndex];
      return { id: `${floorId}-${id}-${tableIndex}`, seats, states: Array.from({ length: seats }, (_, n): Seat => n < occupied ? 'occupied' : n < occupied + reserved ? 'reserved' : 'vacant') };
    }),
  }));
}
const floorStallNames: [string, string][] = [['Rice & wok', '米饭 / 小炒'], ['Noodle kitchen', '面食档口'], ['Vegetarian counter', '素食档口'], ['Rice bowls', '盖饭档口'], ['Soup & congee', '汤粥档口'], ['Dumpling counter', '饺子档口']];
function makeFloorStalls(stalls: Stall[]) {
  return floorStallNames.map(([label, zh], i) => ({ ...stalls[i % stalls.length], id: `floor-stall-${i + 1}`, label, zh }));
}

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [groupSize, setGroupSize] = useState(2);
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRoutes language={language} setLanguage={setLanguage} groupSize={groupSize} setGroupSize={setGroupSize} /></WouterRouter>;
}
function AppRoutes({ language, setLanguage, groupSize, setGroupSize }: { language: Language; setLanguage: Dispatch<SetStateAction<Language>>; groupSize: number; setGroupSize: Dispatch<SetStateAction<number>> }) {
  const [location, setLocation] = useLocation(), t = (en: string, zh: string) => language === 'en' ? en : zh;
  const id = location.startsWith('/canteen/') ? location.split('/')[2] : '';
  const venue = venues.find((v) => v.id === id);
  return <div className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand"><span className="brand-mark">T</span><span><strong className="brand-name">THUCan</strong><small className="brand-sub">{t('Tsinghua campus dining', '清华校园餐饮')}</small></span></Link>
      <span className="campus-pill"><MapPin size={13} /> HAIDIAN · BEIJING</span>
      <button className="lang-btn" aria-label={t('Switch language to Chinese', '切换语言至英文')} onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}>{language === 'en' ? '中文' : 'EN'}</button>
    </header>
    <Switch>
      <Route path="/"><HomePage language={language} t={t} onOpenFloor={(v) => setLocation(`/canteen/${v}`)} /></Route>
      <Route path="/canteen/:id">{venue ? <CanteenPage key={venue.id} venue={venue} language={language} t={t} groupSize={groupSize} onGroupSize={setGroupSize} onBack={() => setLocation('/')} /> : <NotFound t={t} />}</Route>
      <Route><NotFound t={t} /></Route>
    </Switch>
  </div>;
}

function HomePage({ language, t, onOpenFloor }: { language: Language; t: (en: string, zh: string) => string; onOpenFloor: (id: string) => void }) {
  const [minutes, setMinutes] = useState(0), [dietary, setDietary] = useState<string[]>([]), [budget, setBudget] = useState(50), [selectedId, setSelectedId] = useState(''), [showPreferences, setShowPreferences] = useState(false);
  const selected = venues.find((v) => v.id === selectedId);
  const [tapState, setTapState] = useState<{ id: string; time: number }>({ id: '', time: 0 });
  const crowd = (v: Canteen) => {
    const a = minutes <= 15 ? v.occ[0] : v.occ[1], b = minutes <= 15 ? v.occ[1] : v.occ[2];
    return Math.round(a + (b - a) * ((minutes <= 15 ? minutes : minutes - 15) / 15));
  };
  const qualifies = (v: Canteen) => dietary.every((tag) => v.tags.includes(tag)) && v.price[0] <= budget;
  const filteredCount = venues.filter(qualifies).length;
  const routePath = useMemo(() => {
    if (!selected) return '';
    const nearest = (values: number[], target: number) => values.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best);
    const targetX = selected.x * 10, targetY = selected.y * 9;
    const roadX = nearest([266, 444, 623, 777], targetX), roadY = nearest([175, 421, 584, 735], targetY);
    return `M 430 680 L 444 735 L ${roadX} 735 L ${roadX} ${roadY} L ${targetX} ${roadY} L ${targetX} ${targetY}`;
  }, [selected]);
  const onMarker = (v: Canteen) => {
    const now = Date.now();
    if (tapState.id === v.id && now - tapState.time < 520) { onOpenFloor(v.id); setTapState({ id: '', time: 0 }); return; }
    setSelectedId(v.id); setTapState({ id: v.id, time: now });
  };
  return <main className="home-map-screen">
    <div className="map-stage" data-testid="map-campus">
      <svg className="campus-drawing" viewBox="0 0 1000 900" preserveAspectRatio="none" aria-hidden="true">
        <rect width="1000" height="900" fill="#f2f0e9"/>
        <path className="outer-road" d="M122 58 L792 58 Q824 60 845 82 L925 178 L925 745 Q923 781 895 805 L834 850 L194 850 Q151 849 130 826 L76 770 L76 384 Q79 350 100 324 L108 275 L108 126 Q108 82 122 58 Z"/>
        <path className="road" d="M126 175 C245 174 328 176 442 172 S680 173 858 176 M91 421 C226 419 319 423 430 418 S692 419 916 420 M115 584 C255 582 340 587 455 581 S716 585 897 578 M165 735 C288 731 365 737 480 731 S720 735 851 728"/>
        <path className="road" d="M266 87 C266 190 264 275 266 365 S264 570 268 785 M444 78 C446 168 443 252 449 334 L440 462 C438 570 444 690 443 812 M623 81 C618 180 625 260 622 359 S631 565 625 782 M777 117 C771 215 776 299 772 400 S778 606 775 760"/>
        <path className="road secondary" d="M119 340 C219 342 286 340 342 315 S431 270 492 278 L620 290 Q704 302 784 360 L887 362 M111 493 C228 485 296 478 366 449 S469 405 539 422 L649 458 Q746 485 892 476 M176 666 C269 648 326 625 392 622 S510 650 570 681 Q676 728 813 665 M329 178 C346 235 379 276 431 307 M657 421 C711 388 745 336 773 291"/>
        <g className="blocks">
          <rect x="137" y="112" width="87" height="40"/><rect x="294" y="105" width="105" height="50"/><rect x="473" y="110" width="112" height="43"/><rect x="663" y="113" width="104" height="48"/>
          <rect x="143" y="202" width="86" height="52"/><rect x="295" y="198" width="102" height="62"/><rect x="480" y="206" width="110" height="52"/><rect x="673" y="208" width="103" height="54"/>
          <rect x="131" y="365" width="91" height="42"/><rect x="285" y="363" width="102" height="45"/><rect x="477" y="356" width="106" height="48"/><rect x="681" y="365" width="111" height="43"/>
          <rect x="138" y="448" width="91" height="58"/><rect x="291" y="445" width="99" height="57"/><rect x="485" y="447" width="99" height="52"/><rect x="683" y="448" width="110" height="53"/>
          <rect x="139" y="604" width="92" height="55"/><rect x="293" y="600" width="102" height="50"/><rect x="487" y="603" width="103" height="54"/><rect x="683" y="602" width="110" height="57"/>
          <rect x="174" y="758" width="100" height="49"/><rect x="333" y="758" width="110" height="48"/><rect x="516" y="758" width="110" height="49"/><rect x="693" y="755" width="105" height="48"/>
        </g>
        <defs><marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7156ab"/></marker></defs>
        <path className="route-line" d={routePath} markerEnd="url(#route-arrow)"/>
        <circle className="user-halo" cx="430" cy="680" r="19"/><circle className="user-dot" cx="430" cy="680" r="8"/>
      </svg>
      <div className="road-label label-top">HEQING RD.</div><div className="road-label label-left">ZISHAN RD.</div><div className="road-label label-mid">ZHIShAN RD.</div><div className="road-label label-right">Zijing Rd.</div>
      <div className="user-label"><span className="user-pin"><Navigation size={13} /></span><span>{t('Building 6 · You', '六号楼 · 当前位置')}</span></div>
      {venues.map((v, i) => {
        const value = crowd(v), tone = occupancyTone(value), dim = !qualifies(v);
        const offsets: [number, number][] = [[-50, -30], [24, -32], [-5, 28], [-48, 15], [-44, -28], [80, 20], [-40, -50], [-20, -17], [45, -27], [-72, -62], [50, -18], [-48, -25], [52, 12], [-38, -34]];
        const [dx, dy] = offsets[i];
        return <button key={v.id} className={`map-marker ${tone} ${selectedId === v.id ? 'selected' : ''} ${dim ? 'dimmed' : ''}`} style={{ left: `${v.x}%`, top: `${v.y}%`, zIndex: selectedId === v.id ? 8 : 2 + (i % 3), '--dx': `${dx}px`, '--dy': `${dy}px`, '--leader': `${Math.round(Math.hypot(dx, dy))}px`, '--angle': `${Math.atan2(dy, dx) * 180 / Math.PI}deg` } as CSSProperties} onClick={() => onMarker(v)} onDoubleClick={() => onOpenFloor(v.id)} aria-label={`${language === 'en' ? v.name : v.zh}, ${value}% illustrative fullness. Tap once for route; tap again for floor plan.`} data-testid={`button-canteen-${v.id}`}>
          <span className="marker-dot"/><span className="marker-callout"><span className="marker-label">{language === 'en' ? v.name.replace(' Dining Hall', '') : v.zh}</span><span className="marker-value">{value}%</span></span>
        </button>;
      })}
      <div className="map-scale">{t('ILLUSTRATIVE CAMPUS MAP', '校园地图示意')}</div>
      <div className="map-legend"><span><i className="dot low"/> {t('Quiet', '较空')}</span><span><i className="dot mid"/> {t('Steady', '适中')}</span><span><i className="dot high"/> {t('Busy', '较忙')}</span></div>
      <aside className="map-controls">
        <div className="control-title"><div><span className="eyebrow">{t('Campus dining', '校园餐饮')}</span><h1>{t('Where to eat?', '今天去哪吃？')}</h1></div><span className="control-count">{filteredCount}<small> / {venues.length}</small></span></div>
        <div className="forecast-head"><span>{t('Crowd forecast', '人流预测')} · <b>{minutes === 0 ? t('Now', '现在') : t(`In ${minutes} min`, `${minutes} 分钟后`)}</b></span><span className="illustrative-tag">{t('SAMPLE', '示意')}</span></div>
        <input className="forecast-slider" type="range" min="0" max="30" value={minutes} aria-label={t('Crowd forecast minutes', '人流预测分钟')} onChange={(e) => setMinutes(Number(e.target.value))} style={{ '--progress': `${minutes / 30 * 100}%` } as CSSProperties} data-testid="slider-forecast"/>
        <div className="slider-labels"><span>{t('Now', '现在')}</span><span>+15</span><span>+30</span></div>
        <button className="control-expand" aria-expanded={showPreferences} onClick={() => setShowPreferences((open) => !open)}>{showPreferences ? t('Fewer controls', '收起筛选') : t('Diet, budget & group', '饮食、预算与人数')}<span>{showPreferences ? '−' : '+'}</span></button>
        <div className={`advanced-controls ${showPreferences ? 'open' : ''}`}>
        <div className="filters-title">{t('Your preferences', '筛选偏好')}</div>
        <div className="filter-controls">
          <div className="filter-chips">{['Vegetarian', 'Vegan', 'Halal'].map((tag) => <button key={tag} className={`filter-chip ${dietary.includes(tag) ? 'active' : ''}`} aria-pressed={dietary.includes(tag)} onClick={() => setDietary((d) => d.includes(tag) ? d.filter((x) => x !== tag) : [...d, tag])}>{t(tag, tag === 'Vegetarian' ? '素食' : tag === 'Vegan' ? '纯素' : '清真')}</button>)}</div>
          <select aria-label={t('Maximum budget per person', '人均预算上限')} value={budget} onChange={(e) => setBudget(Number(e.target.value))} data-testid="select-budget"><option value={20}>≤ ¥20</option><option value={30}>≤ ¥30</option><option value={50}>≤ ¥50</option></select>
        </div>
        </div>
        {selected ? <div className="selected-canteen"><span className={`crowd-indicator ${occupancyTone(crowd(selected))}`}/><span className="selected-copy"><strong>{language === 'en' ? selected.name : selected.zh}</strong><small>{t('Route shown from Building 6 · tap again for plan', '已显示从六号楼出发路线 · 再次点击查看楼层')}</small></span><button aria-label={t('Open floor plan', '打开楼层图')} onClick={() => onOpenFloor(selected.id)}><Navigation size={16}/></button></div> : <p className="map-hint">{t('Tap a marker for a route. Tap it again to see the floor plan.', '点击标记查看路线，再次点击打开楼层图。')}</p>}
        <p className="sample-note"><Info size={13}/>{t('Crowds and routes are illustrative, not live university data.', '人流与路线均为示意，非校方实时信息。')}</p>
      </aside>
    </div>
  </main>;
}

function CanteenPage({ venue, language, t, groupSize, onGroupSize, onBack }: { venue: Canteen; language: Language; t: (en: string, zh: string) => string; groupSize: number; onGroupSize: (n: number) => void; onBack: () => void }) {
  const [floorId, setFloorId] = useState(venue.floors[0].id), [clusterId, setClusterId] = useState('a'), [stallId, setStallId] = useState('');
  const floor = venue.floors.find((f) => f.id === floorId) ?? venue.floors[0], clusters = makeFloorClusters(floorId);
  const canFit = (c: Cluster) => c.tables.some((table) => table.states.filter((s) => s === 'vacant').length >= groupSize);
  const selectedCluster = clusters.find((c) => c.id === clusterId) ?? clusters[0];
  const stalls = useMemo(() => makeFloorStalls(venue.stalls), [venue]);
  const selectedStall = stalls.find((s) => s.id === stallId);
  useEffect(() => {
    if (!stallId) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setStallId(''); };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, [stallId]);
  const name = language === 'en' ? venue.name : venue.zh;
  return <main className="detail-shell">
    <div className="breadcrumb"><button onClick={onBack} data-testid="button-back-map"><ArrowLeft size={15}/>{t('Campus map', '校园地图')}</button><span>/</span><span>{name}</span></div>
    <div className="detail-header"><div><div className="eyebrow">{t('Dining hall · illustrative details', '食堂 · 示意信息')}</div><h1>{name}</h1><p className="detail-sub">{language === 'en' ? venue.officialLocation : venue.zhLocation}</p><div className="header-meta"><span className="meta-chip"><Clock3 size={13}/>{language === 'en' ? venue.hours : venue.zhHours}</span><span className="meta-chip">¥{venue.price[0]}–{venue.price[1]}</span></div></div></div>
    <section className="floor-card">
      <div className="floor-toolbar"><div><div className="section-kicker">{t('Floor plan', '楼层平面示意')}</div><div className="floor-tabs" role="tablist" aria-label={t('Dining hall floor', '食堂楼层')}>{venue.floors.map((f) => <button key={f.id} role="tab" aria-selected={f.id === floorId} className={f.id === floorId ? 'active' : ''} onClick={() => { setFloorId(f.id); setClusterId('a'); }}>{f.label}</button>)}</div></div><div className="floor-status"><span className={`crowd-indicator ${occupancyTone(floor.occupancy)}`}/>{t('Sample fullness', '示例拥挤度')} <b>{floor.occupancy}%</b></div></div>
      <div className="floor-layout">
        <div className="plan-heading"><span>{t('Dining room', '用餐区')}</span><span>{t('Stall counters', '档口')}</span></div>
        <div className="plan-board">
          <div className="dining-side"><div className="side-label">{t('Seating clusters', '座位区')}</div><div className="cluster-plan-grid">{clusters.map((c) => {
            const fit = canFit(c);
            return <button key={c.id} className={`cluster-plan ${occupancyTone(c.occupancy)} ${selectedCluster.id === c.id ? 'selected' : ''} ${fit ? '' : 'filtered-out'}`} aria-pressed={selectedCluster.id === c.id} onClick={() => setClusterId(c.id)} aria-label={`${t('Cluster', '区域')} ${c.id.toUpperCase()}, ${t(occupancyTone(c.occupancy), occupancyTone(c.occupancy) === 'low' ? '空闲' : occupancyTone(c.occupancy) === 'mid' ? '适中' : '拥挤')}`}>
              <span className="cluster-seats">{c.tables.map((table) => <i key={table.id} className="tiny-table"><b/>{table.states.map((s, i) => <em key={i} className={s}/>)}</i>)}</span><strong>{t('Zone', '区域')} {c.id.toUpperCase()}</strong>
            </button>;
          })}</div><div className="entrance"><span className="entrance-arrow">↗</span>{t('Entrance', '入口')}</div></div>
          <div className="counter-side"><div className="side-label">{t('Order · collect', '点餐 · 取餐')}</div><div className="stall-counter-line">{stalls.map((stall, i) => <button className="counter-stall" key={stall.id} onClick={() => setStallId(stall.id)} data-testid={`button-stall-${stall.id}`}><span className="counter-number">{String(i + 1).padStart(2, '0')}</span><strong>{language === 'en' ? stall.label : stall.zh}</strong><span className="counter-queue">{stall.queue}′</span></button>)}</div><div className="queue-lane">{t('Queue / pickup lane', '排队 / 取餐通道')}</div></div>
        </div>
      </div>
      <section className="seat-section">
        <div className="seat-section-head"><div><h2>{t('Table availability', '桌位情况')}</h2><p><Users size={14}/>{t('Tables fade when they cannot fit your party.', '不适合当前人数的桌位会淡出。')}</p></div><div className="party-picker" role="group" aria-label={t('Party size', '同行人数')}>{[1,2,3,4].map((n) => <button key={n} className={groupSize === n ? 'active' : ''} aria-pressed={groupSize === n} data-testid={`button-party-${n}`} onClick={() => onGroupSize(n)}>{n}</button>)}</div></div>
        <div className="seat-workspace">
          <div className="seat-detail" data-testid="panel-seat-states"><div className="seat-detail-title"><div><strong>{t('Zone', '区域')} {selectedCluster.id.toUpperCase()}</strong><span>{t('Six-table layout · sample', '六桌布局 · 示例')}</span></div><span className={`cluster-state ${occupancyTone(selectedCluster.occupancy)}`} aria-label={occupancyTone(selectedCluster.occupancy)}/></div>
            <div className="table-grid">{selectedCluster.tables.map((table, i) => {
              const fits = table.states.filter((s) => s === 'vacant').length >= groupSize;
              return <article key={table.id} className={`table-card ${fits ? '' : 'table-faded'}`} data-testid={`table-${table.id}`} aria-label={t(`Table ${i + 1}`, `桌 ${i + 1}`)}>
                <strong>{t('Table', '桌')} {i + 1}</strong><div className={`table-seat-layout seats-${table.seats}`}>{table.states.map((state, j) => <i key={j} className={`seat ${state}`} role="img" aria-label={t(state === 'vacant' ? 'Vacant seat' : state === 'reserved' ? 'Reserved seat' : 'Occupied seat', state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')} title={t(state === 'vacant' ? 'Vacant' : state === 'reserved' ? 'Reserved' : 'Occupied', state === 'vacant' ? '空位' : state === 'reserved' ? '已留座' : '有人')}/>)}</div>
              </article>;
            })}</div><div className="seat-legend"><span><i className="seat vacant"/>{t('Vacant', '空位')}</span><span><i className="seat reserved"/>{t('Reserved', '已留座')}</span><span><i className="seat occupied"/>{t('Occupied', '有人')}</span></div>
          </div></div>
      </section>
      <div className="illustrative-note"><Info size={14}/>{t('Seat, queue and menu information is illustrative, not live university data.', '座位、排队与菜单信息均为示意，非校方实时信息。')}</div>
    </section>
    {selectedStall && <div className="sheet-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setStallId(''); }}><section className="stall-sheet" role="dialog" aria-modal="true" aria-labelledby="stall-sheet-title" data-testid={`dialog-stall-${selectedStall.id}`}><div className="sheet-grip"/><header className="sheet-header"><div><span className="section-kicker">{t('Illustrative stall', '档口示意')}</span><h2 id="stall-sheet-title">{language === 'en' ? selectedStall.label : selectedStall.zh}</h2><span className="queue-badge">{t('Sample queue', '示例排队')} · {selectedStall.queue} {t('min', '分钟')}</span></div><button className="close-sheet" aria-label={t('Close stall details', '关闭档口详情')} onClick={() => setStallId('')}><X size={19}/></button></header><div className="sheet-menu-heading"><strong>{t('Menu', '菜单')}</strong><span>{t('Illustrative items', '示例菜品')}</span></div>{selectedStall.menu.map((dish) => <article key={dish.name} className="dish-item"><div className="dish-top"><span className="dish-name">{language === 'en' ? dish.name : dish.zh}</span><span className="dish-price">¥{dish.price}</span></div><p className="dish-desc">{language === 'en' ? dish.description : dish.zhDescription}</p><div className="dish-foot"><span>{dish.rating.toFixed(1)} {t('sample rating', '示例评分')}</span><span className={dish.available ? 'availability' : 'unavailable'}>{dish.available ? t('Available', '供应中') : t('Sold out', '售罄')}</span>{dish.tags.map((tag) => <span className="dish-tag" key={tag}>{t(tag, tag === 'Vegetarian' ? '素食' : '纯素')}</span>)}</div></article>)}</section></div>}
  </main>;
}
function NotFound({ t }: { t: (en: string, zh: string) => string }) {
  const [, setLocation] = useLocation();
  return <main className="not-found"><div><div className="eyebrow">404 · {t('Not found', '页面不存在')}</div><h1>{t('This page is not here.', '页面不存在。')}</h1><button className="back-action" onClick={() => setLocation('/')}><ArrowLeft size={14}/>{t('Back to campus map', '返回校园地图')}</button></div></main>;
}
export default App;
