import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { postsService } from "@/service/posts/posts";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/service/posts/posts", () => ({
  postsService: {
    getPosts: jest.fn(),
    toggleLikePost: jest.fn(),
  },
}));

const mockedGetPosts = postsService.getPosts as jest.Mock;
const mockedToggleLikePost = postsService.toggleLikePost as jest.Mock;

describe("Fluxo do feed de posts (integracao page.tsx + PostCard + postsService)", () => {
  beforeEach(() => {
    mockedGetPosts.mockReset();
    mockedToggleLikePost.mockReset();
    localStorage.clear();
  });

  test("dado feed com posts e usuario autenticado, quando curtir um post, entao atualiza estado do post no feed", async () => {
    mockedGetPosts.mockResolvedValue({
      posts: [{ id: 1, title: "Post de teste", body: "Corpo", liked: false }],
      total: 1,
      skip: 0,
      limit: 10,
    });
    mockedToggleLikePost.mockResolvedValue(undefined);

    // Usuario pre-autenticado via localStorage (chave correta, lida por getUser).
    localStorage.setItem("sqa_social_user", JSON.stringify({ id: 1, email: "usuario@teste.com" }));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    expect(await screen.findByText("Post de teste")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Curtir"));

    await waitFor(() =>
      expect(mockedToggleLikePost).toHaveBeenCalledWith({ postId: 1, userId: 1 })
    );
    expect(await screen.findByText("Curtido")).toBeInTheDocument();
  });
});
