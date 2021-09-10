import { AlreadyExistsError } from "@/server/usecases";
import { ContentMigrationManager, ContentType, ContentTypeMigration, ContentTypeMigrationPath } from "./document-content-models";


export class DefaultMigrationManager implements ContentMigrationManager {
  private migrations: ContentTypeMigration[];


  constructor(migrations: ContentTypeMigration[] = []) {
    this.migrations = migrations;
  }


  async registerMigration(migration: ContentTypeMigration, replace: boolean = false) {
    const index = this.migrations.findIndex(m => this.isEqualMigration(m, migration));
    if (index >= 0 && !replace) {
      throw new AlreadyExistsError(`Migration from ${migration.from.value} to ${migration.to.value}`);
    } else if (index >= 0) {
      this.migrations.splice(index, 1, migration);
    } else {
      this.migrations.push(migration);
    }

    return true;
  }


  async listAllMigrations() {
    return this.migrations.slice();
  }


  async listAvailableMigrations(fromType: ContentType) {
    return this.migrations
      .filter(m => m.from.value === fromType.value);
  }


  async getMigrationPaths(from: ContentType, to: ContentType) {
    const initialMigrations = await this.listAvailableMigrations(from);
    const initialPaths: ContentTypeMigrationPath[] = initialMigrations.map(m => ({
      from,
      to: m.to,
      migrations: [m]
    }));

    const recursivelyFollowPaths: (paths: ContentTypeMigrationPath[]) => Promise<ContentTypeMigrationPath[]> = async (paths: ContentTypeMigrationPath[]) => {
      return (await Promise.all(paths.map(async path => {
        const nextMigrations = (await this.listAvailableMigrations(path.to))
          .filter(m => !path.migrations.includes(m));

        if (!nextMigrations.length)
          return path;

        const nextPaths: ContentTypeMigrationPath[] = nextMigrations.map(m => ({
          from: path.from,
          to: m.to,
          migrations: [...path.migrations, m]
        }));

        return await recursivelyFollowPaths(nextPaths);
      }))).flat();
    }

    const paths = await recursivelyFollowPaths(initialPaths);
    const viablePaths = paths
      .filter(path => path.to.value === to.value)
      .sort((a, b) => b.migrations.length - a.migrations.length);

    return viablePaths;
  }


  async migrate(content: any, path: ContentTypeMigrationPath, direction: 'up' | 'down' = 'up') {
    const newContent = path.migrations.reduce((currentContent, migration) => {
      return migration[direction](currentContent);
    }, content);

    return newContent;
  }


  private isEqualMigration(m1: ContentTypeMigration, m2: ContentTypeMigration) : boolean {
    return m1.from.value == m2.from.value && m1.to.value === m2.to.value;
  }
}