import { DocumentGraph, DocumentLink, ID } from "@/domain";
import { assign, createMachine } from "xstate";
import { ClientDocumentsGateway } from "../interfaces";



export type RecommendedLinksContext = {
  recommendedLinks: DocumentGraph
  error?: Error
}


export type RecommendedLinksEvent =
  | { type: 'fetch', payload: ID }
  | { type: 'link', payload: DocumentLink }
  | { type: 'unlink', payload: DocumentLink };


export function makeRecommendedLinksMachine(gateway: ClientDocumentsGateway) {
  return createMachine<RecommendedLinksContext>({
    id: 'recommended-links',
    initial: 'idle',
    states: {
      idle: {
        on: {
          fetch: { target: 'fetching' },
          link: { target: 'linking' },
          unlink: { target: 'unlinking' }
        }
      },

      fetching: {
        invoke: {
          src: 'getRecommendedLinks',
          onDone: { target: 'idle', actions: ['assignRecommendedLinks'] },
          onError: { target: 'error', actions: ['assignError'] }
        }
      },

      linking: {
        invoke: {
          src: 'linkDocuments',
          onDone: { target: 'idle' },
          onError: { target: 'error', actions: ['assignError'] }
        }
      },

      unlinking: {
        invoke: {
          src: 'unlinkDocuments',
          onDone: { target: 'idle' },
          onError: { target: 'error' }
        }
      },

      error: {
        on: {
          fetch: { target: 'fetching' },
          link: { target: 'linking' },
          unlink: { target: 'unlinking' }
        }
      }
    }
  }, {
    services: {
      async getRecommendedLinks(context, event) {
        const id = event.payload;
        return await gateway.getRecommendedLinks(id);
      },

      async linkDocuments(context, event) {
        const link = event.payload;
        return await gateway.linkDocuments(link.from, link.to, link.meta);
      },

      async unlinkDocuments(context, event) {
        const link = event.payload;
        return await gateway.unlinkDocuments(link.from, link.to);
      }
    },

    actions: {
      assignRecommendedLinks: assign({
        recommendedLinks: (context, event) => event.data,
      }),

      assignError: assign({
        error: (context, event) => event.error
      }),
    }
  })
}