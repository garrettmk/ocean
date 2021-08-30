import { DocumentsGraphQLClient, UrqlGraphQLClient } from '@/client/interfaces';
import { TestAuthenticator } from '@/test/__mocks__/test-authenticator';
import { ChakraProvider } from '@chakra-ui/provider';
import { extendTheme } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import { apiConfig } from './config';
import { ServicesProvider } from './services';


const auth = new TestAuthenticator('lukeskywalker');
const client = new UrqlGraphQLClient(apiConfig.url, auth);
const documents = new DocumentsGraphQLClient(client);


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
  >
    <ChakraProvider
      theme={theme}
    >
      <App/>
    </ChakraProvider>
  </ServicesProvider>,
  rootEl
);