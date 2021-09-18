import { ContentMigration } from "@/domain";
import { textContentType, slateContentType, SlateContent } from "../content-types";
import { validateSlateContent, validateTextContent } from "../validators";


export class TextToSlate implements ContentMigration {
  public from = textContentType;
  public to = slateContentType;


  async migrate(content: any) {
    validateTextContent(content);

    const slateContent: SlateContent = [
      {
        type: 'paragraph',
        children: [
          { text: content }
        ]
      }
    ];

    validateSlateContent(slateContent);
    return slateContent;
  }
}