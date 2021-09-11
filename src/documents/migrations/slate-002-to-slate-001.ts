import { slate001, slate002 } from "../content-types";
import { ContentTypeMigration } from "../interfaces/document-content-models";


export class Slate002ToSlate001 implements ContentTypeMigration {
  public name = 'Slate v2 to Slate v1';
  public from = slate002;
  public to = slate001;


  async migrate(content: any) {
    return content;
  }
}