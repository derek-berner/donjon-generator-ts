import React, {useState} from 'react';
import DungeonCanvas from './DungeonCanvas';
import {DungeonLayoutType, Grid} from "../types/LayoutTypes";
import {CorridorLayout, RoomLayout} from "../types/Types";
import { Range } from 'react-range';

const DungeonWrapper = () => {
    // State for each parameter with defaults
    const [nRows, setNRows] = useState(49);
    const [nCols, setNCols] = useState(49);
    const [dungeonLayout, setDungeonLayout] = useState<DungeonLayoutType | null>(null);
    const [roomLayout, setRoomLayout] = useState<RoomLayout>(0);
    const [corridorLayout, setCorridorLayout] = useState<CorridorLayout>(CorridorLayout.BENT);
    const [roomMin, setRoomMin] = useState(5);
    const [roomMax, setRoomMax] = useState(12);
    const [removeDeadends, setRemoveDeadends] = useState(50);
    const [addStairs, setAddStairs] = useState(2);
    const [seed, setSeed] = useState<number | string>(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    const [cellSize, setCellSize] = useState(12);
    const [grid, setGrid] = useState<Grid>(Grid.SQUARE);

    // Generate a new random seed
    const randomizeSeed = () => setSeed(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

    return (
        <div>
            <div>
                <label>
                    Rows (odd): {nRows}
                    <input
                        type="range"
                        min={3}
                        max={201}
                        step={2}
                        value={nRows}
                        onChange={e => setNRows(Number(e.target.value))}
                    />
                </label>
                <label>
                    Columns (odd): {nCols}
                    <input
                        type="range"
                        min={3}
                        max={201}
                        step={2}
                        value={nCols}
                        onChange={e => setNCols(Number(e.target.value))}
                    />
                </label>

                <div>
                    <label>
                        Dungeon Layout:
                        <input
                            type="radio"
                            name="dungeonLayout"
                            value={"None"}
                            checked={dungeonLayout === null}
                            onChange={() => setDungeonLayout(null)}
                        /> None
                        <input
                            type="radio"
                            name="dungeonLayout"
                            value={"BOX"}
                            checked={dungeonLayout === "BOX"}
                            onChange={() => setDungeonLayout("BOX")}
                        /> Box
                        <input
                            type="radio"
                            name="dungeonLayout"
                            value={"CROSS"}
                            checked={dungeonLayout === "CROSS"}
                            onChange={() => setDungeonLayout("CROSS")}
                        /> Cross
                        <input
                            type="radio"
                            name="dungeonLayout"
                            value={"ROUND"}
                            checked={dungeonLayout === "ROUND"}
                            onChange={() => setDungeonLayout("ROUND")}
                        /> Round
                    </label>
                </div>

                <div>
                    Room Layout:
                    <label>
                        <input
                            type="radio"
                            name="roomLayout"
                            value="PACKED"
                            checked={roomLayout === RoomLayout.PACKED}
                            onChange={() => setRoomLayout(RoomLayout.PACKED)}
                        /> PACKED
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="roomLayout"
                            value="SCATTERED"
                            checked={roomLayout === RoomLayout.SCATTERED}
                            onChange={() => setRoomLayout(RoomLayout.SCATTERED)}
                        /> SCATTERED
                    </label>
                </div>

                <div>
                    Corridor Layout:
                    <label>
                        <input
                            type="radio"
                            name="corridorLayout"
                            value="STRAIGHT"
                            checked={corridorLayout === CorridorLayout.STRAIGHT}
                            onChange={() => setCorridorLayout(CorridorLayout.STRAIGHT)}
                        /> STRAIGHT
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="corridorLayout"
                            value="BENT"
                            checked={corridorLayout === CorridorLayout.BENT}
                            onChange={() => setCorridorLayout(CorridorLayout.BENT)}
                        /> BENT
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="corridorLayout"
                            value="LABYRINTH"
                            checked={corridorLayout === CorridorLayout.LABYRINTH}
                            onChange={() => setCorridorLayout(CorridorLayout.LABYRINTH)}
                        /> LABYRINTH
                    </label>

                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    Room Size: {roomMin} to {roomMax}
                    <div style={{ width: '40vw' }}>
                        <Range
                            values={[roomMin, roomMax]}
                            step={1}
                            min={3}
                            max={Math.floor(Math.max(nRows, nCols) * 0.75)}
                            onChange={(vals) => {
                                setRoomMin(vals[0]);
                                setRoomMax(vals[1]);
                            }}
                            renderTrack={({props, children}) => (
                                <div {...props}
                                     style={{...props.style, height: '6px', background: '#ccc'}}>
                                    {children}
                                </div>
                            )}
                            renderThumb={({props}) => (
                                <div {...props} style={{
                                    ...props.style,
                                    height: '10px',
                                    width: '10px',
                                    backgroundColor: '#999'
                                }}/>
                            )}
                        />
                    </div>
                </div>

                <div>
                    Remove Dead Ends: {removeDeadends}
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={removeDeadends}
                        onChange={e => setRemoveDeadends(Number(e.target.value))}
                    />
                </div>

                <div>
                    Add Stairs:
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={addStairs}
                        onChange={e => setAddStairs(Number(e.target.value))}
                    />
                </div>

                <div>
                    Seed:
                    <input
                        type="text"
                        value={seed}
                        onChange={e => setSeed(e.target.value.replace(/\D/g, ''))}
                    />
                    <button onClick={randomizeSeed}>Randomize</button>
                </div>

                <div>
                    Map Style: STANDARD (static)
                </div>

                <div>
                    Cell Size: {cellSize}
                    <input
                        type="range"
                        min={5}
                        max={50}
                        value={cellSize}
                        onChange={e => setCellSize(Number(e.target.value))}
                    />
                </div>

                <div>
                    Grid:
                    <label>
                        <input
                            type="radio"
                            name="grid"
                            value="SQUARE"
                            checked={grid === Grid.SQUARE}
                            onChange={() => setGrid(Grid.SQUARE)}
                        /> SQUARE
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="grid"
                            value="HEX"
                            checked={grid === Grid.HEX}
                            onChange={() => setGrid(Grid.HEX)}
                        /> HEX
                    </label>
                </div>
            </div>
            <div>
                <DungeonCanvas
                    nRows={nRows}
                    nCols={nCols}
                    dungeonLayout={dungeonLayout}
                    roomMin={roomMin}
                    roomMax={roomMax}
                    roomLayout={roomLayout}
                    corridorLayout={corridorLayout}
                    removeDeadends={removeDeadends}
                    addStairs={addStairs}
                    seed={Number(seed)}
                    mapStyle="STANDARD" // Hardcoded for no alternatives
                    cellSize={cellSize}
                    grid={grid}
                />
            </div>
        </div>
    );
};

export default DungeonWrapper;
