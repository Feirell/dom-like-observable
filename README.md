# dom-like-observable

## Installation

```
npm i dom-like-observable
```

## Examples

```javascript
// SomeClassA does not contains addEventListener etc.

const makeDomLikeObservable = require('dom-like-observable');

let obj = new SomeClassA();
makeDomLikeObservable(obj, ['firstEvent', 'secondEvent']);

obj.addEventListener('firstEvent', console.log)

let newObj = makeDomLikeObservable(, ['another-event']);
//....
```

```javascript

const makeDomLikeObservable = require('dom-like-observable');

function SomeClassB() {
    makeDomLikeObservable(this, ['someEvent', 'someOtherEvent']);

    // ... 
}

SomeClassB.prototype.eventDispatchingFunction = function eventDispatchingFunction() {
    this.dispatchEvent('someEvent', {
        someAttr: 'eventAttr'
    })
}

// example usage

let obj = new SomeClassB();

obj.addEventListener('someEvent', console.log);

obj.eventDispatchingFunction();

obj.removeEventListener('someEvent', console.log);

obj.eventDispatchingFunction();
``` 
