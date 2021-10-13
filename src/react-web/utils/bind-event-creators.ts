import { AnyEventObject } from "xstate";


export type EventCreator<T extends AnyEventObject = AnyEventObject, TArgs extends any[] = any[]> = (...p: TArgs) => T;
export type EventDispatch<TEvent extends AnyEventObject> = (event: TEvent) => unknown;
export type EventSender<TArgs extends any[]> = (...p: TArgs) => void;
export type EventCreatorMap<TEvent extends AnyEventObject> = Record<string, EventCreator<TEvent>>;
export type EventSenderMap<TEvent extends AnyEventObject, TCreatorMap extends EventCreatorMap<TEvent> = EventCreatorMap<TEvent>> = 
  { [k in keyof TCreatorMap]: (...p: Parameters<TCreatorMap[k]>) => void };

export function bindEventCreators<
  TEvent extends AnyEventObject,
  TCreatorMap extends EventCreatorMap<TEvent> = EventCreatorMap<TEvent>,
  TSenderMap extends EventSenderMap<TEvent, TCreatorMap> = EventSenderMap<TEvent, TCreatorMap>
>(
  dispatch: EventDispatch<TEvent>, 
  eventCreators: TCreatorMap,
) : TSenderMap {
  return Object.fromEntries(
    Object
      .entries(eventCreators)
      .map(([key, creator]) => [
        key,
        (...p: any[]) => dispatch(creator(...p))
      ])
  ) as unknown as TSenderMap;
}


type FooEvent = { type: 'foo' };
type BarEvent = { type: 'bar' };
type FooBarEvent = FooEvent | BarEvent;

const dispatch = (event: FooBarEvent) => {};

const senderMap = bindEventCreators(dispatch, {
  foo: (a: string) => ({ type: 'foo' })
});
