import { GameBoard } from './components/GameBoard'
import './App.css'
import { useReducer, useState } from 'react'
import NavBar from './components/NavBar'
import { generateGameId } from './BusinessLogic'

export type GameLevel = "EASY"|"MODERATE"|"HARD"

function App() {

  const [gameLevel, setGameLevel] = useState<GameLevel>("EASY")
  const [gameId, dispatch] = useReducer(reducer, "")

  function reducer(gameId:string, gameLevel:GameLevel):string {
    switch(gameLevel) {
      case "EASY":
        setGameLevel("EASY");
        break;
      case "MODERATE":
        setGameLevel("MODERATE");
        break;
      case "HARD":
        setGameLevel("HARD");
        break;
    }

    return generateGameId()
  }

  return (
    <>
      <NavBar dispatch={dispatch}/>
      <div className='flex'>
        <h1>John Keen Introduces</h1>
        <h1>React Minesweeper Clone</h1>


        {gameLevel==="EASY"&&<GameBoard key={`EASY-${gameId}`} rows={10} cols={10} difficulty={5}/>}
        {gameLevel==="MODERATE"&&<GameBoard key={`MODERATE-${gameId}`} rows={15} cols={15} difficulty={10}/>}
        {gameLevel==="HARD"&&<GameBoard key={`HARD-${gameId}`} rows={20} cols={20} difficulty={25}/>}        
      </div>
    </>
  )
}

export default App