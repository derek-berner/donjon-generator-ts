import {DirectionType} from "./LayoutTypes";
import {MapStyleType, Palette} from "./StyleTypes";

enum CellAttribute {
    BLOCKED,
    ROOM,
    CORRIDOR,
    PERIMETER,
    ENTRANCE,
    ARCH,
    DOOR,
    LOCKED,
    TRAPPED,
    SECRET,
    PORTC,
    STAIR_DN,
    STAIR_UP,
    LABEL
}

interface Cell {
    attributes: Set<CellAttribute>;
    roomId: number;
    label: string | null;
}

interface TunnelCheck {
    readonly corridor: ReadOnlyCoordList;
    readonly walled: ReadOnlyCoordList;
    readonly close: ReadOnlyCoordList;
}

interface CloseEnd extends TunnelCheck {
    readonly recurse: readonly [number, number];
}

// Enum with values and properties
enum CorridorLayout {
    LABYRINTH = 0,
    BENT = 50,
    STRAIGHT = 100
}

interface Room {
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
    doors: Map<DirectionType, Door[]>;
}

interface RoomPrototype {
    i?: number;
    j?: number;
    width?: number;
    height?: number;
}

enum RoomLayout {
    PACKED,
    SCATTERED
}

// Enum with additional attributes
enum DoorType {
    ARCH = "Archway",
    OPEN = "Unlocked Door",
    LOCK = "Locked Door",
    TRAP = "Trapped Door",
    SECRET = "Secret Door",
    PORTC = "Portcullis"
}

const DoorTypeAttributes: { [key in DoorType]: { arch: boolean, door: boolean, lock: boolean, trap: boolean, secret: boolean, portc: boolean, wall: boolean, key: string } } = {
    [DoorType.ARCH]: { arch: true, door: false, lock: false, trap: false, secret: false, portc: false, wall: false, key: "arch" },
    [DoorType.OPEN]: { arch: true, door: true, lock: false, trap: false, secret: false, portc: false, wall: false, key: "open" },
    [DoorType.LOCK]: { arch: true, door: true, lock: true, trap: false, secret: false, portc: false, wall: false, key: "lock" },
    [DoorType.TRAP]: { arch: true, door: true, lock: false, trap: true, secret: false, portc: false, wall: false, key: "trap" },
    [DoorType.SECRET]: { arch: true, door: false, lock: false, trap: false, secret: true, portc: false, wall: true, key: "secret" },
    [DoorType.PORTC]: { arch: true, door: false, lock: false, trap: false, secret: false, portc: true, wall: false, key: "portc" }
}

interface Door {
    row: number;
    col: number;
    outId: number | null;
    type: DoorType;
}

interface Sill {
    sillR: number;
    sillC: number;
    dir: DirectionType;
    doorR: number;
    doorC: number;
    outId?: number | null;
}

interface DungeonImage {
    cellSize: number;
    mapStyle: Palette;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
}

interface Dungeon {
    seed: number;
    random: any; // Replace with an appropriate random type/package
    nRows: number;
    nCols: number;
    cells: Cell[][];
    stairs: Stair[];
    rooms: Room[];
    doors: Door[];
}

enum StairKey {
    UP,
    DOWN
}

interface Stair {
    row: number;
    col: number;
    nextRow: number;
    nextCol: number;
    key: StairKey;
}

interface StairEnd extends TunnelCheck {
    readonly next: readonly [number, number];
}

type ReadOnlyCoordList = readonly (readonly [number, number])[];

function typedKeys<T extends {}>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

export { CellAttribute, CorridorLayout, RoomLayout, DoorType, DoorTypeAttributes, StairKey, typedKeys };
export type { Cell, TunnelCheck, CloseEnd, Room, RoomPrototype, Door, Sill, DungeonImage, Dungeon, Stair, StairEnd, ReadOnlyCoordList };
