import { GameBoard } from './components/GameBoard'
import './App.css'
import { useReducer, useState } from 'react'
import NavBar from './components/NavBar'

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
    // console.log(`Ending Game ID:${gameId}`)
    if(!crypto.randomUUID) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
    }
    return crypto.randomUUID(); 
  }

  return (
    <>
      <NavBar dispatch={dispatch}/>
      <div className='flex'>
        <h1>John Keen Introduces</h1>
        <h1>React Minesweeper</h1>


        {gameLevel==="EASY"&&<GameBoard key={`EASY-${gameId}`} rows={10} cols={10} difficulty={5}/>}
        {gameLevel==="MODERATE"&&<GameBoard key={`MODERATE-${gameId}`} rows={15} cols={15} difficulty={10}/>}
        {gameLevel==="HARD"&&<GameBoard key={`HARD-${gameId}`} rows={20} cols={20} difficulty={25}/>}        
      </div>
    </>
  )
}

export default App