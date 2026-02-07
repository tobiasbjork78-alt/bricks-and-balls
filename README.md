# 🧱⚽ Bricks & Balls

A modern Progressive Web App (PWA) version of the classic Breakout game, built with Next.js, TypeScript, and HTML5 Canvas.

## 🎮 Features

- **Classic Gameplay**: Break all blocks to advance to the next level
- **Touch & Desktop Controls**: Optimized for both mobile touch and desktop mouse/keyboard
- **Progressive Web App**: Installable on mobile devices and desktop
- **Responsive Design**: Works seamlessly across all screen sizes
- **Modern Graphics**: Smooth animations with glow effects and gradients
- **Level Progression**: Increasing difficulty with more blocks and faster ball speed
- **Score System**: Points based on block destruction

## 🎯 How to Play

### Desktop Controls
- **Move Paddle**: Arrow keys (←/→) or A/D keys
- **Start Game**: Click on canvas or press Space
- **Pause/Resume**: Press Space during game

### Mobile Controls
- **Move Paddle**: Touch and drag across the screen
- **Start Game**: Tap the canvas
- **Install**: Use your browser's "Add to Home Screen" option

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bricks-and-balls

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Tech Stack

- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **HTML5 Canvas** - Game rendering and physics
- **Next-PWA** - Progressive Web App functionality

## 🎨 Game Architecture

- **GameEngine**: Core game logic with physics and collision detection
- **Game Component**: React component managing canvas and UI
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Responsive Canvas**: Automatically adjusts to screen size

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Ready**: Service worker for caching
- **App-like Experience**: Full screen, no browser chrome
- **Touch Optimized**: Native mobile feel

## 🎲 Game Mechanics

- **Physics**: Realistic ball bouncing and collision detection
- **Paddle Control**: Angle-based ball reflection
- **Block System**: Colorful blocks with different point values
- **Level Progression**: Automatic difficulty scaling
- **Lives System**: 3 lives per game
- **Scoring**: Points based on block position and level

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Game engine and utilities
├── types/              # TypeScript definitions
└── styles/             # Global styles

public/                 # Static assets and PWA files
```

### Key Components
- `GameEngine`: Physics and game state management
- `Game`: Main React component with canvas integration
- `PWA Manifest`: Installation and app metadata

## 🚀 Deployment

The app is ready for deployment to Vercel, Netlify, or any static hosting platform:

```bash
npm run build
```

## 📄 License

Open source project - feel free to fork and modify!

## 🎮 Game Screenshots

The game features:
- Colorful block layouts
- Smooth ball physics
- Responsive paddle controls
- Level progression system
- Modern UI with gradient backgrounds

Enjoy playing Bricks & Balls! 🎉