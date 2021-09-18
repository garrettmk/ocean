import { JSONSerializable } from "@/domain";
import { parseContentType } from "../utils/content-type-utils";

export const jsonContentType = Object.freeze({
  ...parseContentType('application/json'),
  name: 'JSON'
});


export type JSONContent = JSONSerializable;