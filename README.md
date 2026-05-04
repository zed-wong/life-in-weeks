# Life Progress

A contemplative web application that visualizes your life journey as a grid of weeks. Built with SvelteKit as a Progressive Web App, Life Progress helps you gain perspective on your timeline and mark the moments that shaped it.

![Life Progress Screenshot](public/screenshot.png)

## Features

- **Life Visualization**: See your life as a grid of weeks — each dot is one week, colored by era
- **Event Marking**: Add events, milestones, and turning points to any week
- **Progress Tracking**: View your life progress as a percentage and in weeks
- **Export & Import**: Back up and restore your data as JSON
- **Responsive Design**: Works beautifully on all devices
- **PWA Support**: Install as a Progressive Web App for offline access
- **Data Persistence**: Everything is saved locally in the browser
- **Dark Mode**: A warm walnut-ink dark theme, not neon
- **Accessibility**: Built with keyboard navigation and screen readers in mind

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Typography**: Fraunces (serif) + Geist (sans)
- **PWA**: Custom service worker
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- [Bun](https://bun.sh/) (recommended) or npm/pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zed-wong/life-progress.git
   cd life-progress
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
bun run build
```

## Usage

1. **First Visit**: Enter your birth date and life expectancy to generate your grid
2. **Mark Moments**: Click any week to add an event, milestone, or turning point
3. **Export Data**: Click **Export** on the stats page to download your data as JSON
4. **Import Data**: Click **Import** to restore from a previously exported JSON file
5. **Reset**: Erase all data and start over from the setup page

## PWA Features

- **Offline Support**: Works without an internet connection
- **Installable**: Add to your home screen for quick access
- **Data Persistence**: All data is stored locally in the browser
- **Automatic Updates**: Service worker keeps the app up to date

## Project Structure

```
life-progress/
├── src/
│   ├── lib/
│   │   ├── components/        # UI components
│   │   │   ├── LifeProgressGrid.svelte   # Main grid visualization
│   │   │   ├── EventDialog.svelte        # Add/edit events on weeks
│   │   │   ├── EventTimeline.svelte      # Sidebar event timeline
│   │   │   ├── Landing.svelte            # Home/landing page
│   │   │   ├── Setup.svelte              # Birthday setup form
│   │   │   ├── TopBar.svelte              # Navigation masthead
│   │   │   └── ui/                        # shadcn-svelte primitives
│   │   ├── dataIO.ts          # Export & import logic
│   │   ├── stores.ts          # Svelte stores with localStorage persistence
│   │   ├── weekUtils.ts       # Week calculation utilities
│   │   ├── utils.ts           # General utilities
│   │   └── quotes.ts          # Curated quotes
│   ├── routes/
│   │   ├── +page.svelte       # Landing page
│   │   ├── +layout.svelte     # Root layout with TopBar & PWA setup
│   │   ├── setup/+page.svelte # Setup route
│   │   └── stats/+page.svelte# Stats (grid) route
│   └── app.css                # Global styles & design tokens
├── static/                    # Static assets (icons, SW, manifest)
└── package.json
```

## Development

```bash
bun run dev          # Start dev server
bun run check        # Type checking with svelte-check
bun run test:unit    # Run unit tests
bun run build        # Production build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the "Your Life in Weeks" visualization
- Built with [SvelteKit](https://kit.svelte.dev/)
- UI components from [shadcn-svelte](https://www.shadcn-svelte.com/)
- Icons from [Lucide](https://lucide.dev/)