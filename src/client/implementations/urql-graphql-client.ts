import { Client, dedupExchange, Exchange, fetchExchange, makeOperation, subscriptionExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { cacheExchange, ResolverConfig } from '@urql/exchange-graphcache';
import { DocumentNode } from 'graphql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { pipe, toCallbag } from 'wonka';
import { makeWebsocketUrl, Source } from '@/client/utils';
import { ClientAuthenticator, GraphQLClient, GraphQLResult } from '@/client/interfaces';


type Fetch = ConstructorParameters<Client>[0]['fetch'];


export type UrqlGraphQLClientOptions = {
  url: string,
  subscriptionsUrl?: string,
  authenticator: ClientAuthenticator,
  fetch?: Fetch,
  cacheResolvers?: ResolverConfig
}


export class UrqlGraphQLClient implements GraphQLClient {
  private client: Client;
  private subscriptionClient: SubscriptionClient;

  constructor({ 
    url, 
    subscriptionsUrl = makeWebsocketUrl(url), 
    authenticator, 
    fetch, 
    cacheResolvers 
  }: UrqlGraphQLClientOptions) {
    // Create a subscription client
    this.subscriptionClient = UrqlGraphQLClient.makeSubscriptionClient(subscriptionsUrl, authenticator);

    // Setup the exchanges
    const auth = UrqlGraphQLClient.makeAuthExchange(authenticator);
    const subscriptions = UrqlGraphQLClient.makeSubscriptionExchange(this.subscriptionClient);
    const cache = UrqlGraphQLClient.makeCacheExchange(cacheResolvers);

    // Create the urql client
    this.client = new Client({
      url,
      fetch,
      // The order is important: first dedupe requests, then check cache, the authorize, fetch/subscribe
      exchanges: [
        dedupExchange,
        cache,
        auth,
        fetchExchange,
        subscriptions
      ]
    });
  }

  // Create a SubscriptionClient from an URL and an authenticator
  private static makeSubscriptionClient(url: string, authenticator: ClientAuthenticator): SubscriptionClient {
    const client = new SubscriptionClient(url, {
      reconnect: true,
      connectionParams: async () => ({
        authorization: await authenticator.getAccessToken()
      })
    });

    // This is supposed to fix a bug in Firefox related to websockets
    window.addEventListener('beforeunload', () => {
      client.unsubscribeAll();
      client.close();
    });

    return client;
  }

  // Create a normalized cache
  private static makeCacheExchange(resolvers?: ResolverConfig): Exchange {
    return cacheExchange({
      keys: {
        DocumentGraph: () => `DocumentGraph${(new Date()).getTime()}`
      },
      resolvers
    });
  }

  // Create an authexchange from a ClientAuthenticator
  private static makeAuthExchange(authenticator: ClientAuthenticator): Exchange {
    return authExchange({
      async getAuth({ authState }) {
        return await authenticator.getAccessToken();
      },

      addAuthToOperation({ authState, operation }) {
        // Nothing to do if there's no auth token
        // Don't add auth to subscriptions, that is handled by the
        // subscription client
        if (!authState || operation.kind === 'subscription')
          return operation;

        // Add the Authorization header to the operation
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

      // Require authorization for all operations
      willAuthError({ authState, operation }) {
        return !authState;
      }
    })
  }

  // Create a subscription exchange from a SubscriptionClient
  private static makeSubscriptionExchange(client: SubscriptionClient): Exchange {
    return subscriptionExchange({
      forwardSubscription: operation => client.request(operation)
    });
  }


  // Execute a query and return a stream
  public query(q: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult> {
    return pipe(
      this.client.query(q, variables),
      toCallbag
    ) as Source<GraphQLResult>;
  }

  // Execute a mutation and return a stream
  public mutation(m: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult> {
    return pipe(
      this.client.mutation(m, variables),
      toCallbag
    ) as Source<GraphQLResult>;
  }

  // Execute a subscription and return a streasm
  public subscription(q: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult> {
    return pipe(
      this.client.subscription(q, variables),
      toCallbag
    ) as Source<GraphQLResult>;
  }
}