import "./style.css";
import { gsap } from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scanStatusText = document.querySelector("#scanStatusText");
const scanLayerText = document.querySelector("#scanLayerText");
const summaryCard = document.querySelector("#summaryCard");
const summaryTitle = document.querySelector("#summaryTitle");
const summaryCopy = document.querySelector("#summaryCopy");
const summaryTags = [
  document.querySelector("#summaryTagOne"),
  document.querySelector("#summaryTagTwo"),
];
const orbCluster = document.querySelector("#orbCluster");
const scanTarget = document.querySelector("#scanTarget");
const scanSweep = document.querySelector("#scanSweep");
const metricCards = gsap.utils.toArray(".metric-card");
const particles = gsap.utils.toArray(".particle");

const metrics = new Map(
  metricCards.map((card) => [
    card.dataset.metric,
    {
      card,
      score: card.querySelector("[data-score]"),
      state: card.querySelector("[data-state]"),
      fill: card.querySelector("[data-fill]"),
    },
  ]),
);

const markerMap = {
  hydration: {
    point: ".point-forehead",
    focus: ".focus-forehead",
  },
  barrier: {
    point: ".point-left-cheek",
    focus: ".focus-left-cheek",
  },
  texture: {
    point: ".point-right-cheek",
    focus: ".focus-right-cheek",
  },
  redness: {
    point: ".point-chin",
    focus: ".focus-chin",
  },
};

const scanScenarios = [
  {
    tone: "balanced",
    statuses: [
      "AI calibrating hydration field",
      "Hydration map captured",
      "Barrier shell stabilizing",
      "Texture lattice refining",
      "Redness risk normalized",
      "Skin health summary ready",
    ],
    layers: [
      "Biofield alignment locked",
      "Hydration bands calibrated",
      "Barrier contour stabilized",
      "Dermal texture refined",
      "Capillary flare normalized",
      "Summary card compiled",
    ],
    summaryTitle: "肌肤状态稳定，屏障表现健康。",
    summaryCopy:
      "当前读数显示水润度充足，纹理平滑，泛红风险保持在较低区间，整体状态偏平衡。",
    tags: ["Calm spectrum", "Barrier trace"],
    metrics: {
      hydration: { value: 86, fill: 0.86, state: "well-balanced" },
      barrier: { value: 82, fill: 0.82, state: "stable" },
      texture: { value: 78, fill: 0.78, state: "refined" },
      redness: { value: 18, fill: 0.82, state: "low" },
    },
  },
  {
    tone: "recovering",
    statuses: [
      "AI aligning moisture reserves",
      "Hydration depth sampled",
      "Barrier repair sweep active",
      "Texture map smoothing",
      "Redness drift cooling",
      "Recovery-focused summary ready",
    ],
    layers: [
      "Reservoir scan engaged",
      "Hydration depth captured",
      "Barrier repair traces found",
      "Texture variance reduced",
      "Surface heat softened",
      "Recovery guidance compiled",
    ],
    summaryTitle: "肌肤略偏干，适合做一次补水修护。",
    summaryCopy:
      "屏障表现仍在健康区间，但水润度储备偏低，适合加强补水和夜间修护，帮助表面状态回稳。",
    tags: ["Moisture reserve", "Recovery focus"],
    metrics: {
      hydration: { value: 72, fill: 0.72, state: "recovering" },
      barrier: { value: 76, fill: 0.76, state: "steady" },
      texture: { value: 74, fill: 0.74, state: "smooth" },
      redness: { value: 24, fill: 0.76, state: "low-moderate" },
    },
  },
  {
    tone: "sensitive",
    statuses: [
      "AI tracing sensitive spectrum",
      "Hydration field holding",
      "Barrier edge monitored",
      "Texture mesh balanced",
      "Redness alert softened",
      "Sensitive-state summary ready",
    ],
    layers: [
      "Sensitivity sweep engaged",
      "Hydration reserve confirmed",
      "Barrier edge monitored",
      "Texture mesh settled",
      "Redness markers isolated",
      "Sensitive-state guidance compiled",
    ],
    summaryTitle: "轻微敏感信号出现，建议保持温和护理。",
    summaryCopy:
      "整体表现依旧可控，但泛红风险较前一轮更活跃，建议减少刺激性护肤步骤并维持屏障稳定。",
    tags: ["Gentle protocol", "Sensitive watch"],
    metrics: {
      hydration: { value: 79, fill: 0.79, state: "comfortable" },
      barrier: { value: 74, fill: 0.74, state: "guarded" },
      texture: { value: 76, fill: 0.76, state: "even" },
      redness: { value: 31, fill: 0.69, state: "elevated" },
    },
  },
];

function swapText(element, value) {
  if (!element) {
    return gsap.timeline();
  }

  return gsap
    .timeline()
    .to(element, {
      opacity: 0.34,
      y: 3,
      duration: prefersReducedMotion ? 0.08 : 0.16,
      ease: "power1.in",
    })
    .add(() => {
      element.textContent = value;
    })
    .to(element, {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion ? 0.1 : 0.24,
      ease: "power2.out",
    });
}

function setInitialState() {
  gsap.set(orbCluster, {
    autoAlpha: 0,
    y: 18,
    scale: 0.82,
  });
  gsap.set(scanTarget, {
    autoAlpha: 0,
    y: 18,
    scale: 0.96,
  });
  gsap.set(".skin-map", {
    autoAlpha: 0.56,
    scale: 0.97,
    transformOrigin: "50% 50%",
  });
  gsap.set(scanSweep, {
    yPercent: -118,
    opacity: 0,
  });
  gsap.set(".analysis-point", {
    autoAlpha: 0,
    scale: 0.2,
    transformOrigin: "50% 50%",
  });
  gsap.set(".scan-focus", {
    autoAlpha: 0,
    scale: 0.76,
    transformOrigin: "50% 50%",
  });
  gsap.set(metricCards, {
    autoAlpha: 0.22,
    y: 16,
    scale: 0.96,
  });
  gsap.set(summaryCard, {
    autoAlpha: 0,
    y: 18,
  });
  gsap.set(".summary-tag", {
    autoAlpha: 0,
    y: 8,
  });
  metricCards.forEach((card) => {
    const parts = metrics.get(card.dataset.metric);
    if (!parts) {
      return;
    }

    parts.score.textContent = "--";
    parts.state.textContent = "waiting";
    gsap.set(parts.fill, {
      scaleX: 0,
      transformOrigin: "left center",
    });
  });

  scanStatusText.textContent = "AI preparing skin health scan";
  scanLayerText.textContent = "Idle biofield alignment";
  summaryTitle.textContent = "等待本轮检测启动";
  summaryCopy.textContent = "AI 圆球将依次读取水润度、屏障状态、细腻度与泛红风险。";
  summaryTags[0].textContent = "Calm spectrum";
  summaryTags[1].textContent = "Barrier trace";
  summaryCard.dataset.tone = "balanced";
}

function applyScenarioSummary(scenario) {
  summaryCard.dataset.tone = scenario.tone;
  summaryTitle.textContent = scenario.summaryTitle;
  summaryCopy.textContent = scenario.summaryCopy;
  summaryTags.forEach((tag, index) => {
    tag.textContent = scenario.tags[index] || "";
  });
}

function highlightMarker(metricKey) {
  const marker = markerMap[metricKey];

  if (!marker) {
    return gsap.timeline();
  }

  return gsap
    .timeline()
    .fromTo(
      marker.focus,
      {
        autoAlpha: 0,
        scale: 0.76,
      },
      {
        autoAlpha: 1,
        scale: 1.16,
        duration: prefersReducedMotion ? 0.12 : 0.34,
        ease: "power2.out",
      },
      0,
    )
    .to(
      marker.focus,
      {
        scale: 1,
        autoAlpha: 0.5,
        duration: prefersReducedMotion ? 0.08 : 0.22,
        ease: "power1.out",
      },
      ">-0.04",
    )
    .fromTo(
      marker.point,
      {
        autoAlpha: 0.12,
        scale: 0.24,
      },
      {
        autoAlpha: 1,
        scale: 1.28,
        duration: prefersReducedMotion ? 0.14 : 0.36,
        ease: "power2.out",
      },
      0,
    )
    .to(
      marker.point,
      {
        scale: 1,
        autoAlpha: 0.86,
        duration: prefersReducedMotion ? 0.1 : 0.26,
        ease: "power1.out",
      },
      ">-0.06",
    );
}

function revealMetric(metricKey, metricData) {
  const metric = metrics.get(metricKey);

  if (!metric) {
    return gsap.timeline();
  }

  const counter = {
    value: 0,
  };

  return gsap
    .timeline()
    .to(
      metric.card,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0.14 : 0.34,
        ease: "power2.out",
      },
      0,
    )
    .to(
      metric.fill,
      {
        scaleX: metricData.fill,
        duration: prefersReducedMotion ? 0.18 : 0.56,
        ease: "expo.out",
      },
      0.03,
    )
    .to(
      counter,
      {
        value: metricData.value,
        duration: prefersReducedMotion ? 0.18 : 0.64,
        ease: "power1.out",
        snap: {
          value: 1,
        },
        onUpdate: () => {
          metric.score.textContent = String(Math.round(counter.value));
        },
      },
      0.04,
    )
    .add(() => {
      metric.state.textContent = metricData.state;
    }, 0.08)
    .to(
      metric.card,
      {
        boxShadow:
          "0 24px 56px oklch(0.03 0.008 250 / 0.58), 0 0 0 1px color-mix(in oklab, white 8%, transparent), 0 0 28px var(--metric-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        duration: prefersReducedMotion ? 0.08 : 0.18,
      },
      0,
    );
}

function sweepScan() {
  return gsap
    .timeline()
    .set(scanSweep, {
      yPercent: -118,
      opacity: prefersReducedMotion ? 0.36 : 0.78,
    })
    .to(scanSweep, {
      yPercent: 124,
      opacity: prefersReducedMotion ? 0.18 : 0.92,
      duration: prefersReducedMotion ? 0.26 : 0.82,
      ease: "none",
    });
}

function buildScenarioTimeline(scenario) {
  const tl = gsap.timeline();
  const order = ["hydration", "barrier", "texture", "redness"];

  tl.add(() => {
    setInitialState();
    applyScenarioSummary(scenario);
  })
    .to(
      orbCluster,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0.18 : 0.78,
        ease: "expo.out",
      },
      0,
    )
    .to(
      scanTarget,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0.2 : 0.72,
        ease: "power3.out",
      },
      0.08,
    )
    .to(
      ".skin-map",
      {
        autoAlpha: 1,
        scale: 1,
        duration: prefersReducedMotion ? 0.16 : 0.52,
        ease: "power2.out",
      },
      0.14,
    )
    .add(swapText(scanStatusText, scenario.statuses[0]), 0.04)
    .add(swapText(scanLayerText, scenario.layers[0]), 0.1)
    .to({}, { duration: prefersReducedMotion ? 0.06 : 0.18 });

  order.forEach((metricKey, index) => {
    tl.add(sweepScan(), ">")
      .add(swapText(scanStatusText, scenario.statuses[index + 1]), "<0.04")
      .add(swapText(scanLayerText, scenario.layers[index + 1]), "<0.08")
      .add(highlightMarker(metricKey), "<0.02")
      .add(revealMetric(metricKey, scenario.metrics[metricKey]), "<0.16")
      .to({}, { duration: prefersReducedMotion ? 0.06 : 0.14 });
  });

  tl.add(swapText(scanStatusText, scenario.statuses.at(-1)), ">-0.06")
    .add(swapText(scanLayerText, scenario.layers.at(-1)), "<0.04")
    .to(
      summaryCard,
      {
        autoAlpha: 1,
        y: 0,
        duration: prefersReducedMotion ? 0.16 : 0.46,
        ease: "power3.out",
      },
      "<0.08",
    )
    .to(
      ".summary-tag",
      {
        autoAlpha: 1,
        y: 0,
        duration: prefersReducedMotion ? 0.14 : 0.28,
        stagger: prefersReducedMotion ? 0.02 : 0.06,
        ease: "power2.out",
      },
      "<0.08",
    )
    .to({}, { duration: prefersReducedMotion ? 0.5 : 1.2 })
    .to(
      summaryCard,
      {
        autoAlpha: 0,
        y: 16,
        duration: prefersReducedMotion ? 0.12 : 0.28,
        ease: "power1.in",
      },
      0,
    )
    .to(
      metricCards,
      {
        autoAlpha: 0.32,
        y: 12,
        scale: 0.97,
        duration: prefersReducedMotion ? 0.12 : 0.28,
        ease: "power1.in",
      },
      "<",
    )
    .to(
      [".analysis-point", ".scan-focus"],
      {
        autoAlpha: 0,
        scale: 0.46,
        duration: prefersReducedMotion ? 0.12 : 0.24,
        ease: "power1.in",
      },
      "<",
    )
    .to(
      scanSweep,
      {
        opacity: 0,
        duration: prefersReducedMotion ? 0.08 : 0.2,
      },
      "<",
    )
    .to(
      [scanTarget, orbCluster],
      {
        autoAlpha: 0.18,
        duration: prefersReducedMotion ? 0.12 : 0.28,
        ease: "power1.in",
      },
      "<",
    );

  return tl;
}

function startAmbientMotion() {
  if (prefersReducedMotion) {
    return;
  }

  gsap.to(".ambient-halo-a", {
    scale: 1.06,
    opacity: 0.96,
    duration: 8.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".ambient-halo-b", {
    scale: 1.08,
    opacity: 0.92,
    duration: 9.4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(orbCluster, {
    yPercent: -2.2,
    scale: 1.028,
    duration: 4.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".orb-aura", {
    scale: 1.08,
    opacity: 0.98,
    duration: 5.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".orb-core", {
    scale: 1.04,
    duration: 4.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".orb-liquid", {
    rotation: 10,
    scale: 1.06,
    duration: 5.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    transformOrigin: "50% 50%",
  });

  gsap.to(".target-glow", {
    scale: 1.04,
    opacity: 0.95,
    duration: 4.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    transformOrigin: "50% 50%",
  });

  gsap.to(".scan-ring-outer", {
    rotation: 360,
    duration: 22,
    repeat: -1,
    ease: "none",
    transformOrigin: "50% 50%",
  });

  gsap.to(".scan-ring-middle", {
    rotation: -360,
    duration: 18,
    repeat: -1,
    ease: "none",
    transformOrigin: "50% 50%",
  });

  gsap.to(".scan-ring-inner", {
    rotation: 360,
    duration: 14,
    repeat: -1,
    ease: "none",
    transformOrigin: "50% 50%",
  });

  particles.forEach((particle, index) => {
    gsap.to(particle, {
      y: index % 2 === 0 ? -14 : 14,
      x: index % 3 === 0 ? 12 : -10,
      scale: 1.28,
      opacity: 0.88,
      duration: 2.8 + index * 0.18,
      delay: index * 0.07,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });
}

function run() {
  setInitialState();
  startAmbientMotion();

  const master = gsap.timeline({
    repeat: -1,
    repeatDelay: prefersReducedMotion ? 0.16 : 0.36,
  });

  scanScenarios.forEach((scenario, index) => {
    master.add(buildScenarioTimeline(scenario), index === 0 ? 0 : ">+=0.16");
  });
}

run();
