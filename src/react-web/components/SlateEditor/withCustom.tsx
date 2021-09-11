import { Editor, Text, Transforms } from 'slate';


export function withCustom(editor: Editor) : Editor {
  const { isInline } = editor;

  editor.isInline = element => {
    return ['link'].includes(element.type) ? true : isInline(element);
  }

  editor.isFormatActive = function (this, format) {
    const [match] = Editor.nodes(this, {
      // @ts-ignore
      match: node => node[format] === true,
      mode: 'all'
    });

    return !!match;
  }

  editor.toggleFormat = function (this, format) {
    const isActive = this.isFormatActive(format);
    Transforms.setNodes(
      this,
      { [format]: isActive ? undefined : true },
      { match: Text.isText, split: true }
    );

    return !isActive;
  }

  return editor;
}
