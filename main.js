const doc = document.documentElement;
const loader = document.querySelector(".loader");
const cursor = document.querySelector(".cursor");
const glow = document.querySelector(".mouse-glow");
const magneticItems = document.querySelectorAll(".magnetic");
const tiltCards = document.querySelectorAll(".tilt-card");
const testimonialTrack = document.querySelector(".testimonial-track");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

function splitText() {
  document.querySelectorAll(".split-text").forEach((element) => {
    const text = element.textContent.trim();
    element.setAttribute("aria-label", text);
    element.textContent = "";

    text.split(" ").forEach((word, wordIndex, words) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "word";
      wordWrap.style.display = "inline-block";

      [...word].forEach((char) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        wordWrap.appendChild(span);
      });

      element.appendChild(wordWrap);
      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(" "));
      }
    });
  });
}

function initCursor() {
  if (!cursor || !glow || window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const render = () => {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    glow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    requestAnimationFrame(render);
  };

  render();

  document.querySelectorAll("a, button, .tilt-card, .gallery-item").forEach((item) => {
    item.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    item.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
}

function initMagnetic() {
  magneticItems.forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

function initTilt() {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg) translateY(0)";
    });
  });
}

function duplicateTestimonials() {
  if (!testimonialTrack || testimonialTrack.dataset.ready === "true") return;
  testimonialTrack.innerHTML += testimonialTrack.innerHTML;
  testimonialTrack.dataset.ready = "true";
}

function initFallbackMotion() {
  loader?.classList.add("is-hidden");
  document.querySelectorAll(".scene").forEach((scene, index) => {
    scene.style.opacity = index === 0 ? "1" : "0";
  });
  document.querySelectorAll(".char").forEach((char) => {
    char.style.opacity = "1";
    char.style.transform = "translateY(0) rotateX(0deg)";
  });
  document.querySelectorAll(".blur-reveal, .scale-reveal").forEach((item) => {
    item.style.opacity = "1";
  });
}

function initLenis() {
  if (!window.Lenis) return null;

  const lenis = new Lenis({
    duration: 1.35,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initGsap() {
  if (!window.gsap || !window.ScrollTrigger) {
    initFallbackMotion();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  initLenis();

  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.85,
    delay: 0.35,
    ease: "power2.out",
    onComplete: () => loader?.classList.add("is-hidden"),
  });

  gsap.to(".hero-copy .char", {
    y: 0,
    rotateX: 0,
    opacity: 1,
    duration: 1.15,
    stagger: 0.018,
    ease: "power3.out",
    delay: 0.62,
  });

  const scenes = gsap.utils.toArray(".scene");

  const walk = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".cinema",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.15,
    },
  });

  scenes.forEach((scene, index) => {
    if (index === 0) return;
    walk.to(scenes[index - 1], { opacity: 0, scale: 1.18, filter: "blur(8px)", duration: 0.42 }, index - 0.2);
    walk.fromTo(scene, { opacity: 0, scale: 1.18, filter: "blur(12px)" }, { opacity: 1, scale: 1.02, filter: "blur(0px)", duration: 0.54 }, index - 0.48);
    walk.to(scene.querySelectorAll(".char"), {
      y: 0,
      rotateX: 0,
      opacity: 1,
      stagger: 0.012,
      duration: 0.42,
      ease: "power3.out",
    }, index - 0.36);
  });

  walk
    .to(".scene--outside > img", { scale: 1.34, yPercent: -2, duration: 0.95 }, 0)
    .to(".logo-glow", { scale: 1.34, yPercent: -26, opacity: 0, duration: 0.8 }, 0.08)
    .to(".street-car", { xPercent: 70, opacity: 0.2, duration: 0.8 }, 0)
    .to(".door--left", { rotateY: -64, xPercent: -34, duration: 0.8 }, 0.86)
    .to(".door--right", { rotateY: 64, xPercent: 34, duration: 0.8 }, 0.86)
    .to(".scene--entrance > img", { scale: 1.26, yPercent: -3, duration: 0.9 }, 0.86)
    .to(".scene--reception > img", { scale: 1.2, xPercent: -4, duration: 0.9 }, 1.65)
    .to(".scene--dining > img", { scale: 1.28, yPercent: -4, duration: 1.1 }, 2.55)
    .to(".scene--kitchen > img", { scale: 1.22, xPercent: 4, duration: 0.9 }, 3.55)
    .to(".scene--dish > img", { scale: 1.18, rotation: 1.2, duration: 1.1 }, 4.45);

  gsap.utils.toArray("[data-scene]").forEach((scene) => {
    gsap.to(scene.querySelectorAll(".glass-panel, .steam, .table-light, .fire-bloom, .dish-orbit span"), {
      y: (index) => (index % 2 ? -32 : 28),
      x: (index) => (index % 3 ? 18 : -16),
      scrollTrigger: {
        trigger: ".cinema",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.4,
      },
    });
  });

  gsap.to(".counter", {
    innerText: 118,
    snap: { innerText: 1 },
    duration: 1.2,
    scrollTrigger: {
      trigger: ".scene--reception",
      start: "top center",
      containerAnimation: walk,
      toggleActions: "play none none reverse",
    },
  });

  gsap.utils.toArray(".blur-reveal").forEach((item) => {
    gsap.fromTo(item, {
      y: 48,
      opacity: 0,
      filter: "blur(16px)",
    }, {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 78%",
      },
    });
  });

  gsap.utils.toArray(".scale-reveal").forEach((item) => {
    gsap.fromTo(item, {
      y: 50,
      scale: 0.92,
      opacity: 0,
      filter: "blur(14px)",
    }, {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.95,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
      },
    });
  });

  gsap.to(".section-media", {
    yPercent: 12,
    scale: 1.16,
    scrollTrigger: {
      trigger: ".menu-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".reserve-bg", {
    scale: 1.18,
    filter: "saturate(1.15) brightness(0.9)",
    scrollTrigger: {
      trigger: ".reserve-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

window.addEventListener("load", () => {
  splitText();
  duplicateTestimonials();
  initCursor();
  initMagnetic();
  initTilt();
  initGsap();
  doc.classList.add("is-ready");
});

window.addEventListener("error", () => {
  loader?.classList.add("is-hidden");
}, { once: true });
