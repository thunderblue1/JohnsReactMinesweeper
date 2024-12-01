export type GameBoardProps = {
  rows: number;
  cols: number;
  difficulty: number;
};

export type Cell = {
  row: number;
  col: number;
  id: string;
  liveNeighbors: number;
  isMine: boolean;
  isFlagged: boolean;
  isExploded: boolean;
  isShown: boolean;
  isActive: boolean;
};

export type Board = Cell[];

export function setupBoard({rows, cols, difficulty}:GameBoardProps):Board {
    let newBoard: Board = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
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
        newBoard.push(newCell);
      }
    }
    let mineCount:number = Math.floor((rows*cols)*(difficulty/100))
    while(mineCount>0) {
      const randomMine = Math.floor((cols*rows)*Math.random())
      if(newBoard[randomMine].isMine) continue
      newBoard[randomMine] = {...newBoard[randomMine],isMine:true}
      mineCount--
    }

    newBoard = newBoard.map((cell) => {
        if (!cell.isMine) {
          let count = 0;
          for (let i = -1; i < 2; i++) {
              for (let j = -1; j < 2; j++) {
                if (
                    cell.row + i >= 0 &&
                    cell.col + j >= 0 &&
                    cell.row + i < rows &&
                    cell.col + j < cols
                ) {
                    let checked = newBoard.filter((c) => {
                      if (c.id === `${cell.row + i},${cell.col + j}`) {
                          return true;
                      }
                      return false;
                    })[0];
                    if (checked.isMine) {
                      count++;
                    }
                }
              }
          }
          return { ...cell, liveNeighbors: count };
        }
        return { ...cell, liveNeighbors: 9 };
    });
    return newBoard
}

export function visitCell(id: string, rows: number,cols: number, passedBoard:Board): Board {
    const firstCell = passedBoard.filter((cell) => {
        if (cell.id === id) return true;
        return false;
    })[0];

    if (firstCell.isMine) return boardExploded(passedBoard);

    return floodFill(id,rows,cols,passedBoard);
}

export function floodFill(id: string,rows:number,cols:number, passedBoard:Board):Board {
    const visited = passedBoard.reduce((endValue, currentValue) => {
      if (currentValue.id === id) {
        return currentValue;
      }
      return endValue;
    }, passedBoard[0]);

    let myBoard = passedBoard.map((cell) => {
      if (cell.id === id) return { ...cell, isShown: true };
      return cell;
    });

    if (visited.liveNeighbors === 0) {
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (
            visited.row + i >= 0 &&
            visited.col + j >= 0 &&
            visited.row + i < rows &&
            visited.col + j < cols
          ) {
            let toVisit = myBoard.filter((c) => {
              if (c.id === `${visited.row + i},${visited.col + j}`) {
                return true;
              }
              return false;
            })[0];
            if (!toVisit.isShown&&!toVisit.isFlagged) {
              myBoard = floodFill(`${visited.row + i},${visited.col + j}`,rows,cols, myBoard);
            }
          }
        }
      }
    }
    return myBoard
}

export function boardExploded(passedBoard:Board):Board {
    const myBoard = passedBoard.map((cell) => {
        if (cell.isMine) {
        const newCell: Cell = { ...cell, isExploded: true, isFlagged: false };
        return newCell;
        }
        return cell;
    });
    return myBoard;
}

export function toggleFlag(id:string, board:Board):Board {
    return board.map((cell) => {
        if (cell.id === id&&!cell.isShown) {
            return { ...cell, isFlagged: !cell.isFlagged };
        }
        return cell;
    });
}

export function getNeighborsIds(id:string,rows:number,cols:number): string[] {
    const position = id.split(",")
    const neighborsId:string[] = [];
    for(let i=-1;i<2;i++) {
      for(let j=-1;j<2;j++) {
        const x = parseInt(position[0])+i
        const y = parseInt(position[1])+j
        if((i===0&&j===0)||x<0||y<0||x>=rows||y>=cols) continue
        neighborsId.push(`${x},${y}`)
      }
    }
    return neighborsId
}

export function generateGameId() {
    if(!crypto.randomUUID) {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    return crypto.randomUUID();
}

export function getNumberOfNeighborFlags(neighborsIds:string[], board:Board):number {
  let count = 0;
  neighborsIds.forEach(id=>{
    const neighbor = board.find(cell=>cell.id===id)
    if(neighbor?.isFlagged) count++
  })
  return count
}

export function addNeighborsActive(neighborsIds:string[], board:Board):Board {
  const myBoard = board.map(cell=>{
    if(neighborsIds.includes(cell.id)) return {...cell,isActive:true}
    return cell;
  })
  return myBoard
}

export function removeAllActive(board:Board):Board {
  const myBoard = board.map(cell=>{
    return {...cell,isActive:false}
  })
  return myBoard
}

export function visitAllCells(neighborsIds:string[],rows:number, cols:number, board:Board):Board {
  let myBoard = Array.from(board)
  neighborsIds.forEach(id=>{
    const neighbor = myBoard.find(cell=>cell.id===id)
    if(neighbor?.isShown===false&&neighbor?.isFlagged===false) {
      myBoard = visitCell(id, rows, cols, myBoard)
    }
  })
  return myBoard
}

export function checkIfAllMines(board:Board):boolean {
  let remaining = board
  .filter((cell) => {
    return !cell.isShown;
  })
  .map((cell) => cell.isMine);

  return remaining.reduce((finalResult, current) => {
    if (!current) {
      finalResult = false;
    }
    return finalResult;
  }, true);
}