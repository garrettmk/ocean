import { Sink } from "callbag";
import map from 'callbag-map';
import of from 'callbag-of';
import pipe from 'callbag-pipe';
import { Source } from "./callbag";
import { NextFn, Observable, Observer } from './observable';
export type { Callbag, Sink, Source } from "callbag";
export { pipe, map, of };


export enum CallType {
  Start = 0,
  Data = 1,
  End = 2
}

// Subscribe a function to a source, and return an unsubscribe function
export function subscribe<T>(listener: Observer<T> | NextFn<T>) {
  return function (source: Source<T>) {
    if (typeof listener === 'function')
      listener = { next: listener } as Observer<T>;

    let { next, error, complete } = listener;
    let talkback: Sink<never>;

    source(CallType.Start, (...[t, d]) => {
      if (t === CallType.Start && typeof d === 'function') {
        talkback = d as Sink<never>;
        talkback(CallType.Data);  // Ask for data after the handshake
      }
      else if (t === CallType.Start)
        throw new Error(`Invalid arguments: expected a function, received: ${d}`);
      else if (t === CallType.Data)
        next?.(d as T);
      else if (t === CallType.End && !d) 
        complete?.();
      else if (t === CallType.End && !!d) 
        error?.(d);
    });

    const dispose = () => talkback?.(CallType.End);

    return dispose;
  }
}

// Leverage subscribe() above to return a basic observable
export function toObservable<T>(source: Source<T>) : Observable<T> {
  return {
    subscribe(...[next, error, complete]) {
      const observer: Observer<T> = typeof next === 'function' 
        ? { next, error, complete } as Observer<T>
        : next;

      const unsubscribe = subscribe(observer)(source);
      return { unsubscribe };
    }
  }
}


// export function catchError<E = any>(onError: (error: E) => void) {
//   return function (source: Source<any>) {
//     return function (...[start, sink]: CallbagArgs<any, any>) {
//       if (start !== CallType.Start) return;

//       source(CallType.Start, (...[t, d]) => {
//         if (t === CallType.End)
//       })
//     }
//   }
// }