import { ID } from "@/domain";

export const DOCUMENT_ROUTE = '/doc/:id/:view?';
export type DocumentRouteParams = { id: string, view: string };
export const createDocumentRoute = (id: ID, view?: 'graph') => view ? `/doc/${id}/${view}` : `/doc/${id}`;