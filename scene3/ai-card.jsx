/* AI 识别卡片 — iOS frosted glass, with summary -> similar swap */

import React from "react";

const PRODUCT_IMAGE = new URL("./images/headphones.jpg", import.meta.url).href;

const SIMILAR_IMAGES = {
  sim1: new URL("./assets/sim1.jpg", import.meta.url).href,
  sim2: new URL("./assets/sim2.jpg", import.meta.url).href,
  sim3: new URL("./assets/sim3.jpg", import.meta.url).href,
  sim4: new URL("./assets/sim4.jpg", import.meta.url).href,
  sim5: new URL("./assets/sim5.jpg", import.meta.url).href,
  sim6: new URL("./assets/sim6.jpg", import.meta.url).href,
};

const ACTIONS = [
  {
    key: 'buy', primary: true, label: '购买同款',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h2l1.6 11a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.7L20 9H6"/>
        <circle cx="9" cy="21" r="1.3"/>
        <circle cx="17" cy="21" r="1.3"/>
      </svg>
    )
  },
  {
    key: 'similar', label: '找相似',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="M20 20l-4-4"/>
      </svg>
    )
  },
  {
    key: 'compare', label: '比价',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 6h13M3 12h9M3 18h13"/>
        <path d="M19 4l3 3-3 3M21 14l-3 3 3 3"/>
      </svg>
    )
  }
];

const AI_SUMMARY = '这副 SONORA Aurora Pro 是 2024 年新款真无线降噪耳机，搭载第三代主动降噪芯片，最大消噪深度 48dB，能盖掉地铁、咖啡馆、风噪等绝大多数场景。\n\n单次续航 12 小时（开启降噪 8 小时），充电盒可补到 38 小时；支持 LDAC 高码率传输与空间音频，通勤听歌、办公会议都够用。\n\n现价 ¥1899，比上月低 ¥400，全网同款最低。同价位降噪耳机里评分最高，4.9/5（2.3 万条评价）。整体推荐入手。';

const SIMILAR_ITEMS = [
  { img: SIMILAR_IMAGES.sim1, brand: 'PHIATON',  name: 'BT 460', price: 1299, match: 96 },
  { img: SIMILAR_IMAGES.sim2, brand: 'JAYS',     name: 'u-Jays Wireless', price: 1499, match: 94 },
  { img: SIMILAR_IMAGES.sim3, brand: 'Urbanears',name: 'Plattan Pro', price:  899, match: 92 },
  { img: SIMILAR_IMAGES.sim4, brand: 'Sudio',    name: 'Regent II', price: 1099, match: 90 },
  { img: SIMILAR_IMAGES.sim5, brand: 'Linkface', name: 'Air Pro', price: 1599, match: 88 },
  { img: SIMILAR_IMAGES.sim6, brand: 'Google',   name: 'Pixel Buds Max', price: 2099, match: 87 },
];

const useTypewriter = (text, speed = 22, startDelay = 280) => {
  const [shown, setShown] = React.useState('');
  React.useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    let interval = null;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(start); if (interval) clearInterval(interval); };
  }, [text, speed, startDelay]);
  return shown;
};

/* Similar panel: staggered fade-in cards */
const SimilarPanel = ({ active }) => {
  const [shownCount, setShownCount] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setShownCount(0); return; }
    setShownCount(0);
    const timers = SIMILAR_ITEMS.map((_, i) =>
      setTimeout(() => setShownCount(c => Math.max(c, i + 1)), 280 + i * 180)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="sim-panel">
      <div className="sim-head">
        <div className="sim-head-row">
          <div className="sim-title">为你找到 <span className="em">{SIMILAR_ITEMS.length}</span> 个相似款</div>
          <div className="sim-sort">综合排序 ↓</div>
        </div>
        <div className="sim-sub">按外观、降噪、价格综合相似度排序</div>
      </div>
      <div className="sim-grid">
        {SIMILAR_ITEMS.map((it, i) => (
          <div
            key={i}
            className={"sim-item " + (i < shownCount ? "in" : "")}
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <div className="sim-thumb">
              <img src={it.img} alt="" />
              <div className="sim-match">
                <span className="dot"></span>
                {it.match}% 相似
              </div>
            </div>
            <div className="sim-meta">
              <div className="sim-brand">{it.brand}</div>
              <div className="sim-name">{it.name}</div>
              <div className="sim-price"><span className="yen">¥</span>{it.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AICard = ({ visible, onClose }) => {
  const summary = useTypewriter(visible ? AI_SUMMARY : '', 24, 320);
  const done = summary.length >= AI_SUMMARY.length;
  const [view, setView] = React.useState('summary'); // 'summary' | 'similar'

  // reset to summary whenever card re-opens
  React.useEffect(() => {
    if (!visible) setView('summary');
  }, [visible]);

  // 1s after typing finishes, swap to similar
  React.useEffect(() => {
    if (!visible) return;
    if (!done) return;
    if (view !== 'summary') return;
    const t = setTimeout(() => setView('similar'), 1000);
    return () => clearTimeout(t);
  }, [visible, done, view]);

  // 2s after similar view appears, swap back to summary
  React.useEffect(() => {
    if (!visible) return;
    if (view !== 'similar') return;
    // similar grid takes ~1.4s to fully stagger in; wait 2s after that
    const t = setTimeout(() => setView('summary'), 2000 + SIMILAR_ITEMS.length * 180);
    return () => clearTimeout(t);
  }, [visible, view]);

  if (!visible) return null;

  return (
    <React.Fragment>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="ai-card-halo"></div>
      <div className="ai-card">
        <button className="ai-card-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        {/* top label changes per view */}
        <div className="ai-card-label">
          <span className="pulse"></span>
          {view === 'summary' ? 'NOMI · 视觉识别' : 'NOMI · 找相似'}
        </div>

        {/* big title swaps too */}
        <div className="ai-card-title">
          {view === 'summary' ? (
            <React.Fragment>为你识别到这副 <span className="em">真无线降噪耳机</span></React.Fragment>
          ) : (
            <React.Fragment>同类好物 <span className="em">已为你筛选</span></React.Fragment>
          )}
        </div>

        {/* sliding track */}
        <div className={"ai-track " + (view === 'similar' ? 'show-similar' : 'show-summary')}>
          <div className="ai-pane summary-pane">
            <div className="ai-card-stream">
              {summary.split('\n').map((line, i, arr) => (
                <p key={i}>
                  {line}
                  {i === arr.length - 1 && !done && <span className="cursor"></span>}
                </p>
              ))}
            </div>
            <div className="ai-card-product">
              <div className="ai-card-product-img">
                <img src={PRODUCT_IMAGE} alt="" />
              </div>
              <div className="ai-card-product-info">
                <div className="brand">SONORA Aurora Pro</div>
                <div className="price"><span className="yen">¥</span>1899</div>
              </div>
            </div>
          </div>
          <div className="ai-pane similar-pane">
            <SimilarPanel active={view === 'similar'} />
          </div>
        </div>

        {/* simple actions */}
        <div className="ai-card-actions">
          {ACTIONS.map(a => {
            const isPrimary = (view === 'similar') ? a.key === 'similar' : a.primary;
            return (
              <button
                key={a.key}
                className={"ai-action" + (isPrimary ? " primary" : "")}
                onClick={() => {
                  if (a.key === 'similar') setView('similar');
                  else if (a.key === 'buy') setView('summary');
                }}
              >
                <div className="ico">{a.icon}</div>
                <div className="label">{a.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default AICard;
