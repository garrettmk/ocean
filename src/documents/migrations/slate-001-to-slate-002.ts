import { slate001, slate002 } from "../content-types";
import { ContentTypeMigration } from "@/domain";


export class Slate001ToSlate002 implements ContentTypeMigration {
  public name = 'Slate v1 to Slate v2';
  public from = slate001;
  public to = slate002;


  async migrate(content: any) {
    return content;
  }
}