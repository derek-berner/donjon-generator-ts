import { CellBuilder } from './Cells';
import { MutableStair } from '../types/MutableTypes';
import {CellAttribute, Stair, StairKey, typedKeys} from '../types/Types';
import { Direction } from '../types/LayoutTypes';
import { IStairBuilder } from '../types/Builders';
import { CorridorBuilder } from './Corridors';

class StairBuilder implements IStairBuilder {
    private random: () => number;
    private cellBuilder: CellBuilder;
    private corridorBuilder: CorridorBuilder;

    private nOddRows: number;
    private nOddCols: number;
    private addStairs: number;
    private stairs: MutableStair[] = [];

    constructor(randomFactory: () => number, cellBuilder: CellBuilder, corridorBuilder: CorridorBuilder, nOddRows: number, nOddCols: number, addStairs: number) {
        this.random = randomFactory;
        this.cellBuilder = cellBuilder;
        this.corridorBuilder = corridorBuilder;
        this.nOddRows = nOddRows;
        this.nOddCols = nOddCols;
        this.addStairs = addStairs;
    }

    placeStairs(): void {
        if (this.addStairs > 0) {
            const list = this.stairEnds();
            if (list.length === 0) return;

            for (let i = 0; i < this.addStairs; i++) {
                const stair = list.splice(Math.floor(this.random() * list.length), 1)[0];
                if (!stair) continue;

                const { row: r, col: c } = stair;
                const type = i < 2 ? i : Math.floor(this.random() * 2);

                if (type === 0) {
                    this.cellBuilder.cells[r][c].attributes.add(CellAttribute.STAIR_DN);
                    this.cellBuilder.cells[r][c].label = "d";
                    stair.key = StairKey.DOWN;
                } else {
                    this.cellBuilder.cells[r][c].attributes.add(CellAttribute.STAIR_UP);
                    this.cellBuilder.cells[r][c].label = "u";
                    stair.key = StairKey.UP;
                }
                this.stairs.push(stair);
            }
        }
    }

    buildStairs(): Stair[] {
        return this.stairs.map(stair => stair.toStair());
    }

    private stairEnds(): MutableStair[] {
        const list: MutableStair[] = [];

        for (let i = 0; i < this.nOddRows; i++) {
            const r = i * 2 + 1;
            for (let j = 0; j < this.nOddCols; j++) {
                const c = j * 2 + 1;

                if (this.cellBuilder.cells[r][c].attributes.has(CellAttribute.CORRIDOR) && this.cellBuilder.cells[r][c].attributes.size === 1) {
                    for (const dir of typedKeys(Direction)) {
                        if (this.corridorBuilder.checkTunnel(r, c, Direction[dir].stairEnd)) {
                            const stairEndNext = Direction[dir].stairEnd.next;
                            const end = new MutableStair(r, c);
                            end.nextRow = r + stairEndNext[0];
                            end.nextCol = c + stairEndNext[1];
                            list.push(end);
                            break;
                        }
                    }
                }
            }
        }
        return list;
    }
}

export { StairBuilder };
