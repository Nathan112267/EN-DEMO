import "./style.css";
import { gsap } from "gsap";

const ui = {
  deviceStage: document.querySelector("#deviceStage"),
  clockTime: document.querySelector("#clockTime"),
  clockWrap: document.querySelector("#clockWrap"),
  agentLayer: document.querySelector("#agentLayer"),
  orbShell: document.querySelector("#orbShell"),
  orbAura: document.querySelector(".orb-aura"),
  orbRing: document.querySelector(".orb-ring"),
  orbCore: document.querySelector(".orb-core"),
  orbLiquid: document.querySelector(".orb-liquid"),
  orbHighlight: document.querySelector(".orb-highlight"),
  conversationBubble: document.querySelector("#conversationBubble"),
  conversationText: document.querySelector("#conversationText"),
  podcastTray: document.querySelector("#podcastTray"),
  podcastCard: document.querySelector("#podcastCard"),
  podcastProgressFill: document.querySelector("#podcastProgressFill"),
  podcastProgressGlint: document.querySelector("#podcastProgressGlint"),
  podcastArtCore: document.querySelector(".podcast-art-core"),
  podcastArtWaves: document.querySelectorAll(".podcast-art-wave"),
};

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEMO_CONFIG = {
  stageSize: 980,
  timings: {
    initialDelayMs: 3000,
    promptDelayMs: 440,
    cardDelayMs: 2000,
  },
};

let openingTimeline = null;
let ambientTimeline = null;
let podcastTimeline = null;
let openingTimeoutId = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function updateClock(force = false) {
  const nextValue = formatTime(new Date());
  if (!force && ui.clockTime.textContent === nextValue) {
    return;
  }
  ui.clockTime.textContent = nextValue;
}

function syncViewportMetrics() {
  const visualViewport = window.visualViewport;
  const width = visualViewport ? visualViewport.width : window.innerWidth;
  const height = visualViewport ? visualViewport.height : window.innerHeight;
  const offsetLeft = visualViewport ? visualViewport.offsetLeft : 0;
  const offsetTop = visualViewport ? visualViewport.offsetTop : 0;
  const shortestSide = Math.max(1, Math.min(width, height));
  const framePadding = shortestSide < 420 ? 14 : 22;
  const available = Math.max(1, shortestSide - framePadding * 2);
  const scale = clamp(available / DEMO_CONFIG.stageSize, 0.22, 1);
  const frameSize = DEMO_CONFIG.stageSize * scale;

  root.style.setProperty("--viewport-width", `${width.toFixed(2)}px`);
  root.style.setProperty("--viewport-height", `${height.toFixed(2)}px`);
  root.style.setProperty("--viewport-offset-x", `${offsetLeft.toFixed(2)}px`);
  root.style.setProperty("--viewport-offset-y", `${offsetTop.toFixed(2)}px`);
  root.style.setProperty("--stage-scale", scale.toFixed(4));
  root.style.setProperty("--stage-frame-size", `${frameSize.toFixed(2)}px`);
}

function setConversationState(nextState) {
  ui.agentLayer.dataset.conversationState = nextState;
  ui.podcastTray.setAttribute("aria-hidden", nextState === "options" ? "false" : "true");
}

function setConversationText(text) {
  ui.conversationText.textContent = text;
}

function setInitialVisualState() {
  if (openingTimeoutId) {
    window.clearTimeout(openingTimeoutId);
    openingTimeoutId = 0;
  }
  if (openingTimeline) {
    openingTimeline.kill();
  }
  if (ambientTimeline) {
    ambientTimeline.kill();
  }
  if (podcastTimeline) {
    podcastTimeline.kill();
  }

  gsap.set(ui.clockWrap, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transformOrigin: "50% 50%",
  });

  gsap.set(ui.agentLayer, {
    autoAlpha: 0,
  });

  ui.agentLayer.setAttribute("aria-hidden", "true");
  setConversationState("hidden");
  setConversationText("是否继续播放博客");

  gsap.set(ui.orbShell, {
    xPercent: -50,
    yPercent: -50,
    y: 0,
    scale: 0.8,
    rotationX: 0,
    rotationY: 0,
    transformOrigin: "50% 50%",
    transformPerspective: 900,
    force3D: true,
  });

  gsap.set(ui.orbAura, {
    scale: 0.86,
    opacity: 0.24,
    transformOrigin: "50% 50%",
  });

  gsap.set(ui.orbRing, {
    scale: 0.9,
    opacity: 0.18,
    transformOrigin: "50% 50%",
  });

  gsap.set([ui.orbCore, ui.orbLiquid], {
    scale: 0.86,
    filter: "blur(10px)",
    transformOrigin: "50% 50%",
  });

  gsap.set(ui.orbHighlight, {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 0.28,
    transformOrigin: "50% 50%",
  });

  gsap.set(ui.conversationBubble, {
    autoAlpha: 0,
    y: 22,
    scale: 0.985,
    filter: "blur(18px)",
  });

  gsap.set(ui.podcastTray, {
    autoAlpha: 0,
    y: 28,
    filter: "blur(18px)",
  });

  gsap.set(ui.podcastCard, {
    autoAlpha: 0,
    y: 26,
    scale: 0.82,
    filter: "blur(18px)",
    transformOrigin: "50% 0%",
  });

  gsap.set(ui.podcastProgressFill, {
    scaleX: 0,
    transformOrigin: "left center",
  });

  gsap.set(ui.podcastProgressGlint, {
    opacity: 0,
    xPercent: -140,
  });

  gsap.set(ui.podcastArtCore, {
    scale: 1,
    transformOrigin: "50% 50%",
  });

  gsap.set(ui.podcastArtWaves, {
    scale: 1,
    opacity: (_, target) => (target.classList.contains("podcast-art-wave-a") ? 0.7 : 0.42),
    transformOrigin: "50% 50%",
  });

  ui.deviceStage.dataset.phase = "aod";
}

function startAmbientMotion() {
  ambientTimeline = gsap.timeline({ repeat: -1, yoyo: true });
  ambientTimeline
    .to(
      ui.orbShell,
      {
        rotationX: 1.6,
        rotationY: -1.9,
        duration: prefersReducedMotion ? 1.8 : 3.2,
        ease: "sine.inOut",
      },
      0
    )
    .to(
      ui.orbAura,
      {
        scale: 1.08,
        opacity: 0.9,
        duration: prefersReducedMotion ? 1.6 : 2.8,
        ease: "sine.inOut",
      },
      0
    )
    .to(
      ui.orbRing,
      {
        scale: 1.03,
        opacity: 0.84,
        duration: prefersReducedMotion ? 1.6 : 2.8,
        ease: "sine.inOut",
      },
      0
    )
    .to(
      ui.orbHighlight,
      {
        x: prefersReducedMotion ? 3 : 14,
        y: prefersReducedMotion ? -2 : -10,
        rotate: 9,
        opacity: 0.52,
        duration: prefersReducedMotion ? 1.8 : 3.2,
        ease: "sine.inOut",
      },
      0
    )
    .to(ui.orbLiquid, {
      scale: 1.04,
      rotate: 8,
      duration: prefersReducedMotion ? 1.8 : 3.2,
      ease: "sine.inOut",
    }, 0)
    .to(ui.orbCore, {
      rotate: -4,
      duration: prefersReducedMotion ? 1.8 : 3.2,
      ease: "sine.inOut",
    }, 0);
}

function startPodcastMotion() {
  if (podcastTimeline) {
    podcastTimeline.kill();
  }

  podcastTimeline = gsap.timeline({ repeat: -1, defaults: { overwrite: true } });

  podcastTimeline
    .to(
      ui.podcastArtCore,
      {
        scale: prefersReducedMotion ? 1.02 : 1.08,
        duration: prefersReducedMotion ? 1.3 : 1.9,
        ease: "sine.inOut",
      },
      0
    )
    .to(
      ui.podcastArtWaves,
      {
        scale: (_, target) => (target.classList.contains("podcast-art-wave-a") ? 1.08 : 1.16),
        opacity: (_, target) => (target.classList.contains("podcast-art-wave-a") ? 0.92 : 0.56),
        duration: prefersReducedMotion ? 1.3 : 1.9,
        ease: "sine.inOut",
        stagger: 0.08,
      },
      0
    )
    .to(
      ui.podcastProgressGlint,
      {
        opacity: prefersReducedMotion ? 0.44 : 0.72,
        xPercent: 320,
        duration: prefersReducedMotion ? 1.4 : 1.8,
        ease: "none",
      },
      0
    );
}

function showConversationPrompt() {
  setConversationText("是否继续播放博客");
  setConversationState("prompt");
  gsap.killTweensOf(ui.conversationBubble);

  if (prefersReducedMotion) {
    gsap.set(ui.conversationBubble, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    });
    gsap.set(ui.orbShell, { y: -18 });
    return;
  }

  gsap.fromTo(
    ui.conversationBubble,
    { autoAlpha: 0, y: 18, scale: 0.985, filter: "blur(22px)" },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.72,
      ease: "expo.out",
      overwrite: true,
    }
  );

  gsap.to(ui.orbShell, {
    y: -18,
    duration: 0.56,
    ease: "power3.out",
    overwrite: true,
  });
}

function showPodcastCard() {
  setConversationState("options");
  gsap.killTweensOf([ui.conversationBubble, ui.podcastTray, ui.podcastCard, ui.podcastProgressFill, ui.podcastProgressGlint, ui.orbShell]);

  if (prefersReducedMotion) {
    gsap.set(ui.conversationBubble, {
      autoAlpha: 0,
      y: -10,
      scale: 1,
      filter: "blur(12px)",
    });
    setConversationText("");
    gsap.set(ui.podcastTray, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
    });
    gsap.set(ui.podcastCard, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    });
    gsap.set(ui.podcastProgressFill, { scaleX: 0.73 });
    gsap.set(ui.podcastProgressGlint, { opacity: 0.44, xPercent: 160 });
    gsap.set(ui.orbShell, { y: -94, scale: 0.94 });
    startPodcastMotion();
    return;
  }

  gsap.to(ui.orbShell, {
    y: -94,
    scale: 0.94,
    duration: 0.78,
    ease: "power3.out",
    overwrite: true,
  });

  gsap.to(ui.conversationBubble, {
    autoAlpha: 0,
    y: -10,
    filter: "blur(12px)",
    duration: 0.24,
    ease: "power2.out",
    overwrite: true,
    onComplete: () => {
      setConversationText("");
    },
  });

  gsap.fromTo(
    ui.podcastTray,
    { autoAlpha: 0, y: 28, filter: "blur(18px)" },
    {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.42,
      ease: "power3.out",
      overwrite: true,
    }
  );

  gsap.fromTo(
    ui.podcastCard,
    { autoAlpha: 0, y: 26, scale: 0.82, filter: "blur(18px)" },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.78,
      ease: "expo.out",
      overwrite: true,
      onComplete: () => {
        startPodcastMotion();
      },
    }
  );

  gsap.to(ui.podcastProgressFill, {
    scaleX: 0.73,
    duration: 1.1,
    delay: 0.24,
    ease: "power2.out",
    overwrite: true,
  });
}

function startOpeningSequence() {
  setInitialVisualState();

  openingTimeline = gsap.timeline({
    paused: true,
    defaults: { overwrite: true },
    onStart: () => {
      ui.deviceStage.dataset.phase = "waking";
      ui.agentLayer.setAttribute("aria-hidden", "false");
    },
  });

  openingTimeline
    .to(
      ui.clockWrap,
      {
        autoAlpha: 0,
        scale: prefersReducedMotion ? 1.01 : 1.04,
        y: -18,
        filter: prefersReducedMotion ? "blur(2px)" : "blur(22px)",
        duration: prefersReducedMotion ? 0.16 : 0.2,
        ease: "power2.out",
      },
      0
    )
    .to(
      ui.agentLayer,
      {
        autoAlpha: 1,
        duration: prefersReducedMotion ? 0.18 : 0.42,
        ease: "power1.out",
      },
      0.02
    )
    .to(
      ui.orbShell,
      {
        y: -6,
        scale: 1,
        duration: prefersReducedMotion ? 0.22 : 0.46,
        ease: "expo.out",
      },
      0.02
    )
    .to(
      ui.orbAura,
      {
        scale: 1,
        opacity: 0.84,
        duration: prefersReducedMotion ? 0.2 : 0.46,
        ease: "expo.out",
      },
      0.04
    )
    .to(
      ui.orbRing,
      {
        scale: 1,
        opacity: 0.78,
        duration: prefersReducedMotion ? 0.2 : 0.46,
        ease: "expo.out",
      },
      0.04
    )
    .to(
      [ui.orbCore, ui.orbLiquid],
      {
        scale: 1,
        filter: "blur(0px)",
        duration: prefersReducedMotion ? 0.18 : 0.42,
        ease: "expo.out",
        stagger: 0,
      },
      0.06
    )
    .to(
      ui.orbShell,
      {
        y: -8,
        duration: prefersReducedMotion ? 0.16 : 0.54,
        ease: "power3.out",
      },
      ">-0.06"
    )
    .call(() => {
      ui.deviceStage.dataset.phase = "agent";
      startAmbientMotion();
    })
    .call(showConversationPrompt, null, `+=${DEMO_CONFIG.timings.promptDelayMs / 1000}`)
    .call(showPodcastCard, null, `+=${DEMO_CONFIG.timings.cardDelayMs / 1000}`);

  openingTimeoutId = window.setTimeout(() => {
    openingTimeline.play(0);
  }, DEMO_CONFIG.timings.initialDelayMs);
}

function init() {
  syncViewportMetrics();
  updateClock(true);
  startOpeningSequence();

  window.setInterval(() => {
    updateClock();
  }, 1000);

  window.addEventListener("resize", syncViewportMetrics, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewportMetrics, { passive: true });
  }
}

init();
