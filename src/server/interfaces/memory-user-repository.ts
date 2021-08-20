import { Author, AuthorRepository, ID, NotFoundError } from '@/domain';
import { SaveUserInput, User, UserRepository, validateSaveUserInput } from '@/server/usecases';


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
    validateSaveUserInput(input);

    const existing = this.users[input.id];

    if (existing) {
      const modified = {
        ...existing,
        name: input.name
      };

      this.users[existing.id] = modified;
      return modified;

    } else {
      const author = await this.authors.create({ name: input.name });
      const user: User = { ...input, author };

      this.users[user.id] = user;
      return user;
    }
  }

    
  async getById(id: ID) {
    const user = this.users[id];
    if (!user)
      throw new NotFoundError(`user id ${id}`);

    return user;
  }
}