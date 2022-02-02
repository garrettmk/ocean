import { Source, GraphQLCombinedError } from '@/client/utils';
import { DocumentNode } from 'graphql';


export type GraphQLResult = {
  data?: any,
  error?: GraphQLCombinedError
}

export interface GraphQLClient {
  query(q: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult>
  mutation(m: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult>
  subscription(q: DocumentNode, variables?: Record<string, any>): Source<GraphQLResult>
}