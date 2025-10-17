# 2048 Game 

This is a fully functional implementation of the classic 2048 puzzle game, built using React, Vite, and Tailwind CSS. The project is deployed on Vercel and is designed to be responsive, smooth, and easily maintainable.

The goal of the project is to provide a clean, modular, and production-ready version of 2048 with additional customization features for better gameplay.

---

## Installation

If you are using a mobile device, this project can also be run through GitHub Codespaces or an online IDE such as Replit.

### Clone the Repository

```bash
git clone https://github.com/dineshlkrishn/2048-React-app.git
cd 2048-React-app

### Install Dependencies

```bash
npm install
This installs React, Vite, Tailwind, ESLint, and all other required packages.

### Deployment on Vercel

*****The project is deployed using Vercel*****
Push the code to GitHub.
Go to https://vercel.com
Select “New Project” and import your GitHub repository.

### Configure:

Build Command: npm run build
Output Directory: dist
Click Deploy.

Within a few minutes, your site will be live at:
https://<your-project-name>.vercel.app


## Gameplay Instructions

The objective of the game is to slide numbered tiles on a grid to combine them and create a tile with the number 2048.
Use arrow keys (↑ ↓ ← →) or on-screen buttons to move tiles.
When two tiles of the same number collide, they merge into one tile with their sum.
After each valid move, a new tile (2 or 4) spawns randomly.

### The game ends when:

You create a tile with value 2048 (win)
No more moves are possible (lose)

### Additional Features

Multi-step Undo: You can undo multiple previous moves.

Settings Panel: Adjust spawn probability and target value.

Restart Option: Start a new game anytime.

Responsive Layout: Works on both mobile and desktop.

## Implementation Details

This project was developed with a focus on modular and maintainable code.

### Core Logic

The game board is represented as a two-dimensional array.
Tile spawning logic adds a new tile after each valid move.
Merging logic ensures that each tile can merge only once per move.

### Components

GameBoard: Renders the grid and listens to moves.
Tile: Handles tile appearance and transitions.
Controls: Provides buttons for mobile gameplay.
SettingsPanel: Allows real-time configuration of the game.

#### Undo System

Implemented using a stack of previous board states.
Each move pushes the current state onto the stack.
Undo restores the most recent previous state.

##### Styling and Animations

Tailwind CSS is used for responsive design and clean styling.
Tiles use CSS transitions for smooth merging and movement.
Tile colors are based on their value to maintain clarity and consistency.

## Deployment

Vite is used for fast builds and bundling.
Vercel handles automated builds and deployments directly from GitHub.

## License

This project is licensed under the MIT License.
MIT License © 2025 Dinesh Muthu
