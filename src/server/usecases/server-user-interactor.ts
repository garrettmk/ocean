import { ID, ValidationError } from "@/domain";
import { UserRepository } from "./server-user-models";


export class ServerUserInteractor {
  private users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }


  async loginUser(userId: ID, name: string) {
    if (!userId)
      throw new ValidationError(`invalid user id: ${userId}`);

    if (!name)
      throw new ValidationError(`invalid user name: ${name}`);

    const user = await this.users.save({ id: userId, name });
    return user;
  }
}