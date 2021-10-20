import { render, screen } from "@testing-library/react";
import Progress from "./index";

test("displays the progress message", () => {
  render(<Progress />);

  const addressLabel = screen.getByText(/Generating REport/i);
  expect(addressLabel).toBeInTheDocument();
});
