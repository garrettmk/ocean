import { DefaultMigrationManager } from "@/content";
import { testContentMigrationManager } from '@/test/unit/domain/content';


testContentMigrationManager({
  implementationName: DefaultMigrationManager.prototype.constructor.name,

  beforeEach: async () => ({
    manager: new DefaultMigrationManager()
  })
})