import { ValidationError } from "@/domain";
import { AnyEventObject } from "xstate";


export function assertEventType<T extends AnyEventObject>(value: AnyEventObject, type: T['type'] | AnyEventObject['type'][]) : asserts value is T {
  if (Array.isArray(type) && !type.includes(value.type))
    throw new ValidationError('Wrong event type', ['type'], type.join('|'), value.type);
  else if (typeof type === 'string' && value.type !== type) {
    throw new ValidationError('Wrong event type', ['type'], type as string, value.type);
  }
}