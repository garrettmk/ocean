import React from 'react';
import { Grid, GridItem, Box } from '@chakra-ui/layout';
import { makeBrowseDocumentsMachine } from '@/client/viewmodels';
import { useMachine } from '@xstate/react';
import { useServices } from '@/react-web/services';
import { Button } from '@chakra-ui/react';
import { Link, Route, Switch } from 'wouter';
import { Editor } from '../Editor';


export function App() {
  const services = useServices();
  const browseMachine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  const [state, send] = useMachine(browseMachine);
  const docs = state.context.documents;

  const newDocument = React.useCallback(() => {
    services.documents.createDocument({});
  }, []);
  
  return (
    <Grid
      w='100vw'
      h='100vh'
      templateColumns='300px 1fr'
      templateRows='1fr'
    >
      <GridItem
        bg='blue.500'
        p='4'
      >
        {docs.map(header => (
          <Box>
            <Link href={`/doc/${header.id}`}>
              {header.title}
            </Link>
          </Box>
        ))}
        <Button onClick={newDocument}>New Document</Button>
      </GridItem>

      <GridItem
        bg='green.500'
      >
        <Switch>
          <Route path='/doc/:id' component={Editor}/>
          <Route path='/' component={Box}/>
        </Switch>
      </GridItem>
    </Grid>
  )
}