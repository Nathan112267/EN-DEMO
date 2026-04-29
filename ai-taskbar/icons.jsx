import React from "react";

const Icon = {};

Icon.Messages = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
    <path
      d="M10 20 q0-8 8-8 h28 q8 0 8 8 v18 q0 8-8 8 h-18 l-10 8 v-8 h-0 q-8 0-8-8 z"
      fill="currentColor"
      opacity="0.18"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="22" cy="29" r="2.5" fill="currentColor" />
    <circle cx="32" cy="29" r="2.5" fill="currentColor" />
    <circle cx="42" cy="29" r="2.5" fill="currentColor" />
  </svg>
);

Icon.Calendar = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
    <rect
      x="8"
      y="12"
      width="48"
      height="44"
      rx="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path d="M8 24 h48" stroke="currentColor" strokeWidth="3" />
    <rect x="20" y="6" width="4" height="12" rx="2" fill="currentColor" />
    <rect x="40" y="6" width="4" height="12" rx="2" fill="currentColor" />
    <rect x="18" y="32" width="8" height="8" rx="1.5" fill="currentColor" />
    <rect x="38" y="32" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
    <rect x="28" y="42" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
  </svg>
);

export default Icon;
