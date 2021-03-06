import { Author, AuthorRepository, CreateAuthorInput, ID, NotFoundError, validateAuthor, validateCreateAuthorInput } from "@/domain";


export class MemoryAuthorRepository implements AuthorRepository {
  private authors: {
    [key: string]: Author
  }


  constructor() {
    this.authors = {};
  }


  async create(input: CreateAuthorInput) {
    validateCreateAuthorInput(input);

    const id = Object.keys(this.authors).length + 1;
    const author: Author = {
      id: id + '',
      name: input.name
    };

    validateAuthor(author);

    this.authors[id] = author;
    return author;
  }


  async getById(id: ID) {
    const author = this.authors[id];
    if (!author)
      throw new NotFoundError(`author id ${id}`);

    return author;
  }

  
  async listById(ids: ID[]) {
    return ids.map(id => {
      if (!(id in this.authors))
        throw new NotFoundError(`author id ${id}`);
      
      return this.authors[id];
    })
  }
}