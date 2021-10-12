import { render, screen } from "@testing-library/react";
import Summary from "./index";

test("Adds a summary card to the dashboard", () => {
  render(<Summary summary={{ uniqueAddresses: 100 }} />);

  const addressLabel = screen.getByText(/Unique Addresses/i);
  expect(addressLabel).toBeInTheDocument();
  const dataHeader = screen.getByText(/100/i);
  expect(dataHeader).toBeInTheDocument();
});
