import type { ClientDocumentsGateway } from "@/client/interfaces";
import { ContentAnalysisManager, ContentMigrationManager } from "@/domain";
import { TestAuthenticator } from "@/test/__utils__/test-authenticator";
import React from "react";


export type Services = {
  auth: TestAuthenticator,
  documents: ClientDocumentsGateway,
  migrations: ContentMigrationManager,
  analysis: ContentAnalysisManager,
}


export const ServicesContext = React.createContext<Services>({} as Services);


export function ServicesProvider({
  auth,
  documents,
  migrations,
  analysis,
  children
}: React.PropsWithChildren<Services>) {
  const value = React.useMemo(() => ({
    auth,
    documents,
    migrations,
    analysis,
  }), [auth, documents, migrations]);

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}


export function useServices() : Services {
  return React.useContext(ServicesContext);
}