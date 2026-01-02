# Paint by Numbers Generator

Turn any image into a printable **paint-by-numbers** artwork.

This project is an open-source, browser-based paint-by-numbers generator built with modern web technologies. It allows you to upload an image, reduce it to a configurable color palette, and generate clean, printable templates with numbered regions and an optional painted preview.

## 🙏 Inspiration

This project is inspired by the open-source repository:

https://github.com/drake7707/paintbynumbersgenerator

The core concept comes from there. This project builds upon that idea with a modern web stack, improved SVG generation, and a better overall user experience.

## ✨ Features

- Upload any image
- Adjustable number of colors
- Automatic region (facet) detection
- Merge small regions for cleaner results
- High-quality **SVG** output (perfect for printing)
- Optional painted preview
- Configurable smoothing
- Numbered regions
- Color palette with number → color mapping
- Modern, clean UI
- Open-source and self-hostable

## 🖼 Demo

👉 Live demo: _(coming soon)_

## 🛠 Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Sharp** – image processing
- **SVG** – vector output
- **SVGO** – SVG optimization
- **Tailwind CSS** – UI styling

## ⚙️ How it works

At a high level, the pipeline looks like this:

1. Uploaded image is resized and preprocessed
2. Colors are quantized to a limited palette
3. Connected regions (facets) are detected
4. Small regions are merged for readability
5. Vector outlines and optional fills are generated
6. A labeled SVG and optional painted preview are returned

## 🚀 Getting Started

### Development

```bash
git clone https://github.com/your-username/paint-by-numbers
cd paint-by-numbers
bun install
bun run dev
```

App available at: `http://localhost:3000`

## 🤝 Contributing

Contributions are welcome!

If you have ideas for improvements, bug fixes, or new features:

- Open an issue
- Submit a pull request
- Or just share feedback
