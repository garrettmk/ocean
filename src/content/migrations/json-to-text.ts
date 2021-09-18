import { textContentType, jsonContentType } from "../content-types";
import { ContentMigration } from "@/domain";
import { validateJSONContent } from "../validators";


export class JSONToText implements ContentMigration {
  public from = jsonContentType;
  public to = textContentType;

  async migrate(content: any) {
    validateJSONContent(content);
    
    return JSON.stringify(content, null, '  ');
  }
}