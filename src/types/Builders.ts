import { Dungeon, Cell, TunnelCheck, Room, Door, DoorType, Sill, Stair } from './Types';
import { MutableCell, MutableRoom } from './MutableTypes';

interface IDungeonBuilder {
    generate(): void;
    buildDungeon(): Dungeon;
}

interface ICellBuilder {
    nRows: number;
    nCols: number;
    cells: MutableCell[][];
    emptyBlocks(): void;
    initializeCells(): void;
    buildCells(): Cell[][];
}

interface ICorridorBuilder {
    checkTunnel(r: number, c: number, check: TunnelCheck): boolean;
    collapseTunnels(p: number): void;
    corridors(): void;
}

interface IRoomBuilder {
    openRooms(): void;
    placeRooms(): void;
    labelRooms(): void;
    buildRooms(): Room[];
}

interface IDoorBuilder {
    fixDoors(): void;
    doorType(): DoorType;
    doorSills(room: MutableRoom): Sill[];
    buildDoors(): Door[];
}

interface IStairBuilder {
    placeStairs(): void;
    buildStairs(): Stair[];
}

export type { IDungeonBuilder, ICellBuilder, ICorridorBuilder, IRoomBuilder, IDoorBuilder, IStairBuilder };
