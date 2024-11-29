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
            isMine: Math.random() < difficulty / 100 ? true : false,
            isFlagged: false,
            isExploded: false,
            isShown: false,
        };
        newBoard.push(newCell);
        }
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

function floodFill(id: string,rows:number,cols:number, passedBoard:Board):Board {
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
    console.log(myBoard)
    return myBoard
}

function boardExploded(passedBoard:Board):Board {
    const myBoard = passedBoard.map((cell) => {
        if (cell.isMine) {
        const newCell: Cell = { ...cell, isExploded: true, isFlagged: false };
        return newCell;
        }
        return cell;
    });
    return myBoard;
}
