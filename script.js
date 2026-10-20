/* =========================================================
   VP Sport & Fyzio – Prešov | script.js
   ========================================================= */

/* ---------------------------------------------------------
   💶 CENNÍK – UPRAV CENY TU (sumy v €)
   Každý kľúč zodpovedá atribútu data-price="..." v index.html
   --------------------------------------------------------- */
const PRICES = {
  // Vstupy & permanentky (Gym)
  single: 8,            // Jednorazový vstup
  monthlyClassic: 49,   // Mesačná permanentka KLASIK
  monthlyStudent: 39,   // Mesačná permanentka ŠTUDENT
  quarterly: 129,       // 3-mesačná permanentka
  credit: 70,           // Kreditová permanentka (od)

  // Fyzioterapia & tréningy
  diagnostics: 45,      // Vstupná fyzioterapeutická diagnostika
  therapy30: 30,        // Terapia 30 min
  therapy60: 50,        // Terapia 60 min
  personal: 30,         // Osobný tréning 60 min
  personal10: 270,      // Balík 10 osobných tréningov
};

/* Otváracie hodiny pre odznak „Otvorené / Zatvorené“ (24h formát) */
const OPENING_HOURS = {
  weekday: [6, 22], // Po – Pi
  weekend: [8, 20], // So – Ne
};

/* ---------------------------------------------------------
   📱 INTELIGENTNÉ OTVÁRANIE APLIKÁCIE (SMART DEEP LINKING)
   --------------------------------------------------------- */
function openGymApp(event) {
  if (event) event.preventDefault();

  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  const isAndroid = /android/i.test(ua);
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    // Android Intent priamo na aplikáciu VP Sport & Fyzio s fallbackom na Google Play
    window.location.href =
      "intent://#Intent;package=com.vpsportfyziopresov;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.vpsportfyziopresov;end";
  } else if (isIOS) {
    // iOS presmerovanie priamo na natívny App Store link aplikácie
    window.location.href =
      "https://apps.apple.com/sk/app/vp-sport-fyzio-pre%C5%A1ov/id6795578804";
  } else {
    // Desktop (PC / Mac): plynulý presun na sekciu s tlačidlami App Store a Google Play
    const appSection = document.getElementById("aplikacia");
    if (appSection) {
      appSection.scrollIntoView({ behavior: "smooth" });
    }
  }
}
window.openGymApp = openGymApp;

document.addEventListener("DOMContentLoaded", () => {
  const fmt = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 2 });

  /* ---------- Ceny ---------- */
  document.querySelectorAll("[data-price]").forEach((el) => {
    const v = PRICES[el.dataset.price];
    if (v !== undefined) el.textContent = fmt.format(v);
  });

  /* ---------- Navbar: scroll stav ---------- */
  const navbar = document.getElementById("navbar");
  const mobileBar = document.getElementById("mobileBar");
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 30);
    mobileBar.classList.toggle("show", y > window.innerHeight * 0.7);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobilné menu ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Zavrieť menu" : "Otvoriť menu");
    document.body.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
  window.addEventListener("resize", () => window.innerWidth > 1080 && setMenu(false));

  /* ---------- Aktívny odkaz v navigácii (scrollspy) ---------- */
  const navMap = new Map();
  navLinks.querySelectorAll(':scope > a[href^="#"]').forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) navMap.set(sec, a);
  });
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.querySelectorAll("a.active").forEach((x) => x.classList.remove("active"));
          navMap.get(en.target)?.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navMap.forEach((_, sec) => spy.observe(sec));

  /* ---------- Reveal animácie (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  // Jemné postupné oneskorenie v rámci mriežok
  document.querySelectorAll(".services, .pricing, .team, .reviews, .hero-stats, .steps, .pillars").forEach((grid) => {
    grid.querySelectorAll(":scope > .reveal, :scope > * > .reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
    });
  });
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  /* Kresliaca animácia línie tepu */
  const pulseObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("draw");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".pulse-divider").forEach((el) => pulseObs.observe(el));

  /* ---------- Prepínač cenníka (tabs) ---------- */
  const tabs = document.querySelector(".tabs");
  const tabBtns = tabs.querySelectorAll(".tab");
  const indicator = tabs.querySelector(".tab-indicator");
  const moveIndicator = (btn) => {
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  };
  const activateTab = (btn) => {
    tabBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(b.getAttribute("aria-controls"));
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    tabs.dataset.active = btn.dataset.tab;
    moveIndicator(btn);
  };
  tabBtns.forEach((b, i) => {
    b.addEventListener("click", () => activateTab(b));
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const next = tabBtns[(i + (e.key === "ArrowRight" ? 1 : -1) + tabBtns.length) % tabBtns.length];
        next.focus();
        activateTab(next);
      }
    });
  });
  activateTab(tabs.querySelector(".tab.active"));
  window.addEventListener("resize", () => moveIndicator(tabs.querySelector(".tab.active")));
  document.fonts?.ready.then(() => moveIndicator(tabs.querySelector(".tab.active")));

  /* ---------- QR kód v mockupe telefónu (dekoratívny vzor) ---------- */
  const qrPattern = [1,1,1,0,1, 1,0,1,1,0, 1,1,1,0,1, 0,1,0,1,1, 1,0,1,1,1];
  document.querySelectorAll(".qr-box i").forEach((cell, i) => qrPattern[i] && cell.classList.add("on"));

  /* ---------- Recenzie – bodky pre mobilný karusel ---------- */
  const reviews = document.getElementById("reviews");
  const dotsWrap = document.getElementById("reviewDots");
  const cards = [...reviews.children];
  cards.forEach((card, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Recenzia ${i + 1}`);
    d.addEventListener("click", () => reviews.scrollTo({ left: card.offsetLeft - reviews.offsetLeft - 20, behavior: "smooth" }));
    dotsWrap.appendChild(d);
  });
  const updateDots = () => {
    const center = reviews.scrollLeft + reviews.clientWidth / 2;
    let idx = 0, best = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft - reviews.offsetLeft + c.offsetWidth / 2 - center);
      if (dist < best) { best = dist; idx = i; }
    });
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === idx));
  };
  reviews.addEventListener("scroll", () => requestAnimationFrame(updateDots), { passive: true });
  updateDots();

  /* ---------- Odznak Otvorené / Zatvorené ---------- */
  const badge = document.getElementById("openBadge");
  const now = new Date();
  const day = now.getDay();
  const [from, to] = day === 0 || day === 6 ? OPENING_HOURS.weekend : OPENING_HOURS.weekday;
  const h = now.getHours() + now.getMinutes() / 60;
  const isOpen = h >= from && h < to;
  badge.textContent = isOpen ? "Teraz otvorené" : "Teraz zatvorené";
  badge.classList.add(isOpen ? "open" : "closed");

  /* ---------- Kontaktný formulár ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const nameInput = form.elements.namedItem("name"); // pozn.: form.name je atribút formulára
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^\+?[\d\s/-]{9,}$/;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    const check = (input, ok) => {
      input.closest(".field").classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    };
    check(nameInput, nameInput.value.trim().length >= 2);
    const c = form.contact.value.trim();
    check(form.contact, emailRe.test(c) || phoneRe.test(c));
    check(form.message, form.message.value.trim().length >= 5);

    if (!valid) {
      status.className = "form-status err";
      status.textContent = "Prosím, skontrolujte vyznačené polia.";
      return;
    }

    /* TODO: napojenie na backend / službu (napr. Formspree, EmailJS).
       Zatiaľ sa otvorí e-mailový klient s predvyplnenou správou. */
    const service = form.service.value;
    const subject = encodeURIComponent(`Správa z webu – ${service}`);
    const body = encodeURIComponent(`Meno: ${nameInput.value}\nKontakt: ${c}\nSlužba: ${service}\n\n${form.message.value}`);
    window.location.href = `mailto:info@vpsportfyzio.sk?subject=${subject}&body=${body}`;

    status.className = "form-status ok";
    status.textContent = "Ďakujeme! Vaša správa je pripravená na odoslanie.";
    form.reset();
  });

  form.querySelectorAll("input, textarea").forEach((el) =>
    el.addEventListener("input", () => el.closest(".field")?.classList.remove("invalid"))
  );
});
