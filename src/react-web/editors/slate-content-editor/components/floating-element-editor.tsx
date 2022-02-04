import React from 'react';
import { Portal, Box } from "@chakra-ui/react";
import { Element, Editor, Node } from 'slate';
import { useSlate, ReactEditor} from 'slate-react';
import { usePopper } from 'react-popper';


export type FloatingElementEditorProps = {
  editor: Editor,
  element: Element
}

const NullEditor = (props: FloatingElementEditorProps) => null;

export function FloatingElementEditor({
  elementEditors
}: {
  elementEditors: Record<string, React.ComponentType<FloatingElementEditorProps>>
}) {
  const editor = useSlate();
  const { selection } = editor;

  const [referenceEl, setReferenceEl] = React.useState<HTMLElement | null>(null);
  const [popperEl, setPopperEl] = React.useState<HTMLElement | null>(null);
  const [arrowEl, setArrowEl] = React.useState<HTMLElement | null>(null);
  const { styles, attributes, state } = usePopper(referenceEl, popperEl, {
    modifiers: [
      { name: 'arrow', options: { element: arrowEl } },
      { name: 'hide' }
    ]
  });

  // Track the currently selected element...
  const [slateElement, setSlateEl] = React.useState<Node | null>(null);

  // ...if it has a matching editor
  const isEditableElement = (node: Node) => 
    !Editor.isEditor(node) && 
    Element.isElement(node) && 
    Object.keys(elementEditors).includes(node.type);

  // Check whenever the selection changes
  React.useEffect(() => {
    const [...matches] = Editor.nodes(editor, {
      match: isEditableElement,
      at: selection 
        ? selection 
        : slateElement ? ReactEditor.findPath(editor, slateElement) : undefined
    });
    const matchedEl = matches.length === 1 ? matches[0][0] : null;
    setSlateEl(matchedEl);

    if (ReactEditor.isFocused(editor)) {
      const domElement = matchedEl ? ReactEditor.toDOMNode(editor, matchedEl) : null;
      setReferenceEl(domElement as HTMLElement);
    }
  });


  // If we are tracking an element, show the appropriate editor
  const ElementEditor = slateElement && 'type' in slateElement 
    ? elementEditors[slateElement.type] 
    : NullEditor;

  return (
    <Portal>
      <Box
        ref={setPopperEl}
        p={8}
        bgColor='Menu'
        boxShadow='lg'
        style={styles.popper}
        {...attributes.popper}
        visibility={referenceEl ? undefined : 'hidden'}
      >
        {slateElement && (
          <ElementEditor editor={editor} element={slateElement as Element}/>
        )}
        <Box ref={setArrowEl} style={styles.arrow}/>
      </Box>
    </Portal>
  );
}