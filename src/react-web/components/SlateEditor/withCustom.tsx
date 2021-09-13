import { Editor, Text, Transforms, Element, Range } from 'slate';


export function withCustom(editor: Editor) : Editor {
  const { isInline } = editor;

  // Identify inline elements
  editor.isInline = element => {
    return ['link'].includes(element.type) ? true : isInline(element);
  }

  // Check if the current selection contains nodes with
  // a certain flag
  editor.isFormatActive = function (this, format) {
    const [match] = Editor.nodes(this, {
      // @ts-ignore
      match: node => node[format] === true,
      mode: 'all'
    });

    return !!match;
  }

  // Toggle a flag on the current selection
  editor.toggleFormat = function (this, format) {
    const isActive = this.isFormatActive(format);
    Transforms.setNodes(
      this,
      { [format]: isActive ? undefined : true },
      { match: Text.isText, split: true }
    );

    return !isActive;
  }

  // Check if the current selection is a link
  editor.isLinkActive = function (this) {
    const [link] = Editor.nodes(this, {
      match: node => !Editor.isEditor(node) && Element.isElement(node) && node.type === 'link'
    });

    return !!link;
  }

  // Wrap the current selection in a link
  editor.wrapLink = function (this, url?: string) {
    if (this.isLinkActive())
      this.unwrapLink();

    const { selection } = this;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link: Element = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url ?? 'Click to assign URL' }] : []
    };

    if (isCollapsed) {
      Transforms.insertNodes(this, link);
    } else {
      Transforms.wrapNodes(this, link, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  }

  // Unwrap the selection from a link
  editor.unwrapLink = function (this) {
    Transforms.unwrapNodes(this, {
      match: node => !Editor.isEditor(node) && Element.isElement(node) && node.type === 'link'
    });
  }



  return editor;
}
