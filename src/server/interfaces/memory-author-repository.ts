import { Author, AuthorRepository, CreateAuthorInput, ID, NotFoundError } from "@/domain";


export class MemoryAuthorRepository implements AuthorRepository {
  private authors: {
    [key: string]: Author
  }


  constructor() {
    this.authors = {};
  }


  async create(input: CreateAuthorInput) {
    const id = Object.keys(this.authors).length + 1;
    const author: Author = {
      id: id + '',
      name: input.name
    };

    this.authors[id] = author;
    return author;
  }


  async getById(id: ID) {
    const author = this.authors[id];
    if (!author)
      throw new NotFoundError(`author id ${id}`);

    return author;
  }
}