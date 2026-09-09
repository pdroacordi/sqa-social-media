import { render, screen, fireEvent } from "@testing-library/react";
import { AxiosError } from "axios";
import ResetPassword from "@/app/reset-password/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { authService } from "@/service/auth/auth";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/service/auth/auth", () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

const mockedResetPassword = authService.resetPassword as jest.Mock;

describe("Fluxo de redefinicao de senha", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockedResetPassword.mockReset();
  });

  test("dado email cadastrado, quando solicitar redefinicao, entao deveria exibir exatamente 'E-mail enviado com sucesso' (BUG: mensagem real e diferente da exigida pelo requisito 3)", async () => {
    mockedResetPassword.mockResolvedValue(undefined);
    render(
      <AuthProvider>
        <ResetPassword />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "cadastrado@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar Email" }));

    expect(await screen.findByText("E-mail enviado com sucesso")).toBeInTheDocument();
  });

  test("dado email nao cadastrado, quando solicitar redefinicao, entao exibe mensagem de erro do servidor", async () => {
    const erro = new Error("Request failed") as AxiosError;
    Object.setPrototypeOf(erro, AxiosError.prototype);
    (erro as unknown as { response: unknown }).response = {
      data: { message: "Usuário não encontrado" },
    };
    mockedResetPassword.mockRejectedValue(erro);

    render(
      <AuthProvider>
        <ResetPassword />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "naocadastrado@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar Email" }));

    expect(await screen.findByText("Usuário não encontrado")).toBeInTheDocument();
  });
});
