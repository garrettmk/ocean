import { ContentTypeMigration, DefaultMigrationManager } from "@/documents"
import * as migrationClasses from '@/documents/migrations';
import { parseContentType } from "@/documents/utils/content-type-utils";
import { AlreadyExistsError } from "@/server/usecases";
import e from "cors";


describe('Testing DefaultMigrationManager', () => {
  let manager: DefaultMigrationManager;
  let migrations: ContentTypeMigration[];


  beforeEach(async () => {
    manager = new DefaultMigrationManager();
    migrations = Object.values(migrationClasses).map(migrationClass => new migrationClass());
  });


  async function populate() {
    return Promise.all(migrations.map(migration => manager.registerMigration(migration)));
  }


  describe('Testing registerMigration()', () => {
    it('should resolve to true when registering a new migration', async () => {
      expect.assertions(1);
      await expect(manager.registerMigration(migrations[0])).resolves.toBe(true);
    });


    it('should throw AlreadyExistsError if a matching migration has already been registered', async () => {
      expect.assertions(2);
      const migrationClass = Object.values(migrationClasses)[0];
      const m1 = new migrationClass();
      const m2 = new migrationClass();

      await expect(manager.registerMigration(m1)).resolves.toBe(true);
      await expect(manager.registerMigration(m2)).rejects.toBeInstanceOf(AlreadyExistsError);
    });


    it('should resolve to true if a matching migration exists and replace = true', async () => {
      expect.assertions(2);
      const migrationClass = Object.values(migrationClasses)[0];
      const m1 = new migrationClass();
      const m2 = new migrationClass();

      await expect(manager.registerMigration(m1)).resolves.toBe(true);
      await expect(manager.registerMigration(m2, true)).resolves.toBe(true);
    });
  });


  describe('Testing listAllMigrations', () => {
    it('should return an empty array if no migrations have been registered', async () => {
      expect.assertions(1);
      await expect(manager.listAllMigrations()).resolves.toMatchObject([]);
    });


    it('should return all registered migrations', async () => {
      expect.assertions(1);
      await populate();
      await expect(manager.listAllMigrations()).resolves.toMatchObject(migrations);
    });
  });


  describe('Testing listNextMigrations()', () => {
    let fromTextMigrations: ContentTypeMigration[];


    beforeEach(() => {
      fromTextMigrations = migrations.filter(m => m.from.value === 'text/plain');
    });


    it('should return all migrations with a matching "from" content type', async () => {
      expect.assertions(1);
      await populate();
      const fromType = parseContentType('text/plain');

      await expect(manager.listNextMigrations(fromType)).resolves.toMatchObject(fromTextMigrations);
    });
  });


  describe('Testing getMigrationPaths()', () => {
    it('should return all availabli migration paths', async () => {
      await populate();
      const from = parseContentType('text/plain');
      const to = parseContentType('application/json;format=slate002');

      const paths = await manager.getMigrationPaths(from, to);
    })
  })
})