/* 
Template Name: DONORDOC-B01 
Author: FRONTLENS LLC 
License: For personal/business use only. Redistribution, resale, or sublicensing is strictly prohibited without written consent. 
Copyright (c) 2025 FRONTLENS LLC. All rights reserved. 
*/

// Preloader: show secondary background with primary-colored spinner until all assets are loaded
(function initPreloader() {
  try {
    const body = document.body;
    if (!body) return;
    body.classList.add("loading");

    const preloader = document.createElement("div");
    preloader.id = "preloader";
    preloader.innerHTML =
      '<div class="preloader-spinner" role="status" aria-label="Loading"></div>';
    body.appendChild(preloader);

    window.addEventListener("load", () => {
      // Hide overlay after load; allow CSS transition to finish before removal
      preloader.classList.add("preloader-hidden");
      body.classList.remove("loading");
      setTimeout(() => preloader.remove(), 450);
    });
  } catch (err) {
    // Fail-safe: never block load if something goes wrong
    console.error("Preloader init error:", err);
  }
})();

// Throttle function to limit how often a function can fire
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

document.addEventListener("DOMContentLoaded", function () {
  initStickyHeader();
  initNavScroll();
  initMobileMenu();
  initPricingCards();
  initSwipers();
  initBackToTop();
  initCustomSelects();
  initBlogSection();
  initDropdownBehaviors();
  initNavLinkEffects();
  initLazyImages();
  initImageBlurUp();
  initFooterYear();
  initAppointmentMode();
  initAppointmentPickers();
  initSectionVisibility();
});

const DISABLED_APPOINTMENT_TIMES = [
  "12:00 AM",
  "12:15 AM",
  "12:30 AM",
  "12:45 AM",
  "1:00 AM",
  "1:15 AM",
  "1:30 AM",
  "1:45 AM",
  "2:00 AM",
  "2:15 AM",
  "2:30 AM",
  "2:45 AM",
  "3:00 AM",
  "3:15 AM",
  "3:30 AM",
  "3:45 AM",
  "4:00 AM",
  "4:15 AM",
  "4:30 AM",
  "4:45 AM",
  "5:00 AM",
  "5:15 AM",
  "5:30 AM",
  "5:45 AM",
  "6:00 AM",
  "6:15 AM",
  "6:30 AM",
  "6:45 AM",
  "7:00 AM",
  "7:15 AM",
  "7:30 AM",
  "7:45 AM",
  "8:00 AM",
  "8:15 AM",
  "8:30 AM",
  "8:45 AM",
];

function initAppointmentPickers() {
  try {
    if (typeof window.FLDatePicker !== "function") return;

    const dateEl = document.getElementById("appointment-date");
    const timeEl = document.getElementById("appointment-time");

    if (dateEl) {
      new window.FLDatePicker(dateEl, {
        type: "date",
        placeholder: "Select date",
        disablePast: true,
        closeOnSelect: false,
        closeOnSelectDelay: 400,
      });
    }
    if (timeEl) {
      new window.FLDatePicker(timeEl, {
        type: "time",
        timeStep: 15,
        placeholder: "Select time",
        closeOnSelect: false,
        closeOnSelectDelay: 400,
        disabledTimes: DISABLED_APPOINTMENT_TIMES,
      });
    }

    const appointmentForm = document.querySelector(
      "#appointment-cta .custom-form",
    );
    if (appointmentForm) {
      appointmentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectLabels = appointmentForm.querySelectorAll(
          ".custom-select .selected",
        );
        const department =
          selectLabels[0]?.textContent.trim() || "Not selected";
        const secondary = selectLabels[1]?.textContent.trim() || "Not selected";

        const name =
          appointmentForm
            .querySelector('input[placeholder="Your Name"]')
            ?.value.trim() || "";
        const email =
          appointmentForm
            .querySelector('input[placeholder="Your Email"]')
            ?.value.trim() || "";

        const dateValue =
          document
            .querySelector("#appointment-date .fl-picker-input")
            ?.value.trim() || "";
        const timeValue =
          document
            .querySelector("#appointment-time .fl-picker-input")
            ?.value.trim() || "";

        const payload = {
          department,
          secondary,
          name,
          email,
          date: dateValue,
          time: timeValue,
        };

        alert(JSON.stringify(payload, null, 2));
      });
    }
  } catch (err) {
    console.error("initAppointmentPickers error:", err);
  }
}

function initFooterYear() {
  try {
    const yearEl = document.getElementById("footer-year");
    if (!yearEl) return;

    const currentYear = new Date().getFullYear();
    yearEl.textContent = currentYear;
    yearEl.setAttribute("datetime", String(currentYear));
  } catch (err) {
    console.error("Footer year init error:", err);
  }
}

function initSectionVisibility() {
  try {
    fetch("assets/config/sections.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load sections.json");
        }
        return response.json();
      })
      .then(function (config) {
        if (!config || typeof config !== "object") {
          return;
        }

        Object.keys(config).forEach(function (key) {
          var enabled = !!config[key];
          var section = document.querySelector(
            '[data-section-key="' + key + '"]',
          );

          if (!section) {
            return;
          }

          section.hidden = !enabled;
        });
      })
      .catch(function (error) {
        console.error("Error applying section visibility config:", error);
      });
  } catch (err) {
    console.error("initSectionVisibility error:", err);
  }
}

function initAppointmentMode() {
  try {
    const section = document.getElementById("appointment-cta");
    if (!section) return;

    const internalEl = section.querySelector(
      '[data-appointment-mode="internal"]',
    );
    const externalEl = section.querySelector(
      '[data-appointment-mode="external"]',
    );

    // If containers are missing, do nothing but log for developers
    if (!internalEl && !externalEl) {
      console.warn(
        "initAppointmentMode: no appointment mode containers found.",
      );
      return;
    }

    fetch("assets/config/appointment.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load appointment.json");
        }
        return response.json();
      })
      .then(function (config) {
        const mode =
          config && typeof config.mode === "string"
            ? config.mode.toLowerCase()
            : "internal";

        if (mode === "external") {
          // Prefer external widget: remove/hide internal form
          if (internalEl) {
            internalEl.remove();
          }
          if (externalEl) {
            externalEl.style.display = "";
          }
        } else {
          // Default to internal mode
          if (externalEl) {
            externalEl.remove();
          }
          if (internalEl) {
            internalEl.style.display = "";
          }
        }
      })
      .catch(function (error) {
        console.error("Error applying appointment mode config:", error);
      });
  } catch (err) {
    console.error("initAppointmentMode error:", err);
  }
}

function initStickyHeader() {
  const header = document.getElementById("header");
  const hero = document.querySelector(".section-health");

  if (!header || !hero) return;

  const updateHeroPadding = () => {
    hero.style.paddingTop = `${header.offsetHeight}px`;
  };

  window.addEventListener("load", updateHeroPadding);

  // Use throttled version for scroll performance
  const throttledUpdate = throttle(updateHeroPadding, 100);

  const obs = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry) return;

      header.classList.toggle("sticky", !entry.isIntersecting);
      if (!entry.isIntersecting) {
        header.style.background = "#d7f0db";
        header.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
      } else {
        header.style.background = "transparent";
        header.style.boxShadow = "none";
      }
      if (!entry.isIntersecting) throttledUpdate();
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "-100px",
    },
  );

  obs.observe(hero);
}

function initNavScroll() {
  const sectionToNavHash = {
    "health-cta": "#health-cta",
    featured: "#health-cta",
    "about-cta": "#about-cta",
    "services-cta": "#services-cta",
    "pricing-cta": "#services-cta",
    "doctors-cta": "#services-cta",
    "find-doctor-cta": "#services-cta",
    "testimonials-cta": "#testimonials-cta",
    "morehelp-cta": "#morehelp-cta",
    "appointment-cta": "#appointment-cta",
    "contact-cta": "#appointment-cta",
  };

  const sections = Array.from(document.querySelectorAll("section[id]")).filter(
    (s) => Object.prototype.hasOwnProperty.call(sectionToNavHash, s.id),
  );

  const navLinks = document.querySelectorAll(
    '#navbarSupportedContent .navbar-nav a[href^="#"]:not([href="#"]), #offcanvasNavbar .nav.navbar-nav.flex-column a[href^="#"]:not([href="#"])',
  );

  const linkMap = {};
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!linkMap[href]) linkMap[href] = [];
    linkMap[href].push(link);
  });

  const getScrollAnchorPx = () => {
    const header = document.getElementById("header");
    const h = header ? header.offsetHeight : 0;
    return h + 24;
  };

  const updateActiveNav = () => {
    const anchorPx = getScrollAnchorPx();
    const docEl = document.documentElement;
    const scrollBottom = window.innerHeight + window.scrollY;

    let activeHash = "#health-cta";

    const atBottom = scrollBottom >= docEl.scrollHeight - 2;
    if (atBottom) {
      activeHash = "#appointment-cta";
    } else {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        if (rect.top <= anchorPx) {
          activeHash = sectionToNavHash[section.id] || activeHash;
        }
      }
    }

    if (window.innerWidth > 768) {
      history.replaceState(null, null, activeHash);
    }

    navLinks.forEach((l) => l.classList.remove("active"));
    const group = linkMap[activeHash];
    if (group) {
      group.forEach((l) => l.classList.add("active"));
    }
  };

  const throttledUpdate = throttle(updateActiveNav, 50);
  window.addEventListener("scroll", throttledUpdate, { passive: true });
  window.addEventListener("resize", throttledUpdate);
  updateActiveNav();
}

function initMobileMenu() {
  const toggler = document.querySelector(".navbar-toggler");
  const offcanvasElement = document.getElementById("offcanvasNavbar");
  const offcanvasInstance = offcanvasElement
    ? bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement)
    : null;

  if (toggler) {
    toggler.addEventListener("click", () => {
      toggler.classList.toggle("opened");
    });
  }

  const offcanvasLinks = document.querySelectorAll(
    '.offcanvas-body li a[href^="#"]:not([href="#"])',
  );
  offcanvasLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }

      if (toggler) {
        toggler.classList.remove("opened");
      }
    });
  });

  if (offcanvasElement) {
    offcanvasElement.addEventListener("hidden.bs.offcanvas", () => {
      if (toggler) {
        toggler.classList.remove("opened");
      }
    });
  }
}

function initSwipers() {
  // Header swiper - optimized with passive events for better scroll performance
  const headerSwiper = new Swiper(".header-swiper", {
    slidesPerView: 3,
    spaceBetween: 0,
    loop: true,
    speed: 5000,
    autoplay: {
      delay: 0,
      pauseOnMouseEnter: false,
      disableOnInteraction: false,
    },
    grabCursor: true,
    allowTouchMove: true,
    passiveListeners: true, // Improve scroll performance
    on: {
      init: scaleMiddleSlide,
      slideChangeTransitionEnd: throttle(scaleMiddleSlide, 100), // Throttle expensive operation
    },
  });

  // Featured swiper
  new Swiper(".featured-swiper", {
    slidesPerView: 4,
    spaceBetween: 0,
    loop: true,
    speed: 3000,
    autoplay: {
      delay: 0,
      pauseOnMouseEnter: false,
      disableOnInteraction: false,
    },
    grabCursor: true,
    allowTouchMove: true,
    passiveListeners: true,
    breakpoints: {
      500: { slidesPerView: 2 },
      991: { slidesPerView: 3 },
      1199: { slidesPerView: 4 },
    },
  });

  // Doctors swiper - disable autoplay by default to improve performance
  const doctorsSwiper = new Swiper(".doctors-swiper", {
    slidesPerView: 2,
    spaceBetween: 40,
    loop: true,
    grabCursor: true,
    allowTouchMove: true,
    speed: 800, // Reduced from 3000 for better UX
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      enabled: false, // Disabled by default to prevent scroll jank
    },
    navigation: {
      nextEl: ".doctors-next",
      prevEl: ".doctors-prev",
    },
    passiveListeners: true,
    breakpoints: {
      0: { slidesPerView: 1 },
      800: { slidesPerView: 2 },
      992: { slidesPerView: 2 },
    },
  });

  // Pricing swiper - disable autoplay by default
  const pricingSwiper = new Swiper(".pricing-swiper", {
    slidesPerView: 3,
    loop: true,
    grabCursor: true,
    allowTouchMove: true,
    speed: 800, // Reduced from 3000
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      enabled: false, // Disabled by default
    },
    navigation: {
      nextEl: ".pricing-next",
      prevEl: ".pricing-prev",
    },
    passiveListeners: true,
    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
      1200: { slidesPerView: 3 },
      1400: { slidesPerView: 3 },
    },
  });

  // Testimonials swiper
  const testimonialsSwiper = new Swiper(".testimonial-swiper", {
    slidesPerView: 1,
    loop: true,
    grabCursor: true,
    allowTouchMove: true,
    speed: 800, // Reduced from 3000
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      enabled: false, // Disabled by default
    },
    pagination: {
      el: ".testimonial-swiper .swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".testimonials-next",
      prevEl: ".testmonials-prev",
    },
    passiveListeners: true,
  });

  // Enable autoplay only when swipers are in viewport for better performance
  initSwiperAutoplayInView([doctorsSwiper, pricingSwiper, testimonialsSwiper]);
}

// Enable swiper autoplay only when in viewport
function initSwiperAutoplayInView(swipers) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const swiper = swipers.find((s) => s.el === entry.target);
        if (swiper) {
          if (entry.isIntersecting) {
            swiper.autoplay.start();
          } else {
            swiper.autoplay.stop();
          }
        }
      });
    },
    { threshold: 0.5 },
  );

  swipers.forEach((swiper) => {
    observer.observe(swiper.el);
  });
}

function toggleSvcCard(element) {
  const clickedCard = element.closest(".svc-card");

  const wasOpen = clickedCard.classList.contains("is-open");

  document.querySelectorAll(".svc-card").forEach((card) => {
    card.classList.remove("is-open");
  });

  if (!wasOpen) {
    clickedCard.classList.add("is-open");
  }
}

function initBackToTop() {
  const goTopButton = document.getElementById("up-arrow");
  if (!goTopButton) return;

  // Use throttled scroll event for better performance
  window.addEventListener(
    "scroll",
    throttle(function () {
      goTopButton.classList.toggle("show", window.scrollY > 300);
    }, 100),
  );

  goTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initCustomSelects() {
  const handleCustomSelect = (containerClass, selectedClass, optionsClass) => {
    document.querySelectorAll(containerClass).forEach((select) => {
      const selected = select.querySelector(selectedClass);
      const options = select.querySelector(optionsClass);
      const optionItems = select.querySelectorAll(".option, .option-popup");

      selected.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(optionsClass).forEach((opt) => {
          if (opt !== options) opt.classList.remove("show-drop", "active");
        });
        options.classList.toggle("show-drop");
        select.classList.toggle("active");
      });

      optionItems.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.stopPropagation();
          selected.textContent = option.textContent;
          options.classList.remove("show-drop");
          select.classList.remove("active");
        });
      });
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(optionsClass).forEach((options) => {
        options.classList.remove("show-drop");
      });
      document.querySelectorAll(containerClass).forEach((select) => {
        select.classList.remove("active");
      });
    });
  };

  const handleCustomPopup = (containerClass, selectedClass, optionsClass) => {
    document.querySelectorAll(containerClass).forEach((select) => {
      const selected = select.querySelector(selectedClass);
      const options = select.querySelector(optionsClass);
      const optionItems = select.querySelectorAll(".option, .option-popup");

      selected.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(optionsClass).forEach((opt) => {
          if (opt !== options) opt.classList.remove("show-drop", "active");
        });
        options.classList.toggle("show-drop");
        select.classList.toggle("active");

        if (select.classList.contains("active")) {
          document.body.classList.add("no-scroll");
        } else {
          document.body.classList.remove("no-scroll");
        }
      });

      optionItems.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.stopPropagation();
          selected.textContent = option.textContent;
          options.classList.remove("show-drop");
          select.classList.remove("active");
          document.body.classList.remove("no-scroll");
        });
      });
    });

    document.addEventListener("click", () => {
      document.querySelectorAll(optionsClass).forEach((options) => {
        options.classList.remove("show-drop");
      });
      document.querySelectorAll(containerClass).forEach((select) => {
        select.classList.remove("active");
      });
      document.body.classList.remove("no-scroll");
    });
  };

  handleCustomSelect(".custom-select", ".selected", ".options");
  handleCustomPopup(".custom-popup", ".popup", ".options-popup");
}

function initBlogSection() {
  const container = document.querySelector(".blog-section .blog-grid");
  if (!container) return;

  const cards = container.querySelectorAll(":scope > .blog-card");
  const toggleBtn = document.getElementById("toggleBlogBtn");
  if (!cards.length || !toggleBtn) return;

  const cardsToShow = 3;
  const SCROLL_OFFSET = 113;
  let visibleCount = cardsToShow;

  cards.forEach((card) => {
    card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  });

  const updateCardsVisibility = () => {
    cards.forEach((card, index) => {
      if (index < visibleCount) {
        card.style.display = "block";
        requestAnimationFrame(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        });
      } else {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.addEventListener(
          "transitionend",
          function handler() {
            if (card.style.opacity === "0") {
              card.style.display = "none";
              card.removeEventListener("transitionend", handler);
            }
          },
          { once: true },
        );
      }
    });

    toggleBtn.textContent =
      visibleCount >= cards.length ? "Show Less" : "Show More";
    toggleBtn.style.display =
      cards.length <= cardsToShow ? "none" : "inline-block";
  };

  const scrollToWithOffset = (el) => {
    const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const IMAGE_LOAD_DELAY_MS = 500;

  const applyImageLoaderToNewCards = (prevVisible, newVisible) => {
    for (let i = prevVisible; i < newVisible && i < cards.length; i++) {
      const card = cards[i];
      const imageWrapper = card.querySelector(".blog-card-image");
      const img = imageWrapper?.querySelector("img");
      if (!imageWrapper) continue;
      imageWrapper.classList.add("blog-image-loading");
      if (img) img.style.opacity = "0";
      setTimeout(() => {
        imageWrapper.classList.remove("blog-image-loading");
        if (img) img.style.opacity = "";
      }, IMAGE_LOAD_DELAY_MS);
    }
  };

  toggleBtn.addEventListener("click", () => {
    toggleBtn.disabled = true;
    const expanding = visibleCount < cards.length;
    const prevVisible = visibleCount;
    visibleCount = expanding ? cards.length : cardsToShow;

    if (expanding) applyImageLoaderToNewCards(prevVisible, visibleCount);

    updateCardsVisibility();

    if (expanding) {
      const target = cards[Math.min(visibleCount - 1, cards.length - 1)];
      setTimeout(() => {
        scrollToWithOffset(target);
        toggleBtn.disabled = false;
      }, 400);
    } else {
      setTimeout(() => {
        scrollToWithOffset(container);
        toggleBtn.disabled = false;
      }, 400);
    }
  });

  updateCardsVisibility();
}

function initDropdownBehaviors() {
  const appointmentSection = document.querySelector("#appointment-cta");
  if (appointmentSection) {
    const appointmentSelects =
      appointmentSection.querySelectorAll(".custom-select");
    let activeAppointmentSelect = null;

    appointmentSelects.forEach((select) => {
      const selected = select.querySelector(".selected");
      const options = select.querySelector(".options");

      selected.addEventListener("click", function (e) {
        e.stopPropagation();

        if (select === activeAppointmentSelect) {
          options.classList.remove("show-drop");
          activeAppointmentSelect = null;
          return;
        }

        closeAllDropdowns(appointmentSelects, select);
        options.classList.add("show-drop");
        activeAppointmentSelect = select;
      });

      select.querySelectorAll(".option").forEach((option) => {
        option.addEventListener("click", function (e) {
          e.stopPropagation();
          selected.textContent = this.textContent;
          options.classList.remove("show-drop");
          activeAppointmentSelect = null;
        });
      });
    });
  }

  const findDoctorSection = document.querySelector("#find-doctor-cta");
  if (findDoctorSection) {
    const doctorSelect = findDoctorSection.querySelector(".custom-select");
    if (doctorSelect) {
      const selected = doctorSelect.querySelector(".selected");
      const options = doctorSelect.querySelector(".options");
      let hideTimeout;

      selected.addEventListener("click", function () {
        options.classList.add("show-drop");
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          options.classList.remove("show-drop");
        }, 2600);
      });

      doctorSelect.querySelectorAll(".option").forEach((option) => {
        option.addEventListener("click", function () {
          selected.textContent = this.textContent;
          options.classList.remove("show-drop");
          clearTimeout(hideTimeout);
        });
      });
    }
  }
}

function initNavLinkEffects() {
  const mainNavLinks = document.querySelectorAll(
    "#navbarSupportedContent .navbar-nav.ms-auto > .nav-item > .nav-link",
  );
  if (!mainNavLinks.length) return;

  if (window.innerWidth >= 992) {
    mainNavLinks.forEach((link) => {
      link.style.transition = "opacity 0.3s ease";
    });

    mainNavLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        mainNavLinks.forEach((other) => {
          other.style.opacity = other === link ? "1" : "0.3";
        });
      });
      link.addEventListener("mouseleave", () => {
        mainNavLinks.forEach((l) => {
          l.style.opacity = "1";
        });
      });
    });
  }
}

function scaleMiddleSlide(swiper) {
  swiper.slides.forEach((slide) => slide.classList.remove("is-scaled"));

  const visibleSlides = Array.from(swiper.slides).filter((slide) =>
    slide.classList.contains("swiper-slide-visible"),
  );

  if (visibleSlides.length === 3) {
    visibleSlides[1].classList.add("is-scaled");
  }
}

function closeAllDropdowns(allDropdowns, exceptThis = null) {
  allDropdowns.forEach((select) => {
    if (select !== exceptThis) {
      const options = select.querySelector(".options");
      options.classList.remove("show-drop");
    }
  });
}

// Lazy-load all images except those inside <header>. Supports data-src/data-srcset and dynamic content.
function initLazyImages() {
  const isInHeader = (el) => !!el.closest("header");

  // 1) Eager-load header images to preserve LCP
  document.querySelectorAll("header img").forEach((img) => {
    img.loading = "eager";
    img.decoding = "async";
    if (!img.hasAttribute("fetchpriority")) {
      img.setAttribute("fetchpriority", "high");
    }
  });

  // 2) Observer for data-src / data-srcset swap (for full control when desired)
  const ioSwap =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const img = entry.target;

              // Swap sources when about to enter viewport
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
              }
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute("data-srcset");
              }

              // Let browser pick the right candidate after swap
              if (!img.hasAttribute("sizes") && img.parentElement) {
                // no-op: keep author control; add sizes in markup if needed
              }

              obs.unobserve(img);
            });
          },
          { rootMargin: "200px 0px" },
        )
      : null;

  // 3) Upgrade every <img> outside header
  const upgradeImg = (img) => {
    if (isInHeader(img)) return; // skip header
    if (img.hasAttribute("data-no-lazy")) return; // per-image opt-out

    // Prefer native lazy for simple cases
    img.decoding = "async";
    if (!img.hasAttribute("loading")) {
      img.loading = "lazy";
    }

    // If developer provided data-src/srcset, use IO swap for precise timing
    if (ioSwap && (img.dataset.src || img.dataset.srcset)) {
      ioSwap.observe(img);
    }
  };

  document.querySelectorAll("img").forEach(upgradeImg);

  // 4) Handle dynamically injected images (e.g., Swiper slides, CMS content)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (node.matches?.("img")) upgradeImg(node);
        node.querySelectorAll?.("img").forEach(upgradeImg);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

// Blur-up image loader: apply blur + skeleton until image fully decoded
function initImageBlurUp() {
  try {
    const images = Array.from(document.querySelectorAll("img"));
    if (!images.length) return;

    const isInHeader = (el) => !!el.closest("header"); // <— add this

    const applyLoaded = (img) => {
      img.classList.add("is-loaded");
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries, obs) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                img.classList.add("blur-up");

                const onLoad = () => {
                  if (img.decode) {
                    img
                      .decode()
                      .catch(() => {})
                      .finally(() => applyLoaded(img));
                  } else {
                    applyLoaded(img);
                  }
                  img.removeEventListener("load", onLoad);
                };

                if (img.complete && img.naturalWidth > 0) {
                  applyLoaded(img);
                } else {
                  img.addEventListener("load", onLoad, { once: true });
                }

                obs.unobserve(img);
              });
            },
            { rootMargin: "200px 0px", threshold: 0.01 },
          )
        : null;

    images.forEach((img) => {
      if (img.classList.contains("no-blur")) return; // opt-out
      if (isInHeader(img)) return; // NEW: don't blur header/LCP images

      // Ensure placeholder styles apply before image paints
      img.classList.add("blur-up");

      if (img.complete && img.naturalWidth > 0) {
        applyLoaded(img);
        return;
      }

      if (observer) {
        observer.observe(img);
      } else {
        const onLoad = () => {
          applyLoaded(img);
          img.removeEventListener("load", onLoad);
        };
        img.addEventListener("load", onLoad, { once: true });
      }
    });
  } catch (e) {
    console.error("initImageBlurUp error:", e);
  }
}

function initPricingCards() {
  const pricingWrapper = document.querySelector(
    ".pricing-swiper .swiper-wrapper",
  );
  if (!pricingWrapper) return;

  const pricingData = [
    {
      title: "Pregnancy Care",
      price: "$49",
      iconClass: "icon-lg",
      iconSvg:
        '<path d="M12 20a7 7 0 1 1 0-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="M12 7c1.657 0 3 1.343 3 3 0 2.25-3 4-3 4s-3-1.75-3-4c0-1.657 1.343-3 3-3Z" fill="currentColor" />',
    },
    {
      title: "Health Checkup",
      price: "$99",
      iconClass: "icon-normal",
      iconSvg:
        '<path d="M6 3v6a4 4 0 1 0 8 0V3M2 6h8M14 11a5 5 0 0 0 5 5h1a2 2 0 1 1-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
    },
    {
      title: "Dental Care",
      price: "$149",
      iconClass: "icon-normal",
      iconSvg:
        '<path d="M7 3c-2 0-4 2-4 5 0 6 3 8 4 8 1 0 2-2 3-2s2 2 3 2 4-2 4-8c0-3-2-5-4-5-2 0-3 1-3 1s-1-1-3-1Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><circle cx="16.8" cy="7.2" r="1.2" fill="currentColor" />',
    },
    {
      title: "Operation",
      price: "$199",
      iconClass: "icon-normal",
      iconSvg:
        '<path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />',
    },
  ];

  const checklistItems = [
    "Emergency Medical Treatment",
    "Highly Experienced Doctors",
    "Highest Success Rate",
    "Telephone Service",
  ];

  const checkmarkSvg =
    '<circle cx="12" cy="12" r="11" stroke="#c7ecd6" stroke-width="2" /><path d="m7 12 3 3 7-7" stroke="#37b24d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />';

  // Generate cards
  pricingData.forEach((plan) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const checklistHtml = checklistItems
      .map(
        (item) =>
          `<li class="checklist-item">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          ${checkmarkSvg}
        </svg>
        <span class="checklist-item-text">
          ${item}
        </span>
      </li>`,
      )
      .join("");

    slide.innerHTML = `
      <article class="price-card">
        <div class="price-icon">
          <svg class="${plan.iconClass}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            ${plan.iconSvg}
          </svg>
        </div>
        <h3 class="price-title">${plan.title}</h3>
        <div class="price">${plan.price}</div>
        <div class="per">/year</div>
        <ul class="checklist">
          ${checklistHtml}
        </ul>
        <div class="cta">
          <a class="button" href="#">Apply now</a>
        </div>
      </article>
    `;

    pricingWrapper.appendChild(slide);
  });
}
