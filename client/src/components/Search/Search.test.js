import { render, screen } from "@testing-library/react";
import Search from "./index";

test("displays both search ranges", () => {
  render(<Search />);
  const searchRange = screen.getByText(/Search by Range/i);
  expect(searchRange).toBeInTheDocument();
  const searchNBlocks = screen.getByText(/Search by Last N Blocks/i);
  expect(searchNBlocks).toBeInTheDocument();
});
