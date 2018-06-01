const getTypeOf = e => Object.prototype.toString.apply(e).slice(8, -1);

/**
 * `DomLikeObservable` is not a real class, rather an interface which is applied with [makeDomLikeObservable()]{@link makeDomLikeObservable} on an already existing Object.
 * 
 * Please see the documentation of {@link makeDomLikeObservable} for more infomration of the usage.
 * 
 * @class DomLikeObservable
 */

/**
 * @method DomLikeObservable#addEventListener
 * @param {string} name the event which should be the trigger
 * @param {Function} func the callback function
 */
function addEventListener(definedEventNames, registeredEventHandler, name, func) {
    if (getTypeOf(name) != "String" || getTypeOf(func) != "Function")
        return false;

    if (!definedEventNames.contains(name))
        throw new Error('the eventname "' + name + '" is not on of the defined eventnames: ' + definedEventNames.toString());

    if (!(name in registeredEventHandler))
        registeredEventHandler[name] = [];
    else
        for (let i = 0; i < registeredEventHandler[name].length; i++)
            if (registeredEventHandler[name][i] == func)
                return false;

    registeredEventHandler[name][registeredEventHandler[name].length] = func;
    return true;
}

/**
 * @method DomLikeObservable#removeEventListener
 * @param {string} name the event on which this function was registert
 * @param {Function} func the callback function which should be removed
 */
function removeEventListener(definedEventNames, registeredEventHandler, name, func) {
    if (getTypeOf(name) != "String" || getTypeOf(func) != "Function")
        return false;

    if (!definedEventNames.contains(name))
        throw new Error('the eventname "' + name + '" is not on of the defined eventnames: ' + definedEventNames.toString());

    if (!(name in registeredEventHandler))
        return false;

    const pos = registeredEventHandler[name].indexOf(func);
    if (pos == -1)
        return false;

    registeredEventHandler[name].splice(pos, 1);

    return true;
}

/**
 * @method DomLikeObservable#dispatchEvent
 * @param {string} name the event which should be triggered
 * @param {Object?} obj the event object which should be called on all registert listener,
 * if non is set then this function creates an new object, this function adds a name and
 * `timestamp` and `eventName` attribute if not present. The `timestamp` is set with `Date.now()`
 * if not present before and `eventName` is set with the given event name.
 * @returns {boolean} wether the event was dispatched or not
 */
function dispatchEvent(definedEventNames, registeredEventHandler, name, obj) {
    const ts = Date.now();

    if (obj === null || obj === undefined)
        obj = {};

    if (getTypeOf(name) != "String" || !(obj instanceof Object))
        return false;

    if (!definedEventNames.contains(name))
        throw new Error('the eventname "' + name + '" is not on of the defined eventnames: ' + definedEventNames.toString());

    if (!(name in registeredEventHandler))
        return false;

    if (!('timestamp' in obj))
        obj.timestamp = ts;

    obj.eventName = name;

    for (let i = 0; i < registeredEventHandler[name].length; i++)
        registeredEventHandler[name][i](obj);

    return true;
}

/**
 * This function transforms an Object into an {@link DomLikeObservable}.
 * 
 * ```javascript
 * // SomeClass does not contains addEventListener etc.
 * let obj = new SomeClassA();
 * makeDomLikeObservable(obj,['firstEvent','secondEvent']);
 * 
 * obj.addEventListener('firstEvent', () => console.log)
 * 
 * let newObj = makeDomLikeObservable(,['another-event']);
 * //....
 * ```
 * 
 * ```javascript
 * // usage: you are defining some class and want this class to be able to dispatch events and provide functionality so other functions can be registert as eventlistener on this class
 * 
 * function SomeClassB(){
 *  makeDomLikeObservable(this, ['someEvent', 'someOtherEvent']);
 * 
 *  // ... other initlizing code
 * 
 * }
 * 
 * SomeClassB.prototype.eventDispatchingFunction = function eventDispatchingFunction(){
 *  this.dispatchEvent('someEvent', {
 *   someAttr: 'eventAttr'
 *  })
 * }
 * 
 * // example usage
 * 
 * let obj = new SomeClassB();
 * 
 * obj.addEventListener('someEvent',event => console.log);
 * 
 * obj.eventDispatchingFunction();
 * ``` 
 * 
 * @function makeDomLikeObservable
 * @param {Object?} obj the object which should be transformed into an DomLikeObservable, if undefined it creates a new object
 * @param {string[]?} definedEvents the events this DomLikeObservable should accept, if undefined it accepts all events
 * @returns {Object} the object which was transformed
 */
function makeDomLikeObservable(obj, definedEvents) {
    if (obj == undefined) {
        obj = {};
    } else {
        if (!(obj instanceof Object))
            return undefined;
    }

    let registeredEventHandler = Object.create(null);
    let definedEventNames = [];

    if (getTypeOf(definedEvents) == 'Array')
        for (let k in definedEvents)
            if (getTypeOf(definedEvents[k]) == 'String')
                definedEventNames[definedEventNames.length] = definedEvents[k];

    /**
     * Events contains the defined events, if non where defined the array is empty.
     * 
     * The frozen (== immutable) array `events` is meant to represent the available events,
     * which includes an runtime check on register, wether or not this event is defined
     * 
     * `events` has two special members 
     * - `toString()`: is a function which returns a string which is this array in a json format
     * - `contains()`: is a function used by add, remove and dispatch to check if the event is allowed, returns true if the array is empty
     * 
     * @member {string[]} DomLikeObservable#events
     */

    Object.defineProperties(definedEventNames, {
        toString: {
            value: () => '[' + definedEventNames.map(v => '"' + v + '"').join(',') + ']'
        },
        contains: {
            value: definedEventNames.length == 0 ? () => true : name => definedEventNames.indexOf(name) != -1
        }
    });

    Object.defineProperties(obj, {
        addEventListener: {
            value: addEventListener.bind(undefined, definedEventNames, registeredEventHandler)
        },
        removeEventListener: {
            value: removeEventListener.bind(undefined, definedEventNames, registeredEventHandler)
        },
        dispatchEvent: {
            value: dispatchEvent.bind(undefined, definedEventNames, registeredEventHandler)
        },
        events: {
            value: Object.freeze(definedEventNames)
        }
    })

    return obj;
}

module.exports = makeDomLikeObservable;