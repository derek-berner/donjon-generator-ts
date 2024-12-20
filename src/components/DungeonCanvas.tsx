import React, { useRef, useEffect } from 'react';
import { DungeonBuilder } from '../builder/Dungeon'; // Ensure the correct path is used for your module
import {DungeonStyle, MapStyleType} from '../types/StyleTypes'; // Ensure the correct path is used for your module
import { drawDungeon } from '../drawing/Drawing';
import {DungeonLayoutType, Grid} from "../types/LayoutTypes";
import {CorridorLayout, RoomLayout} from "../types/Types"; // Ensure the correct path to your draw function

interface DungeonCanvasProps {
    nRows: number;
    nCols: number;
    dungeonLayout: DungeonLayoutType | null;
    roomMin: number;
    roomMax: number;
    roomLayout: RoomLayout;
    corridorLayout: CorridorLayout;
    removeDeadends: number;
    addStairs: number;
    seed: number;
    mapStyle: MapStyleType;
    cellSize: number;
    grid: Grid;
}

const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
    nRows, nCols, dungeonLayout, roomMin, roomMax, roomLayout, corridorLayout,
    removeDeadends, addStairs, seed, mapStyle, cellSize, grid
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const dungeonBuilder = new DungeonBuilder(
            nRows, nCols,
            dungeonLayout,
            roomMin, roomMax,
            roomLayout,
            corridorLayout,
            removeDeadends,
            addStairs,
            seed
        );

        const dungeonStyle: DungeonStyle = {
            mapStyle: mapStyle,
            cellSize: cellSize,
            grid: grid,
        };

        dungeonBuilder.generate();
        drawDungeon(dungeonBuilder.buildDungeon(), dungeonStyle, canvas);
    }, [
        nRows, nCols, dungeonLayout, roomMin, roomMax, roomLayout, corridorLayout,
        removeDeadends, addStairs, seed, mapStyle, cellSize, grid
    ]);

    return (
        <canvas
            ref={canvasRef}
            width={Math.ceil(nCols * cellSize)}
            height={Math.ceil(nRows * cellSize)}
            style={{ border: '1px solid #000' }} // Optional, for visibility
        />
    );
};

export default DungeonCanvas;
