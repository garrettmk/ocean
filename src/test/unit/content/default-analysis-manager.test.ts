import { DefaultAnalysisManager } from "@/content";
import { testContentAnalysisManager } from "@/test/unit/domain/content";


testContentAnalysisManager<DefaultAnalysisManager>({
  implementationName: DefaultAnalysisManager.prototype.constructor.name,

  beforeEach: (async () => {
    return {
      manager: new DefaultAnalysisManager(),
    }
  })
})