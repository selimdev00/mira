# Bonjour

Landing page for a small French bakery, built in plain HTML, CSS, and JavaScript with Vite. No framework.

- Pure HTML, CSS, and vanilla JS (ES modules)
- Fully responsive, from mobile to wide desktop
- Accessible: keyboard-operable pack-size listbox, skip link, focus rings, live cart label, reduced-motion support
- Drag-to-scroll product rail with per-item quantity and cart logic
- Dockerised build

Figma reference: https://www.figma.com/design/qND9KCcSyMWuPokt70cG9V/Test?node-id=0-53

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build && npm run preview
```

Or with Docker:

```bash
npm run docker      # up
npm run docker:down # down
```

## Author

selim <selimdev00@gmail.com>
