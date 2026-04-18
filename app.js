const STATE_BLANK = 0;
const STATE_CROSS = 1;
const STATE_QUEEN = 2;

class GameApp {
    constructor() {
        this.boardEl = document.getElementById('game-board');
        this.loadingEl = document.getElementById('loading');
        this.winMessageEl = document.getElementById('win-message');
        this.winTimeEl = document.getElementById('win-time');
        this.timerEl = document.getElementById('timer');
        this.sizeButtons = [
            document.getElementById('btn-size-5'),
            document.getElementById('btn-size-6'),
            document.getElementById('btn-size-7'),
            document.getElementById('btn-size-8'),
            document.getElementById('btn-size-9'),
            document.getElementById('btn-size-10')
        ];
        
        this.currentSize = 6;
        this.currentLevel = null;
        this.boardState = []; // 2D array of STATE_*
        
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isPlaying = false;

        this.bindEvents();
        this.startNewGame();
    }

    bindEvents() {
        this.sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSize = parseInt(btn.id.replace('btn-size-', ''));
                this.startNewGame();
            });
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.resetBoardState();
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            this.winMessageEl.classList.add('hidden');
            this.startNewGame();
        });
    }

    startTimer() {
        this.stopTimer();
        this.secondsElapsed = 0;
        this.updateTimerDisplay();
        this.isPlaying = true;
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const m = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.timerEl.textContent = `${m}:${s}`;
    }

    async startNewGame() {
        this.isPlaying = false;
        this.stopTimer();
        this.boardEl.innerHTML = '';
        this.winMessageEl.classList.add('hidden');
        
        // Show loading
        this.loadingEl.classList.remove('hidden');

        // Async generation so UI thread isn't blocked completely
        setTimeout(() => {
            let logic = new QueensLogic(this.currentSize);
            this.currentLevel = logic.generateLevel();
            this.loadingEl.classList.add('hidden');
            
            if (this.currentLevel) {
                this.initBoardUI();
                this.resetBoardState();
                this.startTimer();
            } else {
                alert("Failed to generate level. Try again.");
            }
        }, 50);
    }

    resetBoardState() {
        this.boardState = Array.from({length: this.currentSize}, () => new Array(this.currentSize).fill(STATE_BLANK));
        this.renderBoard();
        this.winMessageEl.classList.add('hidden');
        if (!this.isPlaying) this.startTimer();
    }

    initBoardUI() {
        this.boardEl.style.gridTemplateColumns = `repeat(${this.currentSize}, minmax(0, 1fr))`;
        this.boardEl.style.gridTemplateRows = `repeat(${this.currentSize}, minmax(0, 1fr))`;
        this.boardEl.innerHTML = '';

        const regions = this.currentLevel.regionsMap;
        const colors = this.currentLevel.colors;

        for (let r = 0; r < this.currentSize; r++) {
            for (let c = 0; c < this.currentSize; c++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                let regionId = regions[r][c];
                cell.style.backgroundColor = colors[regionId];

                // CSS styling to make regions look connected by applying borders
                let s = "";
                if (r === 0 || regions[r-1][c] !== regionId) s += "border-top: 2px solid rgba(255,255,255,0.4); ";
                if (r === this.currentSize - 1 || regions[r+1][c] !== regionId) s += "border-bottom: 2px solid rgba(255,255,255,0.4); ";
                if (c === 0 || regions[r][c-1] !== regionId) s += "border-left: 2px solid rgba(255,255,255,0.4); ";
                if (c === this.currentSize - 1 || regions[r][c+1] !== regionId) s += "border-right: 2px solid rgba(255,255,255,0.4); ";
                cell.style.cssText += s;

                cell.addEventListener('click', () => this.onCellClick(r, c));
                this.boardEl.appendChild(cell);
            }
        }
    }

    onCellClick(r, c) {
        if (!this.isPlaying) return;

        let currentState = this.boardState[r][c];
        let nextState = (currentState + 1) % 3;
        
        this.boardState[r][c] = nextState;

        this.renderBoard();
        this.checkWinCondition();
    }

    autoCross(r, c) {
        let size = this.currentSize;
        // Mark row and col, and 8-neighborhood
        for (let idx = 0; idx < size; idx++) {
            if (idx !== c && this.boardState[r][idx] === STATE_BLANK) this.boardState[r][idx] = STATE_CROSS;
            if (idx !== r && this.boardState[idx][c] === STATE_BLANK) this.boardState[idx][c] = STATE_CROSS;
        }

        const dirs = [[-1,-1], [-1,1], [1,-1], [1,1]]; // diagonals
        for (let d of dirs) {
            let nr = r + d[0];
            let nc = c + d[1];
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                if (this.boardState[nr][nc] === STATE_BLANK) {
                    this.boardState[nr][nc] = STATE_CROSS;
                }
            }
        }
    }

    renderBoard() {
        let cells = this.boardEl.children;
        let index = 0;
        for (let r = 0; r < this.currentSize; r++) {
            for (let c = 0; c < this.currentSize; c++) {
                let cell = cells[index++];
                let state = this.boardState[r][c];
                
                if (state === STATE_BLANK) {
                    cell.innerHTML = '';
                    cell.classList.remove('has-queen', 'has-cross');
                } else if (state === STATE_CROSS) {
                    cell.innerHTML = '<svg class="icon"><use href="#icon-cross"></use></svg>';
                    cell.classList.remove('has-queen');
                    cell.classList.add('has-cross');
                } else if (state === STATE_QUEEN) {
                    cell.innerHTML = '<svg class="icon"><use href="#icon-queen"></use></svg>';
                    cell.classList.remove('has-cross');
                    cell.classList.add('has-queen');
                }
            }
        }
    }

    checkWinCondition() {
        let size = this.currentSize;
        let queensPlaced = 0;
        
        let rowCounts = new Array(size).fill(0);
        let colCounts = new Array(size).fill(0);
        let regionCounts = new Array(size).fill(0);
        let queensPos = [];

        // Count queens and check constraints
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (this.boardState[r][c] === STATE_QUEEN) {
                    queensPlaced++;
                    rowCounts[r]++;
                    colCounts[c]++;
                    let regionId = this.currentLevel.regionsMap[r][c];
                    regionCounts[regionId]++;
                    queensPos.push({r, c});
                }
            }
        }

        if (queensPlaced !== size) return; // not finished

        // Check 1 per row/col/region
        for (let i = 0; i < size; i++) {
            if (rowCounts[i] !== 1) return;
            if (colCounts[i] !== 1) return;
            if (regionCounts[i] !== 1) return;
        }

        // Check adjacency
        for (let i = 0; i < queensPlaced; i++) {
            for (let j = i + 1; j < queensPlaced; j++) {
                let q1 = queensPos[i];
                let q2 = queensPos[j];
                let distM = Math.max(Math.abs(q1.r - q2.r), Math.abs(q1.c - q2.c));
                if (distM <= 1) return; // adjacent!
            }
        }

        // Win!
        this.isPlaying = false;
        this.stopTimer();
        this.winTimeEl.textContent = this.timerEl.textContent;
        this.winMessageEl.classList.remove('hidden');
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});
