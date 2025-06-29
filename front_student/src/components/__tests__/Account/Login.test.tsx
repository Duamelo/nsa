import React from "react";
import { render, screen } from "@testing-library/react";

describe("Simple test example", () => {
  it("renders a simple message", () => {
    render(<div>Hello world</div>);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
