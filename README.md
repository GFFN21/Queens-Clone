# Queens Clone 👑

[Play it here!](https://gffn21.github.io/Queens-Clone/)

Ah, LinkedIn. Once a place to responsibly ignore recruiters and vaguely endorse your colleagues for "Microsoft Word," and now... a place to obsessively play logic puzzles. This is a clone of the surprisingly addictive "Queens" game. 

The premise is simple: it's basically Sudoku, but with antisocial royalty. You must place one Queen per row, column, and colored region, with the strict stipulation that no Queen can touch another—not even diagonally. They thrive on personal space.

## How It's Built 🛠️

This isn't just a static HTML page with hardcoded puzzles; it generates **infinite unique, strictly logical puzzles on the fly.** Here's the magic trick behind the scenes:

### 1. Procedural Generation & Backtracking
Generating a puzzle that has *exactly one* logical solution is the hardest part. The engine (`logic.js`) essentially works backward:
* **The Seed:** It first places $N$ Queens on an empty $N \times N$ board entirely at random, obeying only the basic rules (one per row/col, no adjacency).
* **The Growth:** It uses the positions of those Queens as "seeds" and grows those colored regions outward.
* **Boundary Degeneration (The Smudge Tool):** To make levels harder, the engine runs 2,000 "smudge" iterations. It swaps border cells between regions while maintaining shape contiguity. This creates jagged, snake-like regions that hide the Queen's original seed location.
* **The Integrity Rule:** To prevent "freebie" levels, the generator enforces a rule where no more than **one single-cell region** exists per board.
* **The Validation:** Because regions were seeded by Queens, we know there is *at least* one solution. We then run a brute-force recursive backtracking solver to check if exactly one unique solution exists. If not, we try again.

### 2. The Frontend Architecture
No bloat, no heavy frameworks, just raw Vanilla JS, HTML, and CSS.
* **Dynamic Grid:** Supports sizes from 5x5 up to **10x10**.
* **State Management (`app.js`):** Lightweight class managing game lifecycle, event listeners, and victory condition validation.
* **Glassmorphic UI (`style.css`):** The aesthetic relies on an intricate CSS `grid` layout with `minmax(0, 1fr)` cells and a procedural pastel color palette.

### 3. Setup
You don't need to run `npm install` and download half the internet. You can just:
1. Clone the repo.
2. Spin up a local server (e.g., `python3 -m http.server 8080`).
3. Open `index.html` in your browser.
4. Try to beat the 10x10 mode without crying.
