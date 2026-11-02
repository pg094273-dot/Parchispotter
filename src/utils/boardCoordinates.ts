import { HouseId } from '../types/parchis';

export interface BoardPoint {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number; // In degrees, for orientation of tile
  label?: string;
  isSafe?: boolean;
  isExit?: boolean;
  house?: HouseId;
}

// Board is mapped on a 1000 x 1000 canvas
// Corners are 380 x 380
// Center is 240 x 240 (x: 380 to 620, y: 380 to 620)
// Arms: width 240, length 380. Divided into 3 tracks: width 80 each (center is corridor)
// Along the length (380): 8 tiles of approx 47.5 px each

const BOARD_SIZE = 1000;
const CORNER_SIZE = 380;
const CENTER_SIZE = 240;
const TRACK_WIDTH = CENTER_SIZE / 3; // 80
const NUM_TILES_PER_ARM = 8;
const TILE_LENGTH = CORNER_SIZE / NUM_TILES_PER_ARM; // 47.5

export function getTileCoordinates(): Record<number, BoardPoint> {
  const coords: Record<number, BoardPoint> = {};

  // Helper to place coordinates with safe and exit flags
  const safeTiles = new Set([5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68]);

  // LEFT ARM - Top row: tiles 68 (corner transition) and 1 to 4 (going right-to-left towards corner)
  // Let's accurately map Spanish Parchis clockwise 1..68:
  // Tile 68 is right next to center at x: 380 - TILE_LENGTH/2, y: 380 + TRACK_WIDTH/2 (corridor entry is middle row)
  // Let's systematically define the 4 sections:
  
  // SECTION 1: Tiles 1 to 17 (Gryffindor exit 5, turn at top-left corner, down to top-center)
  // Left arm, top row (y = CORNER_SIZE - TRACK_WIDTH/2 = 340):
  // Tile 1 is at x = 380 - 0.5 * TILE_LENGTH, y = 340
  // Going left: 1, 2, 3, 4, 5 (Exit!), 6, 7, 8 (corner edge)
  for (let i = 0; i < 8; i++) {
    const tileNum = i + 1;
    const x = CORNER_SIZE - (i + 0.5) * TILE_LENGTH;
    const y = CORNER_SIZE - TRACK_WIDTH / 2;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: tileNum === 5,
      house: tileNum === 5 ? 'gryffindor' : undefined
    };
  }

  // Top arm, left column (x = CORNER_SIZE + TRACK_WIDTH/2 = 420):
  // Going up from corner: 9, 10, 11, 12 (safe), 13, 14, 15, 16, 17 (Safe & Slytherin entrance)
  // Wait, let's count tiles: from corner 8, turning corner to 9:
  // Going up to the top edge:
  for (let i = 0; i < 8; i++) {
    const tileNum = 9 + i; // 9 to 16
    const x = CORNER_SIZE + TRACK_WIDTH / 2;
    const y = CORNER_SIZE - (i + 0.5) * TILE_LENGTH;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: false
    };
  }
  // Tile 17 is at top end, left side of top-end turn
  coords[17] = {
    x: CORNER_SIZE + TRACK_WIDTH / 2,
    y: 0 + TILE_LENGTH * 0.3,
    isSafe: true,
    house: 'slytherin'
  };

  // Top arm, top end turn & right column:
  // Tile 18 is at the top center/right turn
  coords[18] = {
    x: CORNER_SIZE + TRACK_WIDTH * 1.5,
    y: 0 + TILE_LENGTH * 0.3,
    isSafe: false
  };

  // Going down right column of top arm (x = CORNER_SIZE + TRACK_WIDTH * 2.5 = 580):
  // 19, 20, 21, 22 (Slytherin Exit), 23, 24, 25 (approaching top-right corner)
  for (let i = 0; i < 7; i++) {
    const tileNum = 19 + i; // 19 to 25
    const x = CORNER_SIZE + TRACK_WIDTH * 2.5;
    const y = 0 + (i + 1) * TILE_LENGTH;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: tileNum === 22,
      house: tileNum === 22 ? 'slytherin' : undefined
    };
  }

  // Right arm, top row (y = CORNER_SIZE + TRACK_WIDTH / 2 = 420):
  // Going right: 26, 27, 28, 29 (safe), 30, 31, 32, 33, 34 (Safe & Ravenclaw entrance)
  for (let i = 0; i < 8; i++) {
    const tileNum = 26 + i; // 26 to 33
    const x = CORNER_SIZE + CENTER_SIZE + (i + 0.5) * TILE_LENGTH;
    const y = CORNER_SIZE + TRACK_WIDTH / 2;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: false
    };
  }
  coords[34] = {
    x: 1000 - TILE_LENGTH * 0.3,
    y: CORNER_SIZE + TRACK_WIDTH / 2,
    isSafe: true,
    house: 'ravenclaw'
  };

  // Tile 35 is at right end turn
  coords[35] = {
    x: 1000 - TILE_LENGTH * 0.3,
    y: CORNER_SIZE + TRACK_WIDTH * 1.5,
    isSafe: false
  };

  // Going left along bottom row of right arm (y = CORNER_SIZE + TRACK_WIDTH * 2.5 = 580):
  // 36, 37, 38, 39 (Ravenclaw exit), 40, 41, 42
  for (let i = 0; i < 7; i++) {
    const tileNum = 36 + i; // 36 to 42
    const x = 1000 - (i + 1) * TILE_LENGTH;
    const y = CORNER_SIZE + TRACK_WIDTH * 2.5;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: tileNum === 39,
      house: tileNum === 39 ? 'ravenclaw' : undefined
    };
  }

  // Bottom arm, right column (x = CORNER_SIZE + TRACK_WIDTH * 2.5 = 580):
  // Going down: 43, 44, 45, 46 (safe), 47, 48, 49, 50, 51 (Safe & Hufflepuff entrance)
  for (let i = 0; i < 8; i++) {
    const tileNum = 43 + i; // 43 to 50
    const x = CORNER_SIZE + TRACK_WIDTH * 2.5;
    const y = CORNER_SIZE + CENTER_SIZE + (i + 0.5) * TILE_LENGTH;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: false
    };
  }
  coords[51] = {
    x: CORNER_SIZE + TRACK_WIDTH * 2.5,
    y: 1000 - TILE_LENGTH * 0.3,
    isSafe: true,
    house: 'hufflepuff'
  };

  // Tile 52 is at bottom end turn
  coords[52] = {
    x: CORNER_SIZE + TRACK_WIDTH * 1.5,
    y: 1000 - TILE_LENGTH * 0.3,
    isSafe: false
  };

  // Going up along left column of bottom arm (x = CORNER_SIZE + TRACK_WIDTH / 2 = 420):
  // 53, 54, 55, 56 (Hufflepuff exit), 57, 58, 59
  for (let i = 0; i < 7; i++) {
    const tileNum = 53 + i; // 53 to 59
    const x = CORNER_SIZE + TRACK_WIDTH / 2;
    const y = 1000 - (i + 1) * TILE_LENGTH;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: tileNum === 56,
      house: tileNum === 56 ? 'hufflepuff' : undefined
    };
  }

  // Left arm, bottom row (y = CORNER_SIZE + TRACK_WIDTH * 2.5 = 580):
  // Going left: 60, 61, 62, 63 (safe), 64, 65, 66, 67, 68 (Safe & Gryffindor entrance)
  for (let i = 0; i < 8; i++) {
    const tileNum = 60 + i; // 60 to 67
    const x = CORNER_SIZE - (i + 0.5) * TILE_LENGTH;
    const y = CORNER_SIZE + TRACK_WIDTH * 2.5;
    coords[tileNum] = {
      x,
      y,
      isSafe: safeTiles.has(tileNum),
      isExit: false
    };
  }
  coords[68] = {
    x: 0 + TILE_LENGTH * 0.3,
    y: CORNER_SIZE + TRACK_WIDTH * 2.5,
    isSafe: true,
    house: 'gryffindor'
  };

  return coords;
}

// Corridors: 7 steps leading to Hogwarts center (position 1..7, and 8 is goal)
export function getCorridorCoordinates(): Record<HouseId, BoardPoint[]> {
  const corridors: Record<HouseId, BoardPoint[]> = {
    gryffindor: [],
    slytherin: [],
    ravenclaw: [],
    hufflepuff: []
  };

  // Gryffindor corridor: in left arm, middle row (y = CORNER_SIZE + TRACK_WIDTH * 1.5 = 500)
  // Starts from left (x = ~30) moving right towards center (x = 380)
  for (let i = 1; i <= 7; i++) {
    corridors.gryffindor.push({
      x: 30 + (i * (CORNER_SIZE - 40) / 7.5),
      y: CORNER_SIZE + TRACK_WIDTH * 1.5,
      house: 'gryffindor',
      label: `${i}`
    });
  }

  // Slytherin corridor: in top arm, middle column (x = CORNER_SIZE + TRACK_WIDTH * 1.5 = 500)
  // Starts from top (y = ~30) moving down towards center (y = 380)
  for (let i = 1; i <= 7; i++) {
    corridors.slytherin.push({
      x: CORNER_SIZE + TRACK_WIDTH * 1.5,
      y: 30 + (i * (CORNER_SIZE - 40) / 7.5),
      house: 'slytherin',
      label: `${i}`
    });
  }

  // Ravenclaw corridor: in right arm, middle row (y = CORNER_SIZE + TRACK_WIDTH * 1.5 = 500)
  // Starts from right (x = ~970) moving left towards center (x = 620)
  for (let i = 1; i <= 7; i++) {
    corridors.ravenclaw.push({
      x: 970 - (i * (CORNER_SIZE - 40) / 7.5),
      y: CORNER_SIZE + TRACK_WIDTH * 1.5,
      house: 'ravenclaw',
      label: `${i}`
    });
  }

  // Hufflepuff corridor: in bottom arm, middle column (x = CORNER_SIZE + TRACK_WIDTH * 1.5 = 500)
  // Starts from bottom (y = ~970) moving up towards center (y = 620)
  for (let i = 1; i <= 7; i++) {
    corridors.hufflepuff.push({
      x: CORNER_SIZE + TRACK_WIDTH * 1.5,
      y: 970 - (i * (CORNER_SIZE - 40) / 7.5),
      house: 'hufflepuff',
      label: `${i}`
    });
  }

  return corridors;
}

// 4 Corner House bases (each has 4 token slots inside its courtyard)
export function getHomeBases(): Record<HouseId, { center: BoardPoint; tokenSlots: BoardPoint[] }> {
  return {
    gryffindor: {
      center: { x: 190, y: 190 },
      tokenSlots: [
        { x: 140, y: 140 },
        { x: 240, y: 140 },
        { x: 140, y: 240 },
        { x: 240, y: 240 }
      ]
    },
    slytherin: {
      center: { x: 810, y: 190 },
      tokenSlots: [
        { x: 760, y: 140 },
        { x: 860, y: 140 },
        { x: 760, y: 240 },
        { x: 860, y: 240 }
      ]
    },
    ravenclaw: {
      center: { x: 810, y: 810 },
      tokenSlots: [
        { x: 760, y: 760 },
        { x: 860, y: 760 },
        { x: 760, y: 860 },
        { x: 860, y: 860 }
      ]
    },
    hufflepuff: {
      center: { x: 190, y: 810 },
      tokenSlots: [
        { x: 140, y: 760 },
        { x: 240, y: 760 },
        { x: 140, y: 860 },
        { x: 240, y: 860 }
      ]
    }
  };
}

// Hogwarts center destination (position 8 for finished pieces)
export function getGoalDestinations(): Record<HouseId, BoardPoint> {
  return {
    gryffindor: { x: 440, y: 500 },
    slytherin: { x: 500, y: 440 },
    ravenclaw: { x: 560, y: 500 },
    hufflepuff: { x: 500, y: 560 }
  };
}
