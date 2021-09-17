import { slate001, slate002 } from "../content-types";
import { ContentMigration } from "@/domain";


export class Slate002ToSlate001 implements ContentMigration {
  public from = slate002;
  public to = slate001;

  async migrate(content: any) {
    return content;
  }
}