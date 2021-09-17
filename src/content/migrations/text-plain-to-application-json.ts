import { textPlain, applicationJSON } from "../content-types";
import { ContentMigration } from "@/domain";


export class TextPlainToApplicationJson implements ContentMigration {
  public from = textPlain;
  public to = applicationJSON;

  async migrate(content: any) {
    return JSON.parse(content);
  }
}