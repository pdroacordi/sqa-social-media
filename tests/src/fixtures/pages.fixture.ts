import { RegisteredUser } from "../models/User";
import { FeedPage } from "../pages/FeedPage";
import { LikedPostsPage } from "../pages/LikedPostsPage";
import { SignInPage } from "../pages/SignInPage";
import { SignUpPage } from "../pages/SignUpPage";
import { test as apiTest } from "./api.fixture";

interface PageFixtures {
  feedPage: FeedPage;
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  likedPostsPage: LikedPostsPage;
  signedInUser: RegisteredUser;
}

export const test = apiTest.extend<PageFixtures>({
  feedPage: async ({ page }, use) => {
    await use(new FeedPage(page));
  },
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  likedPostsPage: async ({ page }, use) => {
    await use(new LikedPostsPage(page));
  },
  signedInUser: async ({ registeredUser, signInPage, feedPage }, use) => {
    await signInPage.open();
    await signInPage.signIn(registeredUser);
    await feedPage.waitUntilOpen();
    await use(registeredUser);
  },
});
