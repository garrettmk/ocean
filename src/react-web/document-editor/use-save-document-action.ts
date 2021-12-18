import React from 'react';
import { useDocumentEditor, useStateTransition } from '../hooks';
import { useToast } from '@chakra-ui/toast';


const toastId = 'save-document-toast';

const savingToast = {
  id: toastId,
  title: 'Saving Document',
  description: 'Hold on a sec...',
  status: 'info',
  isClosable: false,
  duration: 0
} as const;

const successToast = {
  id: toastId,
  title: 'Success!',
  description: 'Document saved.',
  status: 'success',
  isClosable: true,
  duration: 5000
} as const;

const errorToast = {
  id: toastId,
  title: 'Oh, Neptune.',
  description: 'There was an error saving the document.',
  status: 'error',
  isClosable: true,
  duration: 5000,
} as const;


export function useSaveDocumentAction() : [boolean, () => void] {
  const editor = useDocumentEditor();
  const toast = useToast();

  useStateTransition(editor.state, 'savingDocument', {
    in: () => toast.isActive(toastId)
      ? toast.update(toastId, savingToast)
      : toast(savingToast),
    out: (current) => current.context.error
      ? toast.update(toastId, errorToast)
      : toast.update(toastId, successToast)
  });

  const canSave = editor.state.nextEvents.includes('saveDocument');
  const save = React.useCallback(() => editor.saveDocument(), [editor]);

  return [canSave, save];
}