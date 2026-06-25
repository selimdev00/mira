import UserCart from "./UserCart.js";

const userCart = new UserCart();

const REQUIRED_FIELDS = ["id", "title", "description", "price", "types", "imageUrl"];

// Guard against malformed data so one bad record can't crash the whole render.
function isValid(product) {
  if (!product || typeof product !== "object") return false;
  for (const field of REQUIRED_FIELDS) {
    if (product[field] === undefined || product[field] === null) return false;
  }
  return Array.isArray(product.types) && product.types.length > 0;
}

export default class Product {
  constructor(product) {
    if (!isValid(product)) {
      console.warn("Skipping invalid product:", product);
      return;
    }

    this.product = product;
    this.productNode = null;
    this.count = 1;
    this.addedQty = 0;
    this.addedToCart = false;
    // One controller removes every listener at once in destroy().
    this.controller = new AbortController();
    this.init();
  }

  init() {
    this.render();
    this.setCounter();
    this.setCartHandler();
    this.setType();
  }

  render() {
    this.wrapper = document.querySelector(".products__slider");
    const { id, title, description, imageUrl, price, types } = this.product;
    const html = `
      <article data-product="${id}" class="products__item">
        <div class="products__item__image">
          <img src="${imageUrl}" alt="${title}" loading="lazy" />
        </div>

        <div class="products__item__content">
          <h3 class="products__item__title font-garamond">${title}</h3>

          <p class="products__item__text">${description}</p>

          <div class="products__item__info">
            <div class="products__item__info__section">
              <div class="products__item__type">
                <button
                  type="button"
                  class="products__item__type__toggle"
                  aria-haspopup="listbox"
                  aria-expanded="false"
                  aria-label="Pack size, currently ${types[0]}"
                >
                  <span class="products__item__type__label">${types[0]}</span>
                  <svg class="products__item__type__icon" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M11 1.5L6 6.5L1 1.5" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>

                <ul class="products__item__type__dropdown" role="listbox" aria-label="Pack size">
                  ${types
                    .map(
                      (type, i) =>
                        `<li class="products__item__type__dropdown__item" role="option" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${type}</li>`,
                    )
                    .join("")}
                </ul>
              </div>

              <div class="products__item__count">
                <button class="products__item__count__button" type="button" aria-label="Decrease quantity">
                  <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10 1L0 1" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>

                <span aria-live="polite" aria-label="Quantity">${this.count}</span>

                <button class="products__item__count__button" type="button" aria-label="Increase quantity">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 0L5 10M10 5L0 5" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>
              </div>
            </div>

            <p class="products__item__price">$<span>${price}</span></p>
          </div>

          <button class="products__item__cart__button" type="button">
            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7.5 0.5L7.5 15.5M15 8H0" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>Add to cart</span>
          </button>
        </div>
      </article>
    `;
    this.wrapper.insertAdjacentHTML("beforeend", html);
    this.productNode = this.wrapper.querySelector(`[data-product="${id}"]`);

    // Graceful fallback if a product image fails to load.
    const img = this.productNode.querySelector(".products__item__image img");
    img.addEventListener(
      "error",
      () => {
        img.remove();
        this.productNode.querySelector(".products__item__image").textContent =
          this.product.title;
      },
      { signal: this.controller.signal },
    );
  }

  setCounter() {
    const counter = this.productNode.querySelector(".products__item__count span");
    counter.textContent = this.count;

    const [subtractButton, addButton] = this.productNode.querySelectorAll(
      ".products__item__count__button",
    );

    addButton.addEventListener(
      "click",
      () => {
        this.count += 1;
        counter.textContent = this.count;
      },
      { signal: this.controller.signal },
    );

    subtractButton.addEventListener(
      "click",
      () => {
        if (this.count > 1) {
          this.count -= 1;
          counter.textContent = this.count;
        }
      },
      { signal: this.controller.signal },
    );
  }

  setCartHandler() {
    const cartButton = this.productNode.querySelector(".products__item__cart__button");
    cartButton.addEventListener(
      "click",
      () => {
        const label = cartButton.querySelector("span");
        if (this.addedToCart) {
          userCart.remove(this.addedQty);
          this.addedToCart = false;
          this.addedQty = 0;
          label.textContent = "Add to cart";
          cartButton.classList.remove("added");
          return;
        }

        this.addedQty = this.count;
        userCart.add(this.addedQty);
        this.addedToCart = true;
        label.textContent = "Remove from cart";
        cartButton.classList.add("added");
      },
      { signal: this.controller.signal },
    );
  }

  setType() {
    const root = this.productNode.querySelector(".products__item__type");
    const toggle = root.querySelector(".products__item__type__toggle");
    const label = root.querySelector(".products__item__type__label");
    const dropdown = root.querySelector(".products__item__type__dropdown");
    const options = [...dropdown.querySelectorAll('[role="option"]')];
    const { signal } = this.controller;

    const isOpen = () => root.classList.contains("active");

    const open = () => {
      root.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      const active = options.find((o) => o.getAttribute("aria-selected") === "true") || options[0];
      active.focus();
    };

    const close = ({ focusToggle = true } = {}) => {
      root.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      if (focusToggle) toggle.focus();
    };

    const select = (option) => {
      options.forEach((o) => {
        const selected = o === option;
        o.setAttribute("aria-selected", String(selected));
        o.tabIndex = selected ? 0 : -1;
      });
      label.textContent = option.textContent;
      toggle.setAttribute("aria-label", `Pack size, currently ${option.textContent}`);
    };

    toggle.addEventListener(
      "click",
      () => (isOpen() ? close() : open()),
      { signal },
    );

    toggle.addEventListener(
      "keydown",
      (e) => {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          open();
        }
      },
      { signal },
    );

    options.forEach((option, index) => {
      option.addEventListener(
        "click",
        () => {
          select(option);
          close();
        },
        { signal },
      );

      option.addEventListener(
        "keydown",
        (e) => {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              options[(index + 1) % options.length].focus();
              break;
            case "ArrowUp":
              e.preventDefault();
              options[(index - 1 + options.length) % options.length].focus();
              break;
            case "Home":
              e.preventDefault();
              options[0].focus();
              break;
            case "End":
              e.preventDefault();
              options[options.length - 1].focus();
              break;
            case "Enter":
            case " ":
              e.preventDefault();
              select(option);
              close();
              break;
            case "Escape":
              e.preventDefault();
              close();
              break;
            case "Tab":
              close({ focusToggle: false });
              break;
          }
        },
        { signal },
      );
    });

    // Close when clicking outside the control.
    document.addEventListener(
      "click",
      (e) => {
        if (isOpen() && !root.contains(e.target)) close({ focusToggle: false });
      },
      { signal },
    );
  }

  // Detach every listener; call before removing the node from the DOM.
  destroy() {
    this.controller.abort();
    this.productNode?.remove();
  }
}
