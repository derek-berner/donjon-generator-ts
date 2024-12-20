import {CellBuilder, OPENSPACE, BLOCK_CORR, STAIRS, containsAny, DOORSPACE} from './Cells';
import {CellAttribute, CorridorLayout, TunnelCheck, typedKeys} from '../types/Types';
import { ICorridorBuilder } from '../types/Builders';
import { Direction, DirectionType } from '../types/LayoutTypes';
import { MutableCell } from "../types/MutableTypes";

class CorridorBuilder implements ICorridorBuilder {
    private readonly random: () => number;
    private readonly cellBuilder: CellBuilder;
    private readonly nOddRows: number;
    private readonly nOddCols: number;
    private readonly corridorLayout: CorridorLayout;

    constructor(randomFactory: () => number, cellBuilder: CellBuilder, nOddRows: number, nOddCols: number, corridorLayout: CorridorLayout) {
        this.random = randomFactory;
        this.cellBuilder = cellBuilder;
        this.nOddRows = nOddRows;
        this.nOddCols = nOddCols;
        this.corridorLayout = corridorLayout;
    }

    checkTunnel(r: number, c: number, check: TunnelCheck): boolean {
        return check.corridor.every(([dr, dc]) =>
            this.cellBuilder.cells[r + dr][c + dc].attributes.has(CellAttribute.CORRIDOR)
        ) && check.walled.every(([dr, dc]) =>
            !(containsAny(this.cellBuilder.cells[r + dr]?.[c + dc]?.attributes ?? OPENSPACE, OPENSPACE))
        );
    }

    collapseTunnels(p: number): void {
        if (p === 0) return;
        const removeAll = p === 100;

        for (let i = 0; i < this.nOddRows; i++) {
            const r = i * 2 + 1;
            for (let j = 0; j < this.nOddCols; j++) {
                const c = j * 2 + 1;

                if (containsAny(this.cellBuilder.cells[r][c].attributes, OPENSPACE) && !containsAny(this.cellBuilder.cells[r][c].attributes, STAIRS)) {
                    if (removeAll || this.random() * 100 < p) {
                        this.collapse(r, c);
                    }
                }
            }
        }
    }

    corridors(): void {
        for (let i = 1; i < this.nOddRows; i++) {
            const r = i * 2 + 1;
            for (let j = 1; j < this.nOddCols; j++) {
                const c = j * 2 + 1;

                if (!this.cellBuilder.cells[r][c].attributes.has(CellAttribute.CORRIDOR)) {
                    this.tunnel(i, j);
                }
            }
        }
    }

    private tunnel(i: number, j: number, lastDir: DirectionType | null = null): void {
        const directions = this.tunnelDirs(lastDir);

        for (let dir of directions) {
            if (this.openTunnel(i, j, dir)) {
                const nextI = i + Direction[dir].delta[0];
                const nextJ = j + Direction[dir].delta[1];
                this.tunnel(nextI, nextJ, dir);
            }
        }
    }

    private tunnelDirs(lastDir: DirectionType | null): DirectionType[] {
        const p: number = this.corridorLayout;
        const dirs: DirectionType[] = typedKeys(Direction).sort(() => this.random() - 0.5);

        if (lastDir !== null && this.random() * 100 < p) {
            return [lastDir, ...dirs.filter(d => d !== lastDir)];
        } else {
            return dirs;
        }
    }

    private openTunnel(i: number, j: number, dir: DirectionType): boolean {
        const thisR = i * 2 + 1;
        const thisC = j * 2 + 1;
        const nextR = (i + Direction[dir].delta[0]) * 2 + 1;
        const nextC = (j + Direction[dir].delta[1]) * 2 + 1;
        const midR = (thisR + nextR) / 2;
        const midC = (thisC + nextC) / 2;

        if (this.checkTunnelPlacement(midR, midC, nextR, nextC)) {
            this.delveTunnel(thisR, thisC, nextR, nextC);
            return true;
        } else {
            return false;
        }
    }

    private checkTunnelPlacement(midR: number, midC: number, nextR: number, nextC: number): boolean {
        if (nextR < 0 || nextR > this.cellBuilder.nRows || nextC < 0 || nextC > this.cellBuilder.nCols) return false;

        for (let r = Math.min(midR, nextR); r <= Math.max(midR, nextR); r++) {
            for (let c = Math.min(midC, nextC); c <= Math.max(midC, nextC); c++) {
                if (containsAny(this.cellBuilder.cells[r][c].attributes, BLOCK_CORR)) return false;
            }
        }
        return true;
    }

    private delveTunnel(thisR: number, thisC: number, nextR: number, nextC: number): boolean {
        for (let r = Math.min(thisR, nextR); r <= Math.max(thisR, nextR); r++) {
            for (let c = Math.min(thisC, nextC); c <= Math.max(thisC, nextC); c++) {
                this.cellBuilder.cells[r][c].attributes.delete(CellAttribute.ENTRANCE);
                this.cellBuilder.cells[r][c].attributes.add(CellAttribute.CORRIDOR);
            }
        }
        return true;
    }

    private collapse(r: number, c: number): void {
        if (!containsAny(this.cellBuilder.cells[r][c].attributes, OPENSPACE)) return;

        for (let dir of typedKeys(Direction)) {
            const check = Direction[dir].closeEnd;
            if (this.checkTunnel(r, c, check)) {
                check.close.forEach(([dr, dc]) => {
                    this.cellBuilder.cells[r + dr][c + dc] = new MutableCell();
                });
                const [dr, dc] = check.recurse;
                this.collapse(r + dr, c + dc);
            }
        }
    }
}

export { CorridorBuilder };
