import { ValidationError } from "@/domain";
import { AnyEventObject } from "xstate";


export function assertEventType<T extends AnyEventObject>(value: AnyEventObject, type: T['type']) : asserts value is T {
  if (value.type !== type)
    throw new ValidationError('Wrong event type', ['type'], type, value.type);
}