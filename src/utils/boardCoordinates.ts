import { HouseId } from '../types/parchis';

export interface BoardTileGeom {
  num: number;
  x: number;       // cell top-left x
  y: number;       // cell top-left y
  w: number;       // cell width
  h: number;       // cell height
  cx: number;      // token center x
  cy: number;      // token center y
  isSafe: boolean;
  isExit: boolean;
  house?: HouseId;
  label?: string;
}

export interface BoardPoint {
  x: number;
  y: number;
  isSafe?: boolean;
  isExit?: boolean;
  house?: HouseId;
  label?: string;
}

// 1000 x 1000 coordinate system
const CORNER = 380;
const CENTER_SIZE = 240;
const TRACK_W = CENTER_SIZE / 3; // 80
const STEP_LEN = CORNER / 8;     // 47.5

export function getBoardTiles(): Record<number, BoardTileGeom> {
  const tiles: Record<number, BoardTileGeom> = {};
  const safeSet = new Set([5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68]);

  // Helper to create tile geometry
  const addTile = (
    num: number,
    x: number,
    y: number,
    w: number,
    h: number,
    isExit: boolean = false,
    house?: HouseId
  ) => {
    tiles[num] = {
      num,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
      isSafe: safeSet.has(num),
      isExit,
      house
    };
  };

  // 1. TOP ARM - LEFT COLUMN (x: 380, width: 80). Going top to bottom: 1..8
  for (let i = 0; i < 8; i++) {
    const num = i + 1;
    const x = CORNER;
    const y = i * STEP_LEN;
    const isExit = num === 5;
    addTile(num, x, y, TRACK_W, STEP_LEN, isExit, isExit ? 'hufflepuff' : undefined);
  }

  // 2. LEFT ARM - TOP ROW (y: 380, height: 80). Going right to left: 9..16
  for (let i = 0; i < 8; i++) {
    const num = 9 + i;
    const x = CORNER - (i + 1) * STEP_LEN;
    const y = CORNER;
    addTile(num, x, y, STEP_LEN, TRACK_W, false);
  }

  // 3. Tile 17 (Left outer turn & Ravenclaw entry): x: 0, y: 460
  tiles[17] = {
    num: 17,
    x: 0,
    y: CORNER + TRACK_W,
    w: STEP_LEN,
    h: TRACK_W,
    cx: STEP_LEN / 2,
    cy: CORNER + TRACK_W + TRACK_W / 2,
    isSafe: true,
    isExit: false,
    house: 'ravenclaw'
  };

  // 4. LEFT ARM - BOTTOM ROW (y: 540, height: 80). Going left to right: 18..25
  for (let i = 0; i < 8; i++) {
    const num = 18 + i;
    const x = i * STEP_LEN;
    const y = CORNER + 2 * TRACK_W;
    const isExit = num === 22;
    addTile(num, x, y, STEP_LEN, TRACK_W, isExit, isExit ? 'ravenclaw' : undefined);
  }

  // 5. BOTTOM ARM - LEFT COLUMN (x: 380, width: 80). Going top to bottom: 26..33
  for (let i = 0; i < 8; i++) {
    const num = 26 + i;
    const x = CORNER;
    const y = CORNER + CENTER_SIZE + i * STEP_LEN;
    addTile(num, x, y, TRACK_W, STEP_LEN, false);
  }

  // 6. Tile 34 (Bottom outer turn & Gryffindor entry): x: 460, y: 952.5
  tiles[34] = {
    num: 34,
    x: CORNER + TRACK_W,
    y: 1000 - STEP_LEN,
    w: TRACK_W,
    h: STEP_LEN,
    cx: CORNER + TRACK_W + TRACK_W / 2,
    cy: 1000 - STEP_LEN / 2,
    isSafe: true,
    isExit: false,
    house: 'gryffindor'
  };

  // 7. BOTTOM ARM - RIGHT COLUMN (x: 540, width: 80). Going bottom to top: 35..42
  for (let i = 0; i < 8; i++) {
    const num = 35 + i;
    const x = CORNER + 2 * TRACK_W;
    const y = 1000 - (i + 1) * STEP_LEN;
    const isExit = num === 39;
    addTile(num, x, y, TRACK_W, STEP_LEN, isExit, isExit ? 'gryffindor' : undefined);
  }

  // 8. RIGHT ARM - BOTTOM ROW (y: 540, height: 80). Going left to right: 43..50
  for (let i = 0; i < 8; i++) {
    const num = 43 + i;
    const x = CORNER + CENTER_SIZE + i * STEP_LEN;
    const y = CORNER + 2 * TRACK_W;
    addTile(num, x, y, STEP_LEN, TRACK_W, false);
  }

  // 9. Tile 51 (Right outer turn & Slytherin entry): x: 952.5, y: 460
  tiles[51] = {
    num: 51,
    x: 1000 - STEP_LEN,
    y: CORNER + TRACK_W,
    w: STEP_LEN,
    h: TRACK_W,
    cx: 1000 - STEP_LEN / 2,
    cy: CORNER + TRACK_W + TRACK_W / 2,
    isSafe: true,
    isExit: false,
    house: 'slytherin'
  };

  // 10. RIGHT ARM - TOP ROW (y: 380, height: 80). Going right to left: 52..59
  for (let i = 0; i < 8; i++) {
    const num = 52 + i;
    const x = 1000 - (i + 1) * STEP_LEN;
    const y = CORNER;
    const isExit = num === 56;
    addTile(num, x, y, STEP_LEN, TRACK_W, isExit, isExit ? 'slytherin' : undefined);
  }

  // 11. TOP ARM - RIGHT COLUMN (x: 540, width: 80). Going bottom to top: 60..67
  for (let i = 0; i < 8; i++) {
    const num = 60 + i;
    const x = CORNER + 2 * TRACK_W;
    const y = CORNER - (i + 1) * STEP_LEN;
    addTile(num, x, y, TRACK_W, STEP_LEN, false);
  }

  // 12. Tile 68 (Top outer turn & Hufflepuff entry): x: 460, y: 0
  tiles[68] = {
    num: 68,
    x: CORNER + TRACK_W,
    y: 0,
    w: TRACK_W,
    h: STEP_LEN,
    cx: CORNER + TRACK_W + TRACK_W / 2,
    cy: STEP_LEN / 2,
    isSafe: true,
    isExit: false,
    house: 'hufflepuff'
  };

  return tiles;
}

// Convert for backwards-compatibility or point retrieval
export function getTileCoordinates(): Record<number, BoardPoint> {
  const geoms = getBoardTiles();
  const res: Record<number, BoardPoint> = {};
  for (const [k, g] of Object.entries(geoms)) {
    res[parseInt(k, 10)] = {
      x: g.cx,
      y: g.cy,
      isSafe: g.isSafe,
      isExit: g.isExit,
      house: g.house
    };
  }
  return res;
}

export interface CorridorCellGeom {
  step: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  house: HouseId;
}

// 7 Corridor tiles for each house leading towards the center
export function getCorridorGeometries(): Record<HouseId, CorridorCellGeom[]> {
  const corridors: Record<HouseId, CorridorCellGeom[]> = {
    gryffindor: [],
    slytherin: [],
    ravenclaw: [],
    hufflepuff: []
  };

  const corrStep = CORNER / 7.2;

  // Hufflepuff corridor: in Top arm middle column (x: 460, width 80), steps from y: 0..380 moving down
  for (let i = 1; i <= 7; i++) {
    const x = CORNER + TRACK_W;
    const y = (i - 1) * corrStep + 10;
    const w = TRACK_W;
    const h = corrStep - 4;
    corridors.hufflepuff.push({
      step: i,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
      house: 'hufflepuff'
    });
  }

  // Ravenclaw corridor: in Left arm middle row (y: 460, height 80), steps from x: 0..380 moving right
  for (let i = 1; i <= 7; i++) {
    const x = (i - 1) * corrStep + 10;
    const y = CORNER + TRACK_W;
    const w = corrStep - 4;
    const h = TRACK_W;
    corridors.ravenclaw.push({
      step: i,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
      house: 'ravenclaw'
    });
  }

  // Gryffindor corridor: in Bottom arm middle column (x: 460, width 80), steps from y: 1000..620 moving up
  for (let i = 1; i <= 7; i++) {
    const x = CORNER + TRACK_W;
    const y = 1000 - i * corrStep - 6;
    const w = TRACK_W;
    const h = corrStep - 4;
    corridors.gryffindor.push({
      step: i,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
      house: 'gryffindor'
    });
  }

  // Slytherin corridor: in Right arm middle row (y: 460, height 80), steps from x: 1000..620 moving left
  for (let i = 1; i <= 7; i++) {
    const x = 1000 - i * corrStep - 6;
    const y = CORNER + TRACK_W;
    const w = corrStep - 4;
    const h = TRACK_W;
    corridors.slytherin.push({
      step: i,
      x,
      y,
      w,
      h,
      cx: x + w / 2,
      cy: y + h / 2,
      house: 'slytherin'
    });
  }

  return corridors;
}

export function getCorridorCoordinates(): Record<HouseId, BoardPoint[]> {
  const geoms = getCorridorGeometries();
  const res: Record<HouseId, BoardPoint[]> = {
    gryffindor: [],
    slytherin: [],
    ravenclaw: [],
    hufflepuff: []
  };
  for (const h of ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'] as HouseId[]) {
    res[h] = geoms[h].map(g => ({
      x: g.cx,
      y: g.cy,
      house: h,
      label: `${g.step}`
    }));
  }
  return res;
}

// 4 Corner House bases (matching classic board photo: Top-Left: Hufflepuff, Top-Right: Slytherin, Bottom-Left: Ravenclaw, Bottom-Right: Gryffindor)
export function getHomeBases(): Record<HouseId, { center: BoardPoint; tokenSlots: BoardPoint[] }> {
  return {
    hufflepuff: {
      center: { x: 190, y: 190 },
      tokenSlots: [
        { x: 130, y: 130 },
        { x: 250, y: 130 },
        { x: 130, y: 250 },
        { x: 250, y: 250 }
      ]
    },
    slytherin: {
      center: { x: 810, y: 190 },
      tokenSlots: [
        { x: 750, y: 130 },
        { x: 870, y: 130 },
        { x: 750, y: 250 },
        { x: 870, y: 250 }
      ]
    },
    ravenclaw: {
      center: { x: 190, y: 810 },
      tokenSlots: [
        { x: 130, y: 750 },
        { x: 250, y: 750 },
        { x: 130, y: 870 },
        { x: 250, y: 870 }
      ]
    },
    gryffindor: {
      center: { x: 810, y: 810 },
      tokenSlots: [
        { x: 750, y: 750 },
        { x: 870, y: 750 },
        { x: 750, y: 870 },
        { x: 870, y: 870 }
      ]
    }
  };
}

// Hogwarts center destination (position 8 for finished pieces)
export function getGoalDestinations(): Record<HouseId, BoardPoint> {
  return {
    hufflepuff: { x: 500, y: 440 }, // Top triangle pointing down
    ravenclaw: { x: 440, y: 500 },  // Left triangle pointing right
    gryffindor: { x: 500, y: 560 }, // Bottom triangle pointing up
    slytherin: { x: 560, y: 500 }   // Right triangle pointing left
  };
}
