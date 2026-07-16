const header = document.querySelector("[data-header]");
const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-category]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const trailer = document.querySelector("[data-trailer]");
const trailerKicker = document.querySelector("[data-trailer-kicker]");
const trailerTitle = document.querySelector("[data-trailer-title]");
const trailerCopy = document.querySelector("[data-trailer-copy]");
const loader = document.querySelector("[data-loader]");
const particleCanvas = document.querySelector("[data-particles]");
const revealSections = document.querySelectorAll(".hero, .section, .contact-section, .social-strip");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const contactEndpoint = window.location.protocol === "file:" ? "http://127.0.0.1:8000/contact" : "/contact";

document.documentElement.classList.add("js-reveal-ready");

const trailerScenes = {
  home: {
    kicker: "Welcome",
    title: "Home",
    copy: "Welcome to my home, the cinematic start of my portfolio."
  },
  about: {
    kicker: "Behind The Build",
    title: "About Me",
    copy: "Meet the developer shaping ideas into real digital systems."
  },
  education: {
    kicker: "Foundation",
    title: "Education",
    copy: "Academic strength, discipline, and the beginning of the journey."
  },
  projects: {
    kicker: "Showcase",
    title: "Projects",
    copy: "Real builds, cloud experiments, backend APIs, and full-stack work."
  },
  skills: {
    kicker: "Power Stack",
    title: "Skills",
    copy: "Frontend, backend, cloud, DevOps, automation, and deployment."
  },
  interests: {
    kicker: "Beyond Code",
    title: "Interests",
    copy: "The curiosity, hobbies, and learning energy behind the work."
  },
  contact: {
    kicker: "Final Scene",
    title: "Contact",
    copy: "Connect with me and let us build something useful."
  },
  "social-connect": {
    kicker: "Network Open",
    title: "Social Connect",
    copy: "Choose your platform and connect with me directly."
  }
};

let trailerTimer;
let trailerCleanupTimer;
let projectsRotated = false;

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 18);
};

window.addEventListener("scroll", updateHeader);
updateHeader();

const animateSection = (section, force = false) => {
  if (!force && section.dataset.animated === "true") {
    return;
  }

  section.dataset.animated = "true";
  if (force) {
    section.classList.remove("section-arrive");
    void section.offsetWidth;
  }
  section.classList.add("section-arrive");

  if (section.id === "projects" && !projectsRotated && !prefersReducedMotion) {
    projectsRotated = true;
    window.setTimeout(() => {
      section.classList.add("projects-rotate-once");
    }, 600);
  }
};

const prepareHeroTitle = () => {
  const title = document.querySelector(".hero-content h1");
  if (!title || title.dataset.prepared === "true") {
    return;
  }

  title.dataset.prepared = "true";
  title.innerHTML = '<span class="hero-name-word">Ekanath</span><span class="hero-name-word">Anehosur</span>';
};

const initLoader = () => {
  if (!loader) {
    return;
  }

  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, prefersReducedMotion ? 120 : 650);
};

const initParticles = () => {
  if (!particleCanvas || prefersReducedMotion) {
    return;
  }

  const ctx = particleCanvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let deviceScale = 1;
  let animationFrame = 0;
  let isVisible = !document.hidden;
  let lastDraw = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    deviceScale = Math.min(window.devicePixelRatio || 1, 1.4);
    particleCanvas.width = Math.floor(width * deviceScale);
    particleCanvas.height = Math.floor(height * deviceScale);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    const count = width < 700 ? 8 : 16;
    particles.length = 0;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.35,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.42 + 0.14
      });
    }
  };

  const draw = () => {
    if (!isVisible) {
      animationFrame = 0;
      return;
    }

    if (time - lastDraw < 40) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }
    lastDraw = time;

    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      ctx.beginPath();
      ctx.fillStyle = `rgba(198, 132, 255, ${particle.alpha})`;
      ctx.shadowColor = "rgba(168, 85, 247, 0.85)";
      ctx.shadowBlur = 4;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance < 118) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(125, 92, 255, ${0.13 * (1 - distance / 118)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  const syncVisibility = () => {
    isVisible = !document.hidden;
    if (isVisible && !animationFrame) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", syncVisibility);
  resize();
  animationFrame = requestAnimationFrame(draw);
};

prepareHeroTitle();
initLoader();
initParticles();

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealVisibleSections = () => {
    revealSections.forEach((section) => {
      if (section.dataset.animated === "true") {
        return;
      }

      const rect = section.getBoundingClientRect();
      const entersViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;
      if (entersViewport) {
        animateSection(section);
      }
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateSection(entry.target);
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -6% 0px" });

  revealSections.forEach((section) => sectionObserver.observe(section));
  window.addEventListener("scroll", revealVisibleSections, { passive: true });
  window.addEventListener("resize", revealVisibleSections);
  window.setTimeout(revealVisibleSections, 80);
} else {
  revealSections.forEach((section) => animateSection(section));
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selected = filter.dataset.filter;

    filters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");

    cards.forEach((card) => {
      const shouldShow = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const playTrailer = (targetId) => {
  const scene = trailerScenes[targetId];
  const section = document.getElementById(targetId);

  if (!scene || !section || !trailer) {
    return;
  }

  window.clearTimeout(trailerTimer);
  window.clearTimeout(trailerCleanupTimer);
  trailer.className = `trailer-transition trailer-${targetId}`;
  trailerKicker.textContent = scene.kicker;
  trailerTitle.textContent = scene.title;
  trailerCopy.textContent = scene.copy;
  trailer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-trailer-playing");

  void trailer.offsetWidth;
  trailer.classList.add("is-active");

  trailerTimer = window.setTimeout(() => {
    document.body.classList.remove("is-trailer-playing");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    animateSection(section, true);
    trailer.setAttribute("aria-hidden", "true");
  }, 2050);

  trailerCleanupTimer = window.setTimeout(() => {
    trailer.classList.remove("is-active");
  }, 2850);
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href").slice(1);

    if (!trailerScenes[targetId]) {
      return;
    }

    event.preventDefault();
    playTrailer(targetId);
  });
});

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');

        const formData = {
            name: form.name.value,
            email: form.email.value,
            message: form.message.value,
            website: form.website?.value || ""
        };

        try {
            formNote.textContent = "Sending securely...";
            form.classList.add("is-sending");
            form.classList.remove("is-sent");
            if (submitButton) {
                submitButton.disabled = true;
            }

            const response = await fetch(contactEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            formNote.textContent = result.message;

            if (response.ok) {
                form.classList.add("is-sent");
                form.reset();
            }

        } catch (err) {
            formNote.textContent = "Server unavailable. Please try again later.";
        } finally {
            form.classList.remove("is-sending");
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}
