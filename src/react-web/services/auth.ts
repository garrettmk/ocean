import { ClientAuthenticator } from "@/client/interfaces";


export class Authenticator implements ClientAuthenticator {
  public userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getAccessToken() {
    return this.userId;
  }
}