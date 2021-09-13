import { makeOpenDocumentMachine } from "@/client/viewmodels";
import { ContentType } from "@/documents";
import { parseContentType } from "@/documents/utils/content-type-utils";
import { useServices } from "@/react-web/services";
import { Box, Button, Flex, Grid, Input, Select, Textarea } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import React from "react";
import { SlateEditor } from "../SlateEditor";
import { TextPlainEditor } from "../TextPlainEditor";
import { ApplicationJSONEditor } from "../ApplicationJSONEditor";
import { RecommendedLinks } from "../RecommendedLinks";


export function DocumentEditor({
  params: { id }
}: {
  params: { id: string }
}) : JSX.Element {
  const services = useServices();
  const machine = React.useMemo(() => makeOpenDocumentMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const document = state.context.document;

  // Open the document when the component mounts
  React.useEffect(() => {
    send({ type: 'open', payload: id });
  }, [id]);


  // Change the title
  const setTitle = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    send({
      type: 'edit', 
      payload: { 
        title: event.target.value
      }
    })
  }, [send]);


  // Change the content
  const setContent = React.useCallback(newContent => {
    if (document?.contentType && newContent) {
      const analysis = services.analysis.analyze(document.contentType, newContent);
    }
    
    send({
      type: 'edit',
      payload: {
        contentType: document?.contentType,
        content: newContent
      }
    });
  }, [send, document?.contentType]);


  // Content type options
  const [contentTypeOptions, setContentTypeOptions] = React.useState<ContentType[]>([]);
  React.useEffect(() => {
    const value = document?.contentType;
    if (!value)
      setContentTypeOptions([]);

    (async () => {
      if (!value) return;
      const contentType = parseContentType(value);
      const avalablePaths = await services.migrations.getMigrationPaths(contentType);
      setContentTypeOptions([
        contentType,
        ...avalablePaths.map(p => p.to)
      ])
    })();
  }, [document?.contentType]);


  // Change the content type
  const setContentType = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    (async () => {
      const from = parseContentType(document!.contentType);
      const to = parseContentType(event.target.value);

      const avalableMigrations = await services.migrations.getMigrationPaths(from, to);
      const migration = avalableMigrations[0];

      const newContent = await services.migrations.migrate(document?.content, migration);

      send({
        type: 'edit',
        payload: {
          contentType: to.value,
          content: newContent
        }
      });
    })();
  }, [document?.contentType, document?.content])


  // Save the document
  const saveDocument = React.useCallback(() => {
    send({
      type: 'save'
    });
  }, [send]);


  // The editor component
  const ContentEditorComponent = React.useMemo(() => {
    const contentType = document?.contentType ?? '';

    return {
      'text/plain': TextPlainEditor,
      'application/json': ApplicationJSONEditor,
      'application/json;format=slate001': SlateEditor
    }[contentType] ?? ApplicationJSONEditor;
  }, [document?.contentType]);


  return (
    <Grid
      templateRows='auto auto 1fr'
      templateColumns='1fr auto'
      templateAreas={`
        "title buttons"
        "links links"
        "content content"
      `}
      gap={4}
      p={8}
    >
      <Input
        gridArea='title'
        size='lg'
        value={document?.title ?? ''}
        onChange={setTitle}
        disabled={!document}
      />

      <Flex gridArea='buttons' alignItems='center'>
        <Select mr={2} value={document?.contentType} onChange={setContentType}>
          {contentTypeOptions.map(contentType => (
            <option
              key={contentType.value} 
              value={contentType.value}
            >
              {contentType.name}
            </option>
          ))}
        </Select>
        <Button
          onClick={saveDocument}
          disabled={!state.matches('edited')}
        >
          Save
        </Button>
      </Flex>

      <RecommendedLinks/>

      <ContentEditorComponent
        content={document?.content as string}
        onChange={setContent}
      />

    </Grid>
  )
}