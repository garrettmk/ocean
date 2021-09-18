import { textContentType, slateContentType, SlateContent } from "../content-types";
import { ContentMigration } from "@/domain";
import { createEditor, Node } from "slate";
import { validateSlateContent, validateTextContent } from "../validators";


export class SlateToText implements ContentMigration {
  public from = slateContentType;
  public to = textContentType;

  async migrate(content: SlateContent) {
    validateSlateContent(content);

    const editor = createEditor();
    editor.children = content;
    const textContent = Node.string(editor);

    validateTextContent(textContent);
    return textContent;
  }
}