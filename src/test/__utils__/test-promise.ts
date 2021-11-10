export type PromiseState = 'pending' | 'resolved' | 'rejected';
export type ResolveFn<T> = (value: T) => void;
export type RejectFn = (reason: any) => void;
export type ExecutorFn<T> = (resolve: ResolveFn<T>, reject: RejectFn) => void;

export class TestPromise<T = any> extends Promise<T> {
  private _resolve: ResolveFn<T>;
  private _reject: RejectFn;

  public state: PromiseState = 'pending';
  public value?: T;
  public reason?: any;

  // @ts-ignore
  constructor(executor?: ExecutorFn<T>) {
    // Store these in temporary variables, since we can't access
    // this until after the call to super()
    let _resolve: ResolveFn<T>;
    let _reject: RejectFn;

    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    // By definition the executor above is called immediately (synchronously)
    // So it's safe to ignore the warning below

    // @ts-ignore - variable being used before being assigned
    this._resolve = _resolve;
    // @ts-ignore
    this._reject = _reject;

    this.state = 'pending';

    // Bind resolve() and reject() to this instance, since we
    // are potentially passing them to the executor function
    // below
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);

    if (executor)
      executor(this.resolve, this.reject);
  }

  resolve(value: T) {
    this.state = 'resolved';
    this.value = value;
    this._resolve(value);
  }

  reject(reason: any) {
    this.state = 'rejected';
    this.reason = reason;
    this._reject(reason);
  }
}