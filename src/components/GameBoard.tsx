import { useEffect, useRef, useState } from "react";
import { Tile } from "./Tile";
import "./GameBoard.css";
import { Board, Cell, visitCell, GameBoardProps, setupBoard } from "../BusinessLogic";

export function GameBoard({ rows, cols, difficulty }: GameBoardProps) {
  const [board, setBoard] = useState<Board>([]);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const neighborsIdRef = useRef<string[]>([])
  const mouseDownIdRef = useRef<string>("")
  const leftRef = useRef(false);
  const bothRef = useRef(false);

  useEffect(() => {
    setBoard(()=>{
      return setupBoard({rows,cols,difficulty})
    });

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
  }, []);

  useEffect(() => {
    if (!gameLost && !gameWon && board.length > 0) {
      checkGameWin();
      checkGameLost();
    }
  }, [board]);

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
      setBoard((previousBoard)=>{
        return previousBoard.map((cell)=>{
          if(cell.isMine) {
            return {...cell, isFlagged: true}
          }
          return cell
        })
      })
      setGameWon(true);
      console.log("You Win!");
    }
  }

  function checkGameLost() {
    const bombs = board.filter(cell=>cell.isMine)
    if(bombs?.length>0&&bombs[0].isExploded) {
      setGameLost(true);
    }
  }

  function handleLeftClick(id: string, flag: string) {
    if (gameLost || gameWon) return; 
    if (flag === "1") {
      const updated = board.map((cell) => {
        if (cell.id === id) {
          return { ...cell, isFlagged: !cell.isFlagged };
        }
        return cell;
      });
      setBoard(updated);
    } else {
      const newBoard = visitCell(id,rows,cols, board);
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
            myBoard = visitCell(id, rows, cols, myBoard)
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
        onContextMenu={(e:React.MouseEvent)=>{e.preventDefault()}}
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