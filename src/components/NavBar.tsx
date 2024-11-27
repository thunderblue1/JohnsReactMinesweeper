import { GameLevel } from "../App";
import "./NavBar.css"

type NavBarProps = {
  dispatch: React.Dispatch<GameLevel>
}

export default function NavBar({dispatch}:NavBarProps) {
  return (
    <ul className="nav">
      <li onClick={()=>{dispatch("EASY")}}>Easy</li>
      <li onClick={()=>{dispatch("MODERATE")}}>Moderate</li>
      <li onClick={()=>{dispatch("HARD")}}>Hard</li>
    </ul>
  );
}