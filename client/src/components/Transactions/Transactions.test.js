import { render, screen } from "@testing-library/react";
import Transactions from "./index";

test("displays Sender and Receiver headers", () => {
  render(
    <Transactions
      senders={{ "0x123": 10 }}
      receivers={{ "0x321": 10 }}
      contracts={["0x321"]}
    />
  );

  const sender = screen.getByText(/Senders/i);
  expect(sender).toBeInTheDocument();
  const receiver = screen.getByText(/Receivers/i);
  expect(receiver).toBeInTheDocument();
});

test("displays cards for senders and receivers", () => {
  render(
    <Transactions
      senders={{ "0x123": 190e18 }}
      receivers={{ "0x321": 1e10 }}
      contracts={["0x321"]}
    />
  );

  const sender = screen.getAllByText(/0x123/i);
  expect(sender.length).toBe(1);
  const senderAmount = screen.getAllByText(/190/i);
  expect(senderAmount.length).toBe(1);
});
