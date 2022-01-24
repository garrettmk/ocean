import React from 'react';
import { useDocumentEditor, useStateTransition } from '../hooks';
import { useToast } from '@chakra-ui/toast';
// import { uiConfig } from '@/react-web/config';

const toastId = 'delete-document-toast';

const deleteToast = {
  id: toastId,
  title: 'Deleting Document',
  description: 'Hold on a sec...',
  status: 'info',
  isClosable: false,
  duration: 0
} as const;

const successToast = {
  id: toastId,
  title: 'Success!',
  description: 'Document deleted.',
  status: 'success',
  isClosable: true,
  duration: 5000,
} as const;

const errorToast = {
  id: toastId,
  title: 'Oh, Neptune.',
  description: 'There was an error deleting the document.',
  status: 'error',
  isClosable: true,
  duration: 5000,
} as const;


export function useDeleteDocumentAction() : [boolean, () => void] {
  const editor = useDocumentEditor();
  const toast = useToast();

  useStateTransition(editor?.state, 'deletingDocument', {
    in: () => toast.isActive(toastId)
      ? toast.update(toastId, deleteToast)
      : toast(deleteToast),
    out: (current) => current.context.error
      ? toast.update(toastId, errorToast)
      : toast.update(toastId, successToast)
  });

  const canDelete = !!editor?.state?.nextEvents.includes('deleteDocument');
  const deleteDoc = React.useCallback(() => editor?.send({
    type: 'deleteDocument'
  }), [editor]);

  return [canDelete, deleteDoc];
}