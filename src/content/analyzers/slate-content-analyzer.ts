import { ContentAnalysis, ContentAnalyzer } from "@/domain";
import { createEditor, Node } from "slate";
import { slateContentType, LinkElement } from "../content-types/content-type-slate";
import { validateSlateContent } from "../validators";


export class SlateContentAnalyzer implements ContentAnalyzer {
  public contentTypes = [slateContentType.value];

  async analyze(contentType: string, content: any) : Promise<ContentAnalysis> {
    validateSlateContent(content);
    
    const editor = createEditor();
    editor.children = content;

    const [...matches] = Node.elements(editor);
    const linkElements: LinkElement[] = matches
      .filter(m => m[0].type === 'link')
      .map(m => m[0] as LinkElement);

    return {
      links: linkElements.map(({ url }) => ({ url: url! }))
    };
  }
}