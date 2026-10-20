import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = resolve(__dirname, "../../.env");

export class Environment {
  static {
    if (existsSync(ENV_FILE)) {
      process.loadEnvFile(ENV_FILE);
    }
  }

  static readonly apiUrl = process.env.API_URL ?? "http://localhost:8080";
  static readonly clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
  static readonly dummyJsonUrl = process.env.DUMMYJSON_URL ?? "https://dummyjson.com";
}
