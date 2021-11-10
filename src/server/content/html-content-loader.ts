import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { htmlContentType, isSameSubType } from '../../content';


export class HtmlContentLoader {  
  public dom: JSDOM;
  public sanitizer: DOMPurify.DOMPurifyI;

  private _loaded: Promise<void>;


  public static supportsContentType(value: string) : boolean {
    return isSameSubType(value, htmlContentType.value);
  }

  constructor(content?: string, origin?: string) {
    this.dom = new JSDOM();
    this.sanitizer = DOMPurify(this.dom.window as unknown as Window);
    
    const sanitizedContent = this.sanitize(content + '');

    this.dom = new JSDOM(sanitizedContent, {
      resources: 'usable',
      url: origin
    });

    this._loaded = new Promise((resolve) => {
      this.dom.window.addEventListener('load', () => resolve());
    });
  }

  public async toContent() : Promise<string> {
    await this._loaded;
    return this.dom.serialize();
  }


  public async getTitle() : Promise<string> {
    await this._loaded;
    return this.dom.window.document.title;
  }

  private sanitize(content: string) : string {
    return this.sanitizer.sanitize(content, {
      WHOLE_DOCUMENT: true,
      FORCE_BODY: true,
      ADD_TAGS: ['head', 'link', 'img'],
      ADD_ATTR: ['target', 'id', 'rel', 'media', 'href'],
    });
  }
}