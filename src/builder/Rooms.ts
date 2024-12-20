import {CellBuilder, OPENSPACE, ESPACE, containsAny, DOORSPACE} from './Cells';
import { MutableRoom, MutableDoor } from '../types/MutableTypes';
import { DoorType, Room, RoomPrototype, RoomLayout, CellAttribute } from '../types/Types';
import { IDoorBuilder, IRoomBuilder } from '../types/Builders';
import { DoorBuilder } from './Doors';
import {Direction} from "../types/LayoutTypes";

class RoomBuilder implements IRoomBuilder {
    private random: () => number;
    private cellBuilder: CellBuilder;

    private nOddRows: number;
    private nOddCols: number;
    private roomMax: number;
    private roomLayout: RoomLayout;

    private nRooms: number = 0;
    private lastRoomId: number = 0;
    private rooms: MutableRoom[] = [];
    private connects: Map<string, number> = new Map();
    private maxRow: number;
    private maxCol: number;
    private roomBase: number;
    private roomRadix: number;

    doorBuilder: IDoorBuilder;

    constructor(randomFactory: () => number, cellBuilder: CellBuilder, nOddRows: number, nOddCols: number, roomMin: number, roomMax: number, roomLayout: RoomLayout) {
        this.random = randomFactory;
        this.cellBuilder = cellBuilder;
        this.nOddRows = nOddRows;
        this.nOddCols = nOddCols;
        this.roomMax = roomMax;
        this.roomLayout = roomLayout;
        this.maxRow = nOddRows * 2 - 1;
        this.maxCol = nOddCols * 2 - 1;
        this.roomBase = roomMin + 1 / 2;
        this.roomRadix = (roomMax - roomMin) / 2 + 1;
        this.doorBuilder = new DoorBuilder(randomFactory, cellBuilder, this.rooms);
    }

    openRooms(): void {
        this.rooms.forEach((room) => this.openRoom(room));
        this.connects.clear();
    }

    placeRooms(): void {
        switch (this.roomLayout) {
            case RoomLayout.PACKED:
                this.packRooms();
                break;
            case RoomLayout.SCATTERED:
                this.scatterRooms();
                break;
        }
    }

    labelRooms(): void {
        this.rooms.forEach((room) => {
            const label = room.id.toString();
            const labelR = Math.floor((room.north + room.south) / 2);
            const labelC = Math.floor((room.west + room.east - label.length) / 2 + 1);

            Array.from(label).forEach((char, index) => {
                this.cellBuilder.cells[labelR][labelC + index].label = char;
            });
        });
    }

    buildRooms(): Room[] {
        return this.rooms.map((room) => room.toRoom());
    }

    private packRooms(): void {
        for (let i = 0; i < this.nOddRows; i++) {
            const r = i * 2 + 1;
            for (let j = 0; j < this.nOddCols; j++) {
                const c = j * 2 + 1;

                if (this.cellBuilder.cells[r][c].attributes.has(CellAttribute.ROOM) || ((i === 0 || j === 0) && Math.floor(this.random() * 2) === 0)) {
                    continue;
                }

                const proto: RoomPrototype = {i, j};
                this.placeRoom(proto);
            }
        }
    }

    private scatterRooms(): void {
        const nRooms = this.allocRooms();
        for (let i = 0; i < nRooms; i++) {
            this.placeRoom();
        }
    }

    private setRandomRoom(proto: RoomPrototype): void {
        proto.height = proto.height ?? Math.floor(this.random() * this.roomRadix + this.roomBase);
        proto.width = proto.width ?? Math.floor(this.random() * this.roomRadix + this.roomBase);
        proto.i = proto.i ?? Math.floor(this.random() * (this.nOddRows - proto.height!));
        proto.j = proto.j ?? Math.floor(this.random() * (this.nOddCols - proto.width!));
    }

    private selectRoom(proto: RoomPrototype): RoomPrototype {
        if (!proto.height) {
            const a = proto.i !== undefined ? Math.max(0, this.nOddRows - this.roomBase - proto.i) : 0;
            const roomHeightMax = Math.max(a, this.roomRadix);
            proto.height = Math.floor(this.random() * roomHeightMax + this.roomBase);
        }
        if (!proto.width) {
            const a = proto.j !== undefined ? Math.max(0, this.nOddCols - this.roomBase - proto.j) : 0;
            const roomWidthMax = Math.max(a, this.roomRadix);
            proto.width = Math.floor(this.random() * roomWidthMax + this.roomBase);
        }
        if (!proto.i) {
            proto.i = Math.floor(this.random() * (this.nOddRows - proto.height!));
        }
        if (!proto.j) {
            proto.j = Math.floor(this.random() * (this.nOddCols - proto.width!));
        }
        return proto;
    }

    private placeRoom(proto: RoomPrototype | null = null): void {
        if (this.nRooms === 999) return;

        const room = proto ? this.selectRoom(proto) : {};
        if (!proto) {
            this.setRandomRoom(room);
        }

        const r1 = room.i! * 2 + 1;
        const c1 = room.j! * 2 + 1;
        const r2 = (room.i! + room.height!) * 2 - 1;
        const c2 = (room.j! + room.width!) * 2 - 1;

        if (r1 < 1 || r2 > this.maxRow || c1 < 1 || c2 > this.maxCol) return;

        if (Object.keys(this.checkRoomPlacement(r1, c1, r2, c2)).length !== 0) return;

        this.nRooms += 1;
        const roomId = this.nRooms;
        this.lastRoomId = roomId;

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = this.cellBuilder.cells[r][c];
                cell.attributes.add(CellAttribute.ROOM);
                cell.roomId = roomId;
                if (cell.attributes.has(CellAttribute.ENTRANCE)) {
                    ESPACE.forEach(attr => cell.attributes.delete(attr));
                }
                cell.attributes.delete(CellAttribute.PERIMETER);
            }
        }

        const roomOrEntrance = new Set([CellAttribute.ROOM, CellAttribute.ENTRANCE]);
        for (let r = r1 - 1; r <= r2 + 1; r++) {
            if (!containsAny(this.cellBuilder.cells[r][c1 - 1].attributes, roomOrEntrance)) {
                this.cellBuilder.cells[r][c1 - 1].attributes.add(CellAttribute.PERIMETER);
            }
            if (!containsAny(this.cellBuilder.cells[r][c2 + 1].attributes, roomOrEntrance)) {
                this.cellBuilder.cells[r][c2 + 1].attributes.add(CellAttribute.PERIMETER);
            }
        }
        for (let c = c1 - 1; c <= c2 + 1; c++) {
            if (!containsAny(this.cellBuilder.cells[r1 - 1][c].attributes, roomOrEntrance)) {
                this.cellBuilder.cells[r1 - 1][c].attributes.add(CellAttribute.PERIMETER);
            }
            if (!containsAny(this.cellBuilder.cells[r2 + 1][c].attributes, roomOrEntrance)) {
                this.cellBuilder.cells[r2 + 1][c].attributes.add(CellAttribute.PERIMETER);
            }
        }

        const roomData = new MutableRoom(roomId, r1, c1, r1, r2, c1, c2, (r2 - r1 + 1) * 10, (c2 - c1 + 1) * 10, ((r2 - r1 + 1) * 10) * ((c2 - c1 + 1) * 10));
        this.rooms.push(roomData);
    }

    private allocRooms(): number {
        const dungeonArea = this.cellBuilder.nCols * this.cellBuilder.nRows;
        const roomArea = this.roomMax * this.roomMax;
        return Math.floor(dungeonArea / roomArea);
    }

    private checkRoomPlacement(r1: number, c1: number, r2: number, c2: number): { [key: number]: number } {
        const hit: { [key: number]: number } = {};
        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                if (this.cellBuilder.cells[r][c].attributes.has(CellAttribute.BLOCKED)) {
                    return {};
                }
                if (this.cellBuilder.cells[r][c].attributes.has(CellAttribute.ROOM)) {
                    const id = this.cellBuilder.cells[r][c].roomId;
                    if (id !== 0) {
                        hit[id] = (hit[id] ?? 0) + 1;
                    }
                }
            }
        }
        return hit;
    }

    private openRoom(room: MutableRoom): void {
        const sills = this.doorBuilder.doorSills(room);
        if (sills.length === 0) return;

        const nOpens = this.allocOpens(room);

        for (let i = 0; i < nOpens; i++) {
            const sill = sills.pop();
            if (!sill) break;

            const { doorR, doorC, outId } = sill;
            if (Array.from(this.cellBuilder.cells[doorR][doorC].attributes).some(attr => DOORSPACE.has(attr))) continue;

            if (outId !== null) {
                const connectKey = [room.id, outId].sort().join(',');
                if (this.connects.has(connectKey)) continue;
                this.connects.set(connectKey, 1);
            }

            const { sillR: openR, sillC: openC, dir: openDir } = sill;
            for (let x = 0; x < 3; x++) {
                const r = openR + Direction[openDir].delta[0] * x;
                const c = openC + Direction[openDir].delta[1] * x;
                const attributes = this.cellBuilder.cells[r][c].attributes;
                attributes.delete(CellAttribute.PERIMETER);
                attributes.add(CellAttribute.ENTRANCE);
            }

            const doorType = this.doorBuilder.doorType();
            const door = new MutableDoor(doorR, doorC, outId, doorType);
            room.doors.set(openDir, [...(room.doors.get(openDir) || []), door]);
        }
    }

    private allocOpens(room: MutableRoom): number {
        const roomH = Math.floor((room.south - room.north) / 2 + 1);
        const roomW = Math.floor((room.east - room.west) / 2 + 1);
        const linearRoomMeasure = Math.sqrt(roomW * roomH);
        return Math.floor(linearRoomMeasure + this.random() * linearRoomMeasure);
    }
}

export { RoomBuilder };
