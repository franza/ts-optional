```typescript
import { Optional } from './option';

let doc: Optional<String> = Optional.fromUnsafe('hello');

function appendWorld(str: String) {
  return str + ", world!"
}
```

This won't compile

```typescript
console.log(appendWorld(doc));
```

This will compile

```typescript
console.log(doc);
console.log(doc.get());
```

This will also compile but can crash during runtime
```typescript
let crash: Optional<number> = Optional.fromUnsafe(null);
console.log(crash.get());
```

More proper way to work with Optionals
```typescript
let helloworld = doc.map(appendWorld);
let wontcrash = crash.map(x => x + 1);

console.log(helloworld, wontcrash);
```

If we want to do some operation that returns Optional, we use flatMap

```typescript
function findIndex(str: string, substr: string): Optional<number> {
  let index = str.indexOf(substr);
  return index !== -1 ? Optional.Some(index) : Optional.None;
}

let index = helloworld.flatMap(str => findIndex(str, 'world'));
console.log(index);
```

Or chain it with or to get the default value
```typescript
let wasFound = helloworld.flatMap(str => findIndex(str, 'XXX')).or(-1);
console.log('the index is', wasFound);
```
