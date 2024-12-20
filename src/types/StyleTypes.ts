import {Grid} from "./LayoutTypes";

type Color = string;

type ImagePattern = string | CanvasPattern | null;

// Palette Class
class Palette {
    wall: Color;
    door: Color;
    label: Color;
    open: Color | null;
    fill: Color;
    grid: Color | null;
    openGrid: Color | null;
    fillGrid: Color | null;
    stair: Color;
    openPattern: ImagePattern;
    openTile: ImagePattern;
    fillPattern: ImagePattern;
    fillTile: ImagePattern;
    background: ImagePattern;

    constructor({
        wall,
        door,
        label,
        open = null,
        fill,
        grid = null,
        openGrid = null,
        fillGrid = null,
        stair,
        openPattern = null,
        openTile = null,
        fillPattern = null,
        fillTile = null,
        background = null
    }: Partial<Palette>) {
        this.open = open;
        this.openPattern = openPattern;
        this.fillPattern = fillPattern;
        this.openTile = openTile;
        this.fillTile = fillTile;
        this.background = background;

        this.fill = fill || "#000000";
        this.door = door || this.fill || "#000000";
        this.label = label || this.fill || "#000000";
        this.stair = stair || wall || this.fill || "#000000";
        this.wall = wall || this.fill || "#000000";

        this.grid = grid || null;
        this.openGrid = openGrid || null;
        this.fillGrid = fillGrid || null;
    }

    static defaultStandard(): Palette {
        return new Palette({
            fill: "#000000",                 // Black
            open: "#FFFFFF",                 // White
            openGrid: "#CCCCCC",             // Light Gray
            wall: "#2F4F4F",                 // Dark Slate Gray
            door: "#8B4513",                 // Saddle Brown
            label: "#0000FF",                // Blue
            grid: "#808080",                 // Gray
            stair: "#FFD700",                // Gold
            fillPattern: null,               // Define how you want to handle patterns
            fillTile: null,
            openPattern: null,
            background: null
        });
    }
}

interface DungeonStyle {
    mapStyle: MapStyleType;
    cellSize: number;
    grid: Grid;
}

const MapStyle = {
    STANDARD: new Palette(Palette.defaultStandard())
} as const;

type MapStyleType = keyof typeof MapStyle;
type MapStyleProperties = (typeof MapStyle)[MapStyleType];

export { Palette, MapStyle }
export type { Color, ImagePattern, DungeonStyle, MapStyleType, MapStyleProperties };
