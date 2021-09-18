import { textContentType, jsonContentType } from "../content-types";
import { ContentMigration } from "@/domain";
import { validateTextContent } from "../validators";


export class TextToJSON implements ContentMigration {
  public from = textContentType;
  public to = jsonContentType;

  async migrate(content: any) {
    validateTextContent(content);
    
    return JSON.parse(content);
  }
}