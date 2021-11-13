import { unknownContentType } from "@/content";


export class UnknownContentLoader {
  private _content: any;

  public static supportsContentType(value: string) : boolean {
    return true;
  }

  public constructor(content?: any) {
    this._content = content;
  }

  public toContent() : any {
    return this._content;
  }
}