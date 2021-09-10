import { ContentTypeMigration } from "../interfaces/document-content-models";
import { textPlain, slate001 } from "../content-types";
import { Node } from "slate";


export class TextPlainToSlate001 implements ContentTypeMigration {
  public name = 'Plain text to Slate001';
  public from = textPlain;
  public to = slate001;


  async up(content: any) {
    const text = '' + content;

    return [
      {
        type: 'paragraph',
        children: [
          { text }
        ]
      }
    ]
  }


  async down(content: any) {
    const nodes: any[] = content ?? [];

    return nodes.map(n => Node.string(n)).join('\n');
  }
}