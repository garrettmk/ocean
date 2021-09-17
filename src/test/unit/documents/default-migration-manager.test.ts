import { DefaultMigrationManager } from "@/content";
import { testContentMigrationManager } from "../domain/domain-content-migration-manager-tests";


testContentMigrationManager({
  implementationName: DefaultMigrationManager.prototype.constructor.name,

  beforeEach: async () => ({
    manager: new DefaultMigrationManager()
  })
})