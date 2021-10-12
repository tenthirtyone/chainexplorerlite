import { render, screen } from "@testing-library/react";
import AppBar from "./index";

test("Adds a summary card to the dashboard", () => {
  render(<AppBar startBlock={10} endBlock={100} />);

  const header = screen.getByText(/Reporting on 10 - 100/i);
  expect(header).toBeInTheDocument();
});
