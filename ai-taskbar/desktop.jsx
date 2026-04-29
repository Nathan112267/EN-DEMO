import React, { useState } from "react";

function StatusBar() {
  const [time] = useState("14:02");

  return (
    <div className="status-bar">
      <div className="sb-left">
        <span className="sb-carrier">no service</span>
        <span className="sb-time">{time}</span>
      </div>
      <div className="sb-cutout" />
      <div className="sb-right">
        <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
          <g fill="#fff">
            <rect x="0" y="10" width="3" height="6" rx="0.8" />
            <rect x="5" y="7" width="3" height="9" rx="0.8" />
            <rect x="10" y="4" width="3" height="12" rx="0.8" />
            <rect x="15" y="1" width="3" height="15" rx="0.8" />
          </g>
        </svg>
        <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
          <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 6 q9-7 18 0" />
            <path d="M5 9 q6-5 12 0" />
            <path d="M8 12 q3-3 6 0" />
          </g>
          <circle cx="11" cy="14" r="1.2" fill="#fff" />
        </svg>
        <div className="sb-battery">
          <div className="sb-batt-fill" />
          <div className="sb-batt-cap" />
        </div>
      </div>
    </div>
  );
}

const APPS = [
  { key: "gallery2", name: "AppGallery", tone: "#E8404E", glyph: "storeA" },
  { key: "themes", name: "Themes", tone: "#9C7BFF", glyph: "themes" },
  { key: "mydevice", name: "My Device", tone: "#3B82F6", glyph: "phoneOutline" },
  { key: "search", name: "Search", tone: "#3B82F6", glyph: "searchG" },
  { key: "gamectr", name: "GameCenter", tone: "#22C55E", glyph: "controller" },
  { key: "books", name: "Books", tone: "#EC4899", glyph: "books" },
  { key: "music", name: "Music", tone: "#EF4444", glyph: "note" },
  { key: "video", name: "Video", tone: "#F59E0B", glyph: "play" },
  { key: "health", name: "Health", tone: "#22C55E", glyph: "heart" },
  { key: "maps", name: "Maps", tone: "#06B6D4", glyph: "pin" },
  { key: "settings", name: "Settings", tone: "#94A3B8", glyph: "gear" },
  { key: "gallery", name: "Gallery", tone: "#FB923C", glyph: "frame" },
];

const DOCK = [
  { key: "phone", name: "Phone", tone: "#22C55E", glyph: "phone" },
  { key: "sms", name: "Messages", tone: "#3B82F6", glyph: "sms" },
  { key: "photos", name: "Photos", tone: "#FFFFFF", glyph: "photos" },
  { key: "cam", name: "Camera", tone: "#1F2937", glyph: "cam" },
];

function Glyph({ id, color }) {
  switch (id) {
    case "storeA":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M16 50 l10-30 l4-8 h4 l4 8 l10 30 h-8 l-2-7 h-12 l-2 7 z M26 36 h12 l-6-18 z"
            fill="#fff"
          />
        </svg>
      );
    case "themes":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <circle cx="22" cy="32" r="10" fill="#fff" opacity="0.6" />
          <circle cx="42" cy="32" r="10" fill="#fff" opacity="0.85" />
          <circle cx="32" cy="22" r="10" fill="#fff" opacity="0.95" />
        </svg>
      );
    case "phoneOutline":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <rect
            x="20"
            y="10"
            width="24"
            height="44"
            rx="5"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
          />
          <rect x="28" y="14" width="8" height="2" rx="1" fill="#fff" />
          <circle cx="32" cy="48" r="2" fill="#fff" />
        </svg>
      );
    case "searchG":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <circle cx="28" cy="28" r="14" fill="none" stroke="#fff" strokeWidth="4" />
          <path d="M40 40 l10 10" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="28" cy="28" r="6" fill="#fff" opacity="0.6" />
        </svg>
      );
    case "controller":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M14 22 q-6 0-6 8 v8 q0 8 8 8 q4 0 6-3 l4-5 h12 l4 5 q2 3 6 3 q8 0 8-8 v-8 q0-8-6-8 z"
            fill="#fff"
          />
          <circle cx="22" cy="32" r="2.5" fill={color} />
          <circle cx="42" cy="30" r="2" fill={color} />
          <circle cx="46" cy="34" r="2" fill={color} />
        </svg>
      );
    case "books":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M14 14 h16 q4 0 4 4 v32 q0-4-4-4 h-16 z M50 14 h-16 q-4 0-4 4 v32 q0-4 4-4 h16 z"
            fill="#fff"
          />
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M24 44 v-22 l20-5 v22"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse cx="22" cy="46" rx="5" ry="4" fill="#fff" />
          <ellipse cx="42" cy="42" rx="5" ry="4" fill="#fff" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path d="M22 18 L46 32 L22 46 Z" fill="#fff" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M32 50 C 16 40, 10 30, 14 22 C 18 14, 28 16, 32 24 C 36 16, 46 14, 50 22 C 54 30, 48 40, 32 50 Z"
            fill="#fff"
          />
          <path
            d="M14 32 h6 l3-5 l4 10 l3-7 l3 4 l9 0"
            fill="none"
            stroke={color}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M32 12 c-9 0-16 7-16 16 c0 11 16 24 16 24 s16-13 16-24 c0-9-7-16-16-16 z"
            fill="#fff"
          />
          <circle cx="32" cy="28" r="6" fill={color} />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <g fill="#fff">
            <circle cx="32" cy="32" r="9" />
            <path d="M32 8 l3 6 l-3 4 l-3-4 z M32 56 l-3-6 l3-4 l3 4 z M8 32 l6-3 l4 3 l-4 3 z M56 32 l-6 3 l-4-3 l4-3 z M15 15 l6 1 l1 6 l-6-1 z M49 49 l-6-1 l-1-6 l6 1 z M49 15 l-1 6 l-6 1 l1-6 z M15 49 l1-6 l6-1 l-1 6 z" />
          </g>
          <circle cx="32" cy="32" r="3" fill={color} />
        </svg>
      );
    case "frame":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <rect x="10" y="14" width="44" height="36" rx="4" fill="#fff" />
          <circle cx="22" cy="24" r="3" fill={color} />
          <path d="M10 44 l12-12 l9 9 l8-6 l15 12" fill={color} stroke={color} strokeWidth="0.5" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M14 12 q0-4 4-4 h6 q3 0 4 3 l4 10 q1 3-2 5 l-4 3 q5 9 14 14 l3-4 q2-3 5-2 l10 4 q3 1 3 4 v6 q0 4-4 4 q-26 0-43-43 z"
            fill="#fff"
          />
        </svg>
      );
    case "sms":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <path
            d="M10 22 q0-10 10-10 h24 q10 0 10 10 v14 q0 10-10 10 h-14 l-12 8 v-8 q-8-2-8-10 z"
            fill="#fff"
          />
          <circle cx="24" cy="29" r="2.4" fill={color} />
          <circle cx="32" cy="29" r="2.4" fill={color} />
          <circle cx="40" cy="29" r="2.4" fill={color} />
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <g transform="translate(32 32)">
            <circle r="14" fill="#FFD15D" transform="rotate(0)" />
            <circle
              r="14"
              fill="#22C55E"
              transform="rotate(60) translate(8 0)"
              opacity="0.85"
            />
            <circle
              r="14"
              fill="#3B82F6"
              transform="rotate(120) translate(8 0)"
              opacity="0.85"
            />
            <circle
              r="14"
              fill="#EC4899"
              transform="rotate(180) translate(8 0)"
              opacity="0.85"
            />
            <circle
              r="14"
              fill="#A78BFA"
              transform="rotate(240) translate(8 0)"
              opacity="0.85"
            />
            <circle
              r="14"
              fill="#EF4444"
              transform="rotate(300) translate(8 0)"
              opacity="0.85"
            />
          </g>
        </svg>
      );
    case "cam":
      return (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <rect x="6" y="18" width="52" height="32" rx="6" fill="#fff" />
          <rect x="22" y="12" width="20" height="8" rx="2" fill="#fff" />
          <circle cx="32" cy="34" r="9" fill={color} />
          <circle cx="32" cy="34" r="4" fill="#fff" />
        </svg>
      );
    default:
      return null;
  }
}

function AppTile({ app, size = 220 }) {
  const isLight = app.tone === "#FFFFFF";

  return (
    <div className="app">
      <div
        className="app-tile"
        style={{
          width: size,
          height: size,
          background: app.tone,
          boxShadow: isLight
            ? "0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.8)"
            : undefined,
        }}
      >
        <div className="app-tile-glow" />
        <div
          className="app-tile-glyph"
          style={{ color: isLight ? "#1F2937" : "#fff" }}
        >
          <Glyph id={app.glyph} color={app.tone} />
        </div>
      </div>
      <div className="app-name">{app.name}</div>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="desktop">
      <StatusBar />
      <div className="desk-page">
        <div className="hero">
          <div className="hero-time">14:02</div>
          <div className="hero-meta">
            <span>Mon, 20 May</span>
            <span className="hero-cloud">
              <svg viewBox="0 0 24 16" width="22" height="14" aria-hidden="true">
                <path
                  d="M6 12 q-4 0-4-3 q0-3 3-3 q0-3 4-3 q3 0 4 2 q1-1 3-1 q4 0 4 4 q3 0 3 2 q0 2-3 2 z"
                  fill="rgba(255,255,255,0.85)"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="search-pill">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            <path
              d="M16 16 l5 5"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Search or enter URL</span>
        </div>

        <div className="grid">
          {APPS.map((app) => (
            <AppTile key={app.key} app={app} />
          ))}
        </div>

        <div className="page-dots">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>

        <div className="dock">
          {DOCK.map((app) => (
            <AppTile key={app.key} app={app} size={220} />
          ))}
        </div>

        <div className="home-indicator" />
      </div>
    </div>
  );
}
