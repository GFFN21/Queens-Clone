# Queens Clone 👑

Ah, LinkedIn. Once a place to responsibly ignore recruiters and vaguely endorse your colleagues for "Microsoft Word," and now... a place to obsessively play logic puzzles. This is a clone of the surprisingly addictive "Queens" game. 

The premise is simple: it's basically Sudoku, but with antisocial royalty. You must place one Queen per row, column, and colored region, with the strict stipulation that no Queen can touch another—not even diagonally. They thrive on personal space.

## How It's Built 🛠️

This isn't just a static HTML page with hardcoded puzzles; it generates **infinite unique, strictly logical puzzles on the fly.** Here's the magic trick behind the scenes:

### 1. Procedural Generation & Backtracking
Generating a puzzle that has *exactly one* logical solution is the hardest part of mimicking this game. The engine (`logic.js`) essentially works backward:
* **The Seed:** It first places $N$ Queens on an empty $N \times N$ board entirely at random, obeying only the basic rules (one per row/col, no adjacency).
* **The Growth:** It uses the positions of those Queens as "seeds" and randomly grows those colored regions outward—like mold taking over bread—until the board is fully covered.
* **The Validation:** Because regions were seeded by Queens, we know there is *at least* one solution. We then run a brute-force recursive backtracking solver over the board to check how many solutions exist. If the solver finds 2 or more solutions, the board is rejected and it tries again until it finds a structurally perfect, unique puzzle.

### 2. The Frontend Architecture
No bloat, no heavy frameworks, just raw Vanilla JS, HTML, and CSS.
* **State Management (`app.js`):** Lightweight class managing game lifecycle, event listeners, and victory condition validation based entirely on pure array data structs.
* **Glassmorphic UI (`style.css`):** The aesthetic relies on an intricate CSS `grid` layout. The cells are sized via `minmax(0, 1fr)` to prevent layout shifts when you plop down an SVG crown. The colors are procedurally chosen distinct pastel palettes that adapt beautifully to the dark frosted-glass container.

### 3. Setup
You don't need to run `npm install` and download half the internet. You can just:
1. Clone the repo.
2. Spin up a local server (e.g., `python3 -m http.server 8080`).
3. Open `index.html` in your browser.
4. Try to beat the 10x10 mode without crying.
