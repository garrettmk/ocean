import { AuthorRepository, ID, NotFoundError } from "@/domain";
import { UserRepository } from "./server-user-models";


export class ServerUserInteractor {
  private users: UserRepository;
  private authors: AuthorRepository;

  constructor(users: UserRepository, authors: AuthorRepository) {
    this.users = users;
    this.authors = authors;
  }


  async loginUser(userId: ID, name: string) {
    const existingUser = await this.users.getById(userId).catch((error: any) => {
      if (error instanceof NotFoundError)
        return null;
    });

    if (existingUser) {
      return await this.users.update(existingUser.id, {
        name,
      });
    } else {
      const author = await this.authors.create({
        name,
      });

      return await this.users.create(userId, {
        author,
        name
      });
    }
  }
}