export class KeycloakError extends Error {
  readonly name = 'KeycloakError';

  constructor(
    readonly message: string,
    readonly error: string,
  ) {
    super(message);
  }
}
