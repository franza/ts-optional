import { Optional } from './option';

let doc: Optional<String> = Optional.fromUnsafe('hello');

function appendWorld(str: String) {
  return str + ", world!"
}

// this won't compile
// console.log(appendWorld(doc));

// this will compile
console.log(doc);
console.log(doc.get());

// this will also compile but can crash during runtime
let crash: Optional<number> = Optional.fromUnsafe(null);
console.log(crash);
// console.log(crash.get());

// more proper way to work with Optionals
let helloworld = doc.map(appendWorld);
let wontcrash = crash.map(x => x + 1);

console.log(helloworld, wontcrash);

// if we want to do some operation that returns Optional, we use flatMap

function findIndex(str: string, substr: string): Optional<number> {
  let index = str.indexOf(substr);
  return index !== -1 ? Optional.Some(index) : Optional.None;
}

let index = helloworld.flatMap(str => findIndex(str, 'world'));
console.log(index);

// or chain it with or to get the default value
let wasFound = helloworld.flatMap(str => findIndex(str, 'XXX')).or(-1);
console.log('the index is', wasFound);
