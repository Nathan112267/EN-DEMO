// AI Companion bar — slides in from the right edge.
// States:
//   idle        : just the orb + hint text
//   listening   : orb pressed/listening, sonar pulse
//   thinking    : user msg shown, AI is "thinking"
//   replied     : both user msg + AI reply visible
//   flights     : bar widens, flight cards revealed
import React from "react";


function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12 s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 L21 6 L18 11 L11 12.6 L8 18 L6.5 17.6 L7.6 13.6 L3.6 13 Z" />
    </svg>
  );
}

const FLIGHTS = [
  { dep:'06:30', arr:'09:50', from:'SZX', to:'PEK',
    airline:'国航 CA1305', dur:'3h 20m', stops:'直飞', plane:'330',
    price:'¥ 980', tag:'最早起飞', tagTone:'cool' },
  { dep:'09:15', arr:'12:30', from:'SZX', to:'PEK',
    airline:'南航 CZ3105', dur:'3h 15m', stops:'直飞', plane:'320',
    price:'¥ 1,180', tag:'推荐', tagTone:'hot' },
  { dep:'11:05', arr:'14:25', from:'SZX', to:'PEK',
    airline:'厦航 MF8108', dur:'3h 20m', stops:'直飞', plane:'737',
    price:'¥ 920', tag:'准点率高', tagTone:'cool' },
  { dep:'13:40', arr:'17:05', from:'SZX', to:'PEK',
    airline:'海航 HU7802', dur:'3h 25m', stops:'直飞', plane:'737',
    price:'¥ 860', tag:'最低价', tagTone:'green' },
  { dep:'16:25', arr:'19:55', from:'SZX', to:'PEK',
    airline:'川航 3U8902', dur:'3h 30m', stops:'直飞', plane:'350',
    price:'¥ 1,260', tag:'宽体机', tagTone:'mute' },
  { dep:'19:50', arr:'23:20', from:'SZX', to:'PEK',
    airline:'东航 MU5135', dur:'3h 30m', stops:'直飞', plane:'320',
    price:'¥ 1,050', tag:'晚班', tagTone:'mute' },
];

// Reasons + hotels shown when the recommended flight is expanded.
// All reasons are drawn from the user's Feishu workspace data
// (calendar, docs, past trips) so the recommendation feels "知道你".
const REASONS = [
  { src:'飞书日历', text:'你 5 月 15 日 14:00 有「Q2 评审会」，12:30 落地刚好赶上' },
  { src:'飞书出行', text:'返程已自动锁定 5 月 17 日傍晚，往返均预留 2h 缓冲' },
  { src:'飞书文档', text:'《北京客户拜访计划》提到首日下午需到客户现场' },
  { src:'飞书审批', text:'你过去 5 次北京出差全部选了上午时段，准点率 92%' },
];

const HOTELS = [
  { name:'北京王府井希尔顿酒店',
    chip:'含双早', area:'王府井',
    badge:'近会场 · 1.2km',
    rating:'4.8', reviews:'1,238',
    price:'¥ 1,280', sub:'/晚',
    grad:'linear-gradient(135deg, oklch(0.82 0.16 35) 0%, oklch(0.62 0.18 25) 50%, oklch(0.48 0.18 350) 100%)',
    deco:'sun' },
  { name:'前门同仁堂主题酒店',
    chip:'地铁 5min', area:'前门',
    badge:'文化体验 · 老城',
    rating:'4.6', reviews:'986',
    price:'¥ 980', sub:'/晚',
    grad:'linear-gradient(135deg, oklch(0.78 0.14 200) 0%, oklch(0.58 0.18 240) 55%, oklch(0.40 0.18 290) 100%)',
    deco:'gate' },
  { name:'三里屯洲际行政套房',
    chip:'CBD 商务', area:'三里屯',
    badge:'行政酒廊 · 含 4 项福利',
    rating:'4.9', reviews:'2,054',
    price:'¥ 1,580', sub:'/晚',
    grad:'linear-gradient(135deg, oklch(0.82 0.14 150) 0%, oklch(0.58 0.16 180) 55%, oklch(0.40 0.18 230) 100%)',
    deco:'tower' },
  { name:'北京王府半岛酒店',
    chip:'米其林餐厅', area:'金鱼胡同',
    badge:'奢华入选 · 行政接送',
    rating:'4.9', reviews:'3,402',
    price:'¥ 2,180', sub:'/晚',
    grad:'linear-gradient(135deg, oklch(0.86 0.10 90) 0%, oklch(0.66 0.16 60) 55%, oklch(0.42 0.16 30) 100%)',
    deco:'crown' },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2 L14.6 8.6 L21.6 9.2 L16.3 13.8 L18 20.6 L12 16.9 L6 20.6 L7.7 13.8 L2.4 9.2 L9.4 8.6 Z"/>
    </svg>
  );
}

// Hotels rail with an automatic ping-pong demo (mimics a finger swiping
// through the cards). Stops the moment the user interacts.
function HotelsRail({ items, stopDown }) {
  const railRef = React.useRef(null);
  const idxRef = React.useRef(0);
  const dirRef = React.useRef(1);
  const stoppedRef = React.useRef(false);
  const timerRef = React.useRef(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [showCue, setShowCue] = React.useState(true);

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const stepTo = (i) => {
      const cardEl = rail.querySelector('.hotel-card');
      if (!cardEl) return;
      const cardW = cardEl.offsetWidth + 24; // gap = 24
      rail.scrollTo({ left: i * cardW, behavior: 'smooth' });
      setActiveIdx(i);
    };

    const tick = () => {
      if (stoppedRef.current) return;
      let next = idxRef.current + dirRef.current;
      if (next >= items.length) { dirRef.current = -1; next = items.length - 2; }
      else if (next < 0)         { dirRef.current = 1;  next = 1; }
      idxRef.current = next;
      stepTo(next);
      timerRef.current = setTimeout(tick, 2400);
    };

    // Kick off demo after a short pause so user notices the rail.
    timerRef.current = setTimeout(tick, 1100);

    const stopDemo = () => {
      stoppedRef.current = true;
      setShowCue(false);
      clearTimeout(timerRef.current);
    };
    rail.addEventListener('pointerdown', stopDemo, { once: true });
    rail.addEventListener('wheel', stopDemo, { once: true, passive: true });

    return () => {
      stoppedRef.current = true;
      clearTimeout(timerRef.current);
      rail.removeEventListener('pointerdown', stopDemo);
      rail.removeEventListener('wheel', stopDemo);
    };
  }, [items.length]);

  return (
    <React.Fragment>
      <div className="hotels-rail-wrap">
        <div className="hotels-rail"
             ref={railRef}
             onMouseDown={stopDown}
             onTouchStart={stopDown}>
          {items.map((h, i) => (
            <div key={h.name} className="hotel-card"
                 style={{ animationDelay: `${i * 90 + 200}ms` }}>
              <div className="hotel-image" style={{ background: h.grad }}>
                <div className="hotel-image-deco" data-deco={h.deco} />
                <div className="hotel-image-shine" />
                <div className="hotel-image-area">{h.area}</div>
                <div className="hotel-image-rating">
                  <StarIcon /> <span>{h.rating}</span>
                </div>
                <div className="hotel-image-chip">{h.chip}</div>
              </div>
              <div className="hotel-info">
                <div className="hotel-name">{h.name}</div>
                <div className="hotel-meta">
                  <span>{h.badge}</span>
                  <span className="dotsep">·</span>
                  <span>{h.reviews} 条评价</span>
                </div>
                <div className="hotel-info-bot">
                  <div className="hotel-price">
                    <span className="hp-num">{h.price}</span>
                    <span className="hp-sub">{h.sub}</span>
                  </div>
                  <button className="hotel-book" onClick={stopDown}>预订</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* pagination dots tracking the active card */}
      <div className="hotels-dots">
        {items.map((_, i) => (
          <span key={i} className={"hd-dot" + (i === activeIdx ? " active" : "")} />
        ))}
      </div>
    </React.Fragment>
  );
}

function FlightCard({ f, idx, visible, isExpanded, onCardClick }) {
  const delay = visible ? (idx * 90 + 120) : 0;
  const isRecommended = f.tag === '推荐';
  const cls = "flight-card"
    + (visible ? " in" : "")
    + (isRecommended ? " recommended" : "")
    + (isExpanded ? " expanded" : "");

  const handleClick = (e) => {
    if (!isRecommended) return;
    onCardClick && onCardClick(f);
  };
  const stop = (e) => { e.stopPropagation(); };

  return (
    <div className={cls}
         style={{ transitionDelay: `${delay}ms` }}
         onMouseDown={stop}
         onTouchStart={stop}
         onClick={handleClick}>
      <div className="flight-row-top">
        <div className="flight-times">
          <div className="flight-time">{f.dep}</div>
          <div className="flight-route">
            <span className="flight-from">{f.from}</span>
            <span className="flight-arrow">
              <span className="flight-line" />
              <span className="flight-plane">
                <PlaneIcon />
              </span>
            </span>
            <span className="flight-to">{f.to}</span>
          </div>
          <div className="flight-time">{f.arr}</div>
        </div>
        <div className={"flight-tag tag-" + f.tagTone}>{f.tag}</div>
      </div>
      <div className="flight-row-bot">
        <div className="flight-meta">
          <span>{f.airline}</span>
          <span className="dotsep">·</span>
          <span>{f.stops}</span>
          <span className="dotsep">·</span>
          <span>{f.dur}</span>
          <span className="dotsep">·</span>
          <span>{f.plane}</span>
        </div>
        <div className="flight-price">{f.price}</div>
      </div>

      {/* "Tap to see why" hint — only on the recommended card, only when collapsed */}
      {isRecommended && !isExpanded && (
        <div className="flight-tap-hint">
          <span>点击查看推荐理由 · 同步酒店</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
               stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
               strokeLinejoin="round">
            <path d="M6 9 L12 15 L18 9"/>
          </svg>
        </div>
      )}

      {/* Expanded section: reasons + hotels + actions */}
      {isRecommended && isExpanded && (
        <div className="flight-expand">
          <div className="expand-section">
            <div className="expand-section-head">
              <span className="expand-spark">✨</span>
              <span>根据你的飞书行程为你推荐</span>
            </div>
            <div className="reasons">
              {REASONS.map((r, i) => (
                <div key={i} className="reason"
                     style={{ animationDelay: `${i * 70 + 60}ms` }}>
                  <span className="reason-src">{r.src}</span>
                  <span className="reason-text">{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="expand-section hotels-section">
            <div className="expand-section-head">
              <span className="expand-spark">🏨</span>
              <span>顺便预订北京的酒店</span>
              <span className="expand-section-sub">已为你筛选 {HOTELS.length} 家 · 左右滑动查看</span>
            </div>
            <HotelsRail items={HOTELS} stopDown={stop} />
          </div>

          <div className="expand-actions">
            <button className="expand-btn ghost" onClick={stop}>仅订机票</button>
            <button className="expand-btn primary" onClick={stop}>机票 + 酒店一键预订</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AICompanion({ progress, open, onClose, onPointerDown,
                       aiState, onOrbPress,
                       expandedAirline, onCardClick }) {
  const t = open ? 1 : progress;
  const translate = (1 - t) * 100;
  const overlayClass = "ai-bar-overlay" + (t > 0.05 ? " in" : "");
  const stopDown = (e) => { e.stopPropagation(); };

  // Derived flags
  const showUserMsg = aiState === 'thinking' || aiState === 'replied' || aiState === 'flights';
  const showAiReply = aiState === 'replied' || aiState === 'flights';
  const expanded    = aiState === 'flights';
  const flightsVisible = aiState === 'flights';

  // orb modifier classes
  const orbClass = "ai-orb"
    + (aiState === 'listening' ? ' pressed listening' : '')
    + (aiState === 'thinking'  ? ' thinking' : '')
    + (aiState === 'replied' || aiState === 'flights' ? ' replied' : '');

  const idleHint = aiState === 'idle' ? '点击或按住说话' :
                   aiState === 'listening' ? '正在聆听…' :
                   aiState === 'thinking'  ? '正在思考…' :
                   '继续说话';

  return (
    <React.Fragment>
      <div className={overlayClass}
           style={{ background: `rgba(0,0,0,${(t * 0.32).toFixed(3)})` }}
           onClick={onClose} />

      <div className={"ai-bar" + (expanded ? " expanded" : "")}
           style={{ transform: `translateX(${translate}%)` }}
           onMouseDown={onPointerDown}
           onTouchStart={onPointerDown}>

        <button className="ai-bar-close"
                onMouseDown={stopDown}
                onTouchStart={stopDown}
                onClick={onClose}
                aria-label="关闭">
          <CloseIcon />
        </button>

        {/* TOP: hint card OR initial recognize-screen action — only when idle */}
        {aiState === 'idle' && (
          <React.Fragment>
            <div className="ai-bar-hint">
              当前页面需要手动<br/>触发识屏
            </div>
            <div className="ai-bar-action">
              <EyeIcon />
              <span>识别屏幕</span>
            </div>
          </React.Fragment>
        )}

        {/* CONVERSATION area — appears once user has talked */}
        {(showUserMsg || showAiReply) && (
          <div className="ai-bar-chat">
            {showUserMsg && (
              <div className="chat-bubble user-bubble">
                帮我买一张去北京的机票
              </div>
            )}
            {showAiReply && (
              <div className="chat-bubble ai-bubble">
                <span className="ai-bubble-tag">AI</span>
                好的，正在帮你查询机票
              </div>
            )}
          </div>
        )}

        {/* FLIGHTS panel — only visible when expanded */}
        {expanded && (
          <div className="flights-panel">
            <div className="flights-head">
              <div>
                <div className="flights-title">为你找到 {FLIGHTS.length} 个航班</div>
                <div className="flights-sub">深圳 SZX → 北京 PEK · 5 月 15 日 · 周五</div>
              </div>
              <div className="flights-filter">
                <span className="filter-chip active">推荐</span>
                <span className="filter-chip">价格</span>
                <span className="filter-chip">起飞时间</span>
              </div>
            </div>
            <div className="flights-list">
              {FLIGHTS.map((f, i) => (
                <FlightCard key={f.airline}
                            f={f} idx={i}
                            visible={flightsVisible}
                            isExpanded={expandedAirline === f.airline}
                            onCardClick={onCardClick} />
              ))}
            </div>
          </div>
        )}

        <div className="ai-bar-spacer" />

        <div className="ai-bar-voice">
          <div className={orbClass}
               onMouseDown={(e) => { stopDown(e); onOrbPress && onOrbPress(); }}
               onTouchStart={(e) => { stopDown(e); onOrbPress && onOrbPress(); }}>
            <div className="ai-orb-pulse" />
            <div className="ai-orb-pulse delay" />
          </div>
          <div className="ai-bar-voice-text">{idleHint}</div>
        </div>
      </div>
    </React.Fragment>
  );
}

window.AICompanion = AICompanion;
export default AICompanion;
