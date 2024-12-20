import {
    Dungeon,
    DungeonImage,
    CellAttribute,
    StairKey,
    Door,
    DoorTypeAttributes
} from '../types/Types';
import {DungeonStyle, MapStyle} from '../types/StyleTypes';
import { Grid } from '../types/LayoutTypes';

function drawDungeon(dungeon: Dungeon, style: DungeonStyle, canvas: HTMLCanvasElement): void {
    const image = scaleDungeon(dungeon, style);
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = image.width;
    hiddenCanvas.height = image.height;
    const gc = hiddenCanvas.getContext('2d')!;
    const userGc = canvas.getContext('2d')!;
    const palette = MapStyle[style.mapStyle];

    // Create and draw the base layer
    const baseLayer = createBaseLayer(gc, dungeon, style, image, palette);
    // Fill the base layer and other features
    fillImage(gc, dungeon, style, image, palette);
    openCells(gc, dungeon, baseLayer, image, palette);
    drawWalls(gc, dungeon, image, palette);
    drawDoors(gc, dungeon, image, palette);
    drawStairs(gc, dungeon, image, palette);
    drawLabels(gc, dungeon, image, palette);

    // Copy the hidden canvas to the user-provided canvas
    userGc.drawImage(hiddenCanvas, 0, 0);
}

// Implement other functions

function scaleDungeon(dungeon: Dungeon, style: DungeonStyle): DungeonImage {
    const cellSize = style.cellSize;
    const width = ((dungeon.nCols + 1) * cellSize) + 1;
    const height = ((dungeon.nRows + 1) * cellSize) + 1;
    return {
        cellSize,
        mapStyle: MapStyle[style.mapStyle],
        width,
        height,
        maxX: width - 1,
        maxY: height - 1,
    };
}

function createBaseLayer(gc: CanvasRenderingContext2D, dungeon: Dungeon, style: DungeonStyle, image: DungeonImage, palette: any): HTMLCanvasElement {
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = image.width;
    baseCanvas.height = image.height;
    const baseGc = baseCanvas.getContext('2d')!;

    const maxX = image.maxX;
    const maxY = image.maxY;
    const dim = image.cellSize;

    // Fill the base layer
    if (palette.openPattern) {
        // Replace with pattern drawing implementation
    } else if (palette.openTile) {
        // Tile usage implementation
        for (let r = 0; r < dungeon.nRows; r++) {
            for (let c = 0; c < dungeon.nCols; c++) {
                baseGc.fillStyle = selectTile(dungeon.random, palette.openTile, dim);
                baseGc.fillRect(c * dim, r * dim, dim, dim);
            }
        }
    } else if (palette.open) {
        baseGc.fillStyle = palette.open;
        baseGc.fillRect(0, 0, maxX, maxY);
    } else if (palette.background) {
        baseGc.fillStyle = palette.background;
        baseGc.fillRect(0, 0, maxX, maxY);
    } else {
        baseGc.fillStyle = 'white';
        baseGc.fillRect(0, 0, maxX, maxY);
    }

    // Draw open grid or grid, if specified
    if (palette.openGrid || palette.grid) {
        const gridColor = palette.openGrid || palette.grid;
        drawGrid(baseGc, style, image, gridColor);
    }

    gc.drawImage(baseCanvas, 0, 0);
    return baseCanvas;
}

function selectTile(random: () => number, tile: CanvasPattern, dim: number): CanvasPattern {
    return tile; // Implement tile pattern logic if needed
}

function drawGrid(gc: CanvasRenderingContext2D, style: DungeonStyle, image: DungeonImage, color: string): void {
    gc.strokeStyle = color;
    gc.lineWidth = 0.5;
    if (style.grid === Grid.SQUARE) {
        drawSquareGrid(gc, image, color);
    } else if (style.grid === Grid.HEX) {
        drawHexGrid(gc, image, color);
    }
}

function drawSquareGrid(gc: CanvasRenderingContext2D, image: DungeonImage, color: string): void {
    gc.strokeStyle = color;
    gc.lineWidth = 0.1;
    const dim = image.cellSize;
    for (let x = 0; x <= image.maxX; x += dim) {
        gc.beginPath();
        gc.moveTo(x, 0);
        gc.lineTo(x, image.maxY);
        gc.stroke();
    }
    for (let y = 0; y <= image.maxY; y += dim) {
        gc.beginPath();
        gc.moveTo(0, y);
        gc.lineTo(image.maxX, y);
        gc.stroke();
    }
}

function drawHexGrid(gc: CanvasRenderingContext2D, image: DungeonImage, color: string): void {
    const dim = image.cellSize;
    const dy = dim / 2.0;
    const dx = dim / Math.sqrt(3); // Approximately sqrt(3)
    const nCol = Math.floor(image.width / (3 * dx));
    const nRow = Math.floor(image.height / dy);

    gc.strokeStyle = color;
    gc.lineWidth = 0.5;

    for (let i = 0; i < nCol; i++) {
        const x1 = i * (3 * dx);
        const x2 = x1 + dx;
        const x3 = x1 + (3 * dx);

        for (let j = 0; j < nRow; j++) {
            const y1 = j * dy;
            const y2 = y1 + dy;

            if ((i + j) % 2 === 0) {
                gc.beginPath();
                gc.moveTo(x2, y1);
                gc.lineTo(x1, y2);
                gc.stroke();
            } else {
                gc.beginPath();
                gc.moveTo(x1, y1);
                gc.lineTo(x2, y2);
                gc.stroke();

                gc.beginPath();
                gc.moveTo(x2, y2);
                gc.lineTo(x3, y2);
                gc.stroke();
            }
        }
    }
}

function fillImage(gc: CanvasRenderingContext2D, dungeon: Dungeon, style: DungeonStyle, image: DungeonImage, palette: any): void {
    const maxX = image.maxX;
    const maxY = image.maxY;
    const cellSize = image.cellSize;

    if (palette.fillPattern) {
        // Implement fill pattern logic
    } else if (palette.fillTile) {
        for (let r = 0; r <= dungeon.nRows; r++) {
            for (let c = 0; c <= dungeon.nCols; c++) {
                const x = c * cellSize;
                const y = r * cellSize;
                gc.fillStyle = palette.fillTile;
                gc.fillRect(x, y, cellSize, cellSize);
            }
        }
    } else if (palette.fill) {
        gc.fillStyle = palette.fill;
        gc.fillRect(0, 0, maxX, maxY);
    } else if (palette.background) {
        gc.fillStyle = palette.background;
        gc.fillRect(0, 0, maxX, maxY);
    } else {
        gc.fillStyle = 'black';
        gc.fillRect(0, 0, maxX, maxY);
    }

    const gridColor = palette.fillGrid || palette.grid;
    if (gridColor) {
        drawGrid(gc, style, image, gridColor);
    }
}

function openCells(gc: CanvasRenderingContext2D, dungeon: Dungeon, base: HTMLCanvasElement, image: DungeonImage, palette: any): void {
    const dim = image.cellSize;

    for (let r = 0; r < dungeon.nRows; r++) {
        const y = r * dim;

        for (let c = 0; c < dungeon.nCols; c++) {
            const x = c * dim;

            if (dungeon.cells[r][c].attributes.has(CellAttribute.ROOM) || dungeon.cells[r][c].attributes.has(CellAttribute.CORRIDOR)) {
                gc.drawImage(base, x, y, dim + 1, dim + 1, x, y, dim + 1, dim + 1);
            }
        }
    }
}

function drawWalls(gc: CanvasRenderingContext2D, dungeon: Dungeon, image: DungeonImage, palette: any): void {
    const cellSize = image.cellSize;
    const wallColor = palette.wall;

    for (let r = 0; r < dungeon.nRows; r++) {
        const y1 = r * cellSize;
        const y2 = y1 + cellSize;

        for (let c = 0; c < dungeon.nCols; c++) {
            const x1 = c * cellSize;
            const x2 = x1 + cellSize;

            if (dungeon.cells[r][c].attributes.has(CellAttribute.ROOM) || dungeon.cells[r][c].attributes.has(CellAttribute.CORRIDOR)) {
                gc.strokeStyle = wallColor;
                gc.lineWidth = 0.5;

                if (!dungeon.cells[r - 1]?.[c]?.attributes.has(CellAttribute.ROOM) && !dungeon.cells[r - 1]?.[c]?.attributes.has(CellAttribute.CORRIDOR)) {
                    gc.beginPath();
                    gc.moveTo(x1, y1);
                    gc.lineTo(x2, y1);
                    gc.stroke();
                }

                if (!dungeon.cells[r][c - 1]?.attributes.has(CellAttribute.ROOM) && !dungeon.cells[r][c - 1]?.attributes.has(CellAttribute.CORRIDOR)) {
                    gc.beginPath();
                    gc.moveTo(x1, y1);
                    gc.lineTo(x1, y2);
                    gc.stroke();
                }

                if (!dungeon.cells[r][c + 1]?.attributes.has(CellAttribute.ROOM) && !dungeon.cells[r][c + 1]?.attributes.has(CellAttribute.CORRIDOR)) {
                    gc.beginPath();
                    gc.moveTo(x2, y1);
                    gc.lineTo(x2, y2);
                    gc.stroke();
                }

                if (!dungeon.cells[r + 1]?.[c]?.attributes.has(CellAttribute.ROOM) && !dungeon.cells[r + 1]?.[c]?.attributes.has(CellAttribute.CORRIDOR)) {
                    gc.beginPath();
                    gc.moveTo(x1, y2);
                    gc.lineTo(x2, y2);
                    gc.stroke();
                }
            }
        }
    }
}

function drawDoors(gc: CanvasRenderingContext2D, dungeon: Dungeon, image: DungeonImage, palette: any): void {
    const doors = dungeon.doors;
    const cellSize = image.cellSize;
    const archSize = cellSize / 6;
    const doorThickness = cellSize / 4;
    const trapThickness = cellSize / 3;

    const archColor = palette.wall;
    const doorColor = palette.door;

    doors.forEach(door => {
        const r = door.row;
        const c = door.col;
        const x1 = c * cellSize;
        const y1 = r * cellSize;
        const x2 = x1 + cellSize;
        const y2 = y1 + cellSize;

        const xc = (x1 + x2) / 2;
        const yc = (y1 + y2) / 2;

        if (dungeon.cells[r][c - 1]?.attributes.has(CellAttribute.ROOM) || dungeon.cells[r][c - 1]?.attributes.has(CellAttribute.CORRIDOR)) {
            drawVerticalDoor(gc, door, archSize, doorThickness, trapThickness, y1, y2, xc, yc, archColor, doorColor);
        } else {
            drawHorizontalDoor(gc, door, archSize, doorThickness, trapThickness, x1, x2, xc, yc, archColor, doorColor);
        }
    });
}

function drawVerticalDoor(
    gc: CanvasRenderingContext2D, door: Door, archSize: number, doorThickness: number, trapThickness: number,
    y1: number, y2: number, xc: number, yc: number,
    archColor: string, doorColor: string
): void {
    gc.lineWidth = 0.5;

    // Handle wall
    if (DoorTypeAttributes[door.type].wall) {
        gc.strokeStyle = archColor;
        gc.beginPath();
        gc.moveTo(xc, y1);
        gc.lineTo(xc, y2);
        gc.stroke();
    }

    // Handle secret
    if (DoorTypeAttributes[door.type].secret) {
        gc.strokeStyle = doorColor;
        gc.beginPath();
        gc.moveTo(xc - 1, yc - doorThickness);
        gc.lineTo(xc + 2, yc - doorThickness);
        gc.moveTo(xc - 2, yc - doorThickness + 1);
        gc.lineTo(xc - 2, yc - 1);
        gc.moveTo(xc - 1, yc);
        gc.lineTo(xc + 1, yc);
        gc.moveTo(xc + 2, yc + 1);
        gc.lineTo(xc + 2, yc + doorThickness - 1);
        gc.moveTo(xc - 2, yc + doorThickness);
        gc.lineTo(xc + 1, yc + doorThickness);
        gc.stroke();
    }

    // Handle arch
    if (DoorTypeAttributes[door.type].arch) {
        gc.fillStyle = archColor;
        gc.fillRect(xc - 1, y1, 2, archSize);
        gc.fillRect(xc - 1, y2 - archSize, 2, archSize);
    }

    // Handle door
    if (DoorTypeAttributes[door.type].door) {
        gc.strokeStyle = doorColor;
        gc.strokeRect(xc - doorThickness, y1 + archSize + 1, doorThickness * 2, y2 - y1 - 2 * archSize - 2);
    }

    // Handle lock
    if (DoorTypeAttributes[door.type].lock) {
        gc.beginPath();
        gc.moveTo(xc, y1 + archSize + 1);
        gc.lineTo(xc, y2 - archSize - 1);
        gc.stroke();
    }

    // Handle trap
    if (DoorTypeAttributes[door.type].trap) {
        gc.beginPath();
        gc.moveTo(xc - trapThickness, yc);
        gc.lineTo(xc + trapThickness, yc);
        gc.stroke();
    }

    // Handle portcullis
    if (DoorTypeAttributes[door.type].portc) {
        for (let y = y1 + archSize + 2; y < y2 - archSize; y += 2) {
            gc.beginPath();
            gc.arc(xc, y, 0.5, 0, 2 * Math.PI);
            gc.fill();
        }
    }
}

function drawHorizontalDoor(
    gc: CanvasRenderingContext2D, door: Door, archSize: number, doorThickness: number, trapThickness: number,
    x1: number, x2: number, xc: number, yc: number,
    archColor: string, doorColor: string
): void {
    gc.lineWidth = 0.5;

    // Handle wall
    if (DoorTypeAttributes[door.type].wall) {
        gc.strokeStyle = archColor;
        gc.beginPath();
        gc.moveTo(x1, yc);
        gc.lineTo(x2, yc);
        gc.stroke();
    }

    // Handle secret
    if (DoorTypeAttributes[door.type].secret) {
        gc.strokeStyle = doorColor;
        gc.beginPath();
        gc.moveTo(xc - doorThickness, yc - 2);
        gc.lineTo(xc - doorThickness, yc + 1);
        gc.moveTo(xc - doorThickness + 1, yc + 2);
        gc.lineTo(xc - 1, yc + 2);
        gc.moveTo(xc, yc - 1);
        gc.lineTo(xc, yc + 1);
        gc.moveTo(xc + 1, yc - 2);
        gc.lineTo(xc + doorThickness - 1, yc - 2);
        gc.moveTo(xc + doorThickness, yc - 1);
        gc.lineTo(xc + doorThickness, yc + 2);
        gc.stroke();
    }

    // Handle arch
    if (DoorTypeAttributes[door.type].arch) {
        gc.fillStyle = archColor;
        gc.fillRect(x1, yc - 1, archSize, 2);
        gc.fillRect(x2 - archSize, yc - 1, archSize, 2);
    }

    // Handle door
    if (DoorTypeAttributes[door.type].door) {
        gc.strokeStyle = doorColor;
        gc.strokeRect(xc + archSize + 1, yc - doorThickness, x2 - x1 - 2 * archSize - 2, doorThickness * 2);
    }

    // Handle lock
    if (DoorTypeAttributes[door.type].lock) {
        gc.beginPath();
        gc.moveTo(x1 + archSize + 1, yc);
        gc.lineTo(x2 - archSize - 1, yc);
        gc.stroke();
    }

    // Handle trap
    if (DoorTypeAttributes[door.type].trap) {
        gc.beginPath();
        gc.moveTo(xc, yc - trapThickness);
        gc.lineTo(xc, yc + trapThickness);
        gc.stroke();
    }

    // Handle portcullis
    if (DoorTypeAttributes[door.type].portc) {
        for (let x = x1 + archSize + 2; x < x2 - archSize; x += 2) {
            gc.beginPath();
            gc.arc(x, yc, 0.5, 0, 2 * Math.PI);
            gc.fill();
        }
    }
}


function drawLabels(gc: CanvasRenderingContext2D, dungeon: Dungeon, image: DungeonImage, palette: any): void {
    const cellSize = image.cellSize;
    gc.fillStyle = palette.label;

    for (let r = 0; r <= dungeon.nRows; r++) {
        for (let c = 0; c <= dungeon.nCols; c++) {
            const label = dungeon.cells[r][c].label;
            if (label && (dungeon.cells[r][c].attributes.has(CellAttribute.ROOM) || dungeon.cells[r][c].attributes.has(CellAttribute.CORRIDOR))) {
                // Calculate the position for the label
                const textMetrics = gc.measureText(label)
                const x = (c * cellSize) + (textMetrics.width / 2);
                const y = (r * cellSize) + (textMetrics.actualBoundingBoxAscent) + (cellSize - textMetrics.actualBoundingBoxAscent) / 2;
                // Draw the label on the canvas
                gc.fillText(label, x, y);
            }
        }
    }
}

function drawStairs(gc: CanvasRenderingContext2D, dungeon: Dungeon, image: DungeonImage, palette: any): void {
    const stairs = dungeon.stairs;
    if (stairs.length === 0) return;

    const dim = image.cellSize;
    const sPx = dim / 2;
    const tPx = (dim / 20) + 2;

    gc.strokeStyle = palette.stair;
    gc.lineWidth = 1.0;

    stairs.forEach(stair => {
        const { row, col, nextRow, nextCol, key } = stair;
        const xc = (col + 0.5) * dim;

        if (nextRow > row) {
            // Stair going upward in rows
            const y1 = row * dim;
            const y2 = (nextRow + 1) * dim;
            for (let y = y1; y < y2; y += tPx * 2) {
                const dx = key === StairKey.DOWN ? ((y - y1) / (y2 - y1) * sPx) : sPx;
                gc.beginPath();
                gc.moveTo(xc - dx, y);
                gc.lineTo(xc + dx, y);
                gc.stroke();
            }
        } else if (nextRow < row) {
            // Stair going downward in rows
            const y1 = (row + 1) * dim;
            const y2 = nextRow * dim;
            for (let y = y1; y > y2; y -= tPx * 2) {
                const dx = key === StairKey.DOWN ? ((y - y1) / (y2 - y1) * sPx) : sPx;
                gc.beginPath();
                gc.moveTo(xc - dx, y);
                gc.lineTo(xc + dx, y);
                gc.stroke();
            }
        }

        const yc = (row + 0.5) * dim;

        if (nextCol > col) {
            // Stair going right in columns
            const x1 = col * dim;
            const x2 = (nextCol + 1) * dim;
            for (let x = x1; x < x2; x += tPx * 2) {
                const dy = key === StairKey.DOWN ? ((x - x1) / (x2 - x1) * sPx) : sPx;
                gc.beginPath();
                gc.moveTo(x, yc - dy);
                gc.lineTo(x, yc + dy);
                gc.stroke();
            }
        } else if (nextCol < col) {
            // Stair going left in columns
            const x1 = (col + 1) * dim;
            const x2 = nextCol * dim;
            for (let x = x1; x > x2; x -= tPx * 2) {
                const dy = key === StairKey.DOWN ? ((x - x1) / (x2 - x1) * sPx) : sPx;
                gc.beginPath();
                gc.moveTo(x, yc - dy);
                gc.lineTo(x, yc + dy);
                gc.stroke();
            }
        }
    });
}

export { drawDungeon };
