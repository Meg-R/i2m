(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  const glow = document.querySelector(".cursor-glow");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton?.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    });
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!glow) return;
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    },
    { passive: true },
  );

  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  }

  const tabs = Array.from(document.querySelectorAll(".dimension-tab"));
  const stage = document.querySelector(".dimension-stage");
  const panels = Array.from(document.querySelectorAll(".dimension-panel"));

  const activateTab = (tab) => {
    const targetId = tab.getAttribute("aria-controls");
    const mode = tab.dataset.dimension;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.hidden = !active;
      requestAnimationFrame(() => panel.classList.toggle("is-active", active));
    });
    if (stage && mode) stage.dataset.mode = mode;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      next.focus();
      activateTab(next);
    });
  });

  if (stage && !reduceMotion) {
    stage.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;
        const bounds = stage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        stage.style.setProperty("--stage-x", `${x * 22}px`);
        stage.style.setProperty("--stage-y", `${y * 16}px`);
      },
      { passive: true },
    );
    stage.addEventListener("pointerleave", () => {
      stage.style.setProperty("--stage-x", "0px");
      stage.style.setProperty("--stage-y", "0px");
    });
  }

  document.querySelector("#year").textContent = String(new Date().getFullYear());

  const canvas = document.querySelector("#field");
  if (!canvas || reduceMotion) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let particles = [];
  const pointer = { x: -1000, y: -1000 };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.z = 0.25 + Math.random() * 0.75;
      this.vx = (Math.random() - 0.5) * 0.16;
      this.vy = -(0.04 + Math.random() * 0.12);
      this.radius = 0.5 + this.z * 1.25;
      this.tone = Math.random() > 0.78 ? "156,115,255" : "85,230,255";
    }

    update() {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150 && distance > 0) {
        const force = (150 - distance) / 150;
        this.vx += (dx / distance) * force * 0.012;
        this.vy += (dy / distance) * force * 0.012;
      }
      this.vx *= 0.992;
      this.vy *= 0.998;
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -15 || this.x < -20 || this.x > width + 20) this.reset();
    }

    draw() {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${this.tone},${0.2 + this.z * 0.55})`;
      context.fill();
    }
  }

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(110, Math.max(48, Math.floor(width / 12)));
    particles = Array.from({ length: count }, () => new Particle());
  };

  const drawConnections = () => {
    const maxDistance = Math.min(125, width / 8);
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < maxDistance) {
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(105,173,222,${(1 - distance / maxDistance) * 0.13})`;
          context.lineWidth = 0.5;
          context.stroke();
        }
      }
    }
  };

  const animate = () => {
    context.clearRect(0, 0, width, height);
    const gradient = context.createRadialGradient(
      pointer.x,
      pointer.y,
      0,
      pointer.x,
      pointer.y,
      320,
    );
    gradient.addColorStop(0, "rgba(85,230,255,0.06)");
    gradient.addColorStop(1, "rgba(85,230,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    drawConnections();
    animationFrame = requestAnimationFrame(animate);
  };

  const pointerMove = (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  };

  canvas.closest(".hero")?.addEventListener("pointermove", pointerMove, { passive: true });
  canvas.closest(".hero")?.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      animate();
    }
  });

  resize();
  animate();
})();
