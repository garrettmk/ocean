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
} from "@chakra-ui/modal";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { ID } from "@/domain";


export type ChooseDocumentModalProps = Pick<ModalProps, 'isOpen' | 'onClose'> & {
  onChoose?: (id: ID) => void
}

export function ChooseDocumentModal({
  isOpen,
  onClose,
  onChoose
}: ChooseDocumentModalProps) {
  const [idText, setIdText] = React.useState<string>('');
  const changeIdText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setIdText(value);
  }

  const [isValidId, setIsValidId] = React.useState(false);
  React.useEffect(() => {
     setIsValidId(idText.length > 0);
  }, [idText]);

  const handleChoose = () => {
    onChoose?.(idText);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Select Document ID</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Input
           value={idText}
           onChange={changeIdText}
           placeholder='12345'
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' colorScheme='blue' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid' colorScheme='blue' disabled={!isValidId} onClick={handleChoose}>
            Select
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}