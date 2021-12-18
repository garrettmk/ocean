import React from 'react';
import { useDocumentEditor, useStateTransition } from '../hooks';
import { useToast } from '@chakra-ui/toast';

const toastId = 'clone-document-toast';

const cloneToast = {
  id: toastId,
  title: 'Cloning Document',
  description: 'Hold on a sec...',
  status: 'info',
  isClosable: false,
  duration: 0
} as const;

const successToast = {
  id: toastId,
  title: 'Success!',
  description: 'Document cloned.',
  status: 'success',
  isClosable: true,
  duration: 5000,
} as const;

const errorToast = {
  id: toastId,
  title: 'Oh, Neptune.',
  description: 'There was an error cloning the document.',
  status: 'error',
  isClosable: true,
  duration: 5000,
} as const;


export function useCloneDocumentAction() : [boolean, () => void] {
  const editor = useDocumentEditor();
  const toast = useToast();

  useStateTransition(editor.state, 'cloningDocument', {
    in: () => toast.isActive(toastId)
      ? toast.update(toastId, cloneToast)
      : toast(cloneToast),
    out: (current) => current.context.error
      ? toast.update(toastId, errorToast)
      : toast.update(toastId, successToast)
  });

  const canClone = editor.state.nextEvents.includes('cloneDocument');
  const cloneDocument = React.useCallback(() => editor.send({
    type: 'cloneDocument'
  }), [editor]);

  return [canClone, cloneDocument];
}