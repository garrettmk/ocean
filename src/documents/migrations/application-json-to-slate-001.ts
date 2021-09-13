import { applicationJSON, slate001 } from "../content-types";
import { ContentTypeMigration } from "@/domain";


export class ApplicationJsonToSlate001 implements ContentTypeMigration {
  public name = 'JSON to Slate V1';
  public from = applicationJSON;
  public to = slate001;


  async migrate(content: any) {
    return content;
  }
}