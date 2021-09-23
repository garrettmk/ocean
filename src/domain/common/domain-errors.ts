

export class OceanError extends Error {
  constructor(message?: string) {
    super();
    this.name = this.constructor.name;
    this.message = message ? `${this.name}: ${message}` : this.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}


export class NotImplementedError extends OceanError {};
export class NotFoundError extends OceanError {};
export class AlreadyExistsError extends OceanError {};

export class ValidationError extends OceanError {
  public path: string[];
  public expected: string;
  public recieved: any;

  constructor(message: string, path: string[], expected: string, recieved: any) {
    super(message);
    this.path = path;
    this.expected = expected;
    this.recieved = recieved;
  }
};

