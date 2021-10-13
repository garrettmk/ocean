import { ContentMigrationPath } from "@/domain";
import { useDocumentEditor } from "@/react-web/hooks";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Select,
  FormControl,
  FormLabel,
  Input
} from "@chakra-ui/react";
import React from 'react';



export function DocumentConvertModal() {
  const editor = useDocumentEditor();
  const isOpen = editor.state.matches('convertingDocument');
  const paths: ContentMigrationPath[] = editor.state.context.migrationPaths ?? [];

  const [selectValue, setSelectValue] = React.useState(paths[0]?.to.value);

  React.useEffect(() => {
    setSelectValue(paths[0]?.to.value)
  }, [paths]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(event.target.value);
  };

  const handleConvert = () => {
    editor.confirmConvertDocument(selectValue);
  };

  return (
    <Modal isOpen={isOpen} onClose={editor.cancel}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Convert Document</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <FormControl id='from' isReadOnly mb='4'>
            <FormLabel>From type:</FormLabel>
            <Input value={getButtonLabel(editor.document?.contentType)}/>
          </FormControl>
          <FormControl id='to'>
            <FormLabel>To type:</FormLabel>
            <Select value={selectValue} onChange={handleSelectChange}>
              {paths.map(path => (
                <option key={path.to.value} value={path.to.value}>
                  {getButtonLabel(path.to.value)}
                </option>
              ))}
            </Select>
          </FormControl>            
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' mr='3' onClick={editor.cancel}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleConvert}>
            Convert
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
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