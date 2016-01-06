### Theory

`Optional` is a type which is used to inform that the value may not present. In Java, C#, JavaScript and other languages it is usually handled by special `null` value, but in languages like Rust, Scala and Haskell it is handled by a special type.

First, you may think that it is cumbersome to handle the wrapper, but more often you use `Optional` - more often you will feel that you WANT to know if the value is possibly absent during development. Using `Optional` you will:

1. Have knowledge that value may be is absent in compile time.
2. Not forget to check if value is absent.

In TypeScript there are also `null`-values like `null` or `undefined`, but you can start using `Optional` as a convention in places where `null`/`undefined` are expected.

What about outer world? There are libraries which use same old `null`-values, so isn't `Optional` is another `null` value? It isn't, there is a way to convert `null` values which are coming from outer world.

### Example - absent value

Imagine, we have a library that parses XML to specific type and returns null in case of error. If we use plain `null`s we'll probably end up failing with ReferenceError like this:

```typescript
let user: User = parseXml<User>('<user name="George">');
console.log(user.name); // <-- here we have ReferenceError because XML is invalid and returned `obj` is null
```
Now let's do the same, but wrap result into `Optional`. `parseXml` is a library function, it knows nothing about `Optional`, and returns `null`. We can fix that using `fromUnsafe` method:

```typescript  
import Optional from 'optional';
let user: Optional<User> = Optional.fromUnsafe(parseXml<User>('<user name="George">'));
```

Here `user` variable has type `Optional<User>` which says that we may not have user here. Working with it as with real `User` object will not work and that's good, because we are not sure if there is a user actually. Let's check that:

```typescript
if (user.isNone()) {
  console.log(`Failed to get user`);
}
```

### Example - valid value

But what if our value is fine and we need to work with it as usual? See next example:

```typescript
if (user.isSome()) {
  let actualUser = user.unwrap();
  console.log(`User's name is ${actualUser.name}`)
}
```

`unwrap` method returns the value if there is some or throws exception in opposite case.

### Example - creating values

`Optional.fromUnsafe` is not the only function which creates optional values. `Optional.None` is a singleton value which means the absent value, and `Optional.Some` is a function to create actual value. Both have type `Optional<T>` so can be used in same context:

```typescript
function findIndex(str: string, substr: string): Optional<number> {
  let index = str.indexOf(substr);
  return index !== -1 ? Optional.Some(index) : Optional.None;
}

let index = findIndex('banana', 'ba');
if (index.isSome()) {
  console.log(`found string at position # ${index.unwrap()}`)
}
```

### Example - using map

Usually, `isSome`, `isNone` and `unwrap` methods are enough, but what if we don't like to call "unsafe" `unwrap` method in case if we forgot to check it? Let's convert the output above to human readable format so it will print 1 instead of 0, 2 instead of 1 and so on, using `map` method:

```typescript
function inc(index: number): number {
  return number + 1;
}

let index = findIndex('banana', 'ba');
index = index.map(i => inc(i));

if (index.isSome()) {
  console.log(`found string at position # ${index.unwrap()}`);
}
```

The code above will return "found string at position # 1". `map` method applies the function passed in first argument to the inner value and returns a result of function wrapped in `Optional`. So in `index` we have `Optional.Some(0)` value. `map` applies `inc` to the inner value and adds `1` to `0`. This will return `Optional.Some(1)`.

What if we have no value? What if we have `Optional.None`? Well, that will always return same `Optional.None`, it won't even try to apply the function:

```typescript
let index = findIndex('banana', 't');
index = index.map(i => inc(i));

if (index.isNone()) {
  console.log(`Nothing is found`);
}
```

### Example - using andThen/flatMap

Returning `Optional` from `map` may look cumbersome. We can fix that using `andThen` or its alias `flatMap`. Let's try to lookup substrings in user's name in three different ways:

```typescript
let xml = '<user name="George">'; // <- invalid XML again, parsing it returns `null`

function doItWithNulls(substr: string): number {
  let user: User = parseXml<User>(xml);
  if (user === null) {
    return null;
  }
  let index: number = user.name.indexOf(substr);
  if (index === -1) {
    return null;
  }
}

function doItWithOptionalSimpleWay(substr: string): Optional<number> {
  let user = Optional.fromUnsafe(parseXml<User>(xml));
  if (user.isNone()) {
    return Optional.None();
  }
  return findIndex(user.unwrap().name, substr);
}

function doItWithAndThen(substr: string): Optional<number> {
  let user = Optional.fromUnsafe(parseXml<User>(xml));
  return user.andThen(u => findIndex(u.name, substr));
}
```

Third example can be squashed into oneliner, but readability is more important now.

The code in first example is straightforward, no comments on that.
In second example we used `findIndex` defined above. We still have to check once but looks shorter. We may also try to use `map`:

```typescript
let user = Optional.fromUnsafe(parseXml<User>(xml));
let index = user.unwrap().map(u => findIndex(u.name, substr));
```
but the type of `index` here is `Optional<Optional<number>>`. That's because `map` wraps its result into `Optional`. So we will need check if `index.isNone()` and if it's not then again `index.unwrap().isNone()` which is quite ugly.

In third example checking and unwrapping is done by `andThen` method. It is called on optional value *and then* applies a function that returns yet another optional over wrapped value. In fact it does:

1. User is `Optional.None`? If he is, then return `Optional.None` right away.
2. If user is `Optional.Some` then get the actual user, and run a function that is passed as argument. It returns an `Optional<number>` which is returned as result of function.

### Example - other useful methods

`#unwrap_or` - like unwrap, but instead of throwing an exception, it will return its argument. Useful thing if need to get a default value. Here's how we can move back to result similar to `indexOf`:

```typescript
let index: number = findIndex('banana', 'G').unwrap_or(-1); // <- returns -1
```

`#and` - returns caller if caller is `Optional.None`, otherwise returns argument:

```typescript
let x = Optional.Some(2);
let y = Optional.Some(3);
let z = Optional.None();

assert(x.and(y).unwrap === 3);
assert(x.and(z).isNone());
assert(z.and(x).isNone());
```

`::all` - receives array of `Optional`s and converts it to `Optional` of array of values. If at least one item in argument array is `Optional.None` - whole result is `Optional.None`. Useful if you have logic that should fail if at least one argument is unavailable:

```typescript
let a: Optional<number> = getA();
let b: Optional<number> = getB();
let c: Optional<number> = getC();

let abc = Optional.all([a, b, c]);
if (abc.isSome()) {
  let [a, b, c] = abc;
  console.log(`Sum is ${a + b + c}`);
} else {
  console.log(`Failed to calculate the su`')
}
```
