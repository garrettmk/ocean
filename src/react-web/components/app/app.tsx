import { DOCUMENT_ROUTE, GRAPH_ROUTE } from '@/react-web/config/routes';
import { AppBarContextValue } from '@/react-web/contexts';
import { DocumentRoute, GraphRoute } from '@/react-web/routes';
import { Grid } from '@chakra-ui/layout';
import React from 'react';
import { useMeasure } from 'react-use';
import { Route, Switch } from 'wouter';
import { AppBar } from '../app-bar';
import { AppBarProvider } from '../app-bar-provider';


export function App() {
  const appBarRef = React.useRef<HTMLDivElement>(null);
  const [measureRef, measure] = useMeasure<HTMLDivElement>();
  const combinedRef = React.useCallback((element: HTMLDivElement) => {
    // @ts-ignore
    appBarRef.current = element;
    measureRef(element);
  }, [appBarRef, measureRef]);
  
  const appBarContextValue = React.useMemo<AppBarContextValue>(() => ({
    ref: appBarRef,
    measure
  }), [measure]);

  return (
    <Grid
      w='100vw'
      maxW='100vw'
      minH='100vh'
      templateRows='auto 1fr'
      templateColumns='1fr'
      bg='gray.400'
      position='relative'
    >
      <AppBar ref={combinedRef}/>

      <AppBarProvider value={appBarContextValue}>
        <Switch>
          <Route path={GRAPH_ROUTE} component={GraphRoute} />
          <Route path={DOCUMENT_ROUTE} component={DocumentRoute} />
        </Switch>
      </AppBarProvider>
    </Grid>
  );
}