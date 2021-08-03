import { AuthorRepository, ID, NotFoundError } from '@/domain';
import { SaveUserInput, User, UserRepository } from '@/server/usecases';


export class MemoryUserRepository implements UserRepository {
  private authors: AuthorRepository;
  private users: {
    [key: string]: User
  }


  constructor(authors: AuthorRepository) {
    this.authors = authors;
    this.users = {};
  }


  async save(input: SaveUserInput) {
    const author = await this.authors.getById(input.id);
    const user: User = { ...input, author };
    this.users[input.id] = user;

    return user;
  }

  
  async getById(id: ID) {
    const user = this.users[id];
    if (!user)
      throw new NotFoundError(`user id ${id}`);

    return user;
  }
}