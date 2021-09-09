import { ID, Author } from "@/domain";


export interface User {
  id: ID,
  name: string,
  author: Author
}


export interface UserRepository {
  create(id: ID, input: CreateUserInput) : Promise<User>,
  getById(id: ID) : Promise<User>,
  getByAuthorId(id: ID) : Promise<User>,
  update(id: ID, input: UpdateUserInput) : Promise<User>,
  delete(id: ID) : Promise<User>
}


export type CreateUserInput = {
  name: string,
  author: Author
}


export type UpdateUserInput = {
  name: string
}