import { ContentTypeMigration } from "@/domain";
import { textPlain, slate001 } from "../content-types";


export class TextPlainToSlate001 implements ContentTypeMigration {
  public name = 'Plain text to Slate001';
  public from = textPlain;
  public to = slate001;


  async migrate(content: any) {
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
}