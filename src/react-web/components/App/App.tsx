import { Box, Divider, Grid } from '@chakra-ui/layout';
import React from 'react';
import { Route, Switch } from 'wouter';
import { DocumentEditor } from '../DocumentEditor';
import { DocumentLinks } from '../DocumentLinks';
import { DocumentList } from '../DocumentList';
import { AppSidebar } from './components/app-sidebar';
import { GraphEditor } from '../GraphEditor.tsx';
import { DOCUMENT_ROUTE, GRAPH_ROUTE } from '@/react-web/config/routes';


export function App() {
  return (
    <Grid
      w='100vw'
      minH='100vh'
      maxW='100vw'
      templateColumns='400px 1fr'
      templateRows='1fr'
    >
      <AppSidebar>
        <DocumentList/>
        <Divider borderColor='gray.500' />
        <DocumentLinks/>
      </AppSidebar>
      
      <Switch>
        <Route path={GRAPH_ROUTE} component={GraphEditor}/>
        <Route path={DOCUMENT_ROUTE} component={DocumentEditor}/>
        <Route path='/' component={Box}/>
      </Switch>
    </Grid>
  )
}