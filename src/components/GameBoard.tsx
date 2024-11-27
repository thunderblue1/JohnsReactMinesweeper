import { useEffect, useRef, useState } from "react";
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
  const neighborsIdRef = useRef<string[]>([])
  const mouseDownIdRef = useRef<string>("")

  const leftRef = useRef(false);
  const bothRef = useRef(false);

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

  useEffect(()=>{
    const outsideOnMouseUp = (e:MouseEvent)=>{
      const boardElement = document.getElementById("board");
      if (boardElement && !boardElement.contains(e.target as Node)) {
        leftRef.current=false;
        bothRef.current=false;
        neighborsIdRef.current.forEach(neigh=>document.getElementById(neigh)?.classList.remove("active"))
      }
    }
    document.addEventListener("mouseup",outsideOnMouseUp)

    return ()=>{
      document.removeEventListener("mouseup",outsideOnMouseUp)
    }
  },[])

  useEffect(() => {
    if (!gameLost && board.length > 0) {
      checkGameWin();
    }
  }, [board]);

  function floodFill(id: string, passedBoard:Board): Board {
    let myBoard = Array.from(passedBoard);

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
              if (!toVisit.isShown&&!toVisit.isFlagged) {
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
      if (gameLost || gameWon) return; 
      const newBoard = floodFill(id,board);
      setBoard(newBoard);
    
    }
  }

  function handleRightClick(id: string) {
    if (gameLost || gameWon) return
    if(leftRef.current.valueOf()===false) {
      const newBoard = board.map((cell) => {
        if (cell.id === id&&!cell.isShown) {
          const newCell: Cell = { ...cell, isFlagged: !cell.isFlagged };
          return newCell;
        }
        return cell;
      });
      setBoard(newBoard);
    }
  }

  function myMouseDown(e:React.MouseEvent) {
    if(e.button===0) {
      leftRef.current = true
    } else if(leftRef.current===true) {    
      bothRef.current=true;
      const myTarget = e.target as HTMLElement
      const id = myTarget.dataset.id!
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
      neighborsId.forEach(neigh=>document.getElementById(neigh)?.classList.add("active"))
      neighborsIdRef.current = neighborsId
      mouseDownIdRef.current = id;
    }
  }

  function myMouseUp(e:React.MouseEvent) {
    if(e.button===0) {
      leftRef.current = false
    } else if(bothRef.current===true&&!gameLost&&!gameWon) {
      const myTarget = e.target as HTMLElement
      const id = myTarget.dataset.id!
      if(id===mouseDownIdRef.current) {
        let myBoard:Board = Array.from(board)
        neighborsIdRef.current.forEach(id=>{
          const neighbor = myBoard.filter(cell=>cell.id===id)
          if(neighbor[0].isShown===false&&neighbor[0].isFlagged===false) {
            myBoard = floodFill(id,myBoard)
          }
        })
        
        setBoard(myBoard)
      }
      bothRef.current = false;
      console.log("DONE")
    }
    neighborsIdRef.current.forEach(neigh=>document.getElementById(neigh)?.classList.remove("active"))
  }

  
  return (
    <>
      {!gameLost&&!gameWon&&<h1 className="game-message play">Game On</h1>}
      {gameWon ? <h1 className="game-message win">You Win!</h1> : null}
      {gameLost ? <h1 className="game-message lose">You Lost</h1> : null}
      <div
        id="board"
        className="minesweeper"
        style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
        onMouseUp={(e:React.MouseEvent)=>{e.preventDefault();myMouseUp(e)}}
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
              mouseDown={(e:React.MouseEvent)=>{e.preventDefault();myMouseDown(e)}}

              key={cell.id}
              {...cell}
            />
          );
        })}
      </div>
    </>
  );
}
