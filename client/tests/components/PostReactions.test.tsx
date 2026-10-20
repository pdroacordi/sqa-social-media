import { render, screen, within } from "@testing-library/react";
import PostReactions from "@/components/PostReactions";

describe("PostReactions", () => {
  test("dado reactions do post, quando renderizar, entao exibe a quantidade de likes e dislikes", () => {
    render(<PostReactions reactions={{ likes: 192, dislikes: 25 }} />);

    const group = screen.getByRole("group", { name: "Reações do post" });
    expect(within(group).getByTestId("post-likes")).toHaveTextContent("192");
    expect(within(group).getByTestId("post-dislikes")).toHaveTextContent("25");
    expect(group).toHaveTextContent("curtidas");
    expect(group).toHaveTextContent("descurtidas");
  });

  test("dado post sem reacoes, quando renderizar, entao exibe zero likes e zero dislikes", () => {
    render(<PostReactions reactions={{ likes: 0, dislikes: 0 }} />);

    expect(screen.getByTestId("post-likes")).toHaveTextContent("0");
    expect(screen.getByTestId("post-dislikes")).toHaveTextContent("0");
  });

  test("dado exatamente uma reacao de cada tipo, quando renderizar, entao usa os rotulos no singular", () => {
    render(<PostReactions reactions={{ likes: 1, dislikes: 1 }} />);

    expect(screen.getByText("curtida")).toBeInTheDocument();
    expect(screen.getByText("descurtida")).toBeInTheDocument();
  });
});
