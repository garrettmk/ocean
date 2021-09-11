import { textMarkdown, textPlain } from "../content-types";
import { ContentTypeMigration } from "../interfaces/document-content-models";


export class TextPlainToTextMarkdown implements ContentTypeMigration {
  public name = 'Plain text to Markdown';
  public from = textPlain;
  public to = textMarkdown;


  async migrate(content: any) {
    return '' + content;
  }
}