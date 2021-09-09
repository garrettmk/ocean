import { MemoryAuthorRepository, MemoryUserRepository } from "../../../server/interfaces";
import { ServerUserInteractor, validateUser } from "../../../server/usecases";


describe('Testing ServerUserInteractor', () => {
  let authors: MemoryAuthorRepository;
  let users: MemoryUserRepository;
  let interactor: ServerUserInteractor;


  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository();
    interactor = new ServerUserInteractor(users, authors);
  });


  it('should return a User', async () => {
    expect.assertions(2);
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