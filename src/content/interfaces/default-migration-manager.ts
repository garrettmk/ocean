import { AlreadyExistsError } from "@/server/usecases";
import { ContentMigrationManager, ContentType, ContentMigration, ContentMigrationPath, validateContentMigration, validateParsedContentType, validateContentMigrationPath } from "@/domain";


export class DefaultMigrationManager implements ContentMigrationManager {
  private migrations: ContentMigration[];


  constructor(migrations: ContentMigration[] = []) {
    this.migrations = migrations;
  }


  async registerMigration(migration: ContentMigration, replace: boolean = false) {
    validateContentMigration(migration);

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


  async listNextMigrations(fromType: ContentType) {
    return this.migrations
      .filter(m => m.from.value === fromType.value);
  }


  async getMigrationPaths(from: ContentType, to?: ContentType) {
    validateParsedContentType(from);
    to && validateParsedContentType(to);

    const initialMigrations = await this.listNextMigrations(from);
    const initialPaths: ContentMigrationPath[] = initialMigrations.map(m => ({
      from,
      to: m.to,
      migrations: [m]
    }));

    const recursivelyFollowPaths: (paths: ContentMigrationPath[]) => Promise<ContentMigrationPath[]> = async (paths: ContentMigrationPath[]) => {
      return (await Promise.all(paths.map(async path => {
        const nextMigrations = (await this.listNextMigrations(path.to))
          .filter(m => m.to.value !== from.value && !path.migrations.includes(m));

        const nextPaths: ContentMigrationPath[] = nextMigrations.map(m => ({
          from: path.from,
          to: m.to,
          migrations: [...path.migrations, m]
        }));

        return [path, ...await recursivelyFollowPaths(nextPaths)];
      }))).flat();
    }

    const paths = await recursivelyFollowPaths(initialPaths);
    const viablePaths = paths
      .filter(path => to ? path.to.value === to.value : true)
      .sort((a, b) => a.migrations.length - b.migrations.length)
      .filter((path, index, array) => {
        const existingToIndex = array.findIndex(p => p.to.value === path.to.value);
        return existingToIndex === index;
      });

    return viablePaths;
  }


  async migrate(content: any, path: ContentMigrationPath) {
    validateContentMigrationPath(path);
    
    const newContent = await path.migrations.reduce(async (currentContent, migration) => {
      return await migration.migrate(await currentContent);
    }, content);

    return newContent;
  }


  private isEqualMigration(m1: ContentMigration, m2: ContentMigration) : boolean {
    return m1.from.value == m2.from.value && m1.to.value === m2.to.value;
  }
}