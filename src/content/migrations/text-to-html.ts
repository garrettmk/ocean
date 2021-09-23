import { ContentMigration } from "@/domain";
import { HTMLContent, htmlContentType, TextContent, textContentType } from "../content-types";



export class TextToHTML implements ContentMigration {
  public from = textContentType;
  public to = htmlContentType;

  async migrate(content: TextContent) {
    return content + '';
  }
}