import React from 'react';
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
} from "@chakra-ui/react";


export function DocumentDeleteModal() {
  const bodyRef = React.useRef(document.body);
  const editor = useDocumentEditor();
  const isOpen = !!editor?.state.matches('deletingDocument');
  const confirm = () => editor?.send({ type: 'confirmDeleteDocument' });
  const cancel = () => editor?.send({ type: 'cancel' });
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={cancel}
      portalProps={{ containerRef: bodyRef }}
    >
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Delete document?</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Text>Do you really want to delete this document?</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' mr='3' onClick={cancel}>
            Cancel
          </Button>
          <Button colorScheme='red' onClick={confirm}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}