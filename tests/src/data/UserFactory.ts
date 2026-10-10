import { randomUUID } from "node:crypto";
import { Credentials } from "../models/User";

export class UserFactory {
  private static readonly VALID_PASSWORD = "Senha@1234";
  private static readonly WRONG_PASSWORD = "Errada@9876";
  private static readonly WEAK_PASSWORD = "123";
  private static readonly MINIMUM_LENGTH_PASSWORD = "Abcde1@x";
  private static readonly EMAIL_WITHOUT_AT = "usuario.sem.arroba.teste.com";

  static valid(): Credentials {
    return { email: UserFactory.uniqueEmail(), password: UserFactory.VALID_PASSWORD };
  }

  static withInvalidEmail(): Credentials {
    return { email: UserFactory.EMAIL_WITHOUT_AT, password: UserFactory.VALID_PASSWORD };
  }

  static withEmailWithoutDomain(): Credentials {
    return { email: `${UserFactory.uniqueLocalPart()}@`, password: UserFactory.VALID_PASSWORD };
  }

  static withWeakPassword(): Credentials {
    return { email: UserFactory.uniqueEmail(), password: UserFactory.WEAK_PASSWORD };
  }

  static withMinimumLengthPassword(): Credentials {
    return { email: UserFactory.uniqueEmail(), password: UserFactory.MINIMUM_LENGTH_PASSWORD };
  }

  static withWrongPassword(credentials: Credentials): Credentials {
    return { email: credentials.email, password: UserFactory.WRONG_PASSWORD };
  }

  static withWeakWrongPassword(credentials: Credentials): Credentials {
    return { email: credentials.email, password: UserFactory.WEAK_PASSWORD };
  }

  private static uniqueEmail(): string {
    return `${UserFactory.uniqueLocalPart()}@teste.com`;
  }

  private static uniqueLocalPart(): string {
    return `qa.${Date.now()}.${randomUUID().slice(0, 8)}`;
  }
}
