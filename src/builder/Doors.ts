import { CellBuilder, containsAny, OPENSPACE, BLOCK_DOOR } from './Cells';
import { MutableRoom, MutableDoor } from '../types/MutableTypes';
import { DoorType, Door, CellAttribute, Sill } from '../types/Types';
import { DirectionType, Direction, DirectionOpposites } from '../types/LayoutTypes';
import { IDoorBuilder } from '../types/Builders';

class DoorBuilder implements IDoorBuilder {
    private random: () => number;
    private cellBuilder: CellBuilder;
    private rooms: MutableRoom[];
    private doors: MutableDoor[];

    constructor(random: () => number, cellBuilder: CellBuilder, rooms: MutableRoom[]) {
        this.random = random;
        this.cellBuilder = cellBuilder;
        this.rooms = rooms;
        this.doors = [];
    }

    fixDoors(): void {
        const fixed: boolean[][] = Array.from({ length: this.cellBuilder.nRows + 1 }, () => Array(this.cellBuilder.nCols + 1).fill(false));

        this.rooms.forEach(room => {
            const directions = Array.from(room.doors.keys()).sort();
            directions.forEach(dir => {
                const shinyDoors: MutableDoor[] = [];

                room.doors.get(dir)?.forEach(door => {
                    const { row: doorR, col: doorC, outId } = door;

                    if (containsAny(this.cellBuilder.cells[doorR][doorC].attributes, OPENSPACE) && !fixed[doorR][doorC]) {
                        if (outId !== null) {
                            const outDir = DirectionOpposites[dir];
                            this.rooms[outId - 1].doors.set(outDir, [...(this.rooms[outId - 1].doors.get(outDir) || []), door]);
                        }
                        shinyDoors.push(door);
                        fixed[doorR][doorC] = true;
                    }
                });

                if (shinyDoors.length > 0) {
                    room.doors.set(dir, shinyDoors);
                    this.doors.push(...shinyDoors);
                } else {
                    room.doors.delete(dir);
                }
            });
        });
    }

    doorType(): DoorType {
        const i = Math.floor(this.random() * 110);
        if (i < 15) return DoorType.ARCH;
        if (i < 60) return DoorType.OPEN;
        if (i < 75) return DoorType.LOCK;
        if (i < 90) return DoorType.TRAP;
        if (i < 100) return DoorType.SECRET;
        return DoorType.PORTC;
    }

    doorSills(room: MutableRoom): Sill[] {
        const list: Sill[] = [];

        if (room.north >= 3) {
            for (let c = room.west; c <= room.east; c += 2) {
                const sill = this.checkSill(room, room.north, c, 'NORTH');
                if (sill) list.push(sill);
            }
        }
        if (room.south <= this.cellBuilder.nRows - 3) {
            for (let c = room.west; c <= room.east; c += 2) {
                const sill = this.checkSill(room, room.south, c, 'SOUTH');
                if (sill) list.push(sill);
            }
        }
        if (room.west >= 3) {
            for (let r = room.north; r <= room.south; r += 2) {
                const sill = this.checkSill(room, r, room.west, 'WEST');
                if (sill) list.push(sill);
            }
        }
        if (room.east <= this.cellBuilder.nCols - 3) {
            for (let r = room.north; r <= room.south; r += 2) {
                const sill = this.checkSill(room, r, room.east, 'EAST');
                if (sill) list.push(sill);
            }
        }
        return list.sort(() => this.random() - 0.5);
    }

    buildDoors(): Door[] {
        return this.doors.map(door => door.toDoor());
    }

    private checkSill(room: MutableRoom, sillR: number, sillC: number, dir: DirectionType): Sill | null {
        const delta = Direction[dir].delta;
        const doorR = sillR + delta[0];
        const doorC = sillC + delta[1];

        const doorCell = this.cellBuilder.cells[doorR][doorC];
        if (!doorCell.attributes.has(CellAttribute.PERIMETER) || containsAny(doorCell.attributes, BLOCK_DOOR)) {
            return null;
        }

        const outR = doorR + delta[0];
        const outC = doorC + delta[1];
        const outCell = this.cellBuilder.cells[outR][outC];
        if (outCell.attributes.has(CellAttribute.BLOCKED)) {
            return null;
        }

        const outId = outCell.attributes.has(CellAttribute.ROOM) && outCell.roomId !== room.id
            ? outCell.roomId
            : null;

        return { sillR, sillC, dir, doorR, doorC, outId };
    }
}

export { DoorBuilder };
