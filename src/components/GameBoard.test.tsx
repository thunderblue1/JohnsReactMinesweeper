import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { GameBoard } from "./GameBoard";
import userEvent from "@testing-library/user-event";

describe("GameBoard",()=>{
    const rows = 4;
    const cols = 4;
    
    const liveNeighborsData = [
        [2, 9, 2, 0],
        [3, 9, 3, 0],
        [3, 9, 3, 0],
        [2, 9, 2, 0],
    ];
    const isMineData = [
        [false, true, false, false],
        [false, true, false, false],
        [false, true, false, false],
        [false, true, false, false],
    ];

    beforeEach(() => {
        const board = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
            board.push({
                row: row,
                col: col,
                id: `${row},${col}`,
                liveNeighbors: liveNeighborsData[row][col],
                isMine: isMineData[row][col],
                isFlagged: false,
                isExploded: false,
                isShown: false,
                isActive: false,
            });
            }
        }

        // Rerender the component for each test
        render(<GameBoard rows={rows} cols={cols} difficulty={0} testBoard={board}/>);
    });

    it("ensure that the board has the correct number of cells",()=>{
        const cells = screen.getAllByTestId("cell")
        expect(cells.length).toBe(rows*cols)
    })

    it("should toggle flag on right click", async () => {
        const user = userEvent.setup();
        const cells = screen.getAllByTestId("cell")
    
        // Right-click the first cell
        await user.pointer({ keys: "[MouseRight]", target: cells[0] });
    
        // Check if it is flagged
        expect(cells[0]).toHaveAttribute("data-flag", "1");
    
        // Right-click again to remove the flag
        await user.pointer({ keys: "[MouseRight]", target: cells[0] });
        expect(cells[0]).toHaveAttribute("data-flag", "0");
    });

    it("should reveal a cell on left click", async () => {
        const user = userEvent.setup();
        const cells = screen.getAllByTestId("cell")

        // Left-click the first cell
        await user.click(cells[0]);
    
        // Check if the cell is revealed
        expect(cells[0]).toHaveAttribute("data-revealed", "1");
    });


    it("should display 'You Win!' message when only mines are left", async () => {
        const user = userEvent.setup();
    
        // Click on every cell that is not a mine
        const cells = screen.getAllByTestId("cell")
        
        for (const cell of cells) {
          const position = cell.id.split(",")
          if (position[1]!=="1") {
            await user.pointer({ keys: "[MouseLeft]", target: cell });
          }
        }
    
        // Check if the win message is displayed
        expect(screen.getByText("You Win!")).toBeInTheDocument();
    });

    it("should display 'You Lost' message when mine is clicked on", async () => {
        const user = userEvent.setup();
    
        // Click on a cell that is a mine
        const cells = screen.getAllByTestId("cell")
        
        for (const cell of cells) {
          const position = cell.id.split(",")
          if (position[1]==="1") {
            await user.pointer({ keys: "[MouseLeft]", target: cell });
            break;
          }
        }
    
        // Check if the win message is displayed
        expect(screen.getByText("You Lost")).toBeInTheDocument();
    });

    it("should make all neighbor cells active on multi click", async () => {
        const user = userEvent.setup();
    
        // Click on a cell that is a mine
        const cells = screen.getAllByTestId("cell")!
        const cell = cells.find(cell=>cell.id==="2,2")!
        
        //Mouse down a specified cell
        await user.pointer({ keys: "[MouseLeft>]", target: cell });
        await user.pointer({ keys: "[MouseRight>]", target: cell });

        //Check that all surrounding cells and only surrounding cells are active
        let cellsActive = cells.filter(cell=>cell.dataset.active==="1").map(cell=>{return cell.id})
        expect(cellsActive.length).toBe(8)

        let neighbors = []
        let position = cell.getAttribute("id")!.split(",")
        const x = parseInt(position[0])
        const y = parseInt(position[1])
        for(let i=-1;i<2;i++) {
            for(let j=-1;j<2;j++) {
                if(i===0&&j===0) continue
                neighbors.push((x+i)+","+(y+j))
            }
        }
        let matched = true

        cellsActive.forEach(data=>{
            if(!neighbors.includes(data)) {
                matched=false
            }
        })
        expect(matched).toBe(true)
    });


    it("should make all neighbor cells, that are not flagged or shown, active on multi click", async () => {
        const user = userEvent.setup();
    
        // Click on a cell that is a mine
        const cells = screen.getAllByTestId("cell")!
        const cell = cells.find(cell=>cell.id==="2,2")!
        const flaggedCell = cells.find(cell=>cell.id==="1,2")!
        const clickedCell = cells.find(cell=>cell.id==="3,2")!
        
        await user.pointer({ keys: "[MouseLeft]", target: clickedCell });
        await user.pointer({ keys: "[MouseRight]", target: flaggedCell });

        //Mouse down a specified cell
        await user.pointer({ keys: "[MouseLeft>]", target: cell });
        await user.pointer({ keys: "[MouseRight>]", target: cell });

        //Check that all surrounding cells and only surrounding cells are active
        let cellsActive = cells.filter(cell=>cell.dataset.active==="1").map(cell=>{return cell.id})
        expect(cellsActive.length).toBe(6)

        let neighbors = []
        let position = cell.getAttribute("id")!.split(",")
        const x = parseInt(position[0])
        const y = parseInt(position[1])
        for(let i=-1;i<2;i++) {
            for(let j=-1;j<2;j++) {
                if(i===0&&j===0) continue
                if(i===1&&j===2) continue
                if(i===3&&j===2) continue
                neighbors.push((x+i)+","+(y+j))
            }
        }
        let matched = true

        cellsActive.forEach(data=>{
            if(!neighbors.includes(data)) {
                matched=false
            }
        })
        expect(matched).toBe(true)
    });

})