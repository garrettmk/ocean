import React from 'react';
import { useDocumentEditor, useStateTransition } from '../hooks';
import { useToast } from '@chakra-ui/toast';

const toastId = 'convert-document-toast';

const convertToast = {
  id: toastId,
  title: 'Converting Document',
  description: 'Hold on a sec...',
  status: 'info',
  isClosable: false,
  duration: 0
} as const;

const successToast = {
  id: toastId,
  title: 'Success!',
  description: 'Document converted.',
  status: 'success',
  isClosable: true,
  duration: 5000,
} as const;

const errorToast = {
  id: toastId,
  title: 'Oh, Neptune.',
  description: 'There was an error converting the document.',
  status: 'error',
  isClosable: true,
  duration: 5000,
} as const;


export function useConvertDocumentAction() : [boolean, () => void] {
  const editor = useDocumentEditor();
  const toast = useToast();

  useStateTransition(editor.state, 'convertingDocument', {
    in: () => toast.isActive(toastId)
      ? toast.update(toastId, convertToast)
      : toast(convertToast),
    out: (current) => current.context.error
      ? toast.update(toastId, errorToast)
      : toast.update(toastId, successToast)
  });

  const canClone = editor.state.nextEvents.includes('convertDocument');
  const cloneDocument = React.useCallback(() => editor.send({
    type: 'convertDocument'
  }), [editor]);

  return [canClone, cloneDocument];
}