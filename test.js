import assert from "node:assert";
import {
  WINNING_COMBINATIONS,
  checkWinOrDraw,
  getAvailableMoves,
  minimax,
  getBestMove,
  getRandomMove,
  getAIMove
} from "./minimax.js";

import {
  isLegalMove,
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
  getGameState
} from "./game.js";

console.log("=== RUNNING TIC-TAC-TOE TESTS ===");

// 1. Board Representation & Initial State
console.log("\n1. Testing Board Representation & Initial State...");
resetGame(true);
assert.deepStrictEqual(getBoard(), ["", "", "", "", "", "", "", "", ""]);
assert.strictEqual(getCurrentPlayer(), "X");
assert.strictEqual(isGameActive(), true);
assert.deepStrictEqual(getScores(), { win: 0, loss: 0, draw: 0 });
console.log("✓ Initial state matches specification");

// 2. Rules & Move Validation
console.log("\n2. Testing Rules & Move Validation...");
assert.strictEqual(isLegalMove(0), true);
assert.strictEqual(isLegalMove(8), true);
assert.strictEqual(isLegalMove(-1), false);
assert.strictEqual(isLegalMove(9), false);
assert.strictEqual(isLegalMove("0"), false);

// Make a move at index 4 (center)
const move1 = makeMove(4, "X");
assert.strictEqual(move1.success, true);
assert.strictEqual(move1.board[4], "X");
assert.strictEqual(isLegalMove(4), false, "Occupied cell must be illegal");
assert.strictEqual(getCurrentPlayer(), "O", "Turn alternates to O");
console.log("✓ Legal moves and turn alternation verified");

// 3. Win / Draw Validation for all 8 triplets
console.log("\n3. Testing Win & Draw Validation (8 triplets)...");
WINNING_COMBINATIONS.forEach(([a, b, c], idx) => {
  const testBoard = ["", "", "", "", "", "", "", "", ""];
  testBoard[a] = "X";
  testBoard[b] = "X";
  testBoard[c] = "X";
  const result = checkWinOrDraw(testBoard);
  assert.deepStrictEqual(result, { winner: "X", line: [a, b, c] }, `Failed on triplet ${idx}: [${a}, ${b}, ${c}]`);
});
console.log("✓ All 8 winning triplets correctly detected for X");

WINNING_COMBINATIONS.forEach(([a, b, c], idx) => {
  const testBoard = ["", "", "", "", "", "", "", "", ""];
  testBoard[a] = "O";
  testBoard[b] = "O";
  testBoard[c] = "O";
  const result = checkWinOrDraw(testBoard);
  assert.deepStrictEqual(result, { winner: "O", line: [a, b, c] }, `Failed on triplet ${idx}: [${a}, ${b}, ${c}]`);
});
console.log("✓ All 8 winning triplets correctly detected for O");

// Draw test
const drawBoard = [
  "X", "O", "X",
  "X", "O", "O",
  "O", "X", "X"
];
assert.deepStrictEqual(checkWinOrDraw(drawBoard), { winner: "draw" });
console.log("✓ Draw state correctly identified");

// 4. Minimax Scoring & Decision Making
console.log("\n4. Testing Minimax Depth-Weighted Scoring & Decisions...");

// Depth test: Immediate win (depth 0) vs later win
// If O has immediate win at index 2:
const winInOne = [
  "O", "O", "",
  "X", "X", "",
  "",  "",  ""
];
const bestMoveForO = getBestMove(winInOne);
assert.strictEqual(bestMoveForO, 2, "AI must take immediate winning move at index 2");

// Immediate block: Human X threatens at 2:
const blockHuman = [
  "X", "X", "",
  "O", "",  "",
  "",  "",  ""
];
const blockMove = getBestMove(blockHuman);
assert.strictEqual(blockMove, 2, "AI must block human at index 2");
console.log("✓ AI successfully takes immediate wins and blocks threats");

// Terminal scoring check
assert.strictEqual(minimax(["O", "O", "O", "", "", "", "", "", ""], 2, false), 8, "AI win at depth 2 = 10 - 2 = 8");
assert.strictEqual(minimax(["X", "X", "X", "", "", "", "", "", ""], 3, true), -7, "Human win at depth 3 = 3 - 10 = -7");
assert.strictEqual(minimax(drawBoard, 5, true), 0, "Draw score = 0");
console.log("✓ Depth-weighted terminal scores verified (+10 - depth, depth - 10, 0)");

// 5. Unbeatable AI Simulation (Impossible Mode)
console.log("\n5. Testing Impossible Mode (AI must NEVER lose)...");
let humanSimWins = 0;
let aiSimWins = 0;
let drawCount = 0;

for (let g = 0; g < 200; g++) {
  let simBoard = ["", "", "", "", "", "", "", "", ""];
  let active = true;
  let turn = "X";

  while (active) {
    const outcome = checkWinOrDraw(simBoard);
    if (outcome) {
      if (outcome.winner === "X") humanSimWins++;
      else if (outcome.winner === "O") aiSimWins++;
      else drawCount++;
      active = false;
      break;
    }

    if (turn === "X") {
      // Human plays random moves
      const empties = getAvailableMoves(simBoard);
      const move = empties[Math.floor(Math.random() * empties.length)];
      simBoard[move] = "X";
      turn = "O";
    } else {
      // AI plays Impossible Mode
      const move = getAIMove(simBoard, "impossible");
      simBoard[move] = "O";
      turn = "X";
    }
  }
}
assert.strictEqual(humanSimWins, 0, "AI must NEVER lose in impossible mode!");
console.log(`✓ 200 simulated games in Impossible mode: AI Wins = ${aiSimWins}, Draws = ${drawCount}, Human Wins = ${humanSimWins} (0 Losses)`);

// 6. Casual/Cute Mode (70% minimax + 30% random)
console.log("\n6. Testing Casual/Cute Mode...");
let randomMoveCount = 0;
// Test over board where optimal move is unique
const testDiffBoard = [
  "X", "X", "",
  "O", "",  "",
  "",  "",  ""
]; // Optimal move is 2
const samples = 1000;
let move2Count = 0;
for (let i = 0; i < samples; i++) {
  const m = getAIMove(testDiffBoard, "casual");
  if (m === 2) move2Count++;
}
// Best move is 2. 70% of the time it chooses 2 via minimax.
// 30% of the time it chooses randomly among 6 available moves (which includes 2 with 1/6 chance).
// Expected frequency of 2: 70% + 30% * (1/6) = 75%.
// Move 2 should be between 65% and 85%.
const ratio = move2Count / samples;
console.log(`✓ Casual mode frequency of optimal move in test position: ${(ratio * 100).toFixed(1)}% (expected ~75%)`);
assert.ok(ratio > 0.65 && ratio < 0.85, "Casual mode should exhibit ~70% optimal behavior");

// 7. Full Game Integration & Scores via game.js
console.log("\n7. Testing UI Integration & Scores (playRound & makeMove)...");
resetGame(true);
setDifficulty("impossible");

// Play a full game using playRound
const round1 = playRound(0); // Human plays 0, AI responds
assert.strictEqual(round1.humanMove.success, true);
assert.strictEqual(round1.aiMove.success, true);
assert.strictEqual(round1.humanMove.player, "X");
assert.strictEqual(round1.aiMove.player, "O");

// Let's reset and test a complete round ending in AI win or draw
resetBoard();
// Human plays badly: 1, then 3, then 8
playRound(1);
playRound(3);
playRound(8);

const currentScores = getScores();
console.log("✓ Scores updated appropriately:", currentScores);
assert.strictEqual(currentScores.win, 0, "Human should have 0 wins vs impossible AI");

// Test score reset
resetScores();
assert.deepStrictEqual(getScores(), { win: 0, loss: 0, draw: 0 });
console.log("✓ resetScores() successfully clears tally");

console.log("\n=========================================");
console.log("ALL TESTS PASSED SUCCESSFULLY! (100%)");
console.log("=========================================\n");
