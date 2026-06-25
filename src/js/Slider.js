// Pointer/touch drag-to-scroll for the horizontal products rail.
// Native overflow-x scrolling still works (trackpad, scroll-snap, keyboard);
// this only adds click-and-drag on top of it.
export default (slider) => {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  // Read the X coordinate from either a mouse or a touch event safely.
  const pointerX = (e) => {
    const point = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
    return point - slider.offsetLeft;
  };

  const end = () => {
    isDown = false;
    slider.classList.remove("active");
  };

  const start = (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = pointerX(e);
    scrollLeft = slider.scrollLeft;
  };

  const move = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dist = pointerX(e) - startX;
    slider.scrollLeft = scrollLeft - dist;
  };

  slider.addEventListener("mousedown", start);
  slider.addEventListener("touchstart", start, { passive: true });

  slider.addEventListener("mousemove", move);
  slider.addEventListener("touchmove", move, { passive: false });

  slider.addEventListener("mouseleave", end);
  slider.addEventListener("mouseup", end);
  slider.addEventListener("touchend", end);
};
