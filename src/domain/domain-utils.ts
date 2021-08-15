import { Struct, assert, StructError } from "superstruct";
import { ValidationError } from "./domain-errors";


// Validates a value using a superstruct schema, and transforms
// StructErrors into ValidationErrors
export function validate(value: any, schema: Struct<any, any>) {
  try {
    assert(value, schema);
  } catch (e) {
    if (e instanceof StructError) {
      // Trim the StructError name from the beginning of the message
      const match = e.message.match(/StructError: (.*)/);
      const message = match ? match[1] : e.message;

      // Re-throw as a ValidationError
      throw new ValidationError(
        message,
        e.path,
        e.type,
        e.value
      );

    } else {
      throw e;
    }
  }
}