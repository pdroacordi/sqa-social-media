import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function Probe() {
  const { isAuthenticated, login } = useAuth();
  return (
    <div>
      {/* "true"/"false" (em vez de "logado"/"deslogado") evita que a asserção por
          substring do toHaveTextContent case acidentalmente com o texto errado. */}
      <span data-testid="status">{String(isAuthenticated)}</span>
      <button onClick={() => login({ id: 1, email: "usuario@teste.com" })}>
        fazer login
      </button>
    </div>
  );
}

describe("Persistencia de autenticacao entre reloads (integracao com AuthProvider real)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("dado login realizado, quando simular reload da pagina, entao deveria continuar autenticado (BUG: saveUser grava em 'user', getUser le 'sqa_social_user')", () => {
    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("fazer login"));
    expect(screen.getByTestId("status")).toHaveTextContent("true");

    // Desmonta e remonta o AuthProvider simulando um reload de pagina: o novo
    // AuthProvider le o usuario persistido do localStorage no useEffect inicial.
    unmount();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("true");
  });
});
