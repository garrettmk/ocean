import { textPlain, applicationJSON } from "../content-types";
import { ContentMigration } from "@/domain";


export class ApplicationJSONToTextPlain implements ContentMigration {
  public from = applicationJSON;
  public to = textPlain;

  async migrate(content: any) {
    return JSON.stringify(content, null, '  ');
  }
}