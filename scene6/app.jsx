import React from "react";

const FEED_IMAGES = {
  fashion: new URL("../scene3/images/fashion.jpg", import.meta.url).href,
  headphones: new URL("../scene3/images/headphones.jpg", import.meta.url).href,
  burger: new URL("../scene3/images/burger.jpg", import.meta.url).href,
  travel: new URL("../scene3/images/travel.jpg", import.meta.url).href,
};

const FEED_ITEMS = [
  {
    id: "fashion-1",
    kind: "穿搭",
    img: FEED_IMAGES.fashion,
    ratio: 1280 / 720,
    title: "冬日机能风穿搭｜海军蓝外套这样叠穿真的帅",
    author: "小雅Aria",
    avatar: "#3a4a78",
    likes: "8.2w",
    productName: "海军蓝机能外套",
    productType: "机能外套",
    price: "¥899",
    summary:
      "这件海军蓝机能外套属于冷调利落风，版型偏短，适合和浅灰、奶白、银色单品做层次。AI 判断它更适合通勤、周末城市步行和轻户外穿搭。",
    similar: ["短款冲锋衣", "海军蓝夹克", "雾灰直筒裤"],
  },
  {
    id: "headphones",
    kind: "数码",
    img: FEED_IMAGES.headphones,
    ratio: 1278 / 852,
    title: "入手了一副降噪神器 真无线旗舰耳机日常分享",
    author: "数码橙子",
    avatar: "#d99858",
    likes: "3.4w",
    productName: "SONORA Aurora Pro",
    productType: "头戴式降噪耳机",
    price: "¥1899",
    summary:
      "画面主体是 SONORA Aurora Pro 头戴式降噪耳机，主打深度降噪、长续航和多设备切换。AI 认为它适合通勤、办公室专注和长时间视频会议。",
    similar: ["BT 460", "Plattan Pro", "Pixel Buds Max"],
  },
  {
    id: "food-1",
    kind: "美食",
    img: FEED_IMAGES.burger,
    ratio: 933 / 700,
    title: "探店｜这家手工汉堡也太好吃了 肉饼厚到流油",
    author: "城南食客",
    avatar: "#e8a878",
    likes: "1.2w",
    productName: "焦香厚肉手工汉堡",
    productType: "探店菜品",
    price: "¥58",
    summary:
      "这张图的重点是厚肉饼、芝士和高饱腹感。AI 建议收藏时同步记录口味关键词：焦香、酱汁偏浓、肉饼厚，后续更容易找到同类店铺。",
    similar: ["厚肉饼汉堡", "美式餐吧", "无糖茶搭配"],
  },
  {
    id: "travel-1",
    kind: "旅行",
    img: FEED_IMAGES.travel,
    ratio: 1500 / 1000,
    title: "北京 CBD 落日机位攻略｜紫粉天空真的浪漫",
    author: "环球小J",
    avatar: "#88a8d4",
    likes: "5.6w",
    video: true,
    productName: "北京 CBD 落日机位",
    productType: "城市机位",
    price: "收藏",
    summary:
      "AI 识别到这是城市落日机位内容，关键价值不是单张照片，而是时间、朝向和到达路线。建议把日落前 40 分钟、附近地铁站和天气条件一起保存。",
    similar: ["国贸落日", "紫粉天空", "周末拍摄路线"],
  },
  {
    id: "skin-1",
    kind: "护肤",
    ratio: 400 / 400,
    title: "空瓶记｜用完才敢推荐的5款精华",
    author: "护肤教练Lily",
    avatar: "#e8b8a8",
    likes: "2.1w",
    productName: "修护型精华组合",
    productType: "护肤清单",
    price: "待比价",
    summary:
      "这是护肤空瓶类内容，AI 建议先提取成分、肤质和使用周期，再判断是否跟买。不要只看空瓶结论，搭配产品和敏感成分更关键。",
    similar: ["修护精华", "成分对比", "敏感肌记录"],
  },
  {
    id: "room-1",
    kind: "家居",
    ratio: 480 / 400,
    title: "50㎡小户型客厅改造 沉浸式收纳分享",
    author: "家居有方",
    avatar: "#a8b8c8",
    likes: "9821",
    productName: "小户型客厅收纳方案",
    productType: "家居方案",
    price: "生成清单",
    summary:
      "AI 认为这类图适合提炼动线、柜体深度和照明层次。若继续加入户型图，可以进一步拆成采购尺寸和摆放建议。",
    similar: ["收纳柜深度", "动线优化", "客厅照明"],
  },
];

const ITEM_BY_ID = Object.fromEntries(FEED_ITEMS.map((item) => [item.id, item]));
const AI_CARD_VIEWS = [
  { id: "summary", label: "识别", aria: "AI 识别结果" },
  { id: "similar", label: "找相似", aria: "相似线索" },
  { id: "compare", label: "比价", aria: "比价建议" },
];

function getViewIndex(view) {
  const index = AI_CARD_VIEWS.findIndex((entry) => entry.id === view);
  return index >= 0 ? index : 0;
}

function getViewByOffset(view, offset) {
  const current = getViewIndex(view);
  const next = (current + offset + AI_CARD_VIEWS.length) % AI_CARD_VIEWS.length;
  return AI_CARD_VIEWS[next].id;
}

function ProductVisual({ item }) {
  if (item.img) {
    return <img src={item.img} alt="" />;
  }
  return (
    <div className={"fallback-visual fallback-" + item.id}>
      <div className="fallback-glow" />
      <div className="fallback-card f1" />
      <div className="fallback-card f2" />
      <div className="fallback-line l1" />
      <div className="fallback-line l2" />
    </div>
  );
}

function splitColumns(items) {
  const left = [];
  const right = [];
  let leftHeight = 0;
  let rightHeight = 0;

  for (const item of items) {
    if (leftHeight <= rightHeight) {
      left.push(item);
      leftHeight += item.ratio;
    } else {
      right.push(item);
      rightHeight += item.ratio;
    }
  }

  return { left, right };
}

function FeedCard({ item, armed, selected, onPick }) {
  return (
    <article
      className={
        "xhs-card" +
        (armed ? " is-armed" : "") +
        (selected ? " is-selected" : "")
      }
      data-card-id={item.id}
    >
      <button
        className="xhs-card-img"
        type="button"
        style={{ aspectRatio: `400 / ${Math.round(item.ratio * 400)}` }}
        aria-label={`背触选图：${item.productName}`}
        onClick={(event) => onPick(item, event.currentTarget)}
      >
        <ProductVisual item={item} />
        <span className="scan-reticle" aria-hidden="true" />
        {item.video && (
          <span className="vbadge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            01:24
          </span>
        )}
      </button>
      <div className="xhs-card-body">
        <div className="xhs-card-title">{item.title}</div>
        <div className="xhs-card-meta">
          <div className="xhs-author">
            <span className="xhs-author-av" style={{ background: item.avatar }} />
            <span className="xhs-author-name">{item.author}</span>
          </div>
          <div className="xhs-likes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            {item.likes}
          </div>
        </div>
      </div>
    </article>
  );
}

function XhsFeed({ armed, selectedId, onPick }) {
  const { left, right } = splitColumns(FEED_ITEMS);
  const renderCard = (item) => (
    <FeedCard
      key={item.id}
      item={item}
      armed={armed}
      selected={selectedId === item.id}
      onPick={onPick}
    />
  );

  return (
    <main className="xhs-app">
      <div className="xhs-status">
        <div className="left">9:41</div>
        <div className="right">
          <div className="xhs-signal"><span /><span /><span /><span /></div>
          <span style={{ fontSize: 28, fontWeight: 600 }}>5G</span>
          <div className="xhs-batt"><div className="xhs-batt-fill" /><div className="xhs-batt-cap" /></div>
        </div>
      </div>
      <div className="xhs-cutout" />

      <div className="xhs-topbar">
        <div className="xhs-search-row">
          <div className="xhs-menu-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </div>
          <div className="xhs-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <span className="placeholder">背触 AI 选图</span>
            <span className="hot">HID</span>
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

      <section className="xhs-feed">
        <div className="xhs-feed-columns">
          <div className="xhs-feed-column">{left.map(renderCard)}</div>
          <div className="xhs-feed-column">{right.map(renderCard)}</div>
        </div>
      </section>

      <nav className="xhs-tabbar">
        <div className="xhs-tabbar-item active">
          <div className="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" /></svg></div>
          首页
        </div>
        <div className="xhs-tabbar-item">
          <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><path d="M3 17l5-5 4 4 3-3 6 6" /></svg></div>
          购物
        </div>
        <div className="xhs-tabbar-item"><div className="xhs-tabbar-plus">+</div></div>
        <div className="xhs-tabbar-item">
          <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" /></svg></div>
          消息
        </div>
        <div className="xhs-tabbar-item">
          <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg></div>
          我
        </div>
      </nav>
      <div className="home-indicator" />
    </main>
  );
}

function HardwareStatus({ armed, capturedItem }) {
  return (
    <div className={"hardware-pill" + (armed ? " armed" : "") + (capturedItem ? " captured" : "")}>
      <span className="hardware-dot" />
      <div>
        <strong>{capturedItem ? "图像已识别" : armed ? "背触已按住" : "等待背触"}</strong>
        <small>
          {capturedItem
            ? `${capturedItem.productName} · BLE HID`
            : armed
              ? "点击任意图片弹出 AI 卡片"
              : "MPR121 铜箔会发送 Space down"}
        </small>
      </div>
    </div>
  );
}

function AICard({ item, visible, onClose }) {
  const [shown, setShown] = React.useState("");
  const [view, setView] = React.useState("summary");
  const [slideDirection, setSlideDirection] = React.useState(null);
  const slideTimerRef = React.useRef(null);

  React.useEffect(() => {
    setShown("");
    setView("summary");
    setSlideDirection(null);
    if (!visible || !item) return undefined;

    let index = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setShown(item.summary.slice(0, index));
        if (index >= item.summary.length) {
          window.clearInterval(interval);
        }
      }, 20);
    }, 220);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [visible, item]);

  React.useEffect(() => () => window.clearTimeout(slideTimerRef.current), []);

  const markSlide = React.useCallback((direction) => {
    setSlideDirection(direction);
    window.clearTimeout(slideTimerRef.current);
    slideTimerRef.current = window.setTimeout(() => setSlideDirection(null), 360);
  }, []);

  const moveView = React.useCallback((offset) => {
    setView((current) => {
      const next = getViewByOffset(current, offset);
      if (next !== current) {
        markSlide(offset > 0 ? "right" : "left");
      }
      return next;
    });
  }, [markSlide]);

  const chooseView = React.useCallback((next) => {
    setView((current) => {
      if (next === current) return current;
      markSlide(getViewIndex(next) > getViewIndex(current) ? "right" : "left");
      return next;
    });
  }, [markSlide]);

  React.useEffect(() => {
    if (!visible) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveView(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveView(-1);
      }
    };

    const onBackSwipe = (event) => {
      const direction = event.detail?.direction;
      const delta = event.detail?.delta;
      if (direction === "right" || direction === "next" || delta > 0) {
        moveView(1);
      }
      if (direction === "left" || direction === "previous" || delta < 0) {
        moveView(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("backswipe", onBackSwipe);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("backswipe", onBackSwipe);
    };
  }, [visible, moveView]);

  if (!visible || !item) return null;

  const done = shown.length >= item.summary.length;
  const viewIndex = getViewIndex(view);
  const viewMeta = AI_CARD_VIEWS[viewIndex];

  return (
    <React.Fragment>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="ai-card-halo" />
      <section
        className={
          "ai-card view-" + view + (slideDirection ? " swipe-" + slideDirection : "")
        }
        aria-label="AI 视觉识别卡片"
      >
        <button className="ai-card-close" type="button" aria-label="关闭 AI 卡片" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="ai-card-label">
          <span className="pulse" />
          NOMI · {viewMeta.label}
        </div>

        <h2 className="ai-card-title">
          为你识别到这个 <span>{item.productType}</span>
        </h2>

        <div className="ai-card-switcher" role="tablist" aria-label="AI 卡片界面">
          {AI_CARD_VIEWS.map((entry) => (
            <button
              key={entry.id}
              className={"ai-view-tab" + (view === entry.id ? " active" : "")}
              type="button"
              role="tab"
              aria-selected={view === entry.id}
              aria-label={entry.aria}
              onClick={() => chooseView(entry.id)}
            >
              <span className="ai-view-dot" />
              <span>{entry.label}</span>
            </button>
          ))}
        </div>

        <div className="ai-track" style={{ "--view-index": viewIndex }}>
          <div className="ai-strip">
            <div className="ai-pane summary-pane">
              <div className="ai-card-stream">
                <p>
                  {shown}
                  {!done && <span className="cursor" />}
                </p>
              </div>
              <div className="ai-card-product">
                <div className="ai-card-product-img">
                  <ProductVisual item={item} />
                </div>
                <div className="ai-card-product-info">
                  <div className="brand">{item.productName}</div>
                  <div className="price">{item.price}</div>
                </div>
              </div>
            </div>

            <div className="ai-pane similar-pane">
              <div className="sim-panel">
                <div className="sim-head">
                  <div className="sim-title">相似线索已整理</div>
                  <div className="sim-sub">按主体、语境和收藏意图排序</div>
                </div>
                <div className="sim-list">
                  {item.similar.map((label, index) => (
                    <div className="sim-chip" key={label}>
                      <span>{index + 1}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ai-pane compare-pane">
              <div className="compare-panel">
                <div className="compare-head">
                  <div className="compare-title">比价路径已生成</div>
                  <div className="compare-sub">同款优先，找不到同款时切到相似替代</div>
                </div>
                <div className="compare-hero">
                  <div>
                    <span>参考价</span>
                    <strong>{item.price}</strong>
                  </div>
                  <small>{item.productName}</small>
                </div>
                <div className="compare-rows">
                  {["官方旗舰", "达人挂链", "二级相似"].map((source, index) => (
                    <div className="compare-row" key={source}>
                      <span className="compare-rank">0{index + 1}</span>
                      <div>
                        <strong>{source}</strong>
                        <small>{index === 0 ? item.productType : item.similar[index - 1] || item.kind}</small>
                      </div>
                      <em>{index === 0 ? "优先" : index === 1 ? "可比" : "备选"}</em>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-card-actions">
          <button className={"ai-action" + (view === "summary" ? " primary" : "")} type="button" onClick={() => chooseView("summary")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h2l1.6 11a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.7L20 9H6" />
              <circle cx="9" cy="21" r="1.3" />
              <circle cx="17" cy="21" r="1.3" />
            </svg>
            购买同款
          </button>
          <button className={"ai-action" + (view === "similar" ? " primary" : "")} type="button" onClick={() => chooseView("similar")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            找相似
          </button>
          <button className={"ai-action" + (view === "compare" ? " primary" : "")} type="button" onClick={() => chooseView("compare")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h13M3 12h9M3 18h13" />
              <path d="M19 4l3 3-3 3M21 14l-3 3 3 3" />
            </svg>
            比价
          </button>
        </div>
      </section>
    </React.Fragment>
  );
}

function App() {
  const [armed, setArmed] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [flash, setFlash] = React.useState(false);
  const armedRef = React.useRef(false);
  const flashTimerRef = React.useRef(null);

  const setHeld = React.useCallback((held) => {
    armedRef.current = held;
    setArmed(held);
  }, []);

  React.useEffect(() => {
    const isBackTouchKey = (event) => event.code === "Space" || event.key === " ";
    const onKeyDown = (event) => {
      if (!isBackTouchKey(event)) return;
      if (event.repeat) return;
      event.preventDefault();
      setHeld(true);
    };
    const onKeyUp = (event) => {
      if (!isBackTouchKey(event)) return;
      event.preventDefault();
      setHeld(false);
    };
    const onBackTouch = (event) => setHeld(Boolean(event.detail?.held));

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("backtouch", onBackTouch);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("backtouch", onBackTouch);
    };
  }, [setHeld]);

  React.useEffect(() => () => window.clearTimeout(flashTimerRef.current), []);

  const pickItem = React.useCallback((item) => {
    if (!armedRef.current) {
      setFlash(true);
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => setFlash(false), 900);
      return;
    }
    setSelected(item);
    setFlash(false);
  }, []);

  const replay = React.useCallback(() => {
    setSelected(null);
    setFlash(false);
    setHeld(false);
  }, [setHeld]);

  return (
    <div className={"app-root" + (armed ? " is-armed" : "") + (flash ? " needs-touch" : "")}>
      <XhsFeed armed={armed} selectedId={selected?.id} onPick={pickItem} />
      <div className={"light-frame" + (armed ? " in" : "")}>
        <div className="light-edge top" />
        <div className="light-edge bottom" />
        <div className="light-edge left" />
        <div className="light-edge right" />
      </div>
      <HardwareStatus armed={armed} capturedItem={selected} />
      <div className={"tap-note" + (flash ? " warn" : "")}>
        {flash ? "先按住背面铜箔，再点图片" : "BLE HID: Space hold = 背触按住"}
      </div>
      <AICard item={selected} visible={Boolean(selected)} onClose={() => setSelected(null)} />
      <button className="replay-btn in" type="button" aria-label="重播演示" onClick={replay}>
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M4 11 A7 7 0 1 1 11 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M4 5 L4 11 L10 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        重播演示
      </button>
    </div>
  );
}

export default App;
