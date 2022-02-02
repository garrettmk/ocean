import { ResolverConfig } from "@urql/exchange-graphcache"; 



export const clientApiCacheResolvers: ResolverConfig = {
  Query: {
    getDocumentHeader: (parent, args, cache, info) => ({
      __typename: 'DocumentHeader',
      id: args.id
    })
  }
};