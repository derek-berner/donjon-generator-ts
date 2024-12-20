import { ICellBuilder } from '../types/Builders';
import { DungeonLayoutType, DungeonLayout } from '../types/LayoutTypes';
import { CellAttribute, Cell } from '../types/Types';
import { MutableCell } from '../types/MutableTypes';

class CellBuilder implements ICellBuilder {
    nRows: number;
    nCols: number;
    private dungeonLayout: DungeonLayoutType | null;
    cells: MutableCell[][];

    constructor(nRows: number, nCols: number, dungeonLayout: DungeonLayoutType | null) {
        this.nRows = nRows;
        this.nCols = nCols;
        this.dungeonLayout = dungeonLayout;
        this.cells = Array.from({ length: nRows + 1 }, () => Array.from({ length: nCols + 1 }, () => new MutableCell()));
    }

    emptyBlocks(): void {
        for (let r = 0; r <= this.nRows; r++) {
            for (let c = 0; c <= this.nCols; c++) {
                const cell = this.cells[r][c];
                if (cell.attributes.has(CellAttribute.BLOCKED)) {
                    this.cells[r][c] = new MutableCell();
                }
            }
        }
    }

    initializeCells(): void {
        const mask = this.dungeonLayout ? DungeonLayout[this.dungeonLayout].pattern : null;
        if (mask) {
            this.maskCells(mask);
        } else if (this.dungeonLayout === 'ROUND') {
            this.roundMask();
        }
    }

    buildCells(): Cell[][] {
        return this.cells.map(row => row.map(cell => cell.toCell()));
    }

    private maskCells(mask: [number, number, number][]): void {
        const rX = mask.length / (this.nRows + 1);
        const cX = mask[0].length / (this.nCols + 1);

        for (let r = 0; r <= this.nRows; r++) {
            for (let c = 0; c <= this.nCols; c++) {
                if (mask[Math.floor(r * rX)]?.[Math.floor(c * cX)] === 0) {
                    this.cells[r][c].attributes.add(CellAttribute.BLOCKED);
                }
            }
        }
    }

    private roundMask(): void {
        const centerR = this.nRows / 2;
        const centerC = this.nCols / 2;

        for (let r = 0; r <= this.nRows; r++) {
            for (let c = 0; c <= this.nCols; c++) {
                const dR = r - centerR;
                const dC = c - centerC;
                const distance = Math.sqrt(dR * dR + dC * dC);
                if (distance > centerC) {
                    this.cells[r][c].attributes.add(CellAttribute.BLOCKED);
                }
            }
        }
    }
}

function containsAny(setA: Set<CellAttribute>, setB: Set<CellAttribute>): boolean {
    for (let item of Array.from(setB)) {
        if (setA.has(item)) {
            return true;
        }
    }
    return false;
}

// Equivalent of EnumSets
const OPENSPACE = new Set([CellAttribute.ROOM, CellAttribute.CORRIDOR]);
const DOORSPACE = new Set([
    CellAttribute.ARCH,
    CellAttribute.DOOR,
    CellAttribute.LOCKED,
    CellAttribute.TRAPPED,
    CellAttribute.SECRET,
    CellAttribute.PORTC
]);
const ESPACE = new Set([
    CellAttribute.ENTRANCE,
    CellAttribute.ARCH,
    CellAttribute.DOOR,
    CellAttribute.LOCKED,
    CellAttribute.TRAPPED,
    CellAttribute.SECRET,
    CellAttribute.PORTC,
    CellAttribute.LABEL
]);
const STAIRS = new Set([CellAttribute.STAIR_DN, CellAttribute.STAIR_UP]);

const BLOCK_CORR = new Set([CellAttribute.BLOCKED, CellAttribute.PERIMETER, CellAttribute.CORRIDOR]);
const BLOCK_DOOR = new Set([
    CellAttribute.BLOCKED,
    CellAttribute.ARCH,
    CellAttribute.DOOR,
    CellAttribute.LOCKED,
    CellAttribute.TRAPPED,
    CellAttribute.SECRET,
    CellAttribute.PORTC
]);

export { CellBuilder, containsAny, OPENSPACE, DOORSPACE, ESPACE, STAIRS, BLOCK_CORR, BLOCK_DOOR };
