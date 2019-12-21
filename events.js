class EventHandler {
    constructor() {
        this.listeners = {}
    }

    addEventListener(type, callback) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }
    removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }
    dispatchEvent(event, ...params) {
        if (!(event in this.listeners)) {
            return true;
        }
        var stack = this.listeners[event].slice();

        for (var i = 0, l = stack.length; i < l; i++) {
            stack[i].call(this, ...params)
        }
    };
}