import { textPlain, applicationJSON } from "../content-types";
import { ContentTypeMigration } from "../interfaces/document-content-models";


export class ApplicationJSONToTextPlain implements ContentTypeMigration {
  public name = 'JSON to plain text';
  public from = applicationJSON;
  public to = textPlain;


  async migrate(content: any) {
    return JSON.stringify(content, null, '  ');
  }
}