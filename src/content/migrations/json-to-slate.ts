import { jsonContentType, slateContentType } from "../content-types";
import { ContentMigration } from "@/domain";
import { validateJSONContent, validateSlateContent } from "../validators";


export class JSONToSlate implements ContentMigration {
  public from = jsonContentType;
  public to = slateContentType;

  async migrate(content: any) {
    validateJSONContent(content);
    validateSlateContent(content);

    return content;
  }
}