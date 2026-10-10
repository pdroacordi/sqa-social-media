import { defineConfig, devices } from "@playwright/test";
import { Environment } from "./src/config/Environment";

export default defineConfig({
  testDir: "./specs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "api",
      testMatch: /.*\.api\.spec\.ts/,
    },
    {
      name: "e2e",
      testMatch: /.*\.e2e\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: Environment.clientUrl,
      },
    },
  ],
});
