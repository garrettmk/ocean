import { DOCUMENT_ROUTE, GRAPH_ROUTE } from '@/react-web/config/routes';
import { AppBarContextValue } from '@/react-web/contexts';
import { DocumentRoute, GraphRoute } from '@/react-web/routes';
import { useServices } from '@/react-web/services';
import { Grid, GridItem } from '@chakra-ui/layout';
import React from 'react';
import { useMeasure } from 'react-use';
import { Route, Switch } from 'wouter';
import { AppBarProvider } from '../app-bar-provider';
import { AppBar } from '../app-bar';


export function App() {
  const services = useServices();

  const [appBarRef, measure] = useMeasure<HTMLDivElement>();
  const primary = React.useRef<HTMLDivElement>(null);
  const secondary = React.useRef<HTMLDivElement>(null);
  const tertiary = React.useRef<HTMLDivElement>(null);

  const appBarContextValue = React.useMemo<AppBarContextValue>(() => ({
    primary,
    secondary,
    tertiary,
    measure
  }), [primary, secondary, tertiary, measure]);

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
      <AppBar 
        ref={appBarRef}
        zIndex='2'
        {...{ primary, secondary, tertiary } }
      />

      <AppBarProvider value={appBarContextValue}>
        <Switch>
          <Route path={GRAPH_ROUTE} component={GraphRoute} />
          <Route path={DOCUMENT_ROUTE} component={DocumentRoute} />
        </Switch>
      </AppBarProvider>
    </Grid>
  );
}