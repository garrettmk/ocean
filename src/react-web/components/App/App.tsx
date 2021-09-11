import { makeBrowseDocumentsMachine } from '@/client/viewmodels';
import { useServices } from '@/react-web/services';
import { Box, Grid, GridItem } from '@chakra-ui/layout';
import { useMachine } from '@xstate/react';
import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { DocumentEditor } from '../DocumentEditor';
import { DocumentList } from '../DocumentList';


export function App() {
  const services = useServices();
  const browseMachine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  const [state, send] = useMachine(browseMachine);
  const docs = state.context.documents;
  const [location, setLocation] = useLocation();
  
  return (
    <Grid
      w='100vw'
      h='100vh'
      templateColumns='400px 1fr'
      templateRows='1fr'
    >
      <DocumentList/>

      <Switch>
        <Route path='/doc/:id' component={DocumentEditor}/>
        <Route path='/' component={Box}/>
      </Switch>
    </Grid>
  )
}