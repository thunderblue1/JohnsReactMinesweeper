import { useEffect, useRef, useState } from "react";
import { Tile } from "./Tile";
import "./GameBoard.css";
import { Board, visitCell, GameBoardProps, setupBoard, toggleFlag, getNeighborsIds, getNumberOfNeighborFlags, visitAllCells, removeAllActive, addNeighborsActive, checkIfAllMines } from "../BusinessLogic";

export function GameBoard({ rows, cols, difficulty, testBoard }: GameBoardProps) {
  const [board, setBoard] = useState<Board>([]);
  const boardRef = useRef<Board>()
  boardRef.current = board;
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const neighborsIdRef = useRef<string[]>([])
  const mouseDownIdRef = useRef<string>("")
  const leftRef = useRef(false);
  const bothRef = useRef(false);

  useEffect(() => {
    if(testBoard) {
      console.log("Test Game Launched")
      setBoard(()=>{
        return testBoard
      });
    } else {
      console.log("Real Game Launched")
      setBoard(()=>{
        return setupBoard({rows,cols,difficulty})
      });
    }

    //Add event listener outside of the board to restore
    //left and both mousedown refs in case of mouseup outside of board
    const outsideOnMouseUp = (e:MouseEvent)=>{
      const boardElement = document.getElementById("board");
      if (boardElement && !boardElement.contains(e.target as Node)) {
        leftRef.current=false;
        bothRef.current=false;
        setBoard(removeAllActive(boardRef.current!))
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
    //If all that is remaining is mines then
    //flag remaining tiles and set game won state
    //so that winning message will be displayed
    let win = checkIfAllMines(board)
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
    //If there are bombs and one exploded then the game is lost
    const bombs = board.filter(cell=>cell.isMine)
    if(bombs?.length>0&&bombs[0].isExploded) {
      setGameLost(true);
    }
  }

  function handleLeftClick(e:React.MouseEvent,id:string) {
    e.preventDefault();
    const flag = e.currentTarget.getAttribute("data-flag")!;
    if (gameLost || gameWon) return; 
    //If it is flagged then toggle the flag on left click
    if (flag === "1") {
      const updated = toggleFlag(id,board)
      setBoard(updated);
    } else {
      //If not flagged then visit the cell and floodfill if blank
      const newBoard = visitCell(id,rows,cols, board);
      setBoard(newBoard);
    }
  }

  function handleRightClick(e:React.MouseEvent, id: string) {
    e.preventDefault();
    if (gameLost || gameWon) return
    //Toggle flag on right click
    if(leftRef.current.valueOf()===false) {
      const newBoard = toggleFlag(id,board)
      setBoard(newBoard);
    }
  }

  function myMouseDown(e:React.MouseEvent) {
    e.preventDefault();
    if(e.button===0) {
      //Keep track of left mousedown for multiclick functionality
      leftRef.current = true
    } else if(leftRef.current===true) {
      //Keep track of the fact that both left and right mousedown
      //has occured for multiclick on mouseup
      bothRef.current=true;
      const myTarget = e.target as HTMLElement
      const id = myTarget.dataset.id!
      //Add depressed class to neighbors of target while both buttons
      //are in mousedown
      const neighborsIds:string[] = getNeighborsIds(id,rows,cols);
      neighborsIdRef.current = neighborsIds
      setBoard(addNeighborsActive(neighborsIds,board))
      mouseDownIdRef.current = id;
    }
  }

  function myMouseUp(e:React.MouseEvent) {
    if(e.button===0) {
      //Restore ref for the left mousedown on left mouseup
      leftRef.current = false
    } else if(bothRef.current===true&&!gameLost&&!gameWon) {
      const myTarget = e.target as HTMLElement
      const id = myTarget.dataset.id!
      //If mouseup target was the same as mousedown target then
      //multi click neighbor tiles
      if(id===mouseDownIdRef.current) {
        const numberOfNeighborFlags = getNumberOfNeighborFlags(neighborsIdRef.current, board)
        const clickedCell = board.find(cell=>{
          return cell.id===id
        })
        //Only multi click if the number flags matches number on tile
        if(numberOfNeighborFlags===clickedCell?.liveNeighbors) {
          setBoard(visitAllCells(neighborsIdRef.current,rows,cols,board))
          
        }
      }
      bothRef.current = false;
    }
    setBoard((myBoard)=>{return removeAllActive(myBoard)})
  }
  
  return (
    <>
      {!gameLost&&!gameWon&&<h1 className="game-message play">Game On</h1>}
      {gameWon ? <h1 className="game-message win">You Win!</h1> : null}
      {gameLost ? <h1 className="game-message lose">You Lost</h1> : null}
      <div
        id="board"
        className="minesweeper"
        style={{ gridTemplateColumns: `repeat(${cols}, 25px)` }}
        onMouseUp={(e:React.MouseEvent)=>{e.preventDefault();myMouseUp(e)}}
        onContextMenu={(e:React.MouseEvent)=>{e.preventDefault()}}
      >
        {board.map((cell) => {
          return (
            <Tile
              leftClick={(e: React.MouseEvent) => {handleLeftClick(e,cell.id);}}
              rightClick={(e: React.MouseEvent) => {handleRightClick(e,cell.id);}}
              mouseDown={(e:React.MouseEvent)=>{myMouseDown(e)}}
              key={cell.id}
              {...cell}
            />
          );
        })}
      </div>
    </>
  );
}