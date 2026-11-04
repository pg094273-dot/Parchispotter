import {
  HouseId,
  HOUSES,
  SAFE_TILES,
  Player,
  Token,
  DiceState,
  MoveOption,
  GameSettings
} from '../types/parchis';

export function getStepsToCorridorEntry(house: HouseId, currentPos: number): number {
  const entry = HOUSES[house].corridorEntryTile;
  if (entry === 68) {
    // Entrance is 68 (wraps around to corridor)
    return 68 - currentPos;
  }
  if (currentPos > entry) {
    return (68 - currentPos) + entry;
  }
  return entry - currentPos;
}

// Check if a tile has a barrier (2 tokens of the SAME house)
export function hasBarrier(
  tileNumber: number,
  allPlayers: Player[],
  excludeHouse?: HouseId,
  excludeTokenId?: number
): boolean {
  const tokensOnTile: Token[] = [];
  for (const player of allPlayers) {
    for (const token of player.tokens) {
      if (
        token.state === 'board' &&
        token.position === tileNumber &&
        !(token.house === excludeHouse && token.id === excludeTokenId)
      ) {
        tokensOnTile.push(token);
      }
    }
  }
  if (tokensOnTile.length >= 2) {
    // If both belong to the same house, it's a barrier
    if (tokensOnTile[0].house === tokensOnTile[1].house) {
      return true;
    }
  }
  return false;
}

// Get tokens occupying a specific board tile
export function getTokensAtTile(tileNumber: number, allPlayers: Player[]): Token[] {
  const result: Token[] = [];
  for (const p of allPlayers) {
    for (const t of p.tokens) {
      if (t.state === 'board' && t.position === tileNumber) {
        result.push(t);
      }
    }
  }
  return result;
}

// Calculate all legal moves for the current player given the dice
export function getLegalMoves(
  player: Player,
  dice: DiceState,
  allPlayers: Player[],
  settings: GameSettings
): MoveOption[] {
  const moves: MoveOption[] = [];

  // Determine active die values to consider
  let valuesToTry: { value: number; index: number }[] = [];

  if (dice.pendingBonus !== null) {
    // A bonus of 20 or 10 is active
    valuesToTry = [{ value: dice.pendingBonus, index: -1 }];
  } else {
    dice.values.forEach((val, idx) => {
      if (!dice.used[idx]) {
        valuesToTry.push({ value: val, index: idx });
      }
    });
  }

  if (valuesToTry.length === 0) return [];

  // In 2-dice mode with both dice unused, we can also test if the sum can be used to move a single piece
  const canUseSum =
    dice.pendingBonus === null &&
    dice.count === 2 &&
    dice.values.length === 2 &&
    !dice.used[0] &&
    !dice.used[1];

  for (const { value: dieValue, index: dieIndex } of valuesToTry) {
    for (const token of player.tokens) {
      // CASE 1: Token is at home
      if (token.state === 'home') {
        // Can only exit with 5 (or if bonus is 5, but bonus is 20/10)
        // In 1-die or 2-dice mode, if dieValue is 5
        const exitTile = HOUSES[player.house].exitTile;
        const tokensOnExit = getTokensAtTile(exitTile, allPlayers);
        
        const canExit = dieValue === 5;
        if (canExit) {
          // Check if exit tile has 2 tokens of the SAME house (barrier)
          const exitHasBarrier = hasBarrier(exitTile, allPlayers);
          if (!exitHasBarrier && tokensOnExit.length < 2) {
            // Check if there is an opponent to capture on exit
            let isCapture = false;
            let capturedToken: { house: HouseId; tokenId: number } | undefined;
            
            if (tokensOnExit.length === 1 && tokensOnExit[0].house !== player.house) {
              isCapture = true;
              capturedToken = { house: tokensOnExit[0].house, tokenId: tokensOnExit[0].id };
            }

            moves.push({
              tokenId: token.id,
              dieValue,
              dieIndex,
              fromState: 'home',
              fromPosition: token.position,
              toState: 'board',
              toPosition: exitTile,
              isCapture,
              capturedToken,
              isEnteringGoal: false
            });
          }
        }
        continue;
      }

      // CASE 2: Token is on main board
      if (token.state === 'board') {
        const stepsToCorridor = getStepsToCorridorEntry(player.house, token.position);

        if (dieValue <= stepsToCorridor) {
          // Token stays on main board
          // Check for any barriers along the intermediate path
          let pathBlocked = false;
          for (let step = 1; step <= dieValue; step++) {
            const intermediateTile = ((token.position - 1 + step) % 68) + 1;
            // If barrier exists on this tile, cannot jump over or land on it
            if (hasBarrier(intermediateTile, allPlayers, player.house, token.id)) {
              pathBlocked = true;
              break;
            }
          }

          if (!pathBlocked) {
            const targetTile = ((token.position - 1 + dieValue) % 68) + 1;
            const tokensOnTarget = getTokensAtTile(targetTile, allPlayers).filter(
              t => !(t.house === player.house && t.id === token.id)
            );

            // Cannot land if 2 tokens already present
            if (tokensOnTarget.length < 2) {
              let isCapture = false;
              let capturedToken: { house: HouseId; tokenId: number } | undefined;

              // Check for capture: 1 opponent token and target is NOT safe
              const isSafe = SAFE_TILES.includes(targetTile);
              if (!isSafe && tokensOnTarget.length === 1 && tokensOnTarget[0].house !== player.house) {
                isCapture = true;
                capturedToken = { house: tokensOnTarget[0].house, tokenId: tokensOnTarget[0].id };
              }

              moves.push({
                tokenId: token.id,
                dieValue,
                dieIndex,
                fromState: 'board',
                fromPosition: token.position,
                toState: 'board',
                toPosition: targetTile,
                isCapture,
                capturedToken,
                isEnteringGoal: false
              });
            }
          }
        } else {
          // Token enters corridor!
          // Intermediate check: check track up to corridor entrance for barriers
          let pathBlocked = false;
          for (let step = 1; step <= stepsToCorridor; step++) {
            const intermediateTile = ((token.position - 1 + step) % 68) + 1;
            if (hasBarrier(intermediateTile, allPlayers, player.house, token.id)) {
              pathBlocked = true;
              break;
            }
          }

          if (!pathBlocked) {
            const remainingSteps = dieValue - stepsToCorridor;
            if (remainingSteps <= 7) {
              // Enters corridor tile (1..7)
              moves.push({
                tokenId: token.id,
                dieValue,
                dieIndex,
                fromState: 'board',
                fromPosition: token.position,
                toState: 'corridor',
                toPosition: remainingSteps,
                isCapture: false,
                isEnteringGoal: false
              });
            } else if (remainingSteps === 8) {
              // Enters Hogwarts goal (8)!
              moves.push({
                tokenId: token.id,
                dieValue,
                dieIndex,
                fromState: 'board',
                fromPosition: token.position,
                toState: 'goal',
                toPosition: 8,
                isCapture: false,
                isEnteringGoal: true
              });
            } else if (remainingSteps > 8) {
              // Overshooting goal: standard Spanish parchis bounce back
              const bouncedPos = 16 - remainingSteps;
              if (bouncedPos >= 1 && bouncedPos <= 7) {
                moves.push({
                  tokenId: token.id,
                  dieValue,
                  dieIndex,
                  fromState: 'board',
                  fromPosition: token.position,
                  toState: 'corridor',
                  toPosition: bouncedPos,
                  isCapture: false,
                  isEnteringGoal: false
                });
              }
            }
          }
        }
        continue;
      }

      // CASE 3: Token is in corridor (1..7)
      if (token.state === 'corridor') {
        const nextPos = token.position + dieValue;
        if (nextPos <= 7) {
          moves.push({
            tokenId: token.id,
            dieValue,
            dieIndex,
            fromState: 'corridor',
            fromPosition: token.position,
            toState: 'corridor',
            toPosition: nextPos,
            isCapture: false,
            isEnteringGoal: false
          });
        } else if (nextPos === 8) {
          moves.push({
            tokenId: token.id,
            dieValue,
            dieIndex,
            fromState: 'corridor',
            fromPosition: token.position,
            toState: 'goal',
            toPosition: 8,
            isCapture: false,
            isEnteringGoal: true
          });
        } else if (nextPos > 8) {
          // Bounce back
          const bouncedPos = 16 - nextPos;
          if (bouncedPos >= 1 && bouncedPos <= 7) {
            moves.push({
              tokenId: token.id,
              dieValue,
              dieIndex,
              fromState: 'corridor',
              fromPosition: token.position,
              toState: 'corridor',
              toPosition: bouncedPos,
              isCapture: false,
              isEnteringGoal: false
            });
          }
        }
      }
    }
  }

  // Also check if in 2-dice mode with sum=5 to take out of home
  if (canUseSum) {
    const sum = dice.values[0] + dice.values[1];
    if (sum === 5) {
      const exitTile = HOUSES[player.house].exitTile;
      const tokensOnExit = getTokensAtTile(exitTile, allPlayers);
      const homeTokens = player.tokens.filter(t => t.state === 'home');
      if (homeTokens.length > 0 && !hasBarrier(exitTile, allPlayers) && tokensOnExit.length < 2) {
        const isCapture = tokensOnExit.length === 1 && tokensOnExit[0].house !== player.house;
        moves.push({
          tokenId: homeTokens[0].id,
          dieValue: 5,
          dieIndex: 99, // special index denoting combined dice
          fromState: 'home',
          fromPosition: homeTokens[0].position,
          toState: 'board',
          toPosition: exitTile,
          isCapture,
          capturedToken: isCapture ? { house: tokensOnExit[0].house, tokenId: tokensOnExit[0].id } : undefined,
          isEnteringGoal: false
        });
      }
    }
  }

  return moves;
}

// Check if a player has won (all 4 tokens in goal)
export function checkWinner(player: Player): boolean {
  return player.tokens.every(t => t.state === 'goal');
}
