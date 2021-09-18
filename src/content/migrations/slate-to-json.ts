import { slateContentType, jsonContentType } from "../content-types";
import { ContentMigration } from "@/domain";
import { validateJSONContent, validateSlateContent } from "../validators";


export class SlateToJSON implements ContentMigration {
  public from = slateContentType;
  public to = jsonContentType;

  async migrate(content: any) {
    validateSlateContent(content);
    validateJSONContent(content);
    
    return content;
  }
}