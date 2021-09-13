import { textPlain, applicationJSON } from "../content-types";
import { ContentTypeMigration } from "@/domain";


export class TextPlainToApplicationJson implements ContentTypeMigration {
  public name = 'Plain text to JSON';
  public from = textPlain;
  public to = applicationJSON;


  async migrate(content: any) {
    return JSON.parse(content);
  }
}