import { Author, CreateAuthorInput, CreateDocumentInput, Document, DocumentHeader, DocumentLink, DocumentLinkMeta, ID, UpdateDocumentInput } from "@/domain";


export const IDS: ID[] = [
  '0',
  '1',
  'one',
  'this-is-a-slug',
  'another'
];

export const NAMES: string[] = [
  'name1',
  'name2'
];

export const TITLES: string[] = [
  'title1',
  'title2'
];

export const CONTENT_TYPES: string[] = [
  'text/format-a',
  'text/format-b;foo=bar',
  'text/format-c',
  'text/format-d;foo=bar-2'
];

export const AUTHORS: Author[] = [
  {
    id: 'author-1',
    name: 'authorname',
  }
];


export const CREATE_AUTHOR_INPUTS: CreateAuthorInput[] = [
  {
    name: 'authorname'
  }
];


export const DOCUMENT_HEADERS: DocumentHeader[] = [
  {
    id: IDS[0],
    author: AUTHORS[0],
    isPublic: true,
    title: TITLES[0],
    contentType: CONTENT_TYPES[0]
  },
];


export const DOCUMENTS: Document[] = [
  {
    ...DOCUMENT_HEADERS[0],
    content: 'some content'
  }
];


export const CREATE_DOCUMENT_INPUTS: CreateDocumentInput[] = [
  {},
  {
    title: TITLES[0]
  },
  {
    title: TITLES[0],
    isPublic: true,
  },
  {
    contentType: CONTENT_TYPES[0],
    content: 'some content'
  },
  {
    title: TITLES[0],
    isPublic: true,
    contentType: CONTENT_TYPES[0],
    content: 'some content'
  }
];


export const UPDATE_DOCUMENT_INPUTS: UpdateDocumentInput[] = [
  {},
  {
    title: TITLES[0]
  },
  {
    title: TITLES[0],
    isPublic: true,
  },
  {
    contentType: CONTENT_TYPES[0],
    content: 'some content'
  },
  {
    title: TITLES[0],
    isPublic: true,
    contentType: CONTENT_TYPES[0],
    content: 'some content'
  }
];


export const DOCUMENT_LINKS: DocumentLink[] = [
  {
    from: IDS[0],
    to: IDS[1],
    meta: {}
  }
];


export const DOCUMENT_LINK_METAS: DocumentLinkMeta[] = [
  {},
  { foo: 'bar' },
  { foo: 123 },
  { foo: null },
  { foo: true },
  { foo: [] },
  { foo: ['bar'] },
  { foo: [123] },
  { foo: [true, false] },
  { foo: { bar: 'baz' } },
  { foo: { bar: ['baz'] } }
];