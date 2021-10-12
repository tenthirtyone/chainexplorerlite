import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the App Bar", () => {
  render(<App />);
  const AppBar = screen.getByText(/Choose a range of blocks/i);
  expect(AppBar).toBeInTheDocument();
});
