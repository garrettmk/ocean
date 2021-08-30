import { cacheExchange, Client, dedupExchange, fetchExchange, makeOperation } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { DocumentNode } from 'graphql';
import { ClientAuthenticator } from './client-authenticator';
import { GraphQLClient, GraphQLResult } from './client-documents-api';


type Fetch = ConstructorParameters<Client>[0]['fetch'];

export class UrqlGraphQLClient implements GraphQLClient {
  private client: Client;

  constructor(url: string, authenticator: ClientAuthenticator, fetch?: Fetch) {
    this.client = new Client({
      url,
      fetch,
      exchanges: [
        dedupExchange,
        cacheExchange,
        authExchange({
          async getAuth({ authState }) {
            return await authenticator.getAccessToken();
          },

          addAuthToOperation({ authState, operation }) {
            if (!authState) {
              return operation;
            }
          
            const fetchOptions =
              typeof operation.context.fetchOptions === 'function'
                ? operation.context.fetchOptions()
                : operation.context.fetchOptions || {};
          
            return makeOperation(operation.kind, operation, {
              ...operation.context,
              fetchOptions: {
                ...fetchOptions,
                headers: {
                  ...fetchOptions.headers,
                  Authorization: authState as string,
                },
              },
            });
          },

          willAuthError() {
            return true;
          }
        }),
        fetchExchange
      ]
    });
  }


  async query(q: DocumentNode, variables?: Record<string, any>) : Promise<GraphQLResult> {
    return this.client.query(q, variables).toPromise();
  }


  async mutation(m: DocumentNode, variables?: Record<string, any>) : Promise<GraphQLResult> {
    return this.client.mutation(m, variables).toPromise();
  }
}