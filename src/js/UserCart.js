export default class UserCart {
  constructor() {
    this.node = document.querySelector("[data-cart]");
    this.button = document.querySelector(".header__cart");
    this.count = 0;

    this.init();
  }

  init() {
    this.sync();
  }

  // Keep the badge text and the button's accessible name in sync with the count.
  sync() {
    this.node.textContent = this.count;
    if (this.button) {
      const noun = this.count === 1 ? "item" : "items";
      this.button.setAttribute(
        "aria-label",
        `Shopping cart with ${this.count} ${noun}`,
      );
    }
  }

  add(amount = 1) {
    this.count += amount;
    this.sync();
  }

  remove(amount = 1) {
    this.count = Math.max(0, this.count - amount);
    this.sync();
  }
}
