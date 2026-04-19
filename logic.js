/**
 * Core game logic and level generation for Queens Clone.
 */

// Colors for the regions (maximum size 8 currently)
const REGION_COLORS = [
    'hsl(348, 83%, 79%)', // Pastel Pink
    'hsl(280, 60%, 80%)', // Pastel Purple
    'hsl(215, 80%, 75%)', // Pastel Blue
    'hsl(175, 50%, 70%)', // Pastel Teal
    'hsl(120, 50%, 75%)', // Pastel Green
    'hsl(50, 80%, 75%)',  // Pastel Yellow
    'hsl(25, 90%, 75%)',  // Pastel Orange
    'hsl(0, 0%, 75%)',    // Pastel Gray
    'hsl(315, 70%, 80%)', // Pastel Magenta
    'hsl(150, 60%, 75%)'  // Pastel Mint
];

class QueensLogic {
    constructor(size) {
        this.size = size;
    }

    /**
     * Checks if placing a queen at (r, c) violates any basic constraint on an EMPTY board.
     * This is used for generating the initial valid queen placement.
     */
    canPlaceInitialQueen(r, c, board) {
        // Col check
        for (let i = 0; i < r; i++) {
            if (board[i] === c) return false;
        }

        // Adjacency check (only need to check previous row if r > 0, since we place row by row)
        if (r > 0) {
            let prevCol = board[r - 1];
            if (Math.abs(prevCol - c) <= 1) return false;
        }

        return true;
    }

    /**
     * Finds a random valid configuration of N queens.
     * Returns an array where index is row and value is col.
     */
    generateValidQueens() {
        let maxAttempts = 1000;
        
        while (maxAttempts-- > 0) {
            let board = new Array(this.size).fill(-1);
            let valid = this.backtrackQueens(0, board);
            if (valid) return board;
        }
        return null;
    }

    backtrackQueens(row, board) {
        if (row === this.size) return true;

        // Try placing in a random column
        let cols = Array.from({length: this.size}, (_, i) => i);
        cols.sort(() => Math.random() - 0.5);

        for (let c of cols) {
            if (this.canPlaceInitialQueen(row, c, board)) {
                board[row] = c;
                if (this.backtrackQueens(row + 1, board)) {
                    return true;
                }
                board[row] = -1;
            }
        }
        return false;
    }

    /**
     * Seeds regions using the queen locations.
     */
    generateRegionsFromQueens(queensArray) {
        const regionsMap = Array.from({length: this.size}, () => new Array(this.size).fill(-1));
        const queue = [];

        // 1. Assign each queen to its own region
        for (let i = 0; i < this.size; i++) {
            regionsMap[i][queensArray[i]] = i;
            queue.push({r: i, c: queensArray[i], id: i});
        }

        // 2. Grow regions randomly (BFS with shuffle)
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // While there are still cells to process
        while (queue.length > 0) {
            // Sort to add randomness to which region grows next
            queue.sort(() => Math.random() - 0.5);
            let current = queue.shift();

            // Shuffle directions
            directions.sort(() => Math.random() - 0.5);
            
            for (let dir of directions) {
                let nr = current.r + dir[0];
                let nc = current.c + dir[1];

                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    if (regionsMap[nr][nc] === -1) {
                        regionsMap[nr][nc] = current.id;
                        // Might push multiple times from different edges, 
                        // but setting to -1 prevents overwriting.
                        queue.push({r: nr, c: nc, id: current.id});
                    }
                }
            }
        }

        return regionsMap;
    }

    smudgeRegions(regionsMap, queens, iterations) {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (let i = 0; i < iterations; i++) {
            let r = Math.floor(Math.random() * this.size);
            let c = Math.floor(Math.random() * this.size);
            
            let isQueen = false;
            for(let row=0; row<this.size; row++){
                if(row === r && queens[row] === c) isQueen = true;
            }
            if(isQueen) continue;

            let d = dirs[Math.floor(Math.random() * dirs.length)];
            let ar = r + d[0];
            let ac = c + d[1];
            
            if (ar >= 0 && ar < this.size && ac >= 0 && ac < this.size) {
                let regionA = regionsMap[r][c];
                let regionB = regionsMap[ar][ac];
                
                if (regionA !== regionB) {
                    regionsMap[r][c] = regionB;
                    let queenRowA = regionA;
                    let queenColA = queens[regionA];
                    if (!this.checkContiguous(regionsMap, regionA, queenRowA, queenColA)) {
                        regionsMap[r][c] = regionA;
                    }
                }
            }
        }
    }

    checkContiguous(regionsMap, regionId, queenRow, queenCol) {
        let totalCells = 0;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (regionsMap[r][c] === regionId) totalCells++;
            }
        }
        let visited = new Set();
        let queue = [{r: queenRow, c: queenCol}];
        visited.add(`${queenRow},${queenCol}`);
        let reached = 0;
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        while (queue.length > 0) {
            let curr = queue.shift();
            reached++;
            for (let d of dirs) {
                let nr = curr.r + d[0];
                let nc = curr.c + d[1];
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    if (regionsMap[nr][nc] === regionId && !visited.has(`${nr},${nc}`)) {
                        visited.add(`${nr},${nc}`);
                        queue.push({r: nr, c: nc});
                    }
                }
            }
        }
        return reached === totalCells;
    }

    /**
     * Solves the board specifically with region constraints to find the number of solutions.
     */
    countSolutions(regionsMap) {
        let solutions = 0;
        let colsUsed = new Array(this.size).fill(false);
        let regionsUsed = new Array(this.size).fill(false);
        let board = new Array(this.size).fill(-1); // stores col index per row

        const solve = (row) => {
            if (row === this.size) {
                solutions++;
                return;
            }

            // Optimization: if solutions > 1, short circuit. We only care if it's EXACTLY 1.
            if (solutions > 1) return;

            for (let c = 0; c < this.size; c++) {
                if (colsUsed[c]) continue;
                
                let regionId = regionsMap[row][c];
                if (regionsUsed[regionId]) continue;

                if (row > 0) {
                    let prevCol = board[row - 1];
                    if (Math.abs(prevCol - c) <= 1) continue;
                }

                // Place
                board[row] = c;
                colsUsed[c] = true;
                regionsUsed[regionId] = true;

                solve(row + 1);

                // Backtrack
                board[row] = -1;
                colsUsed[c] = false;
                regionsUsed[regionId] = false;
            }
        };

        solve(0);
        return solutions;
    }

    /**
     * High-level generation loop.
     */
    generateLevel() {
        let attempts = 0;
        while (attempts < 5000) {
            attempts++;
            let queens = this.generateValidQueens();
            if (!queens) continue;

            let regionsMap = this.generateRegionsFromQueens(queens);
            
            this.smudgeRegions(regionsMap, queens, 2000);
            
            let regionCounts = new Array(this.size).fill(0);
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    regionCounts[regionsMap[r][c]]++;
                }
            }
            let singleCellCount = 0;
            for (let count of regionCounts) {
                if (count === 1) singleCellCount++;
            }
            if (singleCellCount > 1) continue;

            let solCount = this.countSolutions(regionsMap);

            if (solCount === 1) {
                // Return level data structure
                return {
                    size: this.size,
                    regionsMap: regionsMap,
                    solution: queens,
                    colors: this.shuffleColors()
                };
            }
        }
        console.error("Failed to generate a level within max attempts.");
        return null;
    }

    shuffleColors() {
        let c = [...REGION_COLORS.slice(0, this.size)];
        c.sort(() => Math.random() - 0.5);
        return c;
    }
}
