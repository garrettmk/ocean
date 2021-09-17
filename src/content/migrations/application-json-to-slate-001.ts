import { applicationJSON, slate001 } from "../content-types";
import { ContentMigration } from "@/domain";


export class ApplicationJsonToSlate001 implements ContentMigration {
  public from = applicationJSON;
  public to = slate001;

  async migrate(content: any) {
    return content;
  }
}