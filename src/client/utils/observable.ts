export interface Subscription {
  unsubscribe(): void
}


export interface Observer<T = any> {
  start(subscription: Subscription): void
  next(value: T): void
  error(error: any): void
  complete(): void
}

export interface Observable<T = any> {
  subscribe(observer: Observer<T>): Subscription
}