import { ResolverConfig } from "@urql/exchange-graphcache"; 



export const urqlCacheResolvers: ResolverConfig = {
  Query: {
    getDocumentHeader: (parent, args, cache, info) => ({
      __typename: 'DocumentHeader',
      id: args.id
    }),
  },
};