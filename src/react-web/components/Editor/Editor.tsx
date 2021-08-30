import { makeOpenDocumentMachine } from "@/client/viewmodels";
import { useServices } from "@/react-web/services";
import React from "react";
import { useMachine } from '@xstate/react';
import { Box } from "@chakra-ui/layout";


export function Editor({
  params: { id }
}: React.PropsWithChildren<{
  params: { id: string }
}>) {
  const services = useServices();
  const machine = React.useMemo(() => makeOpenDocumentMachine(services.documents), []);
  const [state, send] = useMachine(machine);

  React.useEffect(() => {
    send({ type: 'open', payload: id });
  }, [id]);

  return (
    <Box>
      <pre>
        {JSON.stringify(state, null, '  ')}
      </pre>
    </Box>
  );
}