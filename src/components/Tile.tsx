import { Cell } from "./GameBoard";

type TileProps = {
  leftClick: (e: React.MouseEvent) => void;
  rightClick: (e: React.MouseEvent) => void;
} & Cell;

export function Tile({
  leftClick,
  rightClick,
  id,
  liveNeighbors,
  isFlagged,
  isExploded,
  isShown,
}: TileProps) {
  return (
    <div
      onClick={leftClick}
      onContextMenu={rightClick}
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
