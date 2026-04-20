import "./style.css";
import { gsap } from "gsap";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const userLine = document.querySelector(".caption-user");
const aiLine = document.querySelector(".caption-ai");
const transactionStack = document.querySelector(".transaction-stack");
const vendorSelector = document.querySelector(".vendor-selector");
const vendorCards = gsap.utils.toArray(".vendor-card");
const coffeeCard = document.querySelector(".coffee-card");
const paymentCard = document.querySelector(".payment-card");
const paymentFill = document.querySelector(".payment-fill");
const paymentGlint = document.querySelector(".payment-glint");
const paymentLabel = document.querySelector(".payment-label");
const coffeeStatusText = document.querySelector(".coffee-status-text");

const userUtterance = [
  { token: "帮我", energy: 0.82, duration: 0.34 },
  { token: "买杯", energy: 1.02, duration: 0.38 },
  { token: "咖啡", energy: 1.22, duration: 0.46 },
];

const aiUtterance = [
  { token: "好的", energy: 0.72, duration: 0.34 },
  { token: "正在", energy: 0.8, duration: 0.34 },
  { token: "帮你", energy: 0.88, duration: 0.36 },
  { token: "买常喝的", energy: 1.04, duration: 0.5 },
  { token: "拿铁", energy: 1.16, duration: 0.42 },
];

function createTokens(lineElement, beats, kind) {
  if (!lineElement) {
    return [];
  }

  lineElement.replaceChildren();

  return beats.map((beat) => {
    const token = document.createElement("span");
    token.className = `caption-token caption-token-${kind}`;
    token.textContent = beat.token;
    lineElement.append(token);
    return token;
  });
}

const userTokens = createTokens(userLine, userUtterance, "user");
const aiTokens = createTokens(aiLine, aiUtterance, "ai");

function setInitialState() {
  gsap.set(".voice-stage", { opacity: 1 });
  gsap.set([userLine, aiLine], { autoAlpha: 0, y: 10 });
  gsap.set([...userTokens, ...aiTokens], {
    opacity: 0,
    y: 14,
    scale: 0.94,
    filter: "blur(12px)",
    letterSpacing: "0.08em",
  });
  gsap.set(transactionStack, { autoAlpha: 0, y: 18 });
  gsap.set(vendorSelector, { autoAlpha: 0, y: 18 });
  gsap.set(vendorCards, {
    autoAlpha: 0,
    x: 0,
    y: 24,
    scale: 0.86,
    rotate: 0,
    filter: "blur(12px)",
  });
  gsap.set(coffeeCard, { autoAlpha: 0, y: 20, scale: 0.95, filter: "blur(14px)" });
  gsap.set(paymentCard, { autoAlpha: 0, y: 14 });
  gsap.set(paymentFill, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(paymentGlint, { xPercent: -140, opacity: 0 });
  coffeeCard?.classList.remove("is-paying", "is-paid");
  vendorCards.forEach((card) => {
    card.classList.remove("is-active", "is-selected");
  });

  if (coffeeStatusText) {
    coffeeStatusText.textContent = "正在下单";
  }

  if (paymentLabel) {
    paymentLabel.textContent = "支付处理中";
  }
}

function revealToken(token) {
  if (!token) {
    return;
  }

  gsap.fromTo(
    token,
    {
      opacity: 0,
      y: 14,
      scale: 0.94,
      filter: "blur(12px)",
      letterSpacing: "0.08em",
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      letterSpacing: "0.01em",
      duration: 0.56,
      ease: "power3.out",
      overwrite: "auto",
    },
  );
}

function hideLine(lineElement, tokens) {
  return gsap
    .timeline()
    .to(
      tokens,
      {
        opacity: 0,
        y: -8,
        scale: 0.98,
        filter: "blur(10px)",
        duration: 0.28,
        stagger: 0.026,
        ease: "power2.in",
      },
      0,
    )
    .to(
      lineElement,
      {
        autoAlpha: 0,
        y: -8,
        duration: 0.24,
        ease: "power2.in",
      },
      0,
    );
}

function setVendorClasses(activeIndex, selected = false) {
  vendorCards.forEach((card, index) => {
    card.classList.toggle("is-active", index === activeIndex);
    card.classList.toggle("is-selected", selected && index === activeIndex);
  });
}

function focusVendor(activeIndex, { selected = false, duration = 0.72 } = {}) {
  const compact = window.matchMedia("(max-width: 720px)").matches;
  const step = compact ? 112 : 148;

  return gsap
    .timeline()
    .add(() => {
      setVendorClasses(activeIndex, selected);
    })
    .to(
      vendorCards,
      {
        duration,
        ease: "power3.out",
        x: (_, target) => {
          const index = vendorCards.indexOf(target);
          return (index - activeIndex) * step;
        },
        y: (_, target) => {
          const index = vendorCards.indexOf(target);
          return index === activeIndex ? 0 : 14 + Math.abs(index - activeIndex) * 4;
        },
        scale: (_, target) => {
          const index = vendorCards.indexOf(target);
          if (index === activeIndex) {
            return selected ? 1.04 : 1;
          }

          return compact ? 0.88 : 0.9;
        },
        rotate: (_, target) => {
          const index = vendorCards.indexOf(target);
          if (index === activeIndex) {
            return 0;
          }

          return (index - activeIndex) * (compact ? 5 : 7);
        },
        opacity: (_, target) => {
          const index = vendorCards.indexOf(target);
          if (index === activeIndex) {
            return 1;
          }

          return compact ? 0.36 : 0.44;
        },
        filter: (_, target) => {
          const index = vendorCards.indexOf(target);
          return index === activeIndex ? "blur(0px)" : "blur(1.5px)";
        },
        zIndex: (_, target) => {
          const index = vendorCards.indexOf(target);
          return index === activeIndex ? 4 : 2 - Math.abs(index - activeIndex);
        },
      },
      0,
    );
}

function pulseAura(beat, tint = "user") {
  const bias = tint === "ai" ? 1.06 : 1;

  return gsap.timeline({ defaults: { ease: "sine.inOut" } })
    .to(
      ".aura-cluster",
      {
        scale: 1 + beat.energy * 0.03 * bias,
        duration: beat.duration * 0.9,
      },
      0,
    )
    .to(
      ".background-glow",
      {
        scale: 1 + beat.energy * 0.05 * bias,
        opacity: 0.56 + beat.energy * 0.09,
        duration: beat.duration * 0.96,
      },
      0,
    )
    .to(
      ".aura-one",
      {
        scale: 1.015 + beat.energy * 0.1,
        opacity: 0.44 + beat.energy * 0.11,
        duration: beat.duration * 0.94,
      },
      0.02,
    )
    .to(
      ".aura-two",
      {
        scale: 1 + beat.energy * 0.08,
        opacity: 0.36 + beat.energy * 0.1,
        duration: beat.duration * 1,
      },
      0.03,
    )
    .to(
      ".aura-three",
      {
        scale: 1 + beat.energy * 0.07,
        opacity: 0.24 + beat.energy * 0.09,
        duration: beat.duration * 1.04,
      },
      0.04,
    )
    .to(
      ".aura-four",
      {
        scale: 1 + beat.energy * 0.06,
        opacity: 0.18 + beat.energy * 0.08,
        duration: beat.duration * 1.08,
      },
      0.05,
    )
    .to(
      ".aura-core",
      {
        scale: 1.018 + beat.energy * 0.08,
        opacity: 0.9 + beat.energy * 0.05,
        duration: beat.duration * 0.88,
      },
      0,
    )
    .to(
      ".aura-cluster",
      {
        scale: 1,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
    )
    .to(
      ".background-glow",
      {
        scale: 1,
        opacity: 0.56,
        duration: beat.duration * 1.16,
        ease: "power1.out",
      },
      "<",
    )
    .to(
      ".aura-one, .aura-two, .aura-three, .aura-four, .aura-core",
      {
        scale: 1,
        duration: beat.duration * 1.12,
        ease: "power1.out",
        stagger: 0,
      },
      "<",
    )
    .to(
      ".aura-one",
      {
        opacity: 0.44,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
      "<",
    )
    .to(
      ".aura-two",
      {
        opacity: 0.36,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
      "<",
    )
    .to(
      ".aura-three",
      {
        opacity: 0.24,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
      "<",
    )
    .to(
      ".aura-four",
      {
        opacity: 0.18,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
      "<",
    )
    .to(
      ".aura-core",
      {
        opacity: 0.9,
        duration: beat.duration * 1.12,
        ease: "power1.out",
      },
      "<",
    );
}

function addPhrase(sequence, lineElement, tokens, beats, tint) {
  sequence.to(lineElement, {
    autoAlpha: 1,
    y: 0,
    duration: 0.32,
    ease: "power2.out",
  });

  beats.forEach((beat, index) => {
    sequence.add(() => revealToken(tokens[index]), index === 0 ? "-=0.18" : "-=0.14");
    sequence.add(pulseAura(beat, tint), "<");
  });
}

function swapText(element, value) {
  if (!element) {
    return gsap.timeline();
  }

  return gsap
    .timeline()
    .to(element, {
      opacity: 0.36,
      y: 2,
      duration: 0.14,
      ease: "power1.in",
    })
    .add(() => {
      element.textContent = value;
    })
    .to(element, {
      opacity: 1,
      y: 0,
      duration: 0.22,
      ease: "power2.out",
    });
}

function startAmbientMotion() {
  gsap.to(".aura-cluster", {
    scale: 1.024,
    yPercent: -1.2,
    duration: 6.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".background-glow", {
    scale: 1.08,
    opacity: 0.6,
    duration: 7.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aura-one", {
    scale: 1.025,
    opacity: 0.48,
    duration: 6.1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aura-two", {
    scale: 1.022,
    opacity: 0.4,
    duration: 6.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aura-three", {
    scale: 1.018,
    opacity: 0.27,
    duration: 7.1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aura-four", {
    scale: 1.024,
    opacity: 0.2,
    duration: 7.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".aura-core", {
    scale: 1.024,
    opacity: 0.93,
    duration: 6.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function showVendorSelection() {
  return gsap
    .timeline()
    .to(transactionStack, {
      autoAlpha: 1,
      y: 0,
      duration: 0.26,
      ease: "power2.out",
    })
    .to(
      vendorSelector,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        ease: "power2.out",
      },
      0,
    )
    .to(
      vendorCards,
      {
        autoAlpha: 1,
        y: 18,
        scale: 0.88,
        filter: "blur(4px)",
        duration: 0.5,
        stagger: {
          each: 0.05,
          from: "center",
        },
        ease: "power2.out",
      },
      0.04,
    )
    .add(focusVendor(0, { duration: 0.7 }), "-=0.14");
}

function runVendorSelection() {
  return gsap
    .timeline()
    .to({}, { duration: 0.26 })
    .add(focusVendor(1, { duration: 0.72 }))
    .to({}, { duration: 0.24 })
    .add(focusVendor(2, { selected: true, duration: 0.82 }))
    .to({}, { duration: 0.32 });
}

function hideVendorSelection() {
  return gsap
    .timeline()
    .to(
      vendorCards.filter((_, index) => index !== 2),
      {
        autoAlpha: 0,
        x: (_, target) => {
          const index = vendorCards.indexOf(target);
          return index < 2 ? -210 : 210;
        },
        y: 26,
        scale: 0.82,
        filter: "blur(8px)",
        duration: 0.34,
        ease: "power2.in",
      },
      0,
    )
    .to(
      vendorCards[2],
      {
        autoAlpha: 0,
        y: -18,
        scale: 0.98,
        filter: "blur(8px)",
        duration: 0.38,
        ease: "power2.inOut",
      },
      0.06,
    )
    .to(
      vendorSelector,
      {
        autoAlpha: 0,
        y: -16,
        duration: 0.34,
        ease: "power2.in",
      },
      0.12,
    );
}

function showOrderFlow() {
  return gsap
    .timeline()
    .to(transactionStack, {
      autoAlpha: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    })
    .to(
      coffeeCard,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.68,
        ease: "expo.out",
      },
      0,
    )
    .from(
      ".coffee-main > *, .coffee-status",
      {
        opacity: 0,
        y: 10,
        duration: 0.34,
        stagger: 0.06,
        ease: "power2.out",
      },
      0.12,
    )
    .to(
      paymentCard,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      0.22,
    );
}

function runPaymentFlow() {
  return gsap
    .timeline()
    .add(() => {
      coffeeCard?.classList.add("is-paying");
    })
    .to(paymentFill, {
      scaleX: 0.34,
      duration: 0.55,
      ease: "power2.out",
    })
    .to(
      paymentGlint,
      {
        opacity: 0.82,
        xPercent: 30,
        duration: 0.55,
        ease: "power2.out",
      },
      "<",
    )
    .add(swapText(coffeeStatusText, "等待支付确认"), "<")
    .add(swapText(paymentLabel, "支付确认中"), "<")
    .to({}, { duration: 0.12 })
    .to(paymentFill, {
      scaleX: 0.78,
      duration: 0.9,
      ease: "expo.inOut",
    })
    .to(
      paymentGlint,
      {
        xPercent: 132,
        duration: 0.9,
        ease: "power1.inOut",
      },
      "<",
    )
    .add(swapText(coffeeStatusText, "正在支付"), "<")
    .add(swapText(paymentLabel, "支付处理中"), "<")
    .to({}, { duration: 0.08 })
    .add(() => {
      coffeeCard?.classList.remove("is-paying");
      coffeeCard?.classList.add("is-paid");
    })
    .to(
      paymentFill,
      {
        scaleX: 1,
        duration: 0.7,
        ease: "expo.out",
      },
      "<",
    )
    .to(
      paymentGlint,
      {
        opacity: 0.94,
        xPercent: 190,
        duration: 0.7,
        ease: "power2.out",
      },
      "<",
    )
    .add(swapText(coffeeStatusText, "购买完成"), "<")
    .add(swapText(paymentLabel, "支付成功"), "<")
    .to(paymentGlint, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
    });
}

function buildSequence() {
  const sequence = gsap.timeline({ repeat: -1, repeatDelay: 1.65 });

  sequence.add(() => {
    setInitialState();
  });

  addPhrase(sequence, userLine, userTokens, userUtterance, "user");
  sequence.to({}, { duration: 0.5 });
  sequence.add(hideLine(userLine, userTokens));

  sequence.to({}, { duration: 0.28 });
  addPhrase(sequence, aiLine, aiTokens, aiUtterance, "ai");
  sequence.to({}, { duration: 0.26 });
  sequence.add(showVendorSelection());
  sequence.add(runVendorSelection(), "-=0.02");
  sequence.add(hideVendorSelection(), "-=0.02");
  sequence.add(showOrderFlow());
  sequence.add(runPaymentFlow(), "-=0.02");

  sequence.to(
    ".aura-cluster",
    {
      scale: 1,
      duration: 1.2,
      ease: "power2.out",
    },
    "+=0.12",
  );

  sequence.to(
    ".background-glow",
    {
      scale: 1,
      opacity: 0.56,
      duration: 1.2,
      ease: "power2.out",
    },
    "<",
  );

  return sequence;
}

if (prefersReducedMotion) {
  setInitialState();
  gsap.set(".voice-stage", { opacity: 1 });
  gsap.set(userLine, { autoAlpha: 0 });
  gsap.set(aiLine, { autoAlpha: 1, y: 0 });
  gsap.set(userTokens, { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" });
  gsap.set(aiTokens, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
  gsap.set(transactionStack, { autoAlpha: 1, y: 0 });
  gsap.set(vendorSelector, { autoAlpha: 0, y: 0 });
  gsap.set(coffeeCard, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)" });
  gsap.set(paymentCard, { autoAlpha: 1, y: 0 });
  gsap.set(paymentFill, { scaleX: 1, transformOrigin: "left center" });
  gsap.set(paymentGlint, { opacity: 0, xPercent: 190 });
  coffeeCard?.classList.add("is-paid");
  if (coffeeStatusText) {
    coffeeStatusText.textContent = "购买完成";
  }
  if (paymentLabel) {
    paymentLabel.textContent = "支付成功";
  }
} else {
  setInitialState();
  gsap.set(".voice-stage", { opacity: 1 });
  gsap.set(".aura-cluster", { transformOrigin: "center center" });
  gsap.set(".background-glow", { transformOrigin: "center center" });
  gsap.set(".aura-one, .aura-two, .aura-three, .aura-four, .aura-core", {
    transformOrigin: "center center",
  });

  gsap
    .timeline()
    .from(".background-glow", {
      scale: 0.88,
      opacity: 0,
      duration: 1.6,
      ease: "power3.out",
    })
    .from(
      ".aura-cluster",
      {
        scale: 0.78,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      },
      "-=1.18",
    )
    .from(
      ".caption-stack",
      {
        y: 20,
        opacity: 0,
        duration: 0.82,
        ease: "power3.out",
      },
      "-=0.95",
    );

  startAmbientMotion();
  buildSequence();
}
