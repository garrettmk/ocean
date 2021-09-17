import { applicationJSON, slate001 } from "../content-types";
import { ContentMigration } from "@/domain";


export class Slate001ToApplicationJSON implements ContentMigration {
  public from = slate001;
  public to = applicationJSON;

  async migrate(content: any) {
    return content;
  }
}