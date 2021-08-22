import e from "cors";
import { MemoryAuthorRepository, MemoryUserRepository } from "../interfaces";
import { ServerUserInteractor, validateUser } from "../usecases";


describe('Testing ServerUserInteractor', () => {
  let authors: MemoryAuthorRepository;
  let users: MemoryUserRepository;
  let interactor: ServerUserInteractor;


  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository(authors);
    interactor = new ServerUserInteractor(users);
  });


  it('should return a User', async () => {
    const userId = 'a user key';
    const userName = 'Chewie';

    const received = await interactor.loginUser(userId, userName);

    expect(() => validateUser(received)).not.toThrow();
    expect(users.getById(userId)).resolves.toMatchObject({
      id: userId,
      name: userName
    });
  });
})