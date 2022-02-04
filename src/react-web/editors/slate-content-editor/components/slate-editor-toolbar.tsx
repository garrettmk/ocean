import { Flex, FlexProps, ButtonGroup, ButtonGroupProps, IconButton, IconButtonProps, Spacer, Divider } from "@chakra-ui/react";
import { BsTypeBold, BsTypeItalic, BsTypeUnderline, BsTypeStrikethrough, BsLink} from 'react-icons/bs';
import { useSlate } from 'slate-react';


export type SlateEditorToolbarProps = FlexProps & Pick<ButtonGroupProps, 'size'>;

export function SlateEditorToolbar({ size, ...flexProps}: SlateEditorToolbarProps = {}) : JSX.Element {
  return (
    <Flex {...flexProps}>
      <ButtonGroup
        size={size}
        isAttached
      >
        <FormatButton format={'bold'} aria-label='Bold' icon={<BsTypeBold/>}/>
        <FormatButton format={'italic'} aria-label='Italic' icon={<BsTypeItalic/>}/>
        <FormatButton format={'underline'} aria-label='Underline' icon={<BsTypeUnderline/>}/>
        <FormatButton format={'strikethrough'} aria-label='Strikethrough' icon={<BsTypeStrikethrough/>}/>
        <LinkButton aria-label='Link'/>
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


function LinkButton(props: Partial<IconButtonProps>) : JSX.Element {
  const editor = useSlate();
  const isActive = editor.isLinkActive();
  const toggleLink = () => isActive ? editor.unwrapLink() : editor.wrapLink();
  const label = isActive ? 'Unlink' : 'Link';

  return (
    <IconButton
      isActive={isActive}
      icon={<BsLink/>}
      onClick={toggleLink}
      aria-label={label}
      {...props}
    />
  )
}