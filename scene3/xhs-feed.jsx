/* 小红书 home feed — top tabs + waterfall double column */

import React from "react";

const HEADPHONE_SVG = (
  <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="hpBg" cx="50%" cy="40%" r="80%">
        <stop offset="0%" stopColor="#3a3548"/>
        <stop offset="55%" stopColor="#1a1722"/>
        <stop offset="100%" stopColor="#0a0810"/>
      </radialGradient>
      <linearGradient id="hpMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#888896"/>
        <stop offset="50%" stopColor="#4a4a55"/>
        <stop offset="100%" stopColor="#2a2a32"/>
      </linearGradient>
      <linearGradient id="hpCup" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3a3640"/>
        <stop offset="100%" stopColor="#15131a"/>
      </linearGradient>
      <radialGradient id="hpLight" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stopColor="rgba(180,160,255,0.5)"/>
        <stop offset="60%" stopColor="rgba(180,160,255,0.05)"/>
        <stop offset="100%" stopColor="rgba(180,160,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="400" height="500" fill="url(#hpBg)"/>
    <rect width="400" height="500" fill="url(#hpLight)"/>
    {/* soft floor shadow */}
    <ellipse cx="200" cy="430" rx="160" ry="22" fill="rgba(0,0,0,0.5)"/>
    {/* headband */}
    <path d="M 95 220 Q 200 70 305 220" stroke="url(#hpMetal)" strokeWidth="22" fill="none" strokeLinecap="round"/>
    <path d="M 95 220 Q 200 70 305 220" stroke="rgba(255,255,255,0.18)" strokeWidth="6" fill="none" strokeLinecap="round" transform="translate(0,-4)"/>
    {/* slider arms */}
    <rect x="86" y="210" width="14" height="80" rx="4" fill="url(#hpMetal)"/>
    <rect x="300" y="210" width="14" height="80" rx="4" fill="url(#hpMetal)"/>
    {/* left cup */}
    <ellipse cx="93" cy="305" rx="74" ry="86" fill="url(#hpCup)" stroke="#5a5566" strokeWidth="2"/>
    <ellipse cx="93" cy="305" rx="64" ry="76" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
    <ellipse cx="93" cy="305" rx="48" ry="60" fill="#0a0810"/>
    <ellipse cx="93" cy="305" rx="40" ry="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
    {/* mic dot */}
    <circle cx="93" cy="350" r="3.5" fill="rgba(180,160,255,0.9)"/>
    {/* right cup */}
    <ellipse cx="307" cy="305" rx="74" ry="86" fill="url(#hpCup)" stroke="#5a5566" strokeWidth="2"/>
    <ellipse cx="307" cy="305" rx="64" ry="76" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
    <ellipse cx="307" cy="305" rx="48" ry="60" fill="#0a0810"/>
    <ellipse cx="307" cy="305" rx="40" ry="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
    {/* highlight on left cup */}
    <ellipse cx="75" cy="280" rx="14" ry="22" fill="rgba(255,255,255,0.14)"/>
    {/* logo dot center */}
    <circle cx="93" cy="305" r="6" fill="rgba(255,255,255,0.25)"/>
    <circle cx="307" cy="305" r="6" fill="rgba(255,255,255,0.25)"/>
  </svg>
);

const FOOD_SVG = (
  <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="fdBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f7e3c4"/>
        <stop offset="100%" stopColor="#e8b87a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="320" fill="url(#fdBg)"/>
    <ellipse cx="200" cy="240" rx="170" ry="22" fill="rgba(120,70,30,0.25)"/>
    {/* plate */}
    <ellipse cx="200" cy="200" rx="160" ry="50" fill="#fff"/>
    <ellipse cx="200" cy="195" rx="140" ry="42" fill="#fdf4e3"/>
    {/* bun bottom */}
    <ellipse cx="200" cy="190" rx="110" ry="28" fill="#d99858"/>
    {/* lettuce */}
    <path d="M 95 175 Q 130 155 165 172 Q 200 152 235 172 Q 270 155 305 175 L 300 188 L 100 188 Z" fill="#7ab450"/>
    {/* patty */}
    <ellipse cx="200" cy="160" rx="100" ry="20" fill="#5a3018"/>
    <ellipse cx="200" cy="156" rx="100" ry="18" fill="#8a4825"/>
    {/* cheese */}
    <path d="M 100 150 L 300 150 L 290 165 L 110 165 Z" fill="#f5c84c"/>
    {/* tomato */}
    <ellipse cx="200" cy="138" rx="95" ry="14" fill="#d44a3a"/>
    {/* bun top */}
    <path d="M 100 130 Q 200 60 300 130 L 300 140 L 100 140 Z" fill="#e3a564"/>
    <circle cx="160" cy="100" r="3" fill="#fff"/>
    <circle cx="200" cy="85" r="3" fill="#fff"/>
    <circle cx="240" cy="100" r="3" fill="#fff"/>
    <circle cx="180" cy="110" r="2.5" fill="#fff"/>
    <circle cx="220" cy="110" r="2.5" fill="#fff"/>
  </svg>
);

const FASHION_SVG = (
  <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="fsBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e8d8c4"/>
        <stop offset="100%" stopColor="#b8987a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="540" fill="url(#fsBg)"/>
    {/* head */}
    <ellipse cx="200" cy="120" rx="55" ry="65" fill="#d4a884"/>
    {/* hair */}
    <path d="M 145 95 Q 145 40 200 38 Q 255 40 255 95 Q 255 70 220 65 Q 200 60 180 65 Q 145 70 145 95" fill="#3a2820"/>
    <path d="M 145 95 Q 130 130 138 180 Q 145 140 155 120" fill="#3a2820"/>
    <path d="M 255 95 Q 270 130 262 180 Q 255 140 245 120" fill="#3a2820"/>
    {/* neck */}
    <rect x="186" y="170" width="28" height="30" fill="#c89878"/>
    {/* coat */}
    <path d="M 100 220 Q 200 195 300 220 L 320 540 L 80 540 Z" fill="#7a4a2e"/>
    <path d="M 100 220 Q 200 195 300 220 L 305 270 Q 200 250 95 270 Z" fill="#8a5a3e" opacity="0.6"/>
    {/* lapel */}
    <path d="M 200 200 L 170 250 L 200 290 L 230 250 Z" fill="#5a3520"/>
    {/* belt */}
    <rect x="100" y="370" width="200" height="22" fill="#3a2218"/>
    <rect x="190" y="370" width="20" height="22" fill="#c8a868"/>
    {/* bag strap */}
    <path d="M 240 250 Q 280 350 290 440" stroke="#c8a868" strokeWidth="6" fill="none"/>
    {/* bag */}
    <rect x="270" y="430" width="80" height="60" rx="8" fill="#c8a868"/>
    <rect x="270" y="430" width="80" height="14" fill="#a08850"/>
  </svg>
);

const TRAVEL_SVG = (
  <svg viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="trSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd4a8"/>
        <stop offset="40%" stopColor="#ffaa78"/>
        <stop offset="100%" stopColor="#d4748a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="380" fill="url(#trSky)"/>
    {/* sun */}
    <circle cx="200" cy="200" r="50" fill="#ffe4a8"/>
    <circle cx="200" cy="200" r="40" fill="#fff5d4"/>
    {/* clouds */}
    <ellipse cx="80" cy="80" rx="50" ry="14" fill="rgba(255,255,255,0.6)"/>
    <ellipse cx="320" cy="120" rx="40" ry="10" fill="rgba(255,255,255,0.5)"/>
    {/* sea */}
    <rect x="0" y="240" width="400" height="140" fill="#5a708a"/>
    <path d="M 0 240 Q 100 252 200 240 Q 300 252 400 240 L 400 260 Q 300 272 200 260 Q 100 272 0 260 Z" fill="rgba(255,200,150,0.5)"/>
    <path d="M 0 280 Q 100 290 200 280 Q 300 290 400 280 L 400 296 Q 300 304 200 296 Q 100 304 0 296 Z" fill="rgba(255,255,255,0.2)"/>
    {/* mountain */}
    <path d="M 0 240 L 80 180 L 130 200 L 200 150 L 270 195 L 330 175 L 400 240 Z" fill="#3a4858" opacity="0.6"/>
    {/* boat */}
    <path d="M 250 250 L 295 250 L 285 268 L 260 268 Z" fill="#1a1818"/>
    <rect x="270" y="232" width="2" height="20" fill="#1a1818"/>
    <path d="M 272 232 L 290 252 L 272 252 Z" fill="rgba(255,255,255,0.85)"/>
  </svg>
);

const SKINCARE_SVG = (
  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="skBg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#fce4d8"/>
        <stop offset="100%" stopColor="#e89880"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(#skBg)"/>
    <ellipse cx="200" cy="340" rx="120" ry="14" fill="rgba(120,50,30,0.2)"/>
    {/* bottle */}
    <rect x="140" y="120" width="120" height="200" rx="14" fill="#f7f2ec"/>
    <rect x="140" y="120" width="120" height="200" rx="14" fill="rgba(255,255,255,0.4)"/>
    <rect x="170" y="80" width="60" height="50" rx="6" fill="#1a1818"/>
    {/* label */}
    <rect x="155" y="180" width="90" height="80" rx="4" fill="#1a1818"/>
    <rect x="165" y="195" width="50" height="6" rx="2" fill="#fff"/>
    <rect x="165" y="208" width="70" height="3" rx="1" fill="rgba(255,255,255,0.7)"/>
    <rect x="165" y="216" width="60" height="3" rx="1" fill="rgba(255,255,255,0.7)"/>
    <rect x="165" y="240" width="30" height="10" rx="2" fill="#c4a868"/>
    {/* highlight */}
    <rect x="148" y="130" width="14" height="170" rx="6" fill="rgba(255,255,255,0.6)"/>
    {/* floral accent */}
    <circle cx="100" cy="160" r="14" fill="#f7c8b4" opacity="0.7"/>
    <circle cx="320" cy="280" r="18" fill="#f7c8b4" opacity="0.7"/>
  </svg>
);

const PET_SVG = (
  <svg viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="ptBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d4e8d8"/>
        <stop offset="100%" stopColor="#a8c898"/>
      </linearGradient>
    </defs>
    <rect width="400" height="360" fill="url(#ptBg)"/>
    {/* cat body */}
    <ellipse cx="200" cy="260" rx="140" ry="80" fill="#f5e8d4"/>
    {/* head */}
    <ellipse cx="200" cy="170" rx="95" ry="80" fill="#f5e8d4"/>
    {/* ears */}
    <path d="M 130 130 L 110 70 L 165 110 Z" fill="#f5e8d4"/>
    <path d="M 270 130 L 290 70 L 235 110 Z" fill="#f5e8d4"/>
    <path d="M 130 130 L 120 90 L 155 115 Z" fill="#e8a878"/>
    <path d="M 270 130 L 280 90 L 245 115 Z" fill="#e8a878"/>
    {/* face details */}
    <ellipse cx="170" cy="170" rx="8" ry="12" fill="#1a1818"/>
    <ellipse cx="230" cy="170" rx="8" ry="12" fill="#1a1818"/>
    <ellipse cx="170" cy="167" rx="3" ry="4" fill="#fff"/>
    <ellipse cx="230" cy="167" rx="3" ry="4" fill="#fff"/>
    <path d="M 195 195 L 200 205 L 205 195 Z" fill="#d4787a"/>
    <path d="M 200 205 Q 192 215 185 210 M 200 205 Q 208 215 215 210" stroke="#1a1818" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* whiskers */}
    <line x1="155" y1="200" x2="120" y2="195" stroke="#888" strokeWidth="1.5"/>
    <line x1="155" y1="208" x2="118" y2="210" stroke="#888" strokeWidth="1.5"/>
    <line x1="245" y1="200" x2="280" y2="195" stroke="#888" strokeWidth="1.5"/>
    <line x1="245" y1="208" x2="282" y2="210" stroke="#888" strokeWidth="1.5"/>
    {/* stripes */}
    <path d="M 145 130 Q 155 110 165 130" stroke="#c89868" strokeWidth="3" fill="none"/>
    <path d="M 235 130 Q 245 110 255 130" stroke="#c89868" strokeWidth="3" fill="none"/>
  </svg>
);

const ROOM_SVG = (
  <svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="rmBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e8dcc8"/>
        <stop offset="100%" stopColor="#bca088"/>
      </linearGradient>
    </defs>
    <rect width="400" height="480" fill="url(#rmBg)"/>
    {/* window light */}
    <rect x="40" y="40" width="120" height="180" rx="6" fill="#f7e8c8" opacity="0.7"/>
    <line x1="100" y1="40" x2="100" y2="220" stroke="#fff" strokeWidth="2" opacity="0.5"/>
    <line x1="40" y1="130" x2="160" y2="130" stroke="#fff" strokeWidth="2" opacity="0.5"/>
    {/* sofa */}
    <rect x="40" y="280" width="320" height="140" rx="20" fill="#5a3a4a"/>
    <rect x="40" y="280" width="320" height="60" rx="20" fill="#6a4858"/>
    {/* cushions */}
    <rect x="60" y="300" width="80" height="60" rx="14" fill="#d4948a"/>
    <rect x="160" y="300" width="80" height="60" rx="14" fill="#e8c8a8"/>
    <rect x="260" y="300" width="80" height="60" rx="14" fill="#a8b8c8"/>
    {/* plant */}
    <rect x="290" y="180" width="60" height="50" fill="#7a3a30"/>
    <ellipse cx="320" cy="160" rx="50" ry="40" fill="#5a8a48"/>
    <ellipse cx="305" cy="140" rx="20" ry="30" fill="#7aa858"/>
    <ellipse cx="335" cy="140" rx="22" ry="32" fill="#6a9848"/>
    {/* lamp */}
    <rect x="195" y="180" width="10" height="80" fill="#3a2818"/>
    <path d="M 175 180 L 225 180 L 215 150 L 185 150 Z" fill="#e8d8b8"/>
  </svg>
);

const PHOTO = (src) => (
  <img src={src} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
);

const FEED_IMAGES = {
  fashion: new URL("./images/fashion.jpg", import.meta.url).href,
  headphones: new URL("./images/headphones.jpg", import.meta.url).href,
  burger: new URL("./images/burger.jpg", import.meta.url).href,
  travel: new URL("./images/travel.jpg", import.meta.url).href,
};

const FEED_DATA = [
  {
    id: 'fashion-1',
    img: PHOTO(FEED_IMAGES.fashion), ratio: 1280/720,
    title: '冬日机能风穿搭｜海军蓝外套这样叠穿真的帅',
    author: '小雅Aria', avatar: '#3a4a78',
    likes: '8.2w'
  },
  {
    id: 'headphones',
    img: PHOTO(FEED_IMAGES.headphones), ratio: 1278/852,
    title: '入手了一副降噪神器 真无线旗舰耳机日常分享',
    author: '数码橙子', avatar: '#d99858',
    likes: '3.4w', target: true
  },
  {
    id: 'food-1',
    img: PHOTO(FEED_IMAGES.burger), ratio: 933/700,
    title: '探店｜这家手工汉堡也太好吃了 肉饼厚到流油',
    author: '城南食客', avatar: '#e8a878',
    likes: '1.2w'
  },
  {
    id: 'travel-1',
    img: PHOTO(FEED_IMAGES.travel), ratio: 1500/1000,
    title: '北京 CBD 落日机位攻略｜紫粉天空真的浪漫',
    author: '环球小J', avatar: '#88a8d4',
    likes: '5.6w', video: true
  },
  {
    id: 'skin-1',
    img: SKINCARE_SVG, ratio: 400/400,
    title: '空瓶记｜用完才敢推荐的5款精华',
    author: '护肤教练Lily', avatar: '#e8b8a8',
    likes: '2.1w'
  },
  {
    id: 'pet-1',
    img: PET_SVG, ratio: 360/400,
    title: '我家橘猫又胖了 减肥日记Day12',
    author: '阿橘的爸爸', avatar: '#e8c878',
    likes: '4567'
  },
  {
    id: 'room-1',
    img: ROOM_SVG, ratio: 480/400,
    title: '50㎡小户型客厅改造 沉浸式收纳分享',
    author: '家居有方', avatar: '#a8b8c8',
    likes: '9821'
  }
];

// distribute into two columns by current accumulated height
function splitColumns(items) {
  const left = [], right = [];
  let lh = 0, rh = 0;
  for (const it of items) {
    if (lh <= rh) { left.push(it); lh += it.ratio; }
    else { right.push(it); rh += it.ratio; }
  }
  return { left, right };
}

const Card = ({ data, onClick, tappable, cardRef, imgRef }) => {
  return (
    <div
      ref={cardRef}
      className={"xhs-card" + (data.target ? " target" : "") + (data.target && tappable ? " tappable" : "")}
      onClick={data.target ? onClick : undefined}
    >
      <div ref={imgRef} className="xhs-card-img" style={{ aspectRatio: `400 / ${Math.round(data.ratio * 400)}` }}>
        {data.img}
        {data.video && (
          <div className="vbadge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            01:24
          </div>
        )}
      </div>
      <div className="xhs-card-body">
        <div className="xhs-card-title">{data.title}</div>
        <div className="xhs-card-meta">
          <div className="xhs-author">
            <div className="xhs-author-av" style={{ background: data.avatar }}></div>
            <div className="xhs-author-name">{data.author}</div>
          </div>
          <div className="xhs-likes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z"/>
            </svg>
            {data.likes}
          </div>
        </div>
      </div>
    </div>
  );
};

const XhsFeed = ({ onProductClick, highlight }) => {
  const { left, right } = splitColumns(FEED_DATA);
  const targetRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const [hintPos, setHintPos] = React.useState(null);

  React.useEffect(() => {
    if (!highlight || !imgRef.current) { setHintPos(null); return; }
    const t = setTimeout(() => {
      if (!imgRef.current) return;
      const r = imgRef.current.getBoundingClientRect();
      const parent = document.getElementById('canvas').getBoundingClientRect();
      const scale = parent.width / 1600;
      const cx = (r.left - parent.left) / scale + r.width / scale / 2;
      const cy = (r.top - parent.top) / scale + r.height / scale / 2;
      const w = r.width / scale;
      const h = r.height / scale;
      setHintPos({ cx, cy, w, h });
    }, 300);
    return () => clearTimeout(t);
  }, [highlight]);

  return (
    <div className="xhs-app">
      {/* status bar */}
      <div className="xhs-status">
        <div className="left">9:41</div>
        <div className="right">
          <div className="xhs-signal"><span></span><span></span><span></span><span></span></div>
          <span style={{ fontSize: 28, fontWeight: 600 }}>5G</span>
          <div className="xhs-batt">
            <div className="xhs-batt-fill"></div>
            <div className="xhs-batt-cap"></div>
          </div>
        </div>
      </div>
      <div className="xhs-cutout"></div>

      {/* top bar */}
      <div className="xhs-topbar">
        <div className="xhs-search-row">
          <div className="xhs-menu-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          </div>
          <div className="xhs-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/>
              <line x1="20" y1="20" x2="16.5" y2="16.5"/>
            </svg>
            <span className="placeholder">真无线降噪耳机</span>
            <span className="hot">HOT</span>
          </div>
        </div>

        <div className="xhs-tabs">
          <div className="xhs-tab">关注</div>
          <div className="xhs-tab">视频</div>
          <div className="xhs-tab active">推荐</div>
          <div className="xhs-tab">购物</div>
          <div className="xhs-tab">同城</div>
        </div>

        <div className="xhs-chips">
          <div className="xhs-chip active">推荐</div>
          <div className="xhs-chip">穿搭</div>
          <div className="xhs-chip">美食</div>
          <div className="xhs-chip">数码</div>
          <div className="xhs-chip">家居</div>
          <div className="xhs-chip">旅行</div>
        </div>
      </div>

      {/* feed — flex two-column waterfall */}
      <div className="xhs-feed">
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {left.map(d => (
              <Card
                key={d.id}
                data={d}
                onClick={onProductClick}
                tappable={highlight}
                cardRef={d.target ? targetRef : null}
                imgRef={d.target ? imgRef : null}
              />
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {right.map(d => (
              <Card
                key={d.id}
                data={d}
                onClick={onProductClick}
                tappable={highlight}
                cardRef={d.target ? targetRef : null}
                imgRef={d.target ? imgRef : null}
              />
            ))}
          </div>
        </div>
      </div>

      {/* manual circle gesture is now handled by <DrawLayer /> at the app level */}

      {/* bottom tab bar */}
      <div className="xhs-tabbar">
        <div className="xhs-tabbar-item active">
          <div className="ico">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>
          </div>
          首页
        </div>
        <div className="xhs-tabbar-item">
          <div className="ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="M3 17l5-5 4 4 3-3 6 6"/>
            </svg>
          </div>
          购物
        </div>
        <div className="xhs-tabbar-item">
          <div className="xhs-tabbar-plus">+</div>
        </div>
        <div className="xhs-tabbar-item">
          <div className="ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          消息
        </div>
        <div className="xhs-tabbar-item">
          <div className="ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
          </div>
          我
        </div>
      </div>

      {/* home indicator */}
      <div className="home-indicator"></div>
    </div>
  );
};

export default XhsFeed;
