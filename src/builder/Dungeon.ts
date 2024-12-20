import { CellBuilder } from './Cells';
import { RoomBuilder } from './Rooms';
import { CorridorBuilder } from './Corridors';
import { StairBuilder } from './Stairs';
import { DungeonLayoutType} from '../types/LayoutTypes';
import { IDungeonBuilder } from '../types/Builders';
import { Dungeon, RoomLayout, CorridorLayout } from '../types/Types';
import seedrandom from 'seedrandom';

class DungeonBuilder implements IDungeonBuilder {
    private nOddRows: number;
    private nOddCols: number;
    private nRows: number;
    private nCols: number;

    private randomFactory: () => number;

    private cellBuilder: CellBuilder;
    private roomBuilder: RoomBuilder;
    private corridorBuilder: CorridorBuilder;
    private stairBuilder: StairBuilder;

    constructor(
        nRows: number,
        nCols: number,
        dungeonLayout: DungeonLayoutType | null,
        roomMin: number,
        roomMax: number,
        roomLayout: RoomLayout,
        corridorLayout: CorridorLayout,
        private removeDeadends: number,
        addStairs: number,
        private seed: number
    ) {
        this.nOddRows = Math.floor(nRows / 2);
        this.nOddCols = Math.floor(nCols / 2);
        this.nRows = this.nOddRows * 2;
        this.nCols = this.nOddCols * 2;

        this.randomFactory = seedrandom(`${seed}`);

        this.cellBuilder = new CellBuilder(this.nRows, this.nCols, dungeonLayout);
        this.roomBuilder = new RoomBuilder(this.randomFactory, this.cellBuilder, this.nOddRows, this.nOddCols, roomMin, roomMax, roomLayout);
        this.corridorBuilder = new CorridorBuilder(this.randomFactory, this.cellBuilder, this.nOddRows, this.nOddCols, corridorLayout);
        this.stairBuilder = new StairBuilder(this.randomFactory, this.cellBuilder, this.corridorBuilder, this.nOddRows, this.nOddCols, addStairs);
    }

    generate(): void {
        this.cellBuilder.initializeCells();
        this.roomBuilder.placeRooms();
        this.roomBuilder.openRooms();
        this.roomBuilder.labelRooms();
        this.corridorBuilder.corridors();
        this.stairBuilder.placeStairs();
        this.cleanDungeon();
    }

    buildDungeon(): Dungeon {
        return {
            seed: this.seed,
            random: this.randomFactory,
            nRows: this.nRows,
            nCols: this.nCols,
            cells: this.cellBuilder.buildCells(),
            stairs: this.stairBuilder.buildStairs(),
            rooms: this.roomBuilder.buildRooms(),
            doors: this.roomBuilder.doorBuilder.buildDoors(),
        } as Dungeon;
    }

    private cleanDungeon(): void {
        if (this.removeDeadends > 0) {
            this.corridorBuilder.collapseTunnels(this.removeDeadends);
        }
        this.roomBuilder.doorBuilder.fixDoors();
        this.cellBuilder.emptyBlocks();
    }
}

export { DungeonBuilder };
