import { DocumentsGraphQLClient, UrqlGraphQLClient, urqlCacheResolvers } from '@/client/implementations';
import { DefaultAnalysisManager, defaultAnalyzers, DefaultMigrationManager, defaultMigrations } from '@/content';
import { ChakraProvider } from '@chakra-ui/provider';
import { extendTheme } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/react-web/app';
import { ServicesProvider } from '@/react-web/services';
import { DummyAuthenticator } from '@/react-web/utils';
import { apiConfig } from '@/react-web/config/api';


const auth = new DummyAuthenticator('lukeskywalker');
const client = new UrqlGraphQLClient({ 
  url: apiConfig.url, 
  authenticator: auth, 
  cacheResolvers: urqlCacheResolvers 
});
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