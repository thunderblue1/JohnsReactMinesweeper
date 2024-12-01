import { describe, expect, it } from "vitest";
import { addNeighborsActive, Board, boardExploded, checkIfAllMines, floodFill, generateGameId, getNeighborsIds, getNumberOfNeighborFlags, removeAllActive, setupBoard, toggleFlag, visitAllCells, visitCell } from "./BusinessLogic";

describe("#setupBoard",()=>{
    it('creates a board with the correct number of cells', () => {
        const rows = 5;
        const cols = 5;
        const difficulty = 20;
        const board = setupBoard({ rows, cols, difficulty });
    
        expect(board.length).toBe(rows * cols);
      });
    
      it('assigns the correct properties to each cell', () => {
        const rows = 3;
        const cols = 3;
        const difficulty = 10;
        const board = setupBoard({ rows, cols, difficulty });
    
        board.forEach((cell) => {
          expect(cell).toHaveProperty('row');
          expect(cell).toHaveProperty('col');
          expect(cell).toHaveProperty('id');
          expect(cell).toHaveProperty('liveNeighbors');
          expect(cell).toHaveProperty('isMine');
          expect(cell).toHaveProperty('isFlagged');
          expect(cell).toHaveProperty('isExploded');
          expect(cell).toHaveProperty('isShown');
          expect(cell).toHaveProperty('isActive');
        });
      });
    
      it('generates the correct number of mines based on difficulty', () => {
        const rows = 10;
        const cols = 10;
        const difficulty = 30;
        const board = setupBoard({ rows, cols, difficulty });
    
        const mineCount = board.filter((cell) => cell.isMine).length;
        const expectedMines = Math.round((rows * cols * difficulty) / 100);
    
        expect(mineCount).toBeGreaterThanOrEqual(expectedMines - 5);
        expect(mineCount).toBeLessThanOrEqual(expectedMines + 5);
      });
    
      it('correctly calculates liveNeighbors for non-mine cells', () => {
        const rows = 10;
        const cols = 10;
        const difficulty = 99;
        let board = setupBoard({ rows, cols, difficulty });
    
        //Get the cell that was not a bomb  
        const targetCell = board.find((cell) => cell.isMine === false)!;
        const position = targetCell.id.split(",")

        //Check corners
        if(targetCell.id==="0,0"||targetCell.id==="0,9"||targetCell.id==="9,0"||targetCell.id==="9,9") {
            expect(targetCell?.liveNeighbors).toBe(3);            
        //Check edges
        } else if(position[0]==="0"||position[0]==="9"||position[1]==="0"||position[1]==="9") {
            expect(targetCell?.liveNeighbors).toBe(5);            
        //Check middle
        } else {
            expect(targetCell?.liveNeighbors).toBe(8);
        }    
      });
})

describe("#visitCell",()=>{
    it('handles a cell containing a mine', () => {
        const board = setupBoard({rows:1, cols:1, difficulty:100});
        const result = visitCell('0,0', 1, 1, board);
        const explodedMines = result.filter(cell => cell.isMine && cell.isExploded);
        expect(explodedMines.length).toBe(1);
        expect(explodedMines[0].id).toBe('0,0');
    });
    
    it('reveals cells with no neighboring mines', () => {
        const board = setupBoard({rows: 3, cols: 3, difficulty:0});
        const result = visitCell('1,1', 3, 3, board);
        const revealedCells = result.filter(cell => cell.isShown);
        // All cells should be revealed
        expect(revealedCells.length).toBe(9); 
    });

    it('reveals a cell with neighboring mines', () => {
        const rows=3;
        const cols=3;
        const board:Board = [];
        for(let i=0;i<rows;i++) {
            for(let j=0;j<cols;j++) {
                const newCell = {
                    row: i,
                    col: j,
                    id: `${i},${j}`,
                    liveNeighbors: 0,
                    isMine: (i+","+j==="0,0"||i+","+j==="2,2")?true:false,
                    isFlagged: false,
                    isExploded: false,
                    isShown: false,
                    isActive: false
                };
                if(newCell.id==="0,0"||newCell.id==="2,2") {
                    newCell.liveNeighbors = 9
                } else if(newCell.id==="0,1"||newCell.id==="1,0"||newCell.id==="2,1"||newCell.id==="1,2"||newCell.id==="2,0"||newCell.id==="0,2") {
                    newCell.liveNeighbors = 0
                } else {
                    newCell.liveNeighbors = 2;
                }

                board.push(newCell);
            }
        }
        const result = visitCell('1,1', 3, 3, board);
        const revealedCells = result.filter(cell => cell.isShown);
        expect(revealedCells.length).toBe(1);
        // Only the clicked cell is revealed
        expect(revealedCells[0].id).toBe('1,1');
    });

    it('marks all mines as exploded when a mine is clicked', () => {
        const board = setupBoard({rows:4,cols:4,difficulty:50});
        const firstMine = board.find(cell=>cell.isMine)!
        const result = visitCell(firstMine.id, 3, 3, board);
        const explodedMines = result.filter(cell => cell.isMine && cell.isExploded);
        expect(explodedMines.length).toBe(8);
    });
})

describe("#floodFill",()=>{
    it('reveals cells with no neighboring mines', () => {
        const board = setupBoard({rows: 3, cols: 3, difficulty:0});
        const result = floodFill('1,1', 3, 3, board);
        const revealedCells = result.filter(cell => cell.isShown);
        // All cells should be revealed
        expect(revealedCells.length).toBe(9); 
    });

    it('reveals a cell with neighboring mines', () => {
        const rows=3;
        const cols=3;
        const board:Board = [];
        for(let i=0;i<rows;i++) {
            for(let j=0;j<cols;j++) {
                const newCell = {
                    row: i,
                    col: j,
                    id: `${i},${j}`,
                    liveNeighbors: 0,
                    isMine: (i+","+j==="0,0"||i+","+j==="2,2")?true:false,
                    isFlagged: false,
                    isExploded: false,
                    isShown: false,
                    isActive: false
                };
                if(newCell.id==="0,0"||newCell.id==="2,2") {
                    newCell.liveNeighbors = 9
                } else if(newCell.id==="0,1"||newCell.id==="1,0"||newCell.id==="2,1"||newCell.id==="1,2"||newCell.id==="2,0"||newCell.id==="0,2") {
                    newCell.liveNeighbors = 0
                } else {
                    newCell.liveNeighbors = 2;
                }

                board.push(newCell);
            }
        }
        const result = floodFill('1,1', 3, 3, board);
        const revealedCells = result.filter(cell => cell.isShown);
        expect(revealedCells.length).toBe(1);
        // Only the clicked cell is revealed
        expect(revealedCells[0].id).toBe('1,1');
    });

    it('does not visit flagged or shown cells', () => {
        const board = setupBoard({rows:3,cols:3,difficulty:0});
        board[4].isFlagged=true;
        const result = floodFill('0,0', 3, 3, board);
        expect(result[4].isShown).toBe(false);

        const revealedCells = result.filter(cell => cell.isShown);
        expect(revealedCells.length).toBe(8);
    });
})

describe("#boardExploded",()=>{
    it('marks all mines as exploded', () => {
        const board = setupBoard({rows:4,cols:4,difficulty:50});
        const result = boardExploded(board);
        expect(result.filter(cell => cell.isExploded).length).toBe(8);
        expect(result.filter(cell => cell.isMine).every(cell => cell.isExploded)).toBe(true);
    });
    
    it('leaves non-mine cells unchanged', () => {
        const board = setupBoard({rows:4,cols:4,difficulty:50});
        const result = boardExploded(board);
        expect(result.filter(cell => !cell.isMine && cell.isExploded).length).toBe(0);
    });
})

describe("#toggleFlag",()=>{
    it('flags an unflagged cell', () => {
        const board = setupBoard({rows:3,cols:3,difficulty:50});
        const result = toggleFlag('1,1', board);
        expect(result[4].isFlagged).toBe(true);
    });
    
    it('unflags a flagged cell', () => {
        const board = setupBoard({rows:3,cols:3,difficulty:50});
        board[4].isFlagged = true;
        const result = toggleFlag('1,1', board);
        expect(result[4].isFlagged).toBe(false);
    });
    
    it('does nothing if the cell is already shown', () => {
        const board = setupBoard({rows:3,cols:3,difficulty:50});
        board[4].isShown = true;
        const result = toggleFlag('1,1', board);
        expect(result[4].isFlagged).toBe(false);
    });
})

describe("#getNeighborsIds",()=>{
    it("middle cell has 8 neighbor ids properly listed",()=>{
        const neighbors = getNeighborsIds("1,1",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["0,0","0,1","0,2",
            "1,0","1,2",
            "2,0","2,1","2,2"
            ]))
    })
    it("side cell has 5 neighbors properly listed",()=>{
        const neighbors = getNeighborsIds("1,0",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["0,0","0,1",
            "1,1",
            "2,0","2,1",
            ]))
    })
    it("corner cells have 3 neighbors properly listed",()=>{
        let neighbors = getNeighborsIds("0,0",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["0,1",
            "1,0","1,1"
        ]))
        neighbors = getNeighborsIds("0,2",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["0,1","1,1","1,2"]))
        neighbors = getNeighborsIds("2,0",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["1,0","1,1","2,1"]))
        neighbors = getNeighborsIds("2,2",3,3)
        expect(neighbors).toEqual(expect.arrayContaining(
            ["1,1","1,2","2,1"]))
    })
    it("only one cell should return an empty array",()=>{
        const neighbors = getNeighborsIds("1,1",1,1)
        expect(neighbors).toEqual(expect.arrayContaining([]))
    })
})

describe("#generateGameId",()=>{
    it("generate valid UUID",()=>{
        const id = generateGameId();
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
    })
})

describe("#getNumberOfNeighborFlags",()=>{
    it("count the flags",()=>{
        const rows=2;
        const cols=2;
        const board = []
        for(let i=0;i<rows;i++) {
            for(let j=0;j<cols;j++) {
                const newCell = {
                    row: i,
                    col: j,
                    id: `${i},${j}`,
                    liveNeighbors: 0,
                    isMine: false,
                    isFlagged: (i===0&&j===0)?false:true,
                    isExploded: false,
                    isShown: false,
                    isActive: false
                };
                board.push(newCell);
            }
        }
        const neighborsIds=["0,1","1,1","1,0"];
        const numberOfFlags = getNumberOfNeighborFlags(neighborsIds,board);
        expect(numberOfFlags).toBe(3)
    })
})

describe("#addNeighborsActive",()=>{
    it("make only neighbors active",()=>{
        const rows=3;
        const cols=3;
        const board = []
        for(let i=0;i<rows;i++) {
            for(let j=0;j<cols;j++) {
                const newCell = {
                    row: i,
                    col: j,
                    id: `${i},${j}`,
                    liveNeighbors: 0,
                    isMine: false,
                    isFlagged: false,
                    isExploded: false,
                    isShown: false,
                    isActive: false
                };
                board.push(newCell);
            }
        }
        const neighbors=["0,1","1,1","1,0"];
        const updatedBoard = addNeighborsActive(neighbors,board)
        expect(updatedBoard.find(cell => cell.id === "0,1")?.isActive).toBe(true);
        expect(updatedBoard.find(cell => cell.id === "1,1")?.isActive).toBe(true);
        expect(updatedBoard.find(cell => cell.id === "1,0")?.isActive).toBe(true);
        const active = updatedBoard.filter(data=>{return data.isActive===true}).length
        expect(active).toBe(3)
    })
})

describe("#removeAllActive",()=>{
    it("set all cells as not active",()=>{
        const rows=3;
        const cols=3;
        const board = []
        for(let i=0;i<rows;i++) {
            for(let j=0;j<cols;j++) {
                const newCell = {
                    row: i,
                    col: j,
                    id: `${i},${j}`,
                    liveNeighbors: 0,
                    isMine: false,
                    isFlagged: false,
                    isExploded: false,
                    isShown: false,
                    isActive: (i===0&&j===0)?false:true
                };
                board.push(newCell);
            }
        }
        const updatedBoard = removeAllActive(board)
        expect(updatedBoard.find(cell => cell.id === "0,0")?.isActive).toBe(false);
        expect(updatedBoard.find(cell => cell.id === "0,1")?.isActive).toBe(false);
        expect(updatedBoard.find(cell => cell.id === "1,1")?.isActive).toBe(false);
        expect(updatedBoard.find(cell => cell.id === "1,0")?.isActive).toBe(false);
        const active = updatedBoard.filter(data=>{return data.isActive===true}).length
        expect(active).toBe(0)
    })
})

describe("#visitAllCells",()=>{
    it("visit cells passed as array that aren't shown or flagged",()=>{
        const rows = 4;
        const cols = 4;
        
        const liveNeighborsData = [
          [2, 9, 2, 0],
          [3, 9, 3, 0],
          [3, 9, 3, 0],
          [2, 9, 2, 0],
        ];
        const isMineData = [
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
        ];
        
        const board = [];
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            board.push({
              row: row,
              col: col,
              id: `${row},${col}`,
              liveNeighbors: liveNeighborsData[row][col],
              isMine: isMineData[row][col],
              isFlagged: false,
              isExploded: false,
              isShown: false,
              isActive: false,
            });
          }
        }

        const updatedBoard = visitAllCells(["0,0","0,3"],4,4,board)
        const active = updatedBoard.filter(data=>{return data.isShown===true}).length
        expect(active).toBe(9)
    })
})

describe("#checkIfAllMines",()=>{
    it("check if all hidden cells are mines when they are all mines",()=>{
        const rows = 4;
        const cols = 4;
        
        const liveNeighborsData = [
          [2, 9, 2, 0],
          [3, 9, 3, 0],
          [3, 9, 3, 0],
          [2, 9, 2, 0],
        ];
        const isMineData = [
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
        ];

        const isShownData = [
            [true, false, true,true],
            [true, false, true,true],
            [true, false, true,true],
            [true, false, true,true],
        ];
        
        const board = [];
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            board.push({
              row: row,
              col: col,
              id: `${row},${col}`,
              liveNeighbors: liveNeighborsData[row][col],
              isMine: isMineData[row][col],
              isFlagged: false,
              isExploded: false,
              isShown: isShownData[row][col],
              isActive: false,
            });
          }
        }
        const minesResult = checkIfAllMines(board);
        expect(minesResult).toBe(true)
    })

    it("check if all hidden cells are mines when they are not all mines",()=>{
        const rows = 4;
        const cols = 4;
        
        const liveNeighborsData = [
          [2, 9, 2, 0],
          [2, 9, 2, 0],
          [2, 2, 2, 0],
          [1, 9, 1, 0],
        ];
        const isMineData = [
          [false, true, false, false],
          [false, true, false, false],
          [false, false, false, false],
          [false, true, false, false],
        ];
        
        const isShownData = [
            [true, false, true, true],
            [true, false, true, true],
            [true, false, true, true],
            [true, false, true, true],
        ];

        const board = [];
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            board.push({
              row: row,
              col: col,
              id: `${row},${col}`,
              liveNeighbors: liveNeighborsData[row][col],
              isMine: isMineData[row][col],
              isFlagged: false,
              isExploded: false,
              isShown: isShownData[row][col],
              isActive: false,
            });
          }
        }

        const minesResult = checkIfAllMines(board);
        expect(minesResult).toBe(false)
    })
})