import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { GameBoard } from "./GameBoard";


describe("GameBoard Component", () => {
  const rows = 5;
  const cols = 5;
  const difficulty = 10;

  beforeEach(() => {
    // Rerender the component for each test
    render(<GameBoard rows={rows} cols={cols} difficulty={difficulty} />);
  });

  it("should render the game board with the correct number of cells", () => {
    const cells = screen.getAllByRole("button");
    expect(cells.length).toBe(rows * cols);
  });

  it("should toggle flag on right-click", async () => {
    const user = userEvent.setup();
    const cells = screen.getAllByRole("button");

    // Right-click the first cell
    await user.pointer({ keys: "[MouseRight]", target: cells[0] });

    // Check if it is flagged
    expect(cells[0]).toHaveAttribute("data-flag", "1");

    // Right-click again to remove the flag
    await user.pointer({ keys: "[MouseRight]", target: cells[0] });
    expect(cells[0]).toHaveAttribute("data-flag", "0");
  });

  it("should reveal a cell on left-click", async () => {
    const user = userEvent.setup();
    const cells = screen.getAllByRole("button");

    // Left-click the first cell
    await user.click(cells[0]);

    // Check if the cell is revealed (adjust based on your class or attributes)
    expect(cells[0]).toHaveClass("revealed");
  });

  it("should display 'You Win!' message when all mines are flagged", async () => {
    const user = userEvent.setup();

    // Simulate flagging all mines
    const cells = screen.getAllByRole("button");
    for (const cell of cells) {
      if (cell.getAttribute("data-mine") === "true") {
        await user.pointer({ keys: "[MouseRight]", target: cell });
      }
    }

    // Check if the win message is displayed
    expect(screen.getByText("You Win!")).toBeInTheDocument();
  });

  it("should display 'You Lost' message when clicking a mine", async () => {
    const user = userEvent.setup();
    const cells = screen.getAllByRole("button");

    // Find and click a mine
    const mineCell = cells.find((cell) => cell.getAttribute("data-mine") === "true");
    await user.click(mineCell!);

    // Check if the lose message is displayed
    expect(screen.getByText("You Lost")).toBeInTheDocument();
  });

  it("should handle multi-click revealing neighbors when flags match", async () => {
    const user = userEvent.setup();
    const cells = screen.getAllByRole("button");

    // Simulate clicking and flagging neighbors
    const targetCell = cells[12]; // Choose a center cell
    const neighbors = cells.slice(6, 9); // Adjust based on getNeighborsIds

    for (const neighbor of neighbors) {
      await user.pointer({ keys: "[MouseRight]", target: neighbor }); // Flag neighbors
    }

    // Multi-click with both buttons
    await user.pointer({ keys: "[MouseLeft][MouseRight]", target: targetCell });

    // Verify neighbors are revealed
    for (const neighbor of neighbors) {
      expect(neighbor).toHaveClass("revealed");
    }
  });
});