import { APIRequestContext, test as base } from "@playwright/test";
import { AuthApi } from "../api/AuthApi";
import { DummyJsonApi } from "../api/DummyJsonApi";
import { PostsApi } from "../api/PostsApi";
import { Environment } from "../config/Environment";
import { UserFactory } from "../data/UserFactory";
import { RegisteredUser } from "../models/User";

interface ApiFixtures {
  apiContext: APIRequestContext;
  authApi: AuthApi;
  postsApi: PostsApi;
  dummyJsonApi: DummyJsonApi;
  registeredUser: RegisteredUser;
}

export const test = base.extend<ApiFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: Environment.apiUrl });
    await use(context);
    await context.dispose();
  },
  dummyJsonApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: Environment.dummyJsonUrl });
    await use(new DummyJsonApi(context));
    await context.dispose();
  },
  authApi: async ({ apiContext }, use) => {
    await use(new AuthApi(apiContext));
  },
  postsApi: async ({ apiContext }, use) => {
    await use(new PostsApi(apiContext));
  },
  registeredUser: async ({ authApi }, use) => {
    await use(await authApi.register(UserFactory.valid()));
  },
});
