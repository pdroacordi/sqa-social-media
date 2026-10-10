import { APIResponse, expect as baseExpect } from "@playwright/test";

export const expect = baseExpect.extend({
  async toBeApiError(response: APIResponse, status: number, message: string) {
    const body = await response.json().catch(() => null);
    const pass = response.status() === status && body?.status === status && body?.message === message;

    return {
      pass,
      name: "toBeApiError",
      expected: { status, message },
      actual: { status: response.status(), body },
      message: () =>
        `Esperado erro HTTP ${status} com mensagem "${message}", ` +
        `recebido HTTP ${response.status()} com corpo ${JSON.stringify(body)}`,
    };
  },
});
