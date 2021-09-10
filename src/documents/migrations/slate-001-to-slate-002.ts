import { slate001, slate002 } from "../content-types";
import { ContentTypeMigration } from "../interfaces/document-content-models";


export class Slate001ToSlate002 implements ContentTypeMigration {
  public name = 'Plain text to Markdown';
  public from = slate001;
  public to = slate002;


  async up(content: any) {
    return content;
  }


  async down(content: any) {
    return content;
  }
}