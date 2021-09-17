import { DefaultAnalysisManager } from "@/content";
import { testContentAnalysisManager } from "../domain/domain-content-analysis-manager-tests";


testContentAnalysisManager<DefaultAnalysisManager>({
  implementationName: DefaultAnalysisManager.prototype.constructor.name,

  beforeEach: (async () => {
    return {
      manager: new DefaultAnalysisManager(),
    }
  })
})