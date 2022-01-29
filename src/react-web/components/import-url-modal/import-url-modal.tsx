import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalProps
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";


export type ImportUrlModalProps = Pick<ModalProps, 'isOpen' | 'onClose'> & {
  onImport?: (url: string) => void
}

export function ImportUrlModal({
  isOpen,
  onClose,
  onImport
}: ImportUrlModalProps) {
  const [urlText, setUrlText] = React.useState<string>('');
  const changeUrlText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUrlText(value);
  }

  const [isValidUrl, setIsValidUrl] = React.useState(false);
  React.useEffect(() => {
    try {
      const url = new URL(urlText);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
  }, [urlText]);

  const handleImport = () => {
    onImport?.(urlText);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Import Web Page</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Input
           value={urlText}
           onChange={changeUrlText}
           placeholder='https://www.example.com'
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' colorScheme='blue' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid' colorScheme='blue' disabled={!isValidUrl} onClick={handleImport}>
            Import page
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}