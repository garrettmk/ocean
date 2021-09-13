import { applicationJSON, slate001 } from "../content-types";
import { ContentTypeMigration } from "@/domain";


export class Slate001ToApplicationJSON implements ContentTypeMigration {
  public name = 'Slate v1 to JSON';
  public from = slate001;
  public to = applicationJSON;


  async migrate(content: any) {
    return content;
  }
}