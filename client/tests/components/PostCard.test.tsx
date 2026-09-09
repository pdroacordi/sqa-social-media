import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostCard from "@/components/PostCard";
import { Post } from "@/service/types";

const post: Post = { id: 1, title: "Titulo", body: "Corpo do post", liked: false };

describe("PostCard", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test("dado usuario nao autenticado, quando clicar em curtir, entao exibe alerta e nao chama onLike", () => {
    const onLike = jest.fn();
    render(<PostCard post={post} isAuthenticated={false} onLike={onLike} />);

    fireEvent.click(screen.getByText("Curtir"));

    expect(alertSpy).toHaveBeenCalledWith("Você precisa estar autenticado para curtir posts!");
    expect(onLike).not.toHaveBeenCalled();
  });

  test("dado usuario autenticado, quando clicar em curtir, entao chama onLike e alterna feedback visual", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    render(<PostCard post={post} isAuthenticated={true} onLike={onLike} />);

    fireEvent.click(screen.getByText("Curtir"));

    await waitFor(() => expect(onLike).toHaveBeenCalledWith(1));
    expect(await screen.findByText("Curtido")).toBeInTheDocument();
  });

  test("dado onLike rejeita a promise, quando clicar em curtir, entao reverte estado e exibe alerta de erro", async () => {
    const onLike = jest.fn().mockRejectedValue(new Error("falha de rede"));
    render(<PostCard post={post} isAuthenticated={true} onLike={onLike} />);

    fireEvent.click(screen.getByText("Curtir"));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Erro ao curtir post. Tente novamente.")
    );
    expect(await screen.findByText("Curtir")).toBeInTheDocument();
  });
});
