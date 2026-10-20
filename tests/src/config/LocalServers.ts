import type { PlaywrightTestConfig } from "@playwright/test";
import { resolve } from "node:path";
import { Environment } from "./Environment";

type WebServer = Exclude<NonNullable<PlaywrightTestConfig["webServer"]>, readonly unknown[]>;

const PROJECT_ROOT = resolve(__dirname, "../../..");
const API_DIR = resolve(PROJECT_ROOT, "api");
const CLIENT_DIR = resolve(PROJECT_ROOT, "client");
const API_HEALTH_PATH = "/posts/liked?userId=0";

export class LocalServers {
  static api(): WebServer {
    return {
      name: "API",
      command: `"${LocalServers.mavenWrapper()}" spring-boot:run -Dspring-boot.run.useTestClasspath=true "-Dspring-boot.run.arguments=${LocalServers.inMemoryDatabaseArguments()}"`,
      cwd: API_DIR,
      url: new URL(API_HEALTH_PATH, Environment.apiUrl).toString(),
      reuseExistingServer: true,
      timeout: 180_000,
    };
  }

  static client(): WebServer {
    return {
      name: "Client",
      command: `npm run dev -- --port ${new URL(Environment.clientUrl).port}`,
      cwd: CLIENT_DIR,
      url: Environment.clientUrl,
      env: { NEXT_PUBLIC_BASE_URL: Environment.apiUrl },
      reuseExistingServer: true,
      timeout: 120_000,
    };
  }

  private static mavenWrapper(): string {
    return resolve(API_DIR, process.platform === "win32" ? "mvnw.cmd" : "mvnw");
  }

  private static inMemoryDatabaseArguments(): string {
    return [
      `--server.port=${new URL(Environment.apiUrl).port}`,
      "--spring.datasource.url=jdbc:h2:mem:e2e",
      "--spring.datasource.driverClassName=org.h2.Driver",
      "--spring.datasource.username=sa",
      "--spring.datasource.password=",
      "--spring.jpa.hibernate.ddl-auto=create-drop",
      "--spring.jpa.show-sql=false",
    ].join(" ");
  }
}
