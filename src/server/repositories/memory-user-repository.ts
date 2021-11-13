import { AuthorRepository, ID, NotFoundError } from '@/domain';
import { CreateUserInput, UpdateUserInput, User, UserRepository, validateCreateUserInput, validateUpdateUserInput, validateUser, validateUserId } from '@/server/usecases';


export class MemoryUserRepository implements UserRepository {
  private users: {
    [key: string]: User
  }


  constructor() {
    this.users = {};
  }


  async create(id: ID, input: CreateUserInput) : Promise<User> {
    validateUserId(id);
    validateCreateUserInput(input);

    const user: User = {
      id,
      name: input.name,
      author: input.author
    };

    validateUser(user);
    this.users[id] = user;

    return user;
  }

    
  async getById(id: ID) {
    const user = this.users[id];
    if (!user)
      throw new NotFoundError(`user id ${id}`);

    return user;
  }


  async getByAuthorId(id: ID) {
    const user = Object.values(this.users).find(usr => usr.author.id === id);
    if (!user)
      throw new NotFoundError(`author.id ${id}`);

    return user;
  }


  async update(id: ID, input: UpdateUserInput) : Promise<User> {
    validateUpdateUserInput(input);

    const existing = await this.getById(id);
    const modifiedUser: User = {
      ...existing,
      ...input
    };

    validateUser(modifiedUser);
    this.users[id] = modifiedUser;

    return modifiedUser;
  }


  async delete(id: ID) : Promise<User> {
    const existing = await this.getById(id);
    delete this.users[id];
    return existing;
  }
}