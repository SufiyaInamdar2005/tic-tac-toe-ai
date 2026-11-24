/**
 * game.js - Tic-Tac-Toe Game Engine & State Management
 *
 * Connects cleanly to any UI via simple, predictable function calls.
 * Manages board representation, turn tracking, move validation,
 * score keeping, and integration with the Minimax AI.
 */

import { checkWinOrDraw, getAIMove, WINNING_COMBINATIONS } from "./minimax.js";

// ==========================================
// Game State
// ==========================================

/**
 * 3x3 board represented as a 1D array of 9 elements.
 * Cell indices:
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 */
let board = ["", "", "", "", "", "", "", "", ""];

/**
 * Current turn: "X" for Human, "O" for AI.
 * Human ("X") always starts the game.
 */
let currentPlayer = "X";

/**
 * Tracks if the current round is ongoing.
 */
let gameActive = true;

/**
 * Score tally:
 * - win: Human wins ("X")
 * - loss: AI wins ("O")
 * - draw: Draws
 */
let scores = {
  win: 0,
  loss: 0,
  draw: 0
};

/**
 * Current AI difficulty level:
 * - "impossible": Pure Minimax
 * - "casual" | "cute": 70% Minimax + 30% random legal move
 */
let difficulty = "impossible";

// ==========================================
// Rules & Validation
// ==========================================

/**
 * Validates whether a move at a given index is legal.
 * Move is legal if:
 * 1. Cell index is within [0, 8]
 * 2. board[index] === ""
 * 3. gameActive === true
 *
 * @param {number} index - Board cell index (0-8)
 * @returns {boolean} True if legal, false otherwise
 */
export function isLegalMove(index) {
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < 9 &&
    board[index] === "" &&
    gameActive === true
  );
}

// Re-export checkWinOrDraw for UI or external validation
export { checkWinOrDraw, WINNING_COMBINATIONS };

// ==========================================
// Move Execution & State Transitions
// ==========================================

/**
 * Executes a single move for the specified or current player.
 * Validates legality, updates board, checks win/draw status,
 * and updates score if terminal state is reached.
 *
 * @param {number} index - Board index (0-8)
 * @param {string} [player=currentPlayer] - Player making the move ("X" | "O")
 * @returns {object} Result object containing move outcome and state
 */
export function makeMove(index, player = currentPlayer) {
  if (!isLegalMove(index)) {
    return {
      success: false,
      reason: !gameActive ? "Game is inactive" : "Cell is already occupied or invalid",
      index,
      player,
      board: [...board],
      scores: { ...scores },
      gameActive
    };
  }

  // Place mark
  board[index] = player;

  // Validate win or draw
  const status = checkWinOrDraw(board);

  if (status !== null) {
    // Round concluded
    gameActive = false;

    if (status.winner === "X") {
      scores.win++;
    } else if (status.winner === "O") {
      scores.loss++;
    } else if (status.winner === "draw") {
      scores.draw++;
    }

    return {
      success: true,
      index,
      player,
      status, // { winner: "X" | "O", line: [a, b, c] } or { winner: "draw" }
      board: [...board],
      scores: { ...scores },
      gameActive: false,
      nextPlayer: null
    };
  }

  // Game continues: alternate turn
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  return {
    success: true,
    index,
    player,
    status: null,
    board: [...board],
    scores: { ...scores },
    gameActive: true,
    nextPlayer: currentPlayer
  };
}

/**
 * Triggers the AI ("O") to compute and execute its move based on the selected difficulty.
 *
 * @param {string} [diff=difficulty] - "impossible" | "casual" | "cute"
 * @returns {object|null} Move result from makeMove, or null if AI cannot move
 */
export function makeAIMove(diff = difficulty) {
  if (!gameActive || currentPlayer !== "O") {
    return null;
  }

  const aiMoveIndex = getAIMove(board, diff);
  if (aiMoveIndex === null) {
    return null;
  }

  return makeMove(aiMoveIndex, "O");
}

/**
 * High-level turn coordinator for the UI.
 * Handles the human move at `cellIndex`, and if the game is still active,
 * automatically triggers the AI's response.
 *
 * If your UI prefers an artificial delay (e.g. setTimeout for thinking animation),
 * call `makeMove(cellIndex, "X")` and `makeAIMove()` separately instead.
 *
 * @param {number} cellIndex - Index clicked by the user (0-8)
 * @param {string} [diff=difficulty] - Optional difficulty override
 * @returns {object} Object with humanMove and aiMove results
 */
export function playRound(cellIndex, diff = difficulty) {
  // 1. Human Turn ("X")
  const humanMoveResult = makeMove(cellIndex, "X");

  if (!humanMoveResult.success) {
    return {
      humanMove: humanMoveResult,
      aiMove: null,
      board: [...board],
      scores: { ...scores },
      gameActive
    };
  }

  // If game ended on human's move (win or draw), return immediately
  if (!humanMoveResult.gameActive) {
    return {
      humanMove: humanMoveResult,
      aiMove: null,
      board: [...board],
      scores: { ...scores },
      gameActive: false
    };
  }

  // 2. AI Turn ("O")
  const aiMoveResult = makeAIMove(diff);

  return {
    humanMove: humanMoveResult,
    aiMove: aiMoveResult,
    board: [...board],
    scores: { ...scores },
    gameActive: isGameActive()
  };
}

// ==========================================
// Game Lifecycle & Configuration
// ==========================================

/**
 * Resets the 3x3 board to all empty strings, sets currentPlayer to "X",
 * and reactivates the game. Preserves score tallies.
 *
 * @returns {object} Fresh game state snapshot
 */
export function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;

  return getGameState();
}

/**
 * Resets the scores tally back to 0.
 *
 * @returns {{ win: number, loss: number, draw: number }}
 */
export function resetScores() {
  scores = { win: 0, loss: 0, draw: 0 };
  return { ...scores };
}

/**
 * Resets both the board and optionally scores.
 *
 * @param {boolean} [shouldResetScores=false]
 * @returns {object} Game state snapshot
 */
export function resetGame(shouldResetScores = false) {
  if (shouldResetScores) {
    resetScores();
  }
  return resetBoard();
}

/**
 * Updates the game difficulty setting.
 *
 * @param {"impossible" | "casual" | "cute"} newDifficulty
 */
export function setDifficulty(newDifficulty) {
  const normalized = String(newDifficulty).toLowerCase();
  if (normalized === "casual" || normalized === "cute" || normalized === "impossible") {
    difficulty = normalized;
  }
}

/**
 * Returns the currently active difficulty setting.
 *
 * @returns {"impossible" | "casual" | "cute"}
 */
export function getDifficulty() {
  return difficulty;
}

// ==========================================
// Getters
// ==========================================

/**
 * Returns an immutable copy of the current 1D board.
 * @returns {string[]}
 */
export function getBoard() {
  return [...board];
}

/**
 * Returns the player whose turn it currently is ("X" or "O").
 * @returns {"X" | "O"}
 */
export function getCurrentPlayer() {
  return currentPlayer;
}

/**
 * Returns whether the round is currently active.
 * @returns {boolean}
 */
export function isGameActive() {
  return gameActive;
}

/**
 * Returns a copy of the current score tally.
 * @returns {{ win: number, loss: number, draw: number }}
 */
export function getScores() {
  return { ...scores };
}

/**
 * Returns a complete snapshot of the game state for the UI.
 *
 * @returns {{
 *   board: string[],
 *   currentPlayer: "X" | "O",
 *   gameActive: boolean,
 *   scores: { win: number, loss: number, draw: number },
 *   difficulty: string
 * }}
 */
export function getGameState() {
  return {
    board: [...board],
    currentPlayer,
    gameActive,
    scores: { ...scores },
    difficulty
  };
}

// ==========================================
// Global Scope Attachment (Browser & UI)
// ==========================================

if (typeof globalThis !== "undefined") {
  globalThis.TicTacToe = {
    isLegalMove,
    checkWinOrDraw,
    makeMove,
    makeAIMove,
    playRound,
    resetBoard,
    resetScores,
    resetGame,
    setDifficulty,
    getDifficulty,
    getBoard,
    getCurrentPlayer,
    isGameActive,
    getScores,
    getGameState,
    WINNING_COMBINATIONS
  };
}
