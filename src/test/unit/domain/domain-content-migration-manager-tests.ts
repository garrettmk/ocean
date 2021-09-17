import { ContentMigration, ContentMigrationManager, ValidationError } from "@/domain";
import { AlreadyExistsError } from "@/server/usecases";
import * as INVALID from '../../__utils__/domain-content-invalid-examples';
import * as VALID from '../../__utils__/domain-content-valid-examples';


export type ContentMigrationManagerTestConfig<T extends any> = {
  implementationName: string,
  beforeAll?: () => Promise<T>,
  beforeEach: (t: T) => Promise<{
    manager: ContentMigrationManager
  }>,
  afterEach?: (t: T) => Promise<void>,
  afterAll?: (t: T) => Promise<void>
}


export function testContentMigrationManager<T extends any>({
  implementationName,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterEach: _afterEach,
  afterAll: _afterAll,
}: ContentMigrationManagerTestConfig<T>) {
  describe(`Testing ContentMigrationManager implementation: ${implementationName}`, () => {
    let beforeAllResult: T;
    let manager: ContentMigrationManager;
    let migrations: ContentMigration[] = VALID.CONTENT_MIGRATIONS;


    beforeAll(async () => {
      if (_beforeAll)
        beforeAllResult = await _beforeAll();
    });


    beforeEach(async () => {
      const result = await _beforeEach(beforeAllResult);
      manager = result.manager;
    });


    async function populate() {
      return Promise.all(migrations.map(migration => manager.registerMigration(migration)));
    }


    describe('Testing registerMigration()', () => {
      it('should resolve to true when registering a new migration', async () => {
        expect.assertions(1);
        await expect(manager.registerMigration(VALID.CONTENT_MIGRATIONS[0])).resolves.toBe(true);
      });


      it('should throw AlreadyExistsError if a matching migration has already been registered', async () => {
        expect.assertions(2);

        await expect(manager.registerMigration(VALID.CONTENT_MIGRATIONS[0])).resolves.toBe(true);
        await expect(manager.registerMigration(VALID.CONTENT_MIGRATIONS[0])).rejects.toBeInstanceOf(AlreadyExistsError);
      });


      it('should resolve to true if a matching migration exists and replace = true', async () => {
        expect.assertions(2);

        await expect(manager.registerMigration(migrations[0])).resolves.toBe(true);
        await expect(manager.registerMigration(migrations[0], true)).resolves.toBe(true);
      });

      
      it.each(INVALID.CONTENT_MIGRATIONS)('should throw ValidationError if given an invalid migration %p', async value => {
        expect.assertions(1);

        await expect(manager.registerMigration(value)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing listAllMigrations', () => {
      it('should return an empty array if no migrations have been registered', async () => {
        expect.assertions(1);
        await expect(manager.listAllMigrations()).resolves.toMatchObject([]);
      });


      it('should return all registered migrations', async () => {
        expect.assertions(2);
        await populate();

        const result = await manager.listAllMigrations();

        expect(result).toEqual(expect.arrayContaining(migrations));
        expect(result.length).toEqual(migrations.length);
      });
    });


    describe('Testing listNextMigrations()', () => {
      let fromTypeAMigrations: ContentMigration[];

      beforeEach(() => {
        fromTypeAMigrations = migrations.filter(m => m.from.value === VALID.PARSED_CONTENT_TYPES[0].value);
      });


      it('should return all migrations with a matching "from" content type', async () => {
        expect.assertions(2);
        await populate();
        const contentType = VALID.PARSED_CONTENT_TYPES[0];
        const expected = VALID.CONTENT_MIGRATIONS.filter(m => m.from.value === contentType.value);

        const result = await manager.listNextMigrations(contentType);

        expect(result).toEqual(expect.arrayContaining(expected));
        expect(result.length).toEqual(expected.length);
      });
    });


    describe('Testing getMigrationPaths()', () => {
      beforeEach(async () => {
        await populate();
      })

      it('should return the shortest path to each contentType, if no value for to is given', async () => {
        expect.assertions(2);

        const result = await manager.getMigrationPaths(VALID.PARSED_CONTENT_TYPES[0]);

        expect(result).toEqual(expect.arrayContaining(VALID.CONTENT_MIGRATION_PATHS_FROM_0));
        expect(result.length).toEqual(VALID.CONTENT_MIGRATION_PATHS_FROM_0.length);
      });

      it('should return the shortest path to the given content type, if to is given', async () => {
        expect.assertions(1);

        const result = await manager.getMigrationPaths(VALID.PARSED_CONTENT_TYPES[0], VALID.PARSED_CONTENT_TYPES[3]);

        expect(result).toMatchObject(VALID.CONTENT_MIGRATION_PATHS_0_TO_3);
      })
    });


    describe('Testing migrate()', () => {
      const path = VALID.CONTENT_MIGRATION_PATHS_0_TO_3[0];
      const firstMigration = path.migrations[0];
      const secondMigration = path.migrations[1];


      it('should call each migration with the output of the previous migration', async () => {
        const content = 'format-a';

        const received = await manager.migrate(content, path);

        expect(firstMigration.migrate).toHaveBeenCalledWith(content);
        expect(secondMigration.migrate).toHaveBeenCalledWith((firstMigration.migrate as jest.Mock).mock.results[0].value);
        expect(received).toEqual((secondMigration.migrate as jest.Mock).mock.results[0].value);
      });
    })
  });
}