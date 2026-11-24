# Tic-Tac-Toe AI Engine (`game.js` & `minimax.js`)

Pure, modular JavaScript implementation of Tic-Tac-Toe with an unbeatable Minimax AI, depth-weighted optimization, and difficulty toggles.

---

## 📁 Architecture Overview

```
tic-tac-toe-ai/
├── minimax.js     # Minimax recursive search, terminal evaluation, and AI move selector
├── game.js        # Board state, move validation, win/draw checking, and score management
├── package.json   # ESM module configuration
└── test.js        # Comprehensive test suite (100% pass)
```

---

## 🧠 Minimax AI Engine (`minimax.js`)

### 1. Depth-Weighted Terminal Scores
- **AI Win (`"O"`)**: `+10 - depth` (prioritizes fastest possible wins)
- **Human Win (`"X"`)**: `depth - 10` (delays losses as long as possible)
- **Draw**: `0`

### 2. Difficulty Toggles
- **Impossible Mode (`"impossible"` - default)**: Pure Minimax search. Guaranteed unbeatable.
- **Casual / Cute Mode (`"casual"` / `"cute"`)**: 70% optimal Minimax move + 30% random legal move, allowing humans to win occasionally.

### Core Exported Functions:
- `getAIMove(board, difficulty)`: Computes and returns the cell index (`0-8`) for the AI.
- `getBestMove(board)`: Pure Minimax search.
- `getRandomMove(board)`: Chooses an available cell uniformly at random.
- `minimax(board, depth, isMaximizing)`: Recursive evaluation function.
- `checkWinOrDraw(board)`: Validates 8 winning combinations or draw.

---

## 🎮 Game Engine & State (`game.js`)

### State Representation
- **Board**: 1D array of 9 strings: `["", "", "", "", "", "", "", "", ""]`
- **Current Player**: `"X"` (Human) and `"O"` (AI)
- **Game Active**: `true` while the round is in progress, `false` upon terminal state
- **Scores**: `{ win: 0, loss: 0, draw: 0 }`

### Core Exported Functions:
- `isLegalMove(index)`: Validates `index >= 0 && index < 9 && board[index] === "" && gameActive === true`.
- `playRound(index, difficulty)`: One-step UI function. Plays the human move and immediately follows with the AI move.
- `makeMove(index, player)`: Granular move execution for step-by-step turns or animated delays.
- `makeAIMove(difficulty)`: Triggers AI move execution.
- `resetBoard()`: Clears the board and sets active player to `"X"`.
- `resetScores()`: Resets `{ win: 0, loss: 0, draw: 0 }`.
- `resetGame(shouldResetScores)`: Resets board and optionally scores.
- `getGameState()`: Returns snapshot `{ board, currentPlayer, gameActive, scores, difficulty }`.
- `setDifficulty(mode)` / `getDifficulty()`: Gets or sets difficulty mode.

---

## 🔌 UI Connection Examples

### Option A: Clean 1-Call Integration (`playRound`)
```javascript
import { playRound, getGameState, resetBoard } from "./game.js";

function handleCellClick(index) {
  const result = playRound(index);
  if (!result.humanMove.success) return; // Illegal move ignored

  // Update UI with new board state
  renderBoard(result.board);
  renderScores(result.scores);

  if (!result.gameActive) {
    const finalStatus = result.aiMove?.status || result.humanMove.status;
    showGameOverModal(finalStatus);
  }
}
```

### Option B: Step-by-Step with AI Thinking Delay (`setTimeout`)
```javascript
import { makeMove, makeAIMove, isGameActive, getBoard } from "./game.js";

function handleCellClick(index) {
  // 1. Play Human Move
  const humanResult = makeMove(index, "X");
  if (!humanResult.success) return;

  renderBoard(getBoard());

  // 2. Add Thinking Delay for AI
  if (humanResult.gameActive) {
    setLoadingSpinner(true);
    setTimeout(() => {
      const aiResult = makeAIMove();
      setLoadingSpinner(false);
      renderBoard(getBoard());
      if (!isGameActive()) showGameOverModal(aiResult.status);
    }, 400);
  }
}
```
