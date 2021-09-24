import DOMPurify from "dompurify";


export class HtmlSanitizer {
  private dp: DOMPurify.DOMPurifyI;

  constructor(window: Window) {
    this.dp = DOMPurify(window);
  }

  async sanitize(html: string) : Promise<string> {
    return this.dp.sanitize(html, {
      ADD_ATTR: ['target'],
      WHOLE_DOCUMENT: true,
      FORCE_BODY: true
    });
  }
}