import { ContentMigration } from "@/domain";
import { HTMLContent, htmlContentType, textContentType } from "../content-types";



export class HTMLToText implements ContentMigration {
  public from = htmlContentType;
  public to = textContentType;

  async migrate(content: HTMLContent) {
    return content + '';
  }
}