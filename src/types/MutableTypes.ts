import { Cell, Door, DoorType, Room, Stair, StairKey, CellAttribute } from './Types';
import { DirectionType } from './LayoutTypes';

// MutableDoor Class
class MutableDoor {
    row: number;
    col: number;
    outId: number | null;
    type: DoorType;

    constructor(row: number, col: number, outId: number | null = null, type: DoorType) {
        this.row = row;
        this.col = col;
        this.outId = outId;
        this.type = type;
    }

    toDoor(): Door {
        return { row: this.row, col: this.col, outId: this.outId, type: this.type };
    }
}

// MutableStair Class
class MutableStair {
    row: number;
    col: number;
    nextRow: number;
    nextCol: number;
    key: StairKey | null;

    constructor(row: number, col: number, nextRow: number = 0, nextCol: number = 0, key: StairKey | null = null) {
        this.row = row;
        this.col = col;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.key = key;
    }

    toStair(): Stair {
        if (this.key === null) throw new Error("Key of stair cannot be null");
        return { row: this.row, col: this.col, nextRow: this.nextRow, nextCol: this.nextCol, key: this.key };
    }
}

// MutableCell Class
class MutableCell {
    attributes: Set<CellAttribute>;
    roomId: number;
    label: string | null;

    constructor(attributes: Set<CellAttribute> = new Set<CellAttribute>(), roomId: number = 0, label: string | null = null) {
        this.attributes = attributes;
        this.roomId = roomId;
        this.label = label;
    }

    toCell(): Cell {
        return { attributes: this.attributes, roomId: this.roomId, label: this.label };
    }
}

// MutableRoom Class
class MutableRoom {
    id: number;
    row: number;
    col: number;
    north: number;
    south: number;
    west: number;
    east: number;
    height: number;
    width: number;
    area: number;
    doors: Map<DirectionType, MutableDoor[]>;

    constructor(
        id: number,
        row: number,
        col: number,
        north: number,
        south: number,
        west: number,
        east: number,
        height: number,
        width: number,
        area: number,
        doors: Map<DirectionType, MutableDoor[]> = new Map()
    ) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.north = north;
        this.south = south;
        this.west = west;
        this.east = east;
        this.height = height;
        this.width = width;
        this.area = area;
        this.doors = doors;
    }

    toRoom(): Room {
        const mappedDoors = new Map<DirectionType, Door[]>();
        this.doors.forEach((value, key) => {
            mappedDoors.set(key, value.map(d => d.toDoor()));
        });
        return { id: this.id, row: this.row, col: this.col, north: this.north, south: this.south, west: this.west, east: this.east, height: this.height, width: this.width, area: this.area, doors: mappedDoors };
    }
}

export { MutableDoor, MutableStair, MutableCell, MutableRoom };
