export interface Credentials {
  email: string;
  password: string;
}

export interface RegisteredUser extends Credentials {
  id: number;
}
