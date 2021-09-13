import { ContentAnalysis, ContentAnalyzer } from "../interfaces";
import { slate001, slate002 } from '../content-types';
import { Editor, createEditor, Node, LinkElement } from "slate";


export class SlateContentAnalyzer implements ContentAnalyzer {
  public contentTypes = [slate001.value, slate002.value];

  async analyze(contentType: string, content: any) : Promise<ContentAnalysis> {
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