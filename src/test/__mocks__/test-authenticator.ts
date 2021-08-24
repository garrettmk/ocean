import { ClientAuthenticator } from "@/client/interfaces";
import jwt from 'jwt-simple';


export class TestAuthenticator implements ClientAuthenticator {
  private userId?: string;
  private secret: string;

  constructor(userId: string | undefined = undefined, secret: string = 'secret') {
    this.userId = userId;
    this.secret = secret;
  }

  async getAccessToken() {
    return jwt.encode({
      sub: this.userId,
    }, this.secret);
  }

  useUserId(userId: string | undefined) {
    this.userId = userId;
  }
}