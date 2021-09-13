import { NotFoundError } from "@/domain";
import { AlreadyExistsError } from "@/server/usecases";
import { ContentAnalysisManager, ContentAnalyzer } from "./document-content-models";


export class DefaultAnalysisManager implements ContentAnalysisManager {
  private analyzers: ContentAnalyzer[];

  constructor(analyzers: ContentAnalyzer[]) {
    this.analyzers = analyzers;
  }

  async registerAnalyzer(analyzer: ContentAnalyzer, replace: boolean = false) {
    const replaces = analyzer.contentTypes.reduce((res, cur) => 
      res || !!this.analyzers.find(a => a.contentTypes.includes(cur)), 
      false
    );

    if (replaces && !replace)
      throw new AlreadyExistsError();

    this.analyzers.push(analyzer);
    return true;
  }

  
  async listAllAnalyzers() {
    return this.analyzers.slice();
  }


  async getAnalyzer(contentType: string) {
    const analyzer = this.analyzers.find(a => a.contentTypes.includes(contentType));
    if (!analyzer)
      throw new NotFoundError(`ContentAnalyzer for contentType: ${contentType}`);

    return analyzer;
  }


  async analyze(contentType: string, content: any) {
    const analyzer = await this.getAnalyzer(contentType);
    const analysis = await analyzer.analyze(contentType, content);

    return analysis;
  }
}