# Tic-Tac-Toe AI ✨

A pastel, kawaii-style Tic-Tac-Toe web app powered by an unbeatable Minimax AI. The game engine is pure, modular JavaScript, and the frontend is plain HTML, CSS, and a small inline ES module. There is no build step and no framework.

---

## 📁 Project Structure

```
tic-tac-toe-ai/
├── index.html     # App markup + inline UI controller (<script type="module">)
├── style.css      # Pastel theme, layout, animations, responsive rules
├── game.js        # Board state, move validation, win/draw checking, score management
├── minimax.js     # Minimax recursive search, terminal evaluation, AI move selector
├── package.json   # ESM module configuration ("type": "module")
├── test.js        # Test suite for the engine
└── README.md      # You are here
```

| Layer    | Files                     | Responsibility                                                    |
| -------- | ------------------------- | ----------------------------------------------------------------- |
| Frontend | `index.html`, `style.css` | Rendering, animations, input handling, turn flow                  |
| Engine   | `game.js`                 | Game state, rules, scores, difficulty                             |
| AI       | `minimax.js`              | Move search and selection                                         |
| Tooling  | `package.json`, `test.js` | ES module config and engine tests                                 |

The frontend never touches the Minimax logic. It only calls the exports of `game.js`.

---

## 🚀 Getting Started

The app uses ES module imports, which browsers block on `file://`. Serve the folder over HTTP:

```bash
# Option 1: Node
npx serve .

# Option 2: Python
python -m http.server 8000
```

Then open the printed URL (for example `http://localhost:8000`).

Run the engine tests with:

```bash
node test.js
```

---

## 🎀 Frontend (`index.html` + `style.css`)

### Features

- **Difficulty toggle:** a pill-shaped switch between **Cute Mode 🌸** (`"cute"`) and **Impossible Mode 🤖** (`"impossible"`), wired to `setDifficulty()`.
- **Live scoreboard:** three stat pills for Wins (You), Losses (AI), and Draws. A pill bumps when its value increases.
- **Status banner:** `Your Turn ✨`, `AI is thinking... 💭`, `You Won! 🎉`, `AI Wins! 🤖`, `It's a Draw! 🤝`.
- **Interactive 3x3 grid:** marks pop in with a bounce, and the three winning cells are highlighted and gently pulse.
- **Action buttons:** `Play Again 🔄` (keeps scores) and `Reset Scores` (clears board and scores).
- **Responsive and accessible:** works from small phones to desktop, with visible keyboard focus, ARIA labels, and `prefers-reduced-motion` support.

### Design Tokens

| Token          | Value                      | Use                         |
| -------------- | -------------------------- | --------------------------- |
| Background     | `#FFF8F0` (warm cream)     | Page                        |
| Surface        | `#FFFFFF`                  | Main card                   |
| `X` color      | `#FF8BA7` (pastel coral)   | Player marks, primary button |
| `O` color      | `#9B87F5` (lavender)       | AI marks                    |
| Accent         | `#6EE7B7` (mint)           | Winning-cell ring, draws    |
| Corner radius  | `24px`                     | Card and major surfaces     |
| Font           | Quicksand (Google Fonts)   | All text                    |

### Turn Flow

1. The player clicks an empty cell, and the UI calls `makeMove(index, "X")`. If `success` is `false`, the click is ignored.
2. The board and scores are rendered. If `gameActive` is `false`, the win/draw banner and winning-cell highlights show immediately.
3. If the game continues, the board locks and the banner shows `AI is thinking... 💭`.
4. After **350ms**, the UI calls `makeAIMove()`, renders the result, and unlocks the board.

Clicks are blocked while the AI is thinking. Play Again and Reset Scores cancel any pending AI move first, so a late move can never land on a fresh board.

---

## 🧠 Minimax AI Engine (`minimax.js`)

### Depth-Weighted Terminal Scores

- **AI win (`"O"`):** `+10 - depth` (prefers the fastest win)
- **Human win (`"X"`):** `depth - 10` (delays losses as long as possible)
- **Draw:** `0`

### Difficulty Modes

- **Impossible (`"impossible"`, default):** pure Minimax search, guaranteed unbeatable.
- **Cute / Casual (`"cute"` / `"casual"`):** 70% optimal Minimax move and 30% random legal move, so humans can win occasionally.

### Exports

| Function                                | Description                                              |
| --------------------------------------- | -------------------------------------------------------- |
| `getAIMove(board, difficulty)`          | Returns the AI's chosen cell index (`0-8`)               |
| `getBestMove(board)`                    | Pure Minimax search                                      |
| `getRandomMove(board)`                  | Picks an available cell uniformly at random              |
| `minimax(board, depth, isMaximizing)`   | Recursive evaluation function                            |
| `checkWinOrDraw(board)`                 | Checks the 8 winning combinations, or a draw             |

---

## 🎮 Game Engine & State (`game.js`)

### State Representation

- **Board:** 1D array of 9 strings, `["", "", "", "", "", "", "", "", ""]`
- **Players:** `"X"` (human) and `"O"` (AI)
- **Game active:** `true` while a round is in progress, `false` once it reaches a terminal state
- **Scores:** `{ win: 0, loss: 0, draw: 0 }`

### Exports

| Function                      | Description                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `isLegalMove(index)`          | `true` if `0 <= index < 9`, the cell is empty, and the game is active                            |
| `playRound(index, difficulty)`| One-step helper: plays the human move, then immediately the AI move                              |
| `makeMove(index, player)`     | Executes a single move. Returns `{ success, status, board, scores, gameActive }`                 |
| `makeAIMove(difficulty)`      | Executes the AI move (uses the active difficulty if none is passed). Returns the same shape      |
| `resetBoard()`                | Clears the board and sets the active player to `"X"`, keeping scores                             |
| `resetScores()`               | Resets scores to `{ win: 0, loss: 0, draw: 0 }`                                                  |
| `resetGame(shouldResetScores)`| Resets the board, and the scores too when `true`                                                 |
| `getGameState()`              | Returns `{ board, currentPlayer, gameActive, scores, difficulty }`                               |
| `setDifficulty(mode)` / `getDifficulty()` | Sets or gets the difficulty (`"cute"` or `"impossible"`)                             |

### Result `status` Shape

When a round ends, `status` is one of:

```js
{ winner: "X" | "O", line: [a, b, c] }   // a win, with the winning cell indices
{ winner: "draw" }                        // a draw
```

---

## 🔌 Connecting a UI

The bundled frontend uses the step-by-step approach (Option B) so the AI can "think" before it moves. You can use either option in your own UI.

### Option A: One-Call Integration (`playRound`)

```js
import { playRound } from "./game.js";

function handleCellClick(index) {
  const result = playRound(index);
  if (!result.humanMove.success) return; // illegal move ignored

  renderBoard(result.board);
  renderScores(result.scores);

  if (!result.gameActive) {
    const finalStatus = result.aiMove?.status || result.humanMove.status;
    showGameOverModal(finalStatus);
  }
}
```

### Option B: Step-by-Step with an AI Thinking Delay

```js
import { makeMove, makeAIMove } from "./game.js";

function handleCellClick(index) {
  const humanResult = makeMove(index, "X");
  if (!humanResult.success) return;

  renderBoard(humanResult.board);

  if (humanResult.gameActive) {
    lockBoard();
    setTimeout(() => {
      const aiResult = makeAIMove();
      renderBoard(aiResult.board);
      unlockBoard();
      if (!aiResult.gameActive) showGameOverModal(aiResult.status);
    }, 350);
  } else {
    showGameOverModal(humanResult.status);
  }
}
```

---

## 🧪 Testing

```bash
node test.js
```

The suite covers move validation, win and draw detection, score tracking, resets, and Minimax correctness.
