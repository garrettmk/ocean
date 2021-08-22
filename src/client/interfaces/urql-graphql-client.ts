import { Client, dedupExchange, cacheExchange, fetchExchange, makeOperation } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import e from 'cors';
import { DocumentNode } from 'graphql';
import { GraphQLClient, GraphQLResult } from './client-documents-api';


export type AuthTokenGetter = () => Promise<string>;


export class UrqlGraphQLClient implements GraphQLClient {
  private client: Client;

  constructor(url: string, fetch: any, getAuthToken: AuthTokenGetter) {
    this.client = new Client({
      url,
      fetch,
      exchanges: [
        dedupExchange,
        cacheExchange,
        authExchange({
          async getAuth({ authState }) {
            if (!authState) {
              const token = await getAuthToken();
              return token;
            }
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