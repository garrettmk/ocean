export interface ClientAuthenticator {
  getAccessToken: () => Promise<string>,
  getUserId: () => string | undefined
}