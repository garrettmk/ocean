import { ID, Author } from "@/domain";


export interface User {
  id: ID,
  name: string,
  author: Author
}


export interface UserRepository {
  save(input: SaveUserInput) : Promise<User>,
  getById(id: ID) : Promise<User>,
}


export type SaveUserInput = {
  id: ID,
  name: string,
}