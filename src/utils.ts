import { RegistrationResponse } from './interfaces';

export class Utils {
  static createAuth(registry: RegistrationResponse): string {
    const user = registry.id;
    const pswd = registry.token;
    return 'Basic ' + Utils.base64([user, pswd].join(':'))
  }

  static base64(input: string): string {
    return btoa(input);
  }
}