import { textHTML, textPlain } from "../content-types";
import { ContentMigration } from "@/domain";


export class TextPlainToTextHTML implements ContentMigration {
  public from = textPlain;
  public to = textHTML;

  async migrate(content: any) {
    return '' + content;
  }
}