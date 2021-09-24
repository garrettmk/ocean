import { ContentAnalysis, ContentAnalyzer } from "@/domain";
import { htmlContentType } from "..";


export class HtmlContentAnalyzer implements ContentAnalyzer {
  public contentTypes = [htmlContentType.value];

  async analyze(contentType: string, content: any) : Promise<ContentAnalysis> {

    return {}
  }
}