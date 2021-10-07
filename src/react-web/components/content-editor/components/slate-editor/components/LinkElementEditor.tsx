import { Grid, Text, Input } from "@chakra-ui/react";
import React from "react";
import { Node, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { ElementEditorProps } from ".";


export function LinkElementEditor({
  editor,
  element
}: ElementEditorProps) : JSX.Element {
  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    Transforms.insertText(editor, event.target.value, {
      at: ReactEditor.findPath(editor, element)
    });
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    Transforms.setNodes(editor, { url: event.target.value }, {
      at: ReactEditor.findPath(editor, element)
    })
  }

  return (
    <Grid
      templateRows='auto'
      templateColumns='auto 1fr'
      gap={4}
      alignItems='center'
    >
      <Text>Label:</Text>
      <Input
        type='text'
        value={Node.string(element)}
        onChange={handleLabelChange}
      />

      <Text>URL:</Text>
      <Input
        type='url'
        placeholder='http://www.ocean.com'
        value={(element as any).url}
        onChange={handleUrlChange}
      />
    </Grid>
  );
}