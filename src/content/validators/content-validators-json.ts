import { JSONContent } from "../content-types";
import { validateJSONSerializable } from "@/domain";


export function validateJSONContent(value: any) : asserts value is JSONContent {
  validateJSONSerializable(value);
}