import { Struct, assert, StructError } from "superstruct";
import { ValidationError } from "./domain-errors";


// Transforms StructErrors into ValidationErrors
export function validate(value: any, schema: Struct<any, any>) {
  try {
    assert(value, schema);
  } catch (e) {
    if (e instanceof StructError) {
      const match = e.message.match(/StructError: (.*)/);
      const message = match ? match[1] : e.message;
      throw new ValidationError(message);
    } else {
      throw e;
    }
  }
}