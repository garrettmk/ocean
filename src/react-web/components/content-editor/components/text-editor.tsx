import React from 'react';
import { Textarea, Box, Container } from '@chakra-ui/react';
import { ContentEditorProps } from '../content-editor';
import { useDocumentEditor } from '@/react-web/hooks';


const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non blandit massa enim nec dui nunc mattis enim. Adipiscing diam donec adipiscing tristique risus nec. Nulla aliquet enim tortor at auctor urna nunc id cursus. Consequat id porta nibh venenatis cras sed felis eget. Lacus laoreet non curabitur gravida. Non nisi est sit amet facilisis magna etiam tempor orci. Malesuada fames ac turpis egestas sed tempus urna et pharetra. Nibh sed pulvinar proin gravida. In ante metus dictum at tempor. Accumsan tortor posuere ac ut consequat semper viverra nam libero. Tristique sollicitudin nibh sit amet commodo. Orci dapibus ultrices in iaculis nunc sed. Blandit cursus risus at ultrices mi tempus imperdiet nulla. Est lorem ipsum dolor sit amet consectetur adipiscing elit. Congue mauris rhoncus aenean vel elit scelerisque mauris. Feugiat scelerisque varius morbi enim nunc. Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut. Tempus iaculis urna id volutpat lacus laoreet. Nullam eget felis eget nunc lobortis mattis aliquam faucibus purus.

Malesuada fames ac turpis egestas. Congue nisi vitae suscipit tellus mauris a diam maecenas sed. Id diam vel quam elementum pulvinar etiam non. Facilisi cras fermentum odio eu feugiat pretium. Fermentum posuere urna nec tincidunt praesent semper feugiat nibh. Imperdiet dui accumsan sit amet nulla facilisi morbi tempus. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. In fermentum posuere urna nec tincidunt. Tellus molestie nunc non blandit massa enim. Quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. Orci dapibus ultrices in iaculis nunc sed augue lacus. Tellus mauris a diam maecenas sed enim ut. Maecenas sed enim ut sem viverra. Quis blandit turpis cursus in hac. Accumsan lacus vel facilisis volutpat est velit. Id leo in vitae turpis massa sed elementum tempus. Eget nulla facilisi etiam dignissim diam quis enim lobortis. Augue mauris augue neque gravida in fermentum. Velit dignissim sodales ut eu.

Enim nunc faucibus a pellentesque. Molestie nunc non blandit massa enim. Pellentesque habitant morbi tristique senectus et netus et. Pharetra sit amet aliquam id diam maecenas ultricies mi eget. Sit amet consectetur adipiscing elit ut aliquam purus. At tellus at urna condimentum mattis pellentesque. Donec pretium vulputate sapien nec. Odio aenean sed adipiscing diam donec. Enim tortor at auctor urna nunc id cursus. Dictum fusce ut placerat orci nulla pellentesque. Commodo elit at imperdiet dui. Nec ultrices dui sapien eget mi proin. Ut porttitor leo a diam sollicitudin tempor id eu. Non quam lacus suspendisse faucibus interdum posuere. Nec tincidunt praesent semper feugiat nibh. Venenatis a condimentum vitae sapien pellentesque.`;

export function TextEditor({
  toolbarRef,
  toolbarSize,
  readonly,
  ...boxProps
}: ContentEditorProps) : JSX.Element {
  const editor = useDocumentEditor();
  const content = (editor.document?.content as string) ?? '';
  
  return (
    <Container
      display='grid'
      maxW='container.sm'
      {...boxProps}
    >
      <Textarea
        w='100%'
        h='100%'
        px='8'
        py='8'
        backgroundColor='white'
        focusBorderColor='transparent'
        borderColor='transparent !important'
        borderRadius='0'
        placeholder={loremIpsumText}
        value={content}
        readOnly={readonly}
        onChange={event => editor.setContent(event.target.value)}
      />
    </Container>
  );
}
