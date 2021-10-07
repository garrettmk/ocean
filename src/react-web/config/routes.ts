import { ID } from "@/domain";

export const DOCUMENT_ROUTE = '/doc/:id';
export type DocumentRouteParams = { id: string };
export const createDocumentRoute = (id: ID) => `/doc/${id}`;


export const GRAPH_ROUTE = `/`;
export type GraphRouteParams = {};
export const createGraphRoute = () => `/`;