export interface Subscription {
  unsubscribe(): void
}

export type NextFn<T> = (value: T) => void;
export type ErrorFn<E> = (error: E) => void;
export type CompleteFn = () => void;
export interface Observer<T = any, E = any> {
  next: NextFn<T>
  error?: ErrorFn<E>
  complete: CompleteFn
}

export interface Observable<T = any, E = any> {
  subscribe(observer: Observer<T, E>): Subscription
  subscribe(next: NextFn<T>, error?: ErrorFn<E>, complete?: CompleteFn): Subscription
}


