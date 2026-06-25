import products from "./data/products.json";

import Product from "./js/Product.js";
import Slider from "./js/Slider.js";

// render products
const instances = products.map((product) => new Product(product));

// slider drag logic
Slider(document.querySelector(".products__slider"));

// header background on scroll
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 0);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// mobile navigation toggle
const navToggle = document.querySelector(".header__burger");
const nav = document.querySelector(".header__nav");
if (navToggle && nav) {
  const setNav = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  };

  navToggle.addEventListener("click", () => {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });

  // Close the menu after picking a destination.
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setNav(false)),
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });
}

// scroll reveal, only when the user hasn't asked for reduced motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealables = document.querySelectorAll("[data-reveal]");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );
  revealables.forEach((el) => observer.observe(el));
}

// expose for potential cleanup / debugging
window.__products = instances;
