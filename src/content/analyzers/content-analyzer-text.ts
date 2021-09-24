import { ContentAnalysis, ContentAnalyzer } from "@/domain";
import { textContentType } from "..";


export class TextContentAnalyzer implements ContentAnalyzer {
  public contentTypes = [textContentType.value];

  async analyze(contentType: string, content: any) : Promise<ContentAnalysis> {

    return {}
  }
}