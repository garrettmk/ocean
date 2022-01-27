export interface ClientAuthenticator {
  getAccessToken: () => Promise<string>,
}