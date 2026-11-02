import { Player, MoveOption, SAFE_TILES } from '../types/parchis';

export function selectBestBotMove(
  player: Player,
  legalMoves: MoveOption[],
  allPlayers: Player[]
): MoveOption | null {
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  // Score each candidate move
  const scored = legalMoves.map(move => {
    let score = 0;

    // 1. Entering Goal is highest priority (+1000)
    if (move.isEnteringGoal) {
      score += 1000;
    }

    // 2. Capturing an enemy is second highest priority (+800)
    if (move.isCapture) {
      score += 800;
    }

    // 3. Leaving home is very high priority (+500)
    if (move.fromState === 'home') {
      score += 500;
    }

    // 4. Moving into corridor (safe from all attacks) (+300)
    if (move.toState === 'corridor') {
      score += 300 + move.toPosition * 10;
    }

    // 5. Landing on a safe tile (+200)
    if (move.toState === 'board' && SAFE_TILES.includes(move.toPosition)) {
      score += 200;
    }

    // 6. Prefer moving pieces further ahead to advance game
    if (move.toState === 'board') {
      score += move.dieValue * 5;
    }

    // Add slight random spice (+- 15) so bots don't always pick identically
    score += (Math.random() - 0.5) * 30;

    return { move, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}
