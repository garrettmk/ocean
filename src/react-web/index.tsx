import { DocumentsGraphQLClient, UrqlGraphQLClient } from '@/client/interfaces';
import { DefaultMigrationManager, defaultMigrations } from '@/documents';
import { TestAuthenticator } from '@/test/__mocks__/test-authenticator';
import { ChakraProvider } from '@chakra-ui/provider';
import { extendTheme } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
// import { apiConfig } from './config';
import { ServicesProvider } from './services';


const auth = new TestAuthenticator('lukeskywalker');
const client = new UrqlGraphQLClient('http://localhost:3000/graphql', auth);
const documents = new DocumentsGraphQLClient(client);
const migrations = new DefaultMigrationManager(defaultMigrations);


const rootEl = document.getElementById('root');
if (!rootEl)
  throw new Error("Can't render app: root element not found");


const theme = extendTheme({ config: {
  initialColorMode: 'light',
  useSystemColorMode: false,
}});



ReactDOM.render(
  <ServicesProvider
    auth={auth}
    documents={documents}
    migrations={migrations}
  >
    <ChakraProvider
      theme={theme}
    >
      <App/>
    </ChakraProvider>
  </ServicesProvider>,
  rootEl
);