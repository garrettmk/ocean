import { Buffer } from 'buffer/';
// @ts-ignore
window.Buffer = Buffer;
import { ClientAuthenticator } from "@/client/interfaces";
import jwt from 'jwt-simple';


export class DummyAuthenticator implements ClientAuthenticator {
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

  getUserId() {
    return this.userId;
  }

  useUserId(userId: string | undefined) {
    this.userId = userId;
  }
}