import { NotFoundError, validateContentAnalyzer, validateContentType, validateParsedContentType, AlreadyExistsError } from "@/domain";
import { ContentAnalysisManager, ContentAnalyzer } from '@/domain';


export class DefaultAnalysisManager implements ContentAnalysisManager {
  private analyzers: ContentAnalyzer[];

  constructor(analyzers: ContentAnalyzer[] = []) {
    this.analyzers = analyzers;
  }

  async registerAnalyzer(analyzer: ContentAnalyzer, replace: boolean = false) {
    validateContentAnalyzer(analyzer);

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
    validateContentType(contentType);

    const analyzer = this.analyzers.find(a => a.contentTypes.includes(contentType));
    if (!analyzer)
      throw new NotFoundError(`ContentAnalyzer for contentType: ${contentType}`);

    return analyzer;
  }


  async analyze(contentType: string, content: any) {
    validateContentType(contentType);
    
    const analyzer = await this.getAnalyzer(contentType);
    const analysis = await analyzer.analyze(contentType, content);

    return analysis;
  }
}