import { DocumentsGraphQLClient, UrqlGraphQLClient } from '@/client/interfaces';
import { DefaultAnalysisManager, defaultAnalyzers, DefaultMigrationManager, defaultMigrations } from '@/content';
import { TestAuthenticator } from '@/test/__utils__/test-authenticator';
import { ChakraProvider } from '@chakra-ui/provider';
import { extendTheme } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/app';
// import { apiConfig } from './config';
import { ServicesProvider } from './services';


const auth = new TestAuthenticator('lukeskywalker');
const client = new UrqlGraphQLClient('http://localhost:3000/graphql', auth);
const documents = new DocumentsGraphQLClient(client);
const migrations = new DefaultMigrationManager(defaultMigrations);
const analysis = new DefaultAnalysisManager(defaultAnalyzers);


const rootEl = document.getElementById('root');
if (!rootEl)
  throw new Error("Can't render app: root element not found");


const theme = extendTheme({ config: {
  initialColorMode: 'light',
  useSystemColorMode: false,
}});



ReactDOM.render(
  <ServicesProvider {...{
    auth,
    documents,
    migrations,
    analysis
  }}>
    <ChakraProvider
      theme={theme}
    >
      <App/>
    </ChakraProvider>
  </ServicesProvider>,
  rootEl
);