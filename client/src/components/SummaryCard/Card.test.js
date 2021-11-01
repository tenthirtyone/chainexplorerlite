import { render, screen } from "@testing-library/react";
import Card from "./index";

const label = "address";
const heading = "sender";
const isContract = true;

test("displays dashboard information", () => {
  render(<Card label={label} heading={heading} isContract={isContract} />);

  const addressLabel = screen.getByText(/address/i);
  expect(addressLabel).toBeInTheDocument();
  const addressHeader = screen.getByText(/sender/i);
  expect(addressHeader).toBeInTheDocument();
  const contractChip = screen.getByText(/Contract/i);
  expect(contractChip).toBeInTheDocument();
});
