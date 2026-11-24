/**
 * minimax.js - Minimax AI Engine for Tic-Tac-Toe
 *
 * Implements the Minimax decision algorithm with depth-weighted scoring
 * to prioritize fast wins and delay losses. Includes difficulty toggles:
 * - "impossible": Pure unbeatable Minimax
 * - "casual" / "cute": 70% optimal Minimax move + 30% random legal move
 */

/**
 * All 8 winning combinations on a 3x3 board (indices 0-8):
 * 3 rows, 3 columns, 2 diagonals
 */
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Column 1
  [1, 4, 7], // Column 2
  [2, 5, 8], // Column 3
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

/**
 * Evaluates the board state for a win or a draw.
 *
 * @param {string[]} board - 1D array of 9 strings ("X", "O", or "")
 * @returns {{ winner: "X" | "O", line: number[] } | { winner: "draw" } | null}
 */
export function checkWinOrDraw(board) {
  // Check all 8 winning triplets
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  // If no empty cells remain, it's a draw
  if (!board.includes("")) {
    return { winner: "draw" };
  }

  // Game still in progress
  return null;
}

/**
 * Returns an array of available legal cell indices (0-8) on the board.
 *
 * @param {string[]} board - 1D array of 9 strings
 * @returns {number[]} Array of empty cell indices
 */
export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Minimax algorithm with depth-based terminal scoring:
 * - AI Win ("O"): +10 - depth (favors quicker wins)
 * - Human Win ("X"): depth - 10 (favors delaying losses)
 * - Draw: 0
 *
 * @param {string[]} board - Current board state
 * @param {number} depth - Current depth in the game tree
 * @param {boolean} isMaximizing - True if AI ("O") turn, false if Human ("X") turn
 * @returns {number} Score of the board state
 */
export function minimax(board, depth, isMaximizing) {
  const terminalState = checkWinOrDraw(board);

  if (terminalState !== null) {
    if (terminalState.winner === "O") {
      return 10 - depth; // AI win
    }
    if (terminalState.winner === "X") {
      return depth - 10; // Human win
    }
    if (terminalState.winner === "draw") {
      return 0; // Draw
    }
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const evaluation = minimax(board, depth + 1, false);
        board[i] = "";
        maxEval = Math.max(maxEval, evaluation);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const evaluation = minimax(board, depth + 1, true);
        board[i] = "";
        minEval = Math.min(minEval, evaluation);
      }
    }
    return minEval;
  }
}

/**
 * Calculates the optimal move for AI ("O") using pure Minimax.
 *
 * @param {string[]} board - 1D array of 9 strings
 * @returns {number | null} Index of the best cell (0-8), or null if board is full
 */
export function getBestMove(board) {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMoves = [];

  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    board[move] = "O";
    const score = minimax(board, 0, false);
    board[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // If multiple moves share the best score, choose one at random for variety
  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex];
}

/**
 * Selects a random legal move from all currently available cells.
 *
 * @param {string[]} board - 1D array of 9 strings
 * @returns {number | null} Index of random empty cell (0-8), or null if board is full
 */
export function getRandomMove(board) {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

/**
 * Determines AI move based on selected difficulty mode:
 * - "impossible": 100% optimal Minimax move (unbeatable)
 * - "casual" / "cute": 70% Minimax + 30% random legal move
 *
 * @param {string[]} board - 1D array of 9 strings
 * @param {string} [difficulty="impossible"] - "impossible" | "casual" | "cute"
 * @returns {number | null} Selected move index (0-8)
 */
export function getAIMove(board, difficulty = "impossible") {
  const mode = String(difficulty).toLowerCase();

  if (mode === "casual" || mode === "cute") {
    // 30% chance to make a random legal move
    if (Math.random() < 0.3) {
      return getRandomMove(board);
    }
  }

  // Default: Pure Minimax (impossible mode)
  return getBestMove(board);
}

// Attach to global scope for browser environments and console debugging
if (typeof globalThis !== "undefined") {
  globalThis.Minimax = {
    WINNING_COMBINATIONS,
    checkWinOrDraw,
    getAvailableMoves,
    minimax,
    getBestMove,
    getRandomMove,
    getAIMove
  };
}
