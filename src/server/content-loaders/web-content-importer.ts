import fetch from "node-fetch";
import Mercury from '@postlight/mercury-parser';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import Url from 'url-parse';


export type ImportedWebContent = {
  origin: string,
  title?: string,
  content: string
}

export interface ContentImporter {
  importContent(url: string) : Promise<ImportedWebContent>
}


export class WebContentImporter implements ContentImporter {

  constructor() {

  }

  async importContent(url: string) : Promise<ImportedWebContent> {
    const dom = await JSDOM.fromURL(url, {
      resources: 'usable'
    });

    await this.resolveLinks(dom, url);
    await this.embedStyles(dom);
    
    const content = await this.sanitizeDOM(dom);
    const title = await this.getTitle(dom);

    return {
      origin: url,
      title,
      content
    };
  }

  private async resolveLinks(dom: JSDOM, url: string) {
    const { host } = new Url(url);
    dom.window.document.querySelectorAll('a').forEach(node => {
      node.setAttribute('target', '_parent');
      node.setAttribute('href', new Url(node.href, host).href);
    });
  }

  private async embedStyles(dom: JSDOM) {
    return new Promise<void>((resolve, reject) => {
      dom.window.addEventListener('load', () => {
        const head = dom.window.document.head;

        Array.from(dom.window.document.styleSheets).forEach(sheet => {
          const styleContent = Array.from(sheet.cssRules)
            .map(rule => this.sanitizeCSSRule(rule))
            .map(rule => rule.cssText)
            .join('\n');

          const styleElement = dom.window.document.createElement('style');
          styleElement.setAttribute('type', 'text/css');
          styleElement.appendChild(dom.window.document.createTextNode(styleContent));
          head.appendChild(styleElement);
        });
    
        dom.window.document.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
          node.parentElement?.removeChild(node);
        });
        
        resolve();
      });
    });
  }

  private async getTitle(dom: JSDOM) {
    return dom.window.document.title;
  }

  private async sanitizeDOM(dom: JSDOM) {
    const dp = DOMPurify(dom.window as unknown as Window);

    return dp.sanitize(dom.serialize(), {
      ADD_ATTR: ['target'],
      WHOLE_DOCUMENT: true,
    });
  }

  private sanitizeCSSRule(rule: CSSRule) {
    if (isStyleRule(rule) && rule.style.getPropertyValue('overflow-y')) {
      rule.style.removeProperty('overflow-y');
    }

    if (isStyleRule(rule)) {
      const rootFontSize = 10;
      const remValueRegex = /(\d*(?:\.\d+)?)rem/gi;
      
      for (let i = 0; i < rule.style.length; i++) {
        const name = rule.style[i];
        const value = rule.style.getPropertyValue(name);
        const newValue = value.replace(remValueRegex, (_, mult) => rootFontSize * parseFloat(mult) + 'px');
        rule.style.setProperty(name, newValue);
      }
    }
    return rule;
  }
}

function isStyleRule(rule: CSSRule) : rule is CSSStyleRule {
  return 'style' in rule;
}