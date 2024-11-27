import { Cell } from "./GameBoard";

type TileProps = {
  leftClick: (e: React.MouseEvent) => void;
  rightClick: (e: React.MouseEvent) => void;
  mouseDown: (e: React.MouseEvent) => void;
} & Cell;

export function Tile({
  leftClick,
  rightClick,
  mouseDown,
  id,
  liveNeighbors,
  isFlagged,
  isExploded,
  isShown,
}: TileProps) {
  return (
    <div
      id={id}
      onClick={leftClick}
      onContextMenu={rightClick}
      onMouseDown={mouseDown}
      className="cell"
      data-id={id}
      data-flag={isFlagged ? 1 : 0}
      data-exploded={isExploded ? 1 : 0}
      data-revealed={isShown ? 1 : 0}
    >
      {isShown && liveNeighbors > 0 ? liveNeighbors : ""}
    </div>
  );
}
