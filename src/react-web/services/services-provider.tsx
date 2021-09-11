import type { ClientDocumentsGateway } from "@/client/interfaces";
import { TestAuthenticator } from "@/test/__mocks__/test-authenticator";
import React from "react";


export type Services = {
  auth: TestAuthenticator,
  documents: ClientDocumentsGateway
}


export const ServicesContext = React.createContext<Services>({} as Services);


export function ServicesProvider({
  auth,
  documents,
  children
}: React.PropsWithChildren<Services>) {
  const value = React.useMemo(() => ({
    auth,
    documents,
  }), []);

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}


export function useServices() : Services {
  return React.useContext(ServicesContext);
}