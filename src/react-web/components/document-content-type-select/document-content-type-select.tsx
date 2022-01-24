import { useDocumentEditor } from '@/react-web/hooks';
import { Select, SelectProps, Button, ButtonProps, Menu, MenuItem, MenuList, MenuButton } from '@chakra-ui/react';
import React from 'react';
import { parseContentType } from '@/content/utils';
import { ContentType } from '@/domain';
import { useServices } from '@/react-web/services';
import { ChevronDownIcon } from '@chakra-ui/icons';


export type DocumentContentTypeSelectProps = {  };


export function DocumentContentTypeSelect(props: DocumentContentTypeSelectProps) : JSX.Element {
  const services = useServices();
  const editor = useDocumentEditor();
  const document = editor?.state.context.document;

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
  const setContentType = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    (async () => {
      const targetContentType = (event.target as HTMLButtonElement)?.value as string;

      const from = parseContentType(document!.contentType);
      const to = parseContentType(targetContentType);

      const avalableMigrations = await services.migrations.getMigrationPaths(from, to);
      const migration = avalableMigrations[0];

      const newContent = await services.migrations.migrate(document?.content, migration);

      editor?.send({ type: 'editDocument', payload: {
        contentType: to.value,
        content: newContent
      }});
    })();
  }, [document?.contentType, document?.content]);

  return (
    <Menu>
      <MenuButton 
        as={Button}
        rightIcon={<ChevronDownIcon/>} 
        disabled={!document?.contentType}
        fontSize='xs'
        color='gray.500'
      >
        {getButtonLabel(document?.contentType)}
      </MenuButton>
      <MenuList
        onClick={setContentType}
        shadow='2xl'
        borderWidth='thin'
        borderColor='gray.300'
        color='black'
      >
        {contentTypeOptions.map(contentType => (
          <MenuItem
            key={contentType.value}
            value={contentType.value}
          >
            {contentType.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}


function getButtonLabel(contentTypeValue?: string) : string {
  const label = {
    'text/plain': 'Text',
    'text/html': 'HTML',
    'application/json': 'JSON',
    'application/json;format=slate001': 'Slate v1',
  }[contentTypeValue ?? ''];

  return label ?? contentTypeValue ?? 'Unknown';
}