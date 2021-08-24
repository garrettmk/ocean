import { DocumentHeader, NotFoundError, ValidationError } from "@/domain";
import { ServerTestHarness } from "../__mocks__/server-test-harness";


describe('Testing OceanServer', () => {
  let harness: ServerTestHarness;


  beforeEach(async () => {
    harness = new ServerTestHarness();
    await harness.server.listen();
    await harness.populate();
  });


  afterEach(() => {
    harness.server.close();
  });


  describe('testing listDocuments()', () => {
    it('should only return headers from the given author', async () => {
      expect.assertions(1);
  
      const expected = await harness.getUserDocumentsHeaders('luke');
      harness.authenticator.useUserId('luke');
      
      await expect(harness.documentsApi.listDocuments()).resolves.toMatchObject(expected);
    });
  
    
    it('should return only public documents if no user is logged in', async () => {
      expect.assertions(1);
  
      const expected = await harness.getPublicDocuments();
      harness.authenticator.useUserId(undefined);
  
      await expect(harness.documentsApi.listDocuments()).resolves.toMatchObject(expected);
    });
  
  
    it('should throw an error if given an invalid user id', async () => {
      expect.assertions(1);
  
      harness.authenticator.useUserId('vader');
  
      await expect(harness.documentsApi.listDocuments()).rejects.toBeInstanceOf(Error)
    });
  });


  describe('testing getDocument()', () => {
    it('should return the correct document', async () => {
      expect.assertions(1);

      const document = (harness.docs)![0];
      const user = await harness.users.getByAuthorId(document.author.id);
      harness.authenticator.useUserId(user.id);

      await expect(harness.documentsApi.getDocument(document.id)).resolves.toMatchObject(document);
    });


    it('should throw an error if given an invalid document id', async () => {
      expect.assertions(1);

      harness.authenticator.useUserId('luke');

      await expect(harness.documentsApi.getDocument('invalid')).rejects.toBeInstanceOf(NotFoundError);
    })
  })
})