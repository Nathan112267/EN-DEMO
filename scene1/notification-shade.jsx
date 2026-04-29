// Notification shade (portrait, premium)
const TASKS_INITIAL = [
  {
    id: 't1', icon: 'doc',
    title: '总结《Q2 产品评审会议纪要.pdf》',
    sub: '阅读 28 页 · 提取关键决策与待办',
    progress: 0.42, eta: '约 30 秒',
    accent: 'oklch(0.82 0.14 200)',
  },
  {
    id: 't2', icon: 'image',
    title: '生成图片 · 赛博朋克风格的猫',
    sub: '第 3 张 / 共 4 张 · Stable Diffusion XL',
    progress: 0.66, eta: '约 45 秒',
    accent: 'oklch(0.74 0.18 320)',
  },
  {
    id: 't3', icon: 'plane',
    title: '订 5 月 3 日 深圳 → 上海 机票',
    sub: '比对 12 个航班 · 优选直飞经济舱',
    progress: 0.28, eta: '约 1 分钟',
    accent: 'oklch(0.80 0.16 75)',
  },
  {
    id: 't4', icon: 'bowl',
    title: '预订今晚 19:00 · 4 人 · 海底捞',
    sub: '已找到 2 家分店 · 与你的位置匹配',
    progress: 0.78, eta: '约 15 秒',
    accent: 'oklch(0.78 0.16 25)',
  },
];

function TaskIcon({ kind, color }) {
  const c = color;
  if (kind === 'doc') return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path d="M14 8 h26 l12 12 v36 q0 4-4 4 h-34 q-4 0-4-4 v-44 q0-4 4-4 z" fill={c} fillOpacity="0.18" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M40 8 v12 h12" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M20 32 h22 M20 40 h22 M20 48 h14" stroke={c} strokeWidth="3" strokeLinecap="round"/>
    </svg>);
  if (kind === 'image') return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect x="8" y="10" width="48" height="44" rx="7" fill={c} fillOpacity="0.18" stroke={c} strokeWidth="3"/>
      <circle cx="22" cy="24" r="4" fill={c}/>
      <path d="M8 46 l14-14 l10 10 l8-6 l14 12" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
    </svg>);
  if (kind === 'plane') return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path d="M6 36 l52-18 l-6 12 l-22 6 l-8 16 l-6-2 l4-12 l-12-2 z" fill={c} fillOpacity="0.18" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
    </svg>);
  if (kind === 'bowl') return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path d="M6 30 h52 q0 16-14 22 h-24 q-14-6-14-22 z" fill={c} fillOpacity="0.18" stroke={c} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M22 22 q0-6 6-6 q3 0 3-4 M36 22 q0-6 6-6" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"/>
    </svg>);
  return null;
}

function ProgressBar({ value, color }) {
  return (
    <div className="prog">
      <div className="prog-track" />
      <div className="prog-fill" style={{ width: `${Math.round(value*100)}%`, background: `linear-gradient(90deg, oklch(from ${color} l c h / 0.4), ${color})` }}>
        <div className="prog-shine" />
      </div>
    </div>
  );
}

function TaskCard({ task, idx, visible }) {
  const delay = visible ? (idx * 70 + 80) : 0;
  return (
    <div className={`task ${visible ? 'in' : ''}`}
         style={{ transitionDelay: `${delay}ms`, '--accent': task.accent }}>
      <div className="task-row">
        <div className="task-ico"><TaskIcon kind={task.icon} color={task.accent} /></div>
        <div className="task-body">
          <div className="task-head">
            <div className="task-title">{task.title}</div>
            <div className="task-pct">{Math.round(task.progress*100)}%</div>
          </div>
          <div className="task-sub">{task.sub}</div>
          <div className="task-bar-wrap"><ProgressBar value={task.progress} color={task.accent} /></div>
          <div className="task-meta">
            <span className="task-status"><span className="task-status-dot"/>处理中</span>
            <span className="task-eta">{task.eta}</span>
          </div>
        </div>
        <button className="task-cancel" aria-label="取消">
          <svg viewBox="0 0 24 24" width="30" height="30"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function NotificationShade({ open, progress, tasks, onClose }) {
  const t = open ? 1 : progress;
  const translate = -100 + t * 100;
  const visible = t > 0.7;
  // Subtle scale + fade for premium feel during pull/close
  const scale = 0.985 + t * 0.015;
  const bgOpacity = Math.min(1, t * 1.15);

  return (
    <div className={`shade ${open ? 'open' : ''}`} style={{ transform: `translateY(${translate}%) scale(${scale})`, opacity: bgOpacity }}>
      <div className="shade-bg" />
      <div className="shade-content">
        <div className="shade-statusbar">
          <span>10:42</span>
          <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', color:'rgba(255,255,255,0.4)'}}>下拉以查看更多</span>
        </div>

        <div className="shade-top">
          <div className="shade-time-row">
            <div className="shade-time-big">10:42</div>
            <div className="shade-time-meta">
              <div className="l1">星期三 · 4 月 29 日</div>
              <div className="l2">深圳 · 多云 22°</div>
            </div>
          </div>
          <div className="shade-quick">
            <div className="qchip active"><span className="qchip-dot" style={{background:'oklch(0.85 0.14 200)'}}/>WiFi</div>
            <div className="qchip"><span className="qchip-dot" style={{background:'rgba(255,255,255,0.5)'}}/>蓝牙</div>
            <div className="qchip"><span className="qchip-dot" style={{background:'oklch(0.85 0.16 75)'}}/>勿扰</div>
          </div>
        </div>

        <div className="shade-section-head">
          <div className="ssh-left">
            <div className="ssh-spark">
              <svg viewBox="0 0 24 24" width="38" height="38">
                <defs><linearGradient id="ssg2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#9DE9FF"/><stop offset="1" stopColor="#C9A6FF"/>
                </linearGradient></defs>
                <path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z" fill="url(#ssg2)"/>
              </svg>
            </div>
            <div>
              <div className="ssh-title sm">AI 任务</div>
              <div className="ssh-sub">{tasks.length} 个任务进行中 · 实时</div>
            </div>
          </div>
          <div className="ssh-actions">
            <button className="ssh-btn">全部暂停</button>
          </div>
        </div>

        <div className="tasks">
          {tasks.map((tk, i) => <TaskCard key={tk.id} task={tk} idx={i} visible={visible}/>)}
        </div>

        <div className="shade-section-head" style={{marginTop:'36px'}}>
          <div className="ssh-title sm">通知</div>
          <div className="ssh-sub-small">2 条新通知</div>
        </div>
        <div className="notif-list">
          <div className={`notif ${visible?'in':''}`} style={{transitionDelay:`${visible?500:0}ms`}}>
            <div className="notif-ico" style={{background:'linear-gradient(135deg, oklch(0.45 0.10 250), oklch(0.30 0.06 250))'}}>
              <window.Icon.Messages />
            </div>
            <div className="notif-body">
              <div className="notif-head"><span className="notif-app">信息 · 妈妈</span><span className="notif-time">10:38</span></div>
              <div className="notif-title">记得晚饭前给奶奶打个电话</div>
              <div className="notif-text">点击回复</div>
            </div>
          </div>
          <div className={`notif ${visible?'in':''}`} style={{transitionDelay:`${visible?580:0}ms`}}>
            <div className="notif-ico" style={{background:'linear-gradient(135deg, oklch(0.50 0.14 25), oklch(0.32 0.08 25))'}}>
              <window.Icon.Calendar />
            </div>
            <div className="notif-body">
              <div className="notif-head"><span className="notif-app">日历 · 即将开始</span><span className="notif-time">10:30</span></div>
              <div className="notif-title">产品评审会议</div>
              <div className="notif-text">11:30 · 三楼 305 会议室</div>
            </div>
          </div>
        </div>

        <div className="shade-handle" onClick={onClose}>
          <div className="shade-handle-bar"/>
        </div>
      </div>
    </div>
  );
}

window.NotificationShade = NotificationShade;
window.TASKS_INITIAL = TASKS_INITIAL;
