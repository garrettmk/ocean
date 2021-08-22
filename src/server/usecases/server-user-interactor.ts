import { ID } from "@/domain";
import { SaveUserInput, UserRepository } from "./server-user-models";
import { validateSaveUserInput } from "./server-user-validators";


export class ServerUserInteractor {
  private users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }


  async loginUser(userId: ID, name: string) {
    const input: SaveUserInput = {
      id: userId,
      name
    };

    validateSaveUserInput(input);

    const user = await this.users.save(input);
    return user;
  }
}