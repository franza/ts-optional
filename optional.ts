type Func1<T, R> = (x: T) => R;

export abstract class Optional<T> {
  abstract isSome(): Boolean;

  abstract isNone(): Boolean;

  abstract map<K>(fn: Func1<T, K>): Optional<K>;

  abstract flatMap<K>(fn: Func1<T, Optional<K>>): Optional<K>;

  abstract get<T>(): T;

  abstract or(smth: T): T;

  static fromUnsafe<T>(val: T): Optional<T> {
    return val != null ? Optional.Some(val) : Optional.None;
  }

  static Some(value) {
    return new Some(value);
  }

  private static none;

  static get None(): None {
    if (!Optional.none) {
      Optional.none = new None();
    }
    return Optional.none;
  }
}

class Some<T> extends Optional<T> {
  constructor (private value) {
    super()
  }

  get fucksgiven() { return 0; }

  isSome() { return true; }

  isNone() { return false; }

  map(fn) { return Optional.fromUnsafe(fn(this.value)); }

  flatMap(fn) { return fn(this.value); }

  get() { return this.value }

  toString() { return `Some(${this.value})`; }

  or(_) { return this.value; }
}

class None extends Optional<Object> {
  constructor() {
    super()
  }

  isSome() { return false; }

  isNone() { return true; }

  map(fn: Func1<Object, Object>): Optional<Object> { return Optional.None; }

  flatMap(fn: Func1<Object, Optional<Object>>): Optional<Object> { return Optional.None; }

  get() { throw new Error('Cannot get value of None'); }

  toString() { return 'None'; }

  or(another) { return another; }
}
