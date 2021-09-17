import { textMarkdown, textPlain } from "../content-types";
import { ContentMigration } from '@/domain';


export class TextPlainToTextMarkdown implements ContentMigration {
  public from = textPlain;
  public to = textMarkdown;

  async migrate(content: any) {
    return '' + content;
  }
}