import {ReadOnlyCoordList} from "./Types";

type DungeonLayoutType = 'BOX' | 'CROSS' | 'ROUND';

const DungeonLayout: { [K in DungeonLayoutType]: {pattern: [number, number, number][] | null }} = {
    BOX: {
        pattern: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
        ] as [number, number, number][]
    },
    CROSS: {
        pattern: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ] as [number, number, number][]
    },
    ROUND: {
        pattern: null
    }
} as const;
type DungeonLayoutProperties = (typeof DungeonLayout)[keyof typeof DungeonLayout];

// Direction would need to be imported from your previously converted TypeScript, assuming you have imported TunnelCheck, CloseEnd and StairEnd types.
enum Grid {
    SQUARE,
    HEX
}

interface CloseEnd {
    readonly corridor: ReadOnlyCoordList;
    readonly walled: ReadOnlyCoordList;
    readonly close: ReadOnlyCoordList;
    readonly recurse: readonly [number, number];
}

interface StairEnd {
    readonly corridor: ReadOnlyCoordList;
    readonly walled: ReadOnlyCoordList;
    readonly close: ReadOnlyCoordList;
    readonly next: readonly [number, number];
}

interface DirectionAttributes {
    readonly delta: readonly [number, number];
    readonly closeEnd: CloseEnd;
    readonly stairEnd: StairEnd;
}

type DirectionType = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
const Direction: {[K in DirectionType]: DirectionAttributes} = {
    NORTH: {
        delta: [-1, 0],
        closeEnd: {
            corridor: [[0, 0]],
            walled: [
                [0, -1], [1, -1], [1, 0], [1, 1], [0, 1]
            ],
            close: [[0, 0]],
            recurse: [-1, 0]
        },
        stairEnd: {
            corridor: [[0, 0], [1, 0], [2, 0]],
            walled: [
                [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]
            ],
            close: [],
            next: [1, 0]
        }
    },
    SOUTH: {
        delta: [1, 0],
        closeEnd: {
            corridor: [[0, 0]],
            walled: [
                [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]
            ],
            close: [[0, 0]],
            recurse: [1, 0]
        },
        stairEnd: {
            corridor: [[0, 0], [-1, 0], [-2, 0]],
            walled: [
                [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]
            ],
            close: [],
            next: [-1, 0]
        }
    },
    WEST: {
        delta: [0, -1],
        closeEnd: {
            corridor: [[0, 0]],
            walled: [
                [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]
            ],
            close: [[0, 0]],
            recurse: [0, -1]
        },
        stairEnd: {
            corridor: [[0, 0], [0, 1], [0, 2]],
            walled: [
                [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]
            ],
            close: [],
            next: [0, 1]
        }
    },
    EAST: {
        delta: [0, 1],
        closeEnd: {
            corridor: [[0, 0]],
            walled: [
                [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0]
            ],
            close: [[0, 0]],
            recurse: [0, 1]
        },
        stairEnd: {
            corridor: [[0, 0], [0, -1], [0, -2]],
            walled: [
                [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]
            ],
            close: [],
            next: [0, -1]
        }
    }
} as const;

type DirectionProperties = typeof Direction[keyof typeof Direction];

// In TypeScript, we'll need to calculate 'opposite' programmatically or using a helper function/object.
const DirectionOpposites = {
    NORTH: "SOUTH",
    SOUTH: "NORTH",
    WEST: "EAST",
    EAST: "WEST"
} as const;

type OppositeDirectionType = typeof DirectionOpposites[DirectionType];

export {DungeonLayout, Direction, DirectionOpposites, Grid};
export type {DungeonLayoutType, DungeonLayoutProperties, CloseEnd, StairEnd, DirectionAttributes, DirectionType, DirectionProperties};
