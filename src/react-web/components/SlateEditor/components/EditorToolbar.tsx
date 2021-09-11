import { Flex, ButtonGroup, IconButton, IconButtonProps } from "@chakra-ui/react";
import { BsTypeBold, BsTypeItalic, BsTypeUnderline } from 'react-icons/bs';
import { useSlate } from 'slate-react';


export function EditorToolbar() : JSX.Element {
  return (
    <Flex>
      <ButtonGroup isAttached>
        <FormatButton format={'bold'} aria-label='Bold' icon={<BsTypeBold/>}/>
        <FormatButton format={'italic'} aria-label='Italic' icon={<BsTypeItalic/>}/>
        <FormatButton format={'underline'} aria-label='Underline' icon={<BsTypeUnderline/>}/>
      </ButtonGroup>
    </Flex>
  );
}


function FormatButton({
  format,
  ...props
}: IconButtonProps & {
  format: string
}) : JSX.Element {
  const editor = useSlate();
  // @ts-ignore
  const isActive = editor.isFormatActive(format);
  const setFormat = () => {
    // @ts-ignore
    editor.toggleFormat(format)
  };

  return <IconButton isActive={isActive} onClick={setFormat} {...props}/>;
}