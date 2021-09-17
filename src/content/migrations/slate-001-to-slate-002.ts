import { slate001, slate002 } from "../content-types";
import { ContentMigration } from "@/domain";


export class Slate001ToSlate002 implements ContentMigration {
  public from = slate001;
  public to = slate002;

  async migrate(content: any) {
    return content;
  }
}