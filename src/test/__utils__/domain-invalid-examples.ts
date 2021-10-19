import { query } from 'express';
import * as VALID from './domain-valid-examples';


export const NONEMPTY_STRINGS: any[] = [undefined, null, NaN, 0, 123, '', {}, [], () => null];
export const OPTIONAL_NONEMPTY_STRINGS: any[] = NONEMPTY_STRINGS.filter(v => v === undefined);
export const OBJECTS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', () => null];
export const FUNCS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', {}, []];
export const CONTENT_TYPES: any[] = [
  undefined, 
  null, 
  NaN, 
  0, 
  123, 
  '',
  'text',
  'text-plain',
  'text/',
  '&text/$plain',
  'text/plain;',
  'text/plain;foo',
  'text/plain;foo='
];

export const IDS: any[] = NONEMPTY_STRINGS;
export const NAMES: any[] = NONEMPTY_STRINGS;

export const AUTHORS: any[] = OBJECTS
  .concat(IDS.map(id => ({ ...VALID.AUTHORS[0], id })))
  .concat(NAMES.map(name => ({ ...VALID.AUTHORS[0], name })));

export const TITLES: any[] = NONEMPTY_STRINGS;

export const DOCUMENT_LINK_METAS: any[] = [
  ...OBJECTS,
  { method: () => null }
];

export const DOCUMENT_LINKS: any[] = [
  ...OBJECTS,
  ...VALID.DOCUMENT_LINKS.flatMap(link => IDS.map(from => ({ ...link, from }))),
  ...VALID.DOCUMENT_LINKS.flatMap(link => IDS.map(to => ({ ...link, to }))),
  ...VALID.DOCUMENT_LINKS.flatMap(link => DOCUMENT_LINK_METAS.map(meta => ({ ...link, meta})))
];

export const DOCUMENT_QUERIES: any[] = [
  ...OBJECTS,
  ...IDS.flatMap(id => VALID.DOCUMENT_QUERIES.map(query => ({ ...query, id: [id] }))),
  ...IDS.flatMap(id => VALID.DOCUMENT_QUERIES.map(query => ({ ...query, authorId: [id] }))),
  ...TITLES.flatMap(title => VALID.DOCUMENT_QUERIES.map(query => ({ ...query, title: [title] }))),
  ...CONTENT_TYPES.flatMap(contentType => VALID.DOCUMENT_QUERIES.map(query => ({ ...query, contentType: [contentType] }))),
];

export const DOCUMENT_HEADERS: any[] = [
  ...VALID.DOCUMENT_HEADERS.flatMap(header => IDS.map(id => ({ ...header, id }))),
  ...VALID.DOCUMENT_HEADERS.flatMap(header => AUTHORS.map(author => ({ ...header, author }))),
  ...VALID.DOCUMENT_HEADERS.flatMap(header => TITLES.map(title => ({ ...header, title }))),
  ...VALID.DOCUMENT_HEADERS.flatMap(header => CONTENT_TYPES.map(contentType => ({ ...header, contentType }))),
];

export const DOCUMENT_GRAPHS: any[] = [
  ...OBJECTS,
  ...VALID.DOCUMENT_GRAPHS.flatMap(graph => DOCUMENT_HEADERS.map(header => ({ ...graph, documents: [header] }))),
  ...VALID.DOCUMENT_GRAPHS.flatMap(graph => DOCUMENT_LINKS.map(link => ({ ...graph, links: [link] }))),
];

