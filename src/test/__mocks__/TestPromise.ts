export type PromiseState = 'pending' | 'resolved' | 'rejected';

export class TestPromise<T = any> extends Promise<T> {
  // @ts-ignore
  private _resolve: (value: T) => void;
  // @ts-ignore
  private _reject: (reason: any) => void;

  public state: PromiseState = 'pending';
  public value?: T;
  public reason?: any;

  // @ts-ignore
  constructor() {
    let _resolve, _reject;

    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    // @ts-ignore
    this._resolve = _resolve;
    // @ts-ignore
    this._reject = _reject;
    this.state = 'pending';
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