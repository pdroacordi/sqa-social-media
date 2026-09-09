import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

const mockedUseAuth = useAuth as jest.Mock;

describe("Header", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLogout.mockClear();
  });

  test("dado usuario deslogado, quando renderizar header, entao exibe Entrar e Criar Conta", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, logout: mockLogout });

    render(<Header />);

    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Criar Conta")).toBeInTheDocument();
    expect(screen.queryByText("Sair")).not.toBeInTheDocument();
    expect(screen.queryByText("Posts Curtidos")).not.toBeInTheDocument();
  });

  test("dado usuario logado, quando renderizar header, entao exibe Posts Curtidos e Sair", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, logout: mockLogout });

    render(<Header />);

    expect(screen.getByText("Posts Curtidos")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
    expect(screen.queryByText("Entrar")).not.toBeInTheDocument();
    expect(screen.queryByText("Criar Conta")).not.toBeInTheDocument();
  });

  test("dado usuario logado, quando clicar em Posts Curtidos, entao navega para /auth/liked", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, logout: mockLogout });

    render(<Header />);
    fireEvent.click(screen.getByText("Posts Curtidos"));

    expect(mockPush).toHaveBeenCalledWith("/auth/liked");
  });

  test("dado usuario logado, quando clicar em Sair, entao chama logout e navega para raiz", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, logout: mockLogout });

    render(<Header />);
    fireEvent.click(screen.getByText("Sair"));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
