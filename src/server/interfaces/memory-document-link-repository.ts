import { DocumentLink, DocumentLinkRepository, ID, DocumentLinkMeta, NotFoundError } from "@/domain";
import { AlreadyExistsError } from "../usecases";


export class MemoryDocumentLinkRepository implements DocumentLinkRepository {
  private links: DocumentLink[];


  constructor() {
    this.links = [];
  }


  async link(from: ID, to: ID, meta: DocumentLinkMeta = {}) {
    const existingLink = await this.getLink(from, to).catch(error => {
      if (error instanceof NotFoundError)
        return undefined;
      throw error;
    });
    
    if (existingLink)
      throw new AlreadyExistsError();

    const link: DocumentLink = { from, to, meta };
    this.links.push(link);

    return link;
  }


  async getLink(from: ID, to: ID) {
    const link = this.links.find(l => l.from === from && l.to === to);
    if (!link)
      throw new NotFoundError();

    return link;
  }


  async listLinks(from: ID) {
    const links = this.links.filter(l => l.from === from);
    return links;
  }


  async updateLink(from: ID, to: ID, meta: DocumentLinkMeta) {
    const link = await this.getLink(from, to);
    link.meta = { ...link.meta, ...meta };

    return link;
  }

  async unlink(from: ID, to: ID) {
    const index = this.links.findIndex(l => l.from === from && l.to === to);
    if (index < 0)
      throw new NotFoundError();

    const link = this.links[index];
    this.links.splice(index, 1);

    return link;
  }
}