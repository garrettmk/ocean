import { ID } from "../common/domain-common-types";

export interface Author {
  id: ID,
  name: string
}


export interface AuthorRepository {
  create(input: CreateAuthorInput) : Promise<Author>,
  getById(id: ID) : Promise<Author>,
  listById(ids: ID[]) : Promise<Author[]>
}


export type CreateAuthorInput = {
  name: string
}