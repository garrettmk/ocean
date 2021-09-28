import { Box, Divider, Grid } from '@chakra-ui/layout';
import React from 'react';
import { Route, Switch } from 'wouter';
import { DocumentEditor } from '../DocumentEditor';
import { DocumentLinks } from '../DocumentLinks';
import { DocumentList } from '../DocumentList';
import { AppSidebar } from './components/app-sidebar';


export function App() {
  return (
    <Grid
      w='100vw'
      minH='100vh'
      templateColumns='400px 1fr'
      templateRows='1fr'
    >
      <AppSidebar>
        <DocumentList/>
        <Divider borderColor='gray.500' />
        <DocumentLinks/>
      </AppSidebar>
      
      <Switch>
        <Route path='/doc/:id' component={DocumentEditor}/>
        <Route path='/' component={Box}/>
      </Switch>
    </Grid>
  )
}