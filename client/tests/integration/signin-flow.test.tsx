import { render, screen, fireEvent } from "@testing-library/react";
import { AxiosError } from "axios";
import SignIn from "@/app/signin/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { authService } from "@/service/auth/auth";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

const mockedSignIn = authService.signIn as jest.Mock;

describe("Fluxo de login (signin)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockedSignIn.mockReset();
    localStorage.clear();
  });

  test("dado credenciais invalidas, quando submeter login, entao exibe mensagem 'Credenciais inválidas'", async () => {
    const erro = new Error("Request failed") as AxiosError;
    Object.setPrototypeOf(erro, AxiosError.prototype);
    (erro as unknown as { response: unknown }).response = {
      data: { message: "Credenciais inválidas" },
    };
    mockedSignIn.mockRejectedValue(erro);

    render(
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "usuario@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "SenhaErrada1!" },
    });
    // "Entrar" tambem aparece no botao de navegacao do Header; o botao de
    // submit do formulario e o unico com type="submit".
    const botoes = screen.getAllByRole("button", { name: "Entrar" });
    fireEvent.click(botoes.find((botao) => botao.getAttribute("type") === "submit")!);

    expect(await screen.findByText("Credenciais inválidas")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
