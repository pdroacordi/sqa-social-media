import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import SignUp from "@/app/signup/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { authService } from "@/service/auth/auth";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/service/auth/auth", () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

const mockedSignUp = authService.signUp as jest.Mock;

function renderSignUp() {
  return render(
    <AuthProvider>
      <SignUp />
    </AuthProvider>
  );
}

function preencherFormulario(senha: string, confirmar = senha, email = "novo@teste.com") {
  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
    target: { value: email },
  });
  const senhas = screen.getAllByPlaceholderText("••••••••");
  fireEvent.change(senhas[0], { target: { value: senha } });
  fireEvent.change(senhas[1], { target: { value: confirmar } });
}

function clicarSubmit() {
  // "Criar Conta" tambem e o texto do botao de navegacao no Header; o botao de
  // submit do formulario e o unico com type="submit".
  const botoes = screen.getAllByRole("button", { name: "Criar Conta" });
  const botaoSubmit = botoes.find((botao) => botao.getAttribute("type") === "submit");
  fireEvent.click(botaoSubmit!);
}

describe("Fluxo de cadastro (signup)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockedSignUp.mockReset();
    localStorage.clear();
  });

  test("dado dados validos, quando submeter cadastro, entao autentica e redireciona para raiz", async () => {
    mockedSignUp.mockResolvedValue({ id: 1, email: "novo@teste.com" });
    renderSignUp();

    preencherFormulario("Senha123@");
    clicarSubmit();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
    expect(mockedSignUp).toHaveBeenCalledWith({
      email: "novo@teste.com",
      password: "Senha123@",
    });
  });

  test("dado email ja cadastrado, quando submeter cadastro, entao exibe mensagem de erro do servidor", async () => {
    const erro = new Error("Request failed") as AxiosError;
    Object.setPrototypeOf(erro, AxiosError.prototype);
    (erro as unknown as { response: unknown }).response = {
      data: { message: "E-mail já está em uso" },
    };
    mockedSignUp.mockRejectedValue(erro);
    renderSignUp();

    preencherFormulario("Senha123@");
    clicarSubmit();

    expect(await screen.findByText("E-mail já está em uso")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
