import { textHTML, textPlain } from "../content-types";
import { ContentTypeMigration } from "../interfaces/document-content-models";


export class TextPlainToTextHTML implements ContentTypeMigration {
  public name = 'Plain text to HTML';
  public from = textPlain;
  public to = textHTML;


  async up(content: any) {
    return '' + content;
  }


  async down(content: any) {
    return '' + content;
  }
}