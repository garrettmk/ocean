import { useDocumentEditor } from '@/react-web/hooks';
import { Select, SelectProps } from '@chakra-ui/react';
import React from 'react';
import { parseContentType } from '@/content/utils';
import { ContentType } from '@/domain';
import { useServices } from '@/react-web/services';


export type DocumentContentTypeSelectProps = SelectProps & {  };


export function DocumentContentTypeSelect(props: DocumentContentTypeSelectProps) : JSX.Element {
  const services = useServices();
  const editor = useDocumentEditor();
  const document = editor.document;

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

      editor.send({ type: 'edit', payload: {
        contentType: to.value,
        content: newContent
      }});
    })();
  }, [document?.contentType, document?.content]);


  return (
    <Select
      value={editor.document?.contentType}
      onChange={setContentType}
    >
      {contentTypeOptions.map(contentType => (
        <option
          key={contentType.value} 
          value={contentType.value}
        >
          {contentType.name}
        </option>
      ))}
    </Select>
  );
}