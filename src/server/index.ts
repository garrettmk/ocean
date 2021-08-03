import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import morgan from 'morgan';
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository, ServerApi } from "./interfaces";
import { ServerDocumentInteractor, ServerUserInteractor } from "./usecases";



// Create repositories
const authors = new MemoryAuthorRepository();
const documents = new MemoryDocumentRepository(authors);
const users = new MemoryUserRepository(authors);

// For dev purposes, add a single, default user
users.save({
  id: 'SINGLE_USER',
  name: 'Single User'
});

// Create the interactors
const documentInteractor = new ServerDocumentInteractor(documents, users);
const userInteractor = new ServerUserInteractor(users);

// Create the web service
const serverApi = new ServerApi(userInteractor, documentInteractor);

// Set up the express server
const app = express();
app.use(morgan('combined'));
app.use(cors());

const userMiddleware = makeUserMiddleware();
app.use(userMiddleware);

app.use('/graphql', graphqlHTTP({
  schema: serverApi.getSchema(),
  rootValue: undefined,
  context: userMiddleware.context,
  graphiql: true
}));

app.listen(3000, () => {
  console.log('Listening on port 3000');
});



function makeUserMiddleware() {
  let _context = {};

  function context() {
    return _context;
  }

  async function middleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization;
    // Parse token for user key ('sub')
    const userId = 'SINGLE_USER';
    _context = { userId };
    next();
  }

  return Object.assign(middleware, { context });
}