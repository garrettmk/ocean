import { AppBarContext, AppBarContextValue } from '@/react-web/contexts';
import React from 'react';


export function AppBarProvider({
  value,
  children
}: React.PropsWithChildren<{
  value: AppBarContextValue
}>) : JSX.Element {
  return (
    <AppBarContext.Provider value={value}>
      {children}
    </AppBarContext.Provider>
  );
}