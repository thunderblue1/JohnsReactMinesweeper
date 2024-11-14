import { useEffect, useState } from "react";
import { Tile } from "./Tile";
import "./GameBoard.css";

type GameBoardProps = {
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

type Board = Cell[];

export function GameBoard({ rows, cols, difficulty }: GameBoardProps) {
  const [board, setBoard] = useState<Board>([]);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);

  useEffect(() => {
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
    setBoard(newBoard);
  }, []);

  useEffect(() => {
    if (!gameLost && board.length > 0) {
      checkGameWin();
    }
  }, [board]);

  function floodFill(id: string): Board {
    let myBoard = Array.from(board);

    const firstCell = board.filter((cell) => {
      if (cell.id === id) return true;
      return false;
    })[0];

    if (firstCell.isMine) return boardExploded();

    function visitCells(id: string) {
      const visited = myBoard.reduce((endValue, currentValue) => {
        if (currentValue.id === id) {
          return currentValue;
        }
        return endValue;
      }, myBoard[0]);

      myBoard = myBoard.map((cell) => {
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
              if (!toVisit.isShown) {
                visitCells(`${visited.row + i},${visited.col + j}`);
              }
            }
          }
        }
      }
      return myBoard;
    }
    visitCells(id);
    return myBoard;
  }

  function boardExploded() {
    setGameLost(true);
    const myBoard = board.map((cell) => {
      if (cell.isMine) {
        const newCell: Cell = { ...cell, isExploded: true, isFlagged: false };
        return newCell;
      }
      return cell;
    });
    return myBoard;
  }

  function checkGameWin() {
    let remainingIsMine = board
      .filter((cell) => {
        return !cell.isShown;
      })
      .map((cell) => cell.isMine);
    let win = remainingIsMine.reduce((finalResult, current) => {
      if (!current) {
        finalResult = false;
      }
      return finalResult;
    }, true);
    if (win === true) {
      setGameWon(true);
      console.log("You Win!");
    }
  }

  function handleLeftClick(id: string, flag: string) {
    if (flag === "1") {
      const updated = board.map((cell) => {
        if (cell.id === id) {
          return { ...cell, isFlagged: !cell.isFlagged };
        }
        return cell;
      });
      setBoard(updated);
    } else {
      if (!gameLost && !gameWon) {
        const newBoard = floodFill(id);
        setBoard(newBoard);
      }
    }
  }

  function handleRightClick(id: string) {
    if (!gameLost && !gameWon) {
      const newBoard = board.map((cell) => {
        if (cell.id === id) {
          const newCell: Cell = { ...cell, isFlagged: !cell.isFlagged };
          return newCell;
        }
        return cell;
      });
      setBoard(newBoard);
    }
  }

  return (
    <>
      {gameWon ? <h1 style={{ backgroundColor: "green" }}>You Win!</h1> : null}
      {gameLost ? <h1 style={{ backgroundColor: "red" }}>You Lost</h1> : null}
      <div
        id="board"
        className="minesweeper"
        style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
      >
        {board.map((cell) => {
          return (
            <Tile
              leftClick={(e: React.MouseEvent) => {
                e.preventDefault();
                const isFlag = e.currentTarget.getAttribute("data-flag")!;
                handleLeftClick(cell.id, isFlag);
              }}
              rightClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleRightClick(cell.id);
              }}
              key={cell.id}
              {...cell}
            />
          );
        })}
      </div>
    </>
  );
}
