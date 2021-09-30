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
import { useServices } from "@/react-web/services";
import { makeBrowseDocumentsMachine } from "@/client/viewmodels";
import { useMachine } from "@xstate/react";
import { Select } from "@chakra-ui/select";


export type ChooseDocumentModalProps = Pick<ModalProps, 'isOpen' | 'onClose'> & {
  onChoose?: (id: ID) => void
}

export function ChooseDocumentModal({
  isOpen,
  onClose,
  onChoose
}: ChooseDocumentModalProps) {
  const services = useServices();
  const machine = React.useMemo(() => makeBrowseDocumentsMachine(services.documents), []);
  const [state, send] = useMachine(machine);
  const docs = state.context.documents ?? [];
  
  const [queryText, setQueryText] = React.useState<string>('');
  const handleQueryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setQueryText(value);
  }

  const [selectedId, setSelectedId] = React.useState<ID>();
  const handleSelectDocument = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(event.target.value);
  }
  
  React.useEffect(() => {
    if (!isOpen) return;
    
    send({ type: 'query', payload: queryText ? { title: [queryText] } : undefined });
  }, [isOpen, queryText]);

  const handleChoose = () => {
    onChoose?.(selectedId!);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Select Document ID</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Select placeholder="Select document..." onChange={handleSelectDocument}>
            {docs.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.title}</option> 
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' colorScheme='blue' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid' colorScheme='blue' disabled={!selectedId} onClick={handleChoose}>
            Select
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}