type Func1<T, R> = (x: T) => R;

abstract class Optional<T> {
  abstract isSome(): boolean;

  isNone(): boolean {
    return !this.isSome();
  }

  abstract map<K>(fn: Func1<T, K>): Optional<K>;

  abstract flatMap<K>(fn: Func1<T, Optional<K>>): Optional<K>;

  abstract and(another: T): Optional<T>;

  // Don't override
  andThen<K>(fn: Func1<T, Optional<K>>): Optional<K> {
    return this.flatMap(fn);
  }

  abstract unwrap<T>(): T;

  abstract unwrap_or(smth: T): T;

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

  static all<T>(arr: Array<Optional<T>>): Optional<T> {
    return arr.reduce((memo, item) => {
      if (memo.isSome() && item.isSome()) {
        memo.unwrap().push(item.unwrap());
      }
      return memo;
    }, Optional.Some([]));
  }
}

export default Optional;

class Some<T> extends Optional<T> {
  constructor (private value) {
    super()
  }

  isSome() { return true; }

  map(fn) { return Optional.fromUnsafe(fn(this.value)); }

  flatMap(fn) { return fn(this.value); }

  and(another) {
    return another;
  }

  unwrap() { return this.value }

  unwrap_or(_) { return this.value; }

}

class None extends Optional<Object> {
  constructor() {
    super()
  }

  isSome() { return false; }

  map(fn: Func1<Object, Object>): Optional<Object> { return Optional.None; }

  flatMap(fn: Func1<Object, Optional<Object>>): Optional<Object> { return Optional.None; }

  and(another) {
    return this;
  }

  unwrap() { throw new Error('Cannot get value of None'); }

  unwrap_or(another) { return another; }
}
