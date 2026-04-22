/* =========================================================
   PORTFOLIO — Siddhi Mahajan  |  script.js
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   1. KEYBOARD LAYOUT
   Standard ~60-col grid. Each row is an array of:
   [label, widthUnit, subLabel?, extraClass?]
   --------------------------------------------------------- */
const KEYBOARD_ROWS = [
  [
    ["`","1","~"],["1","1","!"],["2","1","@"],["3","1","#"],["4","1","$"],
    ["5","1","%"],["6","1","^"],["7","1","&"],["8","1","*"],["9","1","("],
    ["0","1",")"],["-","1","_"],["=","1","+"],["BACKSPACE","2","","wide"]
  ],
  [
    ["TAB","1-5","","wide"],
    ["Q","1"],["W","1"],["E","1"],["R","1"],["T","1"],
    ["Y","1"],["U","1"],["I","1"],["O","1"],["P","1"],
    ["[","1","{"],["]","1","}"],["\\","1-5","|","wide"]
  ],
  [
    ["CAPS","1-75","","wide"],
    ["A","1"],["S","1"],["D","1"],["F","1"],["G","1"],
    ["H","1"],["J","1"],["K","1"],["L","1"],
    [";","1",":"],["'","1","\""],
    ["ENTER","2-25","","wide"]
  ],
  [
    ["SHIFT","2-25","","wide"],
    ["Z","1"],["X","1"],["C","1"],["V","1"],["B","1"],
    ["N","1"],["M","1"],
    [",","1","<"],[".","1",">"],["/","1","?"],
    ["SHIFT","2-75","","wide"]
  ],
  [
    ["CTRL","1-5","","wide"],
    ["FN","1-5","","wide"],
    ["ALT","1-5","","wide"],
    ["","6","","wide"],
    ["ALT","1-5","","wide"],
    ["MENU","1-5","","wide"],
    ["CTRL","1-5","","wide"]
  ]
];

const widthClass = w => ({
  "1":"k-1","1-5":"k-1-5","1-75":"k-1-75","2":"k-2",
  "2-25":"k-2-25","2-75":"k-2-75","6":"k-6","6-25":"k-6-25"
}[w] || "k-1");

function buildKeyboard(host) {
  host.innerHTML = "";
  KEYBOARD_ROWS.forEach((row, rIdx) => {
    row.forEach((k, cIdx) => {
      const [label, w, sub = "", extra = ""] = k;
      const el = document.createElement("div");
      el.className = `key ${widthClass(w)} ${extra}`.trim();
      el.dataset.row = rIdx;
      el.dataset.col = cIdx;
      el.dataset.key = label.trim().toUpperCase();
      el.innerHTML = sub
        ? `<span class="sub">${sub}</span><span class="label">${label || "&nbsp;"}</span>`
        : `<span class="label">${label || "&nbsp;"}</span>`;
      host.appendChild(el);
    });
  });
}

const keyboard = document.getElementById("keyboard");
buildKeyboard(keyboard);
gsap.set("#keyboard .key", { opacity: 0 });

function findKey(host, label) {
  return host.querySelector(`.key[data-key="${label.toUpperCase()}"]`);
}

/* ---------------------------------------------------------
   2. AUDIO + MUTE
   --------------------------------------------------------- */
let muted = false;

function playClick() {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 800; o.type = "square";
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    o.start(); o.stop(ctx.currentTime + 0.04);
  } catch(e) {}
}

document.getElementById("muteBtn").addEventListener("click", () => {
  muted = !muted;
  const btn = document.getElementById("muteBtn");
  btn.classList.toggle("muted", muted);
  btn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  btn.textContent = muted ? "♪̶" : "♪";
});

/* ---------------------------------------------------------
   3. HERO — assemble keyboard + type name
   --------------------------------------------------------- */
const allKeys = () => gsap.utils.toArray("#keyboard .key");

const skipBtn = document.getElementById("skipIntro");
skipBtn.classList.add("visible");
skipBtn.addEventListener("click", () => {
  gsap.globalTimeline.progress(1);
  skipBtn.style.display = "none";
});

let interactiveReady = false;

function heroAssemble() {
  gsap.set(allKeys(), { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to("#heroFooter",       { opacity: 1, duration: 0.5 })
    .to(".top-nav .brand",   { opacity: 1, duration: 0.4 }, "-=0.3")
    .to(".nav-slot",         { opacity: 1, duration: 0.5, stagger: 0.06 }, "-=0.3")
    .add(() => typeName(),   "+=0.1")
    .add(() => flyNavKeys(), "+=0.5");

  return tl;
}

function typeName() {
  const text = "SIDDHI  MAHAJAN";
  const out   = document.getElementById("heroOutput");
  const caret = out.querySelector(".caret");
  let i = 0;

  function tick() {
    if (i >= text.length) {
      gsap.to("#heroSubtitle", { opacity: 1, duration: 0.6, delay: 0.3, ease: "power2.out" });
      document.getElementById("skipIntro").style.display = "none";
      interactiveReady = true;
      gsap.to("#typeHint", { opacity: 1, duration: 0.6, delay: 0.8 });
      return;
    }
    const ch = text[i];
    out.insertBefore(document.createTextNode(ch), caret);

    if (ch !== " ") {
      const el = findKey(keyboard, ch);
      if (el) {
        el.classList.add("flash");
        playClick();
        gsap.to(el, { keyframes: [{ y: 4, duration: 0.08 }, { y: 0, duration: 0.14 }] });
        setTimeout(() => el.classList.remove("flash"), 240);
      }
    }
    i++;
    setTimeout(tick, ch === " " ? 260 : gsap.utils.random(150, 220));
  }
  tick();
}

window.addEventListener("keydown", e => {
  if (!interactiveReady) return;
  const out   = document.getElementById("heroOutput");
  const caret = out.querySelector(".caret");
  const hint  = document.getElementById("typeHint");
  if (hint && hint.style.opacity !== "0") gsap.to(hint, { opacity: 0, duration: 0.3 });

  if (e.key === "Escape") {
    [...out.childNodes].forEach(n => { if (n !== caret) n.remove(); });
    "SIDDHI MAHAJAN".split("").forEach(ch => out.insertBefore(document.createTextNode(ch), caret));
    return;
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    const nodes = [...out.childNodes].filter(n => n !== caret);
    if (nodes.length) nodes[nodes.length - 1].remove();
    playClick();
    return;
  }
  if (e.key.length === 1) {
    const ch = e.key.toUpperCase();
    out.insertBefore(document.createTextNode(ch), caret);
    playClick();
    const el = findKey(keyboard, ch);
    if (el) {
      el.classList.add("flash");
      gsap.to(el, { keyframes: [{ y: 4, duration: 0.08 }, { y: 0, duration: 0.14 }] });
      setTimeout(() => el.classList.remove("flash"), 240);
    }
  }
});

/* ---------------------------------------------------------
   Konami easter egg (← →)
   --------------------------------------------------------- */
const KONAMI = [37, 39];
let ki = 0;
window.addEventListener("keydown", e => {
  ki = e.keyCode === KONAMI[ki] ? ki + 1 : 0;
  if (ki === KONAMI.length) { ki = 0; triggerEasterEgg(); }
});

function triggerEasterEgg() {
  document.querySelectorAll(".skill-key").forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 400);
    }, i * 40);
  });

  const overlay = document.createElement("div");
  overlay.textContent = "⌨ CHEAT CODE UNLOCKED — hire me?";
  Object.assign(overlay.style, {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    background: "var(--ink)", color: "var(--lime-mist)",
    border: "2px solid var(--lime-mist)", borderRadius: "8px",
    padding: "24px 40px", fontFamily: "'JetBrains Mono',monospace",
    fontWeight: "700", fontSize: "clamp(14px,2vw,20px)",
    zIndex: "10000", textAlign: "center", whiteSpace: "nowrap"
  });
  document.body.appendChild(overlay);
  gsap.fromTo(overlay, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
  gsap.to(overlay, { opacity: 0, duration: 0.5, delay: 3, onComplete: () => overlay.remove() });
}

/* ---------------------------------------------------------
   4. ABOUT chips
   --------------------------------------------------------- */
const ABOUT_CHIPS = [
  "NMIMS · B.Tech '26",
  "CGPA 3.47 / 4.0",
  "Full-Stack Intern @ V2STech",
  "Best Paper · IRTM 2025",
  "AWS Certified",
  "Based in Mumbai"
];

function renderChips() {
  const meta = document.getElementById("aboutMeta");
  meta.innerHTML = "";
  ABOUT_CHIPS.forEach((t, i) => {
    const s = document.createElement("span");
    s.className = "chip"; s.textContent = t;
    meta.appendChild(s);
    gsap.fromTo(s, { opacity: 0, y: 8 }, { opacity: 0.9, y: 0, delay: 2.6 + i * 0.12, duration: 0.4, ease: "power2.out" });
  });
  const techLine = document.createElement("div");
  techLine.className = "about-tech-line mono";
  techLine.textContent = "C++ · Python · React · FastAPI · PyTorch · Docker · AWS";
  meta.appendChild(techLine);
  gsap.fromTo(techLine, { opacity: 0 }, { opacity: 0.7, delay: 2.6 + ABOUT_CHIPS.length * 0.12 + 0.2, duration: 0.5, ease: "power2.out" });
}

/* ---------------------------------------------------------
   5. FLY A/E/P/R/S/C keys into nav slots
   --------------------------------------------------------- */
function flyNavKeys() {
  const mapping = [
    { letter: "A", slot: document.querySelector('.nav-slot[data-letter="A"]') },
    { letter: "E", slot: document.querySelector('.nav-slot[data-letter="E"]') },
    { letter: "P", slot: document.querySelector('.nav-slot[data-letter="P"]') },
    { letter: "R", slot: document.querySelector('.nav-slot[data-letter="R"]') },
    { letter: "S", slot: document.querySelector('.nav-slot[data-letter="S"]') },
    { letter: "C", slot: document.querySelector('.nav-slot[data-letter="C"]') }
  ];

  mapping.forEach(({ letter, slot }, idx) => {
    const src = findKey(keyboard, letter);
    if (!src || !slot) return;

    const clone = src.cloneNode(true);
    clone.classList.remove("flash", "on");
    const s = src.getBoundingClientRect();
    const d = slot.getBoundingClientRect();

    Object.assign(clone.style, {
      position: "fixed",
      left: s.left + "px", top: s.top + "px",
      width: s.width + "px", height: s.height + "px",
      margin: 0, zIndex: 60,
      pointerEvents: "none",
      gridColumn: "auto",
      transformOrigin: "50% 50%"
    });
    document.body.appendChild(clone);

    const scale = d.width / s.width;
    const dx = (d.left + d.width / 2)  - (s.left + s.width / 2);
    const dy = (d.top  + d.height / 2) - (s.top  + s.height / 2);

    src.classList.add("on");
    setTimeout(() => src.classList.remove("on"), 320);

    gsap.to(clone, {
      x: dx, y: dy, scale,
      rotation: gsap.utils.random(-18, 18),
      duration: 1.15, delay: idx * 0.12,
      ease: "power2.inOut",
      onComplete: () => {
        Object.assign(clone.style, {
          position: "absolute",
          left: 0, top: 0,
          width: "100%", height: "100%",
          transform: "none"
        });
        slot.appendChild(clone);
        slot.classList.add("filled");
      }
    });
  });
}

/* ---------------------------------------------------------
   6. PROJECTS — folder grid
   --------------------------------------------------------- */
const PROJECTS = [
  {
    title: "Real-Time Cognitive Load Detection",
    year: "2025", ext: "PY", url: "",
    desc: "Multimodal deep-learning system (Temporal CNN-MLP fusion) using webcam gaze tracking + keystroke dynamics to classify cognitive load live.",
    stack: ["PyTorch", "Flask", "MediaPipe", "WebGazer.js", "SQLite"],
    outcome: "Multimodal classification on COLET & EMOSURV datasets"
  },
  {
    title: "Sustainable CNN Evaluation",
    year: "2024", ext: "ML", url: "https://github.com/SiddhiMahajan594/Carbon-Aware-ML-Training",
    desc: "Federated vs centralized CNNs on CIFAR-10 with attention + energy-efficient losses. Integrated CodeCarbon to measure CO₂.",
    stack: ["PyTorch", "NumPy", "scikit-learn", "Colab"],
    outcome: "Best Paper @ IRTM 2025 · Federated privacy-preserving learning"
  },
  {
    title: "Electron Orbital Cipher",
    year: "2024", ext: "AES", url: "https://github.com/SiddhiMahajan594/electron-cipher",
    desc: "Hybrid AES cipher using electron-orbital logic + SHA-256-derived dynamic S-boxes. Visualization tool for bit-level transforms.",
    stack: ["Python", "PyCryptodome", "Matplotlib"],
    outcome: "Targeting IEEE INDICON · SHA-256 dynamic S-box generation"
  },
  {
    title: "Turf Booking — Web + Android",
    year: "2023", ext: "APP", url: "https://github.com/SiddhiMahajan594/Turfapp",
    desc: "Cross-platform turf booking with auth, team management, and real-time Firebase data. Built matching REST APIs for both clients.",
    stack: ["JS", "PHP", "Java", "Firebase", "MySQL"],
    outcome: "Live on Android + Web · RESTful API across both platforms"
  },
  {
    title: "Live Cricket Dashboard",
    year: "2023", ext: "JSX", url: "",
    desc: "Real-time cricket score dashboard with React Hooks + API polling, error handling and fully responsive cross-device layout.",
    stack: ["React", "Tailwind", "RapidAPI"],
    outcome: "Real-time API polling · fully responsive cross-device"
  },
  {
    title: "ThouSpeak — Shakespeare NLP Chatbot",
    year: "2023", ext: "NLP", url: "https://github.com/SiddhiMahajan594/NLP-Mini-Project-Shakesphere-Chatbot",
    desc: "NLP chatbot generating Shakespearean dialogue via TF-IDF vectorization and contextual response modeling with speech synthesis.",
    stack: ["Python", "NLTK", "Flask"],
    outcome: "TF-IDF vectorization · Flask backend · speech synthesis"
  }
];

function renderFolders() {
  const grid = document.getElementById("folderGrid");
  grid.innerHTML = "";
  PROJECTS.forEach(p => {
    /* <div> not <a> — nested anchors are invalid HTML and cause layout issues */
    const card = document.createElement("div");
    card.className = "folder";
    card.dataset.stack = p.stack.join(",");
    card.innerHTML = `
      <a class="folder-gh-link" href="${p.url || "#"}" aria-label="View project"${p.url ? ' target="_blank" rel="noopener noreferrer"' : ''}>↗</a>
      <div class="icon" data-ext="${p.ext}"></div>
      <h3>${p.title}</h3>
      <div class="meta">· ${p.year}</div>
      <p>${p.desc}</p>
      <em class="folder-outcome">${p.outcome}</em>
      <div class="stack">${p.stack.map(s => `<span>${s}</span>`).join("")}</div>
    `;
    grid.appendChild(card);
  });
}

/* ---------------------------------------------------------
   7. SKILLS — keys rain in, then settle into grid
   --------------------------------------------------------- */
const SKILLS = [
  { label: "C++",        cat: "lang", tag: "Lang" },
  { label: "Python",     cat: "lang", tag: "Lang" },
  { label: "Java",       cat: "lang", tag: "Lang" },
  { label: "C",          cat: "lang", tag: "Lang" },
  { label: "SQL",        cat: "lang", tag: "Lang" },
  { label: "JS",         cat: "lang", tag: "Lang" },
  { label: "R",          cat: "lang", tag: "Lang" },
  { label: "HTML",       cat: "lang", tag: "Lang" },
  { label: "CSS",        cat: "lang", tag: "Lang" },
  { label: "React",      cat: "fw",   tag: "FW"   },
  { label: "Flask",      cat: "fw",   tag: "FW"   },
  { label: "FastAPI",    cat: "fw",   tag: "FW"   },
  { label: "Tailwind",   cat: "fw",   tag: "FW"   },
  { label: "PyTorch",    cat: "fw",   tag: "ML"   },
  { label: "TensorFlow", cat: "fw",   tag: "ML"   },
  { label: "scikit",     cat: "fw",   tag: "ML"   },
  { label: "Pandas",     cat: "fw",   tag: "ML"   },
  { label: "MySQL",      cat: "db",   tag: "DB"   },
  { label: "MongoDB",    cat: "db",   tag: "DB"   },
  { label: "Postgres",   cat: "db",   tag: "DB"   },
  { label: "Firebase",   cat: "db",   tag: "DB"   },
  { label: "Git",        cat: "tool", tag: "Tool" },
  { label: "Docker",     cat: "tool", tag: "Tool" },
  { label: "AWS",        cat: "tool", tag: "Tool" },
  { label: "Figma",      cat: "tool", tag: "Tool" },
  { label: "Power BI",   cat: "tool", tag: "Tool" },
  { label: "Tableau",    cat: "tool", tag: "Tool" },
  { label: "Linux",      cat: "tool", tag: "Tool" }
];

function renderSkills() {
  const grid = document.getElementById("skillGrid");
  grid.innerHTML = "";
  SKILLS.forEach(s => {
    const el = document.createElement("div");
    el.className = "skill-key";
    el.dataset.cat   = s.cat;
    el.dataset.label = s.label;
    el.style.cursor  = "pointer";
    el.innerHTML = `<span>${s.label}</span><small>${s.tag}</small>`;
    el.addEventListener("click", () => filterFolders(s.label, el));
    grid.appendChild(el);
  });
}

function filterFolders(label, activeEl) {
  const allSkillEls = document.querySelectorAll(".skill-key");
  const folders     = document.querySelectorAll(".folder");
  const isActive    = activeEl && activeEl.classList.contains("active");

  allSkillEls.forEach(el => el.classList.remove("active"));
  if (isActive) {
    folders.forEach(f => gsap.to(f, { opacity: 1, scale: 1, duration: 0.25 }));
    return;
  }
  if (activeEl) activeEl.classList.add("active");
  folders.forEach(f => {
    const stack = (f.dataset.stack || "").split(",");
    const match = stack.some(s =>
      s.toLowerCase().includes(label.toLowerCase()) ||
      label.toLowerCase().includes(s.toLowerCase())
    );
    gsap.to(f, { opacity: match ? 1 : 0.2, scale: match ? 1 : 0.97, duration: 0.25 });
  });
}

function runSkillsRain() {
  const skillEls = gsap.utils.toArray(".skill-key");
  gsap.to(skillEls, {
    opacity: 1, y: 0,
    duration: 0.6,
    ease: "back.out(1.5)",
    stagger: { amount: 1.0, from: "random" },
    delay: 0.35
  });
}

/* ---------------------------------------------------------
   8. SCROLL ANIMATIONS
   --------------------------------------------------------- */
function initScrollAnimations() {
  const kbdStage    = document.getElementById("keyboardStage");
  const heroEl      = document.getElementById("hero");
  const aboutEl     = document.getElementById("about");
  const topNav      = document.getElementById("topNav");

  /* Pin keyboard through hero */
  ScrollTrigger.create({
    trigger: heroEl,
    start: "top top", endTrigger: heroEl, end: "bottom bottom",
    pin: kbdStage, pinSpacing: false, anticipatePin: 1
  });

  /* Shrink + slide keyboard up as about enters */
  gsap.to(kbdStage, {
    scale: 0.65, y: "-10vh",
    ease: "none", transformOrigin: "50% 50%",
    scrollTrigger: { trigger: aboutEl, start: "top bottom", end: "top top", scrub: 0.6 }
  });

  /* Colorize keyboard on about entry */
  gsap.to("#keyboard", {
    boxShadow: "0 4px 0 var(--cream), 0 28px 60px -8px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,245,.2)",
    ease: "none",
    scrollTrigger: { trigger: aboutEl, start: "top bottom", end: "top 50%", scrub: true }
  });

  /* Nav dark-ctx: hero=dark → about=cream → experience=dark → projects=cream
                   → research=dark → skills=cream → contact=dark            */
  topNav.classList.add("dark-ctx");

  const navCtx = [
    { id: "about",      dark: false },
    { id: "experience", dark: true  },
    { id: "projects",   dark: false },
    { id: "research",   dark: true  },
    { id: "skills",     dark: false },
    { id: "contact",    dark: true  }
  ];
  navCtx.forEach(({ id, dark }) => {
    ScrollTrigger.create({
      trigger: document.getElementById(id),
      start: "top 60%",
      onEnter:     () => topNav.classList.toggle("dark-ctx", dark),
      onLeaveBack: () => topNav.classList.toggle("dark-ctx", !dark)
    });
  });

  /* Render chips when about arrives */
  ScrollTrigger.create({
    trigger: aboutEl, start: "top 60%", once: true,
    onEnter: renderChips
  });

  /* CRT entrance */
  const projectsEl = document.getElementById("projects");
  gsap.fromTo("#bigCrt",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: projectsEl, start: "top 70%", once: true } }
  );

  /* Folder cards fade in */
  gsap.fromTo(".folder",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out",
      scrollTrigger: { trigger: projectsEl, start: "top 55%", once: true } }
  );

  /* Experience cards */
  gsap.fromTo(".exp-card",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out",
      scrollTrigger: { trigger: document.getElementById("experience"), start: "top 60%", once: true } }
  );

  /* Research cards */
  gsap.fromTo(".research-card",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: "power2.out",
      scrollTrigger: { trigger: document.getElementById("research"), start: "top 60%", once: true } }
  );

  /* Skills rain */
  ScrollTrigger.create({
    trigger: document.getElementById("skills"),
    start: "top 70%", once: true,
    onEnter: runSkillsRain
  });

  /* Smooth scroll for nav slots */
  document.querySelectorAll(".nav-slot").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const tgt = document.querySelector(a.getAttribute("href"));
      if (tgt) window.scrollTo({ top: tgt.offsetTop - 20, behavior: "smooth" });
    });
  });

  setTimeout(() => ScrollTrigger.refresh(), 400);
}

/* ---------------------------------------------------------
   9. INIT — wait for fonts + DOM
   --------------------------------------------------------- */
window.addEventListener("load", () => {
  document.fonts.ready.then(() => {
    renderFolders();
    renderSkills();
    heroAssemble();
    initScrollAnimations();
  });
});
