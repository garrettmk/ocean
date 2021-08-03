

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
export class ValidationError extends OceanError {};
