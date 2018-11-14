(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aurelia/kernel')) :
    typeof define === 'function' && define.amd ? define(['exports', '@aurelia/kernel'], factory) :
    (factory((global.runtime = {}),global.kernel));
}(this, (function (exports,kernel) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
        LifecycleFlags[LifecycleFlags["mustEvaluate"] = 524288] = "mustEvaluate";
        LifecycleFlags[LifecycleFlags["mutation"] = 3] = "mutation";
        LifecycleFlags[LifecycleFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
        LifecycleFlags[LifecycleFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
        LifecycleFlags[LifecycleFlags["update"] = 28] = "update";
        LifecycleFlags[LifecycleFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
        LifecycleFlags[LifecycleFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
        LifecycleFlags[LifecycleFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
        LifecycleFlags[LifecycleFlags["from"] = 524256] = "from";
        LifecycleFlags[LifecycleFlags["fromFlush"] = 96] = "fromFlush";
        LifecycleFlags[LifecycleFlags["fromAsyncFlush"] = 32] = "fromAsyncFlush";
        LifecycleFlags[LifecycleFlags["fromSyncFlush"] = 64] = "fromSyncFlush";
        LifecycleFlags[LifecycleFlags["fromStartTask"] = 128] = "fromStartTask";
        LifecycleFlags[LifecycleFlags["fromStopTask"] = 256] = "fromStopTask";
        LifecycleFlags[LifecycleFlags["fromBind"] = 512] = "fromBind";
        LifecycleFlags[LifecycleFlags["fromUnbind"] = 1024] = "fromUnbind";
        LifecycleFlags[LifecycleFlags["fromAttach"] = 2048] = "fromAttach";
        LifecycleFlags[LifecycleFlags["fromDetach"] = 4096] = "fromDetach";
        LifecycleFlags[LifecycleFlags["fromCache"] = 8192] = "fromCache";
        LifecycleFlags[LifecycleFlags["fromCreate"] = 16384] = "fromCreate";
        LifecycleFlags[LifecycleFlags["fromDOMEvent"] = 32768] = "fromDOMEvent";
        LifecycleFlags[LifecycleFlags["fromObserverSetter"] = 65536] = "fromObserverSetter";
        LifecycleFlags[LifecycleFlags["fromBindableHandler"] = 131072] = "fromBindableHandler";
        LifecycleFlags[LifecycleFlags["fromLifecycleTask"] = 262144] = "fromLifecycleTask";
        LifecycleFlags[LifecycleFlags["parentUnmountQueued"] = 1048576] = "parentUnmountQueued";
        // this flag is for the synchronous flush before detach (no point in updating the
        // DOM if it's about to be detached)
        LifecycleFlags[LifecycleFlags["doNotUpdateDOM"] = 2097152] = "doNotUpdateDOM";
    })(exports.LifecycleFlags || (exports.LifecycleFlags = {}));
    (function (MutationKind) {
        MutationKind[MutationKind["instance"] = 1] = "instance";
        MutationKind[MutationKind["collection"] = 2] = "collection";
    })(exports.MutationKind || (exports.MutationKind = {}));

    const IRenderable = kernel.DI.createInterface().noDefault();
    const IViewFactory = kernel.DI.createInterface().noDefault();
    const marker = Object.freeze(Object.create(null));
    const ILifecycle = kernel.DI.createInterface().withDefault(x => x.singleton(Lifecycle));
    const IFlushLifecycle = ILifecycle;
    const IBindLifecycle = ILifecycle;
    const IAttachLifecycle = ILifecycle;
    /*@internal*/
    class Lifecycle {
        constructor() {
            /*@internal*/ this.bindDepth = 0;
            /*@internal*/ this.attachDepth = 0;
            /*@internal*/ this.detachDepth = 0;
            /*@internal*/ this.unbindDepth = 0;
            /*@internal*/ this.flushHead = this;
            /*@internal*/ this.flushTail = this;
            /*@internal*/ this.connectHead = this; // this cast is safe because we know exactly which properties we'll use
            /*@internal*/ this.connectTail = this;
            /*@internal*/ this.patchHead = this;
            /*@internal*/ this.patchTail = this;
            /*@internal*/ this.boundHead = this;
            /*@internal*/ this.boundTail = this;
            /*@internal*/ this.mountHead = this;
            /*@internal*/ this.mountTail = this;
            /*@internal*/ this.attachedHead = this;
            /*@internal*/ this.attachedTail = this;
            /*@internal*/ this.unmountHead = this;
            /*@internal*/ this.unmountTail = this;
            /*@internal*/ this.detachedHead = this; //LOL
            /*@internal*/ this.detachedTail = this;
            /*@internal*/ this.unbindAfterDetachHead = this;
            /*@internal*/ this.unbindAfterDetachTail = this;
            /*@internal*/ this.unboundHead = this;
            /*@internal*/ this.unboundTail = this;
            /*@internal*/ this.flushed = null;
            /*@internal*/ this.promise = Promise.resolve();
            /*@internal*/ this.flushCount = 0;
            /*@internal*/ this.connectCount = 0;
            /*@internal*/ this.patchCount = 0;
            /*@internal*/ this.boundCount = 0;
            /*@internal*/ this.mountCount = 0;
            /*@internal*/ this.attachedCount = 0;
            /*@internal*/ this.unmountCount = 0;
            /*@internal*/ this.detachedCount = 0;
            /*@internal*/ this.unbindAfterDetachCount = 0;
            /*@internal*/ this.unboundCount = 0;
            // These are dummy properties to make the lifecycle conform to the interfaces
            // of the components it manages. This allows the lifecycle itself to be the first link
            // in the chain and removes the need for an additional null check on each addition.
            /*@internal*/ this.$nextFlush = marker;
            /*@internal*/ this.flush = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextConnect = marker;
            /*@internal*/ this.connect = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextPatch = marker;
            /*@internal*/ this.patch = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextBound = marker;
            /*@internal*/ this.bound = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextMount = marker;
            /*@internal*/ this.$mount = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextAttached = marker;
            /*@internal*/ this.attached = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextUnmount = marker;
            /*@internal*/ this.$unmount = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextDetached = marker;
            /*@internal*/ this.detached = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextUnbindAfterDetach = marker;
            /*@internal*/ this.$unbind = kernel.PLATFORM.noop;
            /*@internal*/ this.$nextUnbound = marker;
            /*@internal*/ this.unbound = kernel.PLATFORM.noop;
            /*@internal*/ this.task = null;
        }
        registerTask(task) {
            if (this.task === null) {
                this.task = new AggregateLifecycleTask();
            }
            this.task.addTask(task);
        }
        finishTask(task) {
            if (this.task !== null) {
                if (this.task === task) {
                    this.task = null;
                }
                else {
                    this.task.removeTask(task);
                }
            }
        }
        enqueueFlush(requestor) {
            // Queue a flush() callback; the depth is just for debugging / testing purposes and has
            // no effect on execution. flush() will automatically be invoked when the promise resolves,
            // or it can be manually invoked synchronously.
            if (this.flushHead === this) {
                this.flushed = this.promise.then(() => this.processFlushQueue(exports.LifecycleFlags.fromAsyncFlush));
            }
            if (requestor.$nextFlush === null) {
                requestor.$nextFlush = marker;
                this.flushTail.$nextFlush = requestor;
                this.flushTail = requestor;
                ++this.flushCount;
            }
            return this.flushed;
        }
        processFlushQueue(flags) {
            flags |= exports.LifecycleFlags.fromSyncFlush;
            // flush callbacks may lead to additional flush operations, so keep looping until
            // the flush head is back to `this` (though this will typically happen in the first iteration)
            while (this.flushCount > 0) {
                let current = this.flushHead.$nextFlush;
                this.flushHead = this.flushTail = this;
                this.flushCount = 0;
                let next;
                do {
                    next = current.$nextFlush;
                    current.$nextFlush = null;
                    current.flush(flags);
                    current = next;
                } while (current !== marker);
            }
        }
        beginBind() {
            ++this.bindDepth;
        }
        enqueueBound(requestor) {
            // build a standard singly linked list for bound callbacks
            if (requestor.$nextBound === null) {
                requestor.$nextBound = marker;
                this.boundTail.$nextBound = requestor;
                this.boundTail = requestor;
                ++this.boundCount;
            }
        }
        enqueueConnect(requestor) {
            // enqueue connect and patch calls in separate lists so that they can be invoked
            // independently from eachother
            // TODO: see if we can eliminate/optimize some of this, because this is a relatively hot path
            // (first get all the necessary integration tests working, then look for optimizations)
            // build a standard singly linked list for connect callbacks
            if (requestor.$nextConnect === null) {
                requestor.$nextConnect = marker;
                this.connectTail.$nextConnect = requestor;
                this.connectTail = requestor;
                ++this.connectCount;
            }
            // build a standard singly linked list for patch callbacks
            if (requestor.$nextPatch === null) {
                requestor.$nextPatch = marker;
                this.patchTail.$nextPatch = requestor;
                this.patchTail = requestor;
                ++this.patchCount;
            }
        }
        processConnectQueue(flags) {
            // connects cannot lead to additional connects, so we don't need to loop here
            if (this.connectCount > 0) {
                this.connectCount = 0;
                let current = this.connectHead.$nextConnect;
                this.connectHead = this.connectTail = this;
                let next;
                do {
                    current.connect(flags);
                    next = current.$nextConnect;
                    current.$nextConnect = null;
                    current = next;
                } while (current !== marker);
            }
        }
        processPatchQueue(flags) {
            // flush before patching, but only if this is the initial bind;
            // no DOM is attached yet so we can safely let everything propagate
            if (flags & exports.LifecycleFlags.fromStartTask) {
                this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
            }
            // patch callbacks may lead to additional bind operations, so keep looping until
            // the patch head is back to `this` (though this will typically happen in the first iteration)
            while (this.patchCount > 0) {
                this.patchCount = 0;
                let current = this.patchHead.$nextPatch;
                this.patchHead = this.patchTail = this;
                let next;
                do {
                    current.patch(flags);
                    next = current.$nextPatch;
                    current.$nextPatch = null;
                    current = next;
                } while (current !== marker);
            }
        }
        endBind(flags) {
            // close / shrink a bind batch
            if (--this.bindDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processBindQueue(flags);
                return LifecycleTask.done;
            }
        }
        processBindQueue(flags) {
            // flush before processing bound callbacks, but only if this is the initial bind;
            // no DOM is attached yet so we can safely let everything propagate
            if (flags & exports.LifecycleFlags.fromStartTask) {
                this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
            }
            // bound callbacks may lead to additional bind operations, so keep looping until
            // the bound head is back to `this` (though this will typically happen in the first iteration)
            while (this.boundCount > 0) {
                this.boundCount = 0;
                let current = this.boundHead.$nextBound;
                let next;
                this.boundHead = this.boundTail = this;
                do {
                    current.bound(flags);
                    next = current.$nextBound;
                    current.$nextBound = null;
                    current = next;
                } while (current !== marker);
            }
        }
        beginUnbind() {
            // open up / expand an unbind batch; the very first caller will close it again with endUnbind
            ++this.unbindDepth;
        }
        enqueueUnbound(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unbound callbacks
            if (requestor.$nextUnbound === null) {
                requestor.$nextUnbound = marker;
                this.unboundTail.$nextUnbound = requestor;
                this.unboundTail = requestor;
                ++this.unboundCount;
            }
        }
        endUnbind(flags) {
            // close / shrink an unbind batch
            if (--this.unbindDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processUnbindQueue(flags);
                return LifecycleTask.done;
            }
        }
        processUnbindQueue(flags) {
            // unbound callbacks may lead to additional unbind operations, so keep looping until
            // the unbound head is back to `this` (though this will typically happen in the first iteration)
            while (this.unboundCount > 0) {
                this.unboundCount = 0;
                let current = this.unboundHead.$nextUnbound;
                let next;
                this.unboundHead = this.unboundTail = this;
                do {
                    current.unbound(flags);
                    next = current.$nextUnbound;
                    current.$nextUnbound = null;
                    current = next;
                } while (current !== marker);
            }
        }
        beginAttach() {
            // open up / expand an attach batch; the very first caller will close it again with endAttach
            ++this.attachDepth;
        }
        enqueueMount(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for mount callbacks
            if (requestor.$nextMount === null) {
                requestor.$nextMount = marker;
                this.mountTail.$nextMount = requestor;
                this.mountTail = requestor;
                ++this.mountCount;
            }
        }
        enqueueAttached(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for attached callbacks
            if (requestor.$nextAttached === null) {
                requestor.$nextAttached = marker;
                this.attachedTail.$nextAttached = requestor;
                this.attachedTail = requestor;
                ++this.attachedCount;
            }
        }
        endAttach(flags) {
            // close / shrink an attach batch
            if (--this.attachDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processAttachQueue(flags);
                return LifecycleTask.done;
            }
        }
        processAttachQueue(flags) {
            // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
            // and the DOM is updated
            this.processFlushQueue(flags | exports.LifecycleFlags.fromSyncFlush);
            // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
            //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);
            if (this.mountCount > 0) {
                this.mountCount = 0;
                let currentMount = this.mountHead.$nextMount;
                this.mountHead = this.mountTail = this;
                let nextMount;
                do {
                    currentMount.$mount(flags);
                    nextMount = currentMount.$nextMount;
                    currentMount.$nextMount = null;
                    currentMount = nextMount;
                } while (currentMount !== marker);
            }
            // Connect all connect-queued bindings AFTER mounting is done, so that the DOM is visible asap,
            // but connect BEFORE running the attached callbacks to ensure any changes made during those callbacks
            // are still accounted for.
            // TODO: add a flag/option to further delay connect with a RAF callback (the tradeoff would be that we'd need
            // to run an additional patch cycle before that connect, which can be expensive and unnecessary in most real
            // world scenarios, but can significantly speed things up with nested, highly volatile data like in dbmonster)
            this.processConnectQueue(exports.LifecycleFlags.mustEvaluate);
            if (this.attachedCount > 0) {
                this.attachedCount = 0;
                let currentAttached = this.attachedHead.$nextAttached;
                this.attachedHead = this.attachedTail = this;
                let nextAttached;
                do {
                    currentAttached.attached(flags);
                    nextAttached = currentAttached.$nextAttached;
                    currentAttached.$nextAttached = null;
                    currentAttached = nextAttached;
                } while (currentAttached !== marker);
            }
        }
        beginDetach() {
            // open up / expand a detach batch; the very first caller will close it again with endDetach
            ++this.detachDepth;
        }
        enqueueUnmount(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unmount callbacks
            if (requestor.$nextUnmount === null) {
                requestor.$nextUnmount = marker;
                this.unmountTail.$nextUnmount = requestor;
                this.unmountTail = requestor;
                ++this.unmountCount;
            }
        }
        enqueueDetached(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for detached callbacks
            if (requestor.$nextDetached === null) {
                requestor.$nextDetached = marker;
                this.detachedTail.$nextDetached = requestor;
                this.detachedTail = requestor;
                ++this.detachedCount;
            }
        }
        enqueueUnbindAfterDetach(requestor) {
            // This method is idempotent; adding the same item more than once has the same effect as
            // adding it once.
            // build a standard singly linked list for unbindAfterDetach callbacks
            if (requestor.$nextUnbindAfterDetach === null) {
                requestor.$nextUnbindAfterDetach = marker;
                this.unbindAfterDetachTail.$nextUnbindAfterDetach = requestor;
                this.unbindAfterDetachTail = requestor;
                ++this.unbindAfterDetachCount;
            }
        }
        endDetach(flags) {
            // close / shrink a detach batch
            if (--this.detachDepth === 0) {
                if (this.task !== null && !this.task.done) {
                    this.task.owner = this;
                    return this.task;
                }
                this.processDetachQueue(flags);
                return LifecycleTask.done;
            }
        }
        processDetachQueue(flags) {
            // flush before unmounting to ensure batched collection changes propagate to the repeaters,
            // which may lead to additional unmount operations
            this.processFlushQueue(flags | exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.doNotUpdateDOM);
            if (this.unmountCount > 0) {
                this.unmountCount = 0;
                let currentUnmount = this.unmountHead.$nextUnmount;
                this.unmountHead = this.unmountTail = this;
                let nextUnmount;
                do {
                    currentUnmount.$unmount(flags);
                    nextUnmount = currentUnmount.$nextUnmount;
                    currentUnmount.$nextUnmount = null;
                    currentUnmount = nextUnmount;
                } while (currentUnmount !== marker);
            }
            if (this.detachedCount > 0) {
                this.detachedCount = 0;
                let currentDetached = this.detachedHead.$nextDetached;
                this.detachedHead = this.detachedTail = this;
                let nextDetached;
                do {
                    currentDetached.detached(flags);
                    nextDetached = currentDetached.$nextDetached;
                    currentDetached.$nextDetached = null;
                    currentDetached = nextDetached;
                } while (currentDetached !== marker);
            }
            if (this.unbindAfterDetachCount > 0) {
                this.beginUnbind();
                this.unbindAfterDetachCount = 0;
                let currentUnbind = this.unbindAfterDetachHead.$nextUnbindAfterDetach;
                this.unbindAfterDetachHead = this.unbindAfterDetachTail = this;
                let nextUnbind;
                do {
                    currentUnbind.$unbind(flags);
                    nextUnbind = currentUnbind.$nextUnbindAfterDetach;
                    currentUnbind.$nextUnbindAfterDetach = null;
                    currentUnbind = nextUnbind;
                } while (currentUnbind !== marker);
                this.endUnbind(flags);
            }
        }
    }
    exports.CompositionCoordinator = class CompositionCoordinator {
        constructor($lifecycle) {
            this.$lifecycle = $lifecycle;
            this.onSwapComplete = kernel.PLATFORM.noop;
            this.queue = null;
            this.swapTask = LifecycleTask.done;
            this.currentView = null;
            this.isBound = false;
            this.isAttached = false;
        }
        static register(container) {
            return kernel.Registration.transient(this, this).register(container, this);
        }
        compose(value, flags) {
            if (this.swapTask.done) {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                    this.processNext();
                }
                else {
                    this.swap(value, flags);
                }
            }
            else {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                }
                else {
                    this.enqueue(value);
                }
                if (this.swapTask.canCancel()) {
                    this.swapTask.cancel();
                }
            }
        }
        binding(flags, scope) {
            this.scope = scope;
            this.isBound = true;
            if (this.currentView !== null) {
                this.currentView.$bind(flags, scope);
            }
        }
        attaching(flags) {
            this.isAttached = true;
            if (this.currentView !== null) {
                this.currentView.$attach(flags);
            }
        }
        detaching(flags) {
            this.isAttached = false;
            if (this.currentView !== null) {
                this.currentView.$detach(flags);
            }
        }
        unbinding(flags) {
            this.isBound = false;
            if (this.currentView !== null) {
                this.currentView.$unbind(flags);
            }
        }
        caching(flags) {
            this.currentView = null;
        }
        enqueue(view) {
            if (this.queue === null) {
                this.queue = [];
            }
            this.queue.push(view);
        }
        swap(view, flags) {
            if (this.currentView === view) {
                return;
            }
            const $lifecycle = this.$lifecycle;
            const swapTask = new AggregateLifecycleTask();
            let lifecycleTask;
            let currentView = this.currentView;
            if (currentView === null) {
                lifecycleTask = LifecycleTask.done;
            }
            else {
                $lifecycle.enqueueUnbindAfterDetach(currentView);
                $lifecycle.beginDetach();
                currentView.$detach(flags);
                lifecycleTask = $lifecycle.endDetach(flags);
            }
            swapTask.addTask(lifecycleTask);
            currentView = this.currentView = view;
            if (currentView === null) {
                lifecycleTask = LifecycleTask.done;
            }
            else {
                if (this.isBound) {
                    $lifecycle.beginBind();
                    currentView.$bind(flags, this.scope);
                    $lifecycle.endBind(flags);
                }
                if (this.isAttached) {
                    $lifecycle.beginAttach();
                    currentView.$attach(flags);
                    lifecycleTask = $lifecycle.endAttach(flags);
                }
                else {
                    lifecycleTask = LifecycleTask.done;
                }
            }
            swapTask.addTask(lifecycleTask);
            if (swapTask.done) {
                this.swapTask = LifecycleTask.done;
                this.onSwapComplete();
            }
            else {
                this.swapTask = swapTask;
                this.swapTask.wait().then(() => {
                    this.onSwapComplete();
                    this.processNext();
                });
            }
        }
        processNext() {
            if (this.queue !== null && this.queue.length > 0) {
                const next = this.queue.pop();
                this.queue.length = 0;
                if (PromiseSwap.is(next)) {
                    this.swapTask = next.start();
                }
                else {
                    this.swap(next, exports.LifecycleFlags.fromLifecycleTask);
                }
            }
            else {
                this.swapTask = LifecycleTask.done;
            }
        }
    };
    exports.CompositionCoordinator = __decorate([
        kernel.inject(ILifecycle)
    ], exports.CompositionCoordinator);
    const LifecycleTask = {
        done: {
            done: true,
            canCancel() { return false; },
            // tslint:disable-next-line:no-empty
            cancel() { },
            wait() { return Promise.resolve(); }
        }
    };
    class AggregateLifecycleTask {
        constructor() {
            this.done = true;
            /*@internal*/
            this.owner = null;
            this.tasks = [];
            this.waiter = null;
            this.resolve = null;
        }
        addTask(task) {
            if (!task.done) {
                this.done = false;
                this.tasks.push(task);
                task.wait().then(() => this.tryComplete());
            }
        }
        removeTask(task) {
            if (task.done) {
                const idx = this.tasks.indexOf(task);
                if (idx !== -1) {
                    this.tasks.splice(idx, 1);
                }
            }
            if (this.tasks.length === 0) {
                if (this.owner !== null) {
                    this.owner.finishTask(this);
                    this.owner = null;
                }
            }
        }
        canCancel() {
            if (this.done) {
                return false;
            }
            return this.tasks.every(x => x.canCancel());
        }
        cancel() {
            if (this.canCancel()) {
                this.tasks.forEach(x => x.cancel());
                this.done = false;
            }
        }
        wait() {
            if (this.waiter === null) {
                if (this.done) {
                    this.waiter = Promise.resolve();
                }
                else {
                    // tslint:disable-next-line:promise-must-complete
                    this.waiter = new Promise((resolve) => this.resolve = resolve);
                }
            }
            return this.waiter;
        }
        tryComplete() {
            if (this.done) {
                return;
            }
            if (this.tasks.every(x => x.done)) {
                this.complete(true);
            }
        }
        complete(notCancelled) {
            this.done = true;
            if (notCancelled && this.owner !== null) {
                this.owner.processDetachQueue(exports.LifecycleFlags.fromLifecycleTask);
                this.owner.processUnbindQueue(exports.LifecycleFlags.fromLifecycleTask);
                this.owner.processBindQueue(exports.LifecycleFlags.fromLifecycleTask);
                this.owner.processAttachQueue(exports.LifecycleFlags.fromLifecycleTask);
            }
            this.owner.finishTask(this);
            if (this.resolve !== null) {
                this.resolve();
            }
        }
    }
    /*@internal*/
    class PromiseSwap {
        constructor(coordinator, promise) {
            this.coordinator = coordinator;
            this.promise = promise;
            this.done = false;
            this.isCancelled = false;
        }
        static is(object) {
            return 'start' in object;
        }
        start() {
            if (this.isCancelled) {
                return LifecycleTask.done;
            }
            this.promise = this.promise.then(x => {
                this.onResolve(x);
                return x;
            });
            return this;
        }
        canCancel() {
            return !this.done;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
        onResolve(value) {
            if (this.isCancelled) {
                return;
            }
            this.done = true;
            this.coordinator.compose(value, exports.LifecycleFlags.fromLifecycleTask);
        }
    }
    // tslint:disable:jsdoc-format
    /**
     * A general-purpose ILifecycleTask implementation that can be placed
     * before an attached, detached, bound or unbound hook during attaching,
     * detaching, binding or unbinding, respectively.
     *
     * The provided promise will be awaited before the corresponding lifecycle
     * hook (and any hooks following it) is invoked.
     *
     * The provided callback will be invoked after the promise is resolved
     * and before the next lifecycle hook.
     *
     * Example:
    ```ts
    export class MyViewModel {
      private $lifecycle: ILifecycle; // set before created() hook
      private answer: number;

      public binding(flags: LifecycleFlags): void {
        // this.answer === undefined
        this.$lifecycle.registerTask(new PromiseTask(
          this.getAnswerAsync,
          answer => {
            this.answer = answer;
          }
        ));
      }

      public bound(flags: LifecycleFlags): void {
        // this.answer === 42
      }

      private getAnswerAsync(): Promise<number> {
        return Promise.resolve().then(() => 42);
      }
    }
    ```
     */
    // tslint:enable:jsdoc-format
    class PromiseTask {
        constructor(promise, callback) {
            this.done = false;
            this.isCancelled = false;
            this.callback = callback;
            this.promise = promise.then(value => {
                if (this.isCancelled === true) {
                    return;
                }
                this.done = true;
                this.callback(value);
                return value;
            });
        }
        canCancel() {
            return !this.done;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
    }

    function bindingBehavior(nameOrSource) {
        return function (target) {
            return BindingBehaviorResource.define(nameOrSource, target);
        };
    }
    const BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = typeof nameOrSource === 'string'
                ? { name: nameOrSource }
                : nameOrSource;
            Type.kind = BindingBehaviorResource;
            Type.description = description;
            Type.register = register;
            return Type;
        }
    };
    function register(container) {
        container.register(kernel.Registration.singleton(BindingBehaviorResource.keyFrom(this.description.name), this));
    }

    const ELEMENT_NODE = 1;
    const ATTRIBUTE_NODE = 2;
    const TEXT_NODE = 3;
    const COMMENT_NODE = 8;
    const DOCUMENT_FRAGMENT_NODE = 11;
    function isRenderLocation(node) {
        return node.textContent === 'au-end';
    }
    const INode = kernel.DI.createInterface().noDefault();
    const IRenderLocation = kernel.DI.createInterface().noDefault();
    // tslint:disable:no-any
    const DOM = {
        createDocumentFragment(markupOrNode) {
            if (markupOrNode === undefined || markupOrNode === null) {
                return document.createDocumentFragment();
            }
            if (markupOrNode.nodeType > 0) {
                if (markupOrNode.content !== undefined) {
                    return markupOrNode.content;
                }
                const fragment = document.createDocumentFragment();
                fragment.appendChild(markupOrNode);
                return fragment;
            }
            return DOM.createTemplate(markupOrNode).content;
        },
        createTemplate(markup) {
            if (markup === undefined) {
                return document.createElement('template');
            }
            const template = document.createElement('template');
            template.innerHTML = markup;
            return template;
        },
        addClass(node, className) {
            node.classList.add(className);
        },
        addEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).addEventListener(eventName, subscriber, options);
        },
        appendChild(parent, child) {
            parent.appendChild(child);
        },
        attachShadow(host, options) {
            return host.attachShadow(options);
        },
        cloneNode(node, deep) {
            return node.cloneNode(deep !== false); // use true unless the caller explicitly passes in false
        },
        convertToRenderLocation(node) {
            if (isRenderLocation(node)) {
                return node; // it's already a RenderLocation (converted by FragmentNodeSequence)
            }
            if (node.parentNode === null) {
                throw kernel.Reporter.error(52);
            }
            const locationEnd = document.createComment('au-end');
            const locationStart = document.createComment('au-start');
            DOM.replaceNode(locationEnd, node);
            DOM.insertBefore(locationStart, locationEnd);
            locationEnd.$start = locationStart;
            locationStart.$nodes = null;
            return locationEnd;
        },
        createComment(text) {
            return document.createComment(text);
        },
        createElement(name) {
            return document.createElement(name);
        },
        createNodeObserver(target, callback, options) {
            const observer = new MutationObserver(callback);
            observer.observe(target, options);
            return observer;
        },
        createTextNode(text) {
            return document.createTextNode(text);
        },
        getAttribute(node, name) {
            return node.getAttribute(name);
        },
        hasClass(node, className) {
            return node.classList.contains(className);
        },
        insertBefore(nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        },
        isAllWhitespace(node) {
            if (node.auInterpolationTarget === true) {
                return false;
            }
            const text = node.textContent;
            const len = text.length;
            let i = 0;
            // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
            while (i < len) {
                // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
                if (text.charCodeAt(i) > 0x20) {
                    return false;
                }
                i++;
            }
            return true;
        },
        isCommentNodeType(node) {
            return node.nodeType === COMMENT_NODE;
        },
        isDocumentFragmentType(node) {
            return node.nodeType === DOCUMENT_FRAGMENT_NODE;
        },
        isElementNodeType(node) {
            return node.nodeType === ELEMENT_NODE;
        },
        isNodeInstance(potentialNode) {
            return potentialNode.nodeType > 0;
        },
        isTextNodeType(node) {
            return node.nodeType === TEXT_NODE;
        },
        migrateChildNodes(currentParent, newParent) {
            while (currentParent.firstChild) {
                DOM.appendChild(newParent, currentParent.firstChild);
            }
        },
        registerElementResolver(container, resolver) {
            container.registerResolver(INode, resolver);
            container.registerResolver(Element, resolver);
            container.registerResolver(HTMLElement, resolver);
            container.registerResolver(SVGElement, resolver);
        },
        remove(node) {
            if (node.remove) {
                node.remove();
            }
            else {
                node.parentNode.removeChild(node);
            }
        },
        removeAttribute(node, name) {
            node.removeAttribute(name);
        },
        removeClass(node, className) {
            node.classList.remove(className);
        },
        removeEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).removeEventListener(eventName, subscriber, options);
        },
        replaceNode(newChild, oldChild) {
            if (oldChild.parentNode) {
                oldChild.parentNode.replaceChild(newChild, oldChild);
            }
        },
        setAttribute(node, name, value) {
            node.setAttribute(name, value);
        },
        treatAsNonWhitespace(node) {
            // see isAllWhitespace above
            node.auInterpolationTarget = true;
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        firstChild: null,
        lastChild: null,
        childNodes: kernel.PLATFORM.emptyArray,
        findTargets() { return kernel.PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { }
    };
    const NodeSequence = {
        empty: emptySequence
    };
    /**
     * An specialized INodeSequence with optimizations for text (interpolation) bindings
     * The contract of this INodeSequence is:
     * - the previous element is an `au-marker` node
     * - text is the actual text node
     */
    class TextNodeSequence {
        constructor(text) {
            this.firstChild = text;
            this.lastChild = text;
            this.childNodes = [text];
            this.targets = [new AuMarker(text)];
        }
        findTargets() {
            return this.targets;
        }
        insertBefore(refNode) {
            refNode.parentNode.insertBefore(this.firstChild, refNode);
        }
        appendTo(parent) {
            parent.appendChild(this.firstChild);
        }
        remove() {
            this.firstChild.remove();
        }
    }
    // tslint:enable:no-any
    // This is the most common form of INodeSequence.
    // Every custom element or template controller whose node sequence is based on an HTML template
    // has an instance of this under the hood. Anyone who wants to create a node sequence from
    // a string of markup would also receive an instance of this.
    // CompiledTemplates create instances of FragmentNodeSequence.
    /*@internal*/
    class FragmentNodeSequence {
        constructor(fragment) {
            this.fragment = fragment;
            // tslint:disable-next-line:no-any
            const targetNodeList = fragment.querySelectorAll('.au');
            let i = 0;
            let ii = targetNodeList.length;
            const targets = this.targets = Array(ii);
            while (i < ii) {
                // eagerly convert all markers to IRenderLocations (otherwise the renderer
                // will do it anyway) and store them in the target list (since the comments
                // can't be queried)
                const target = targetNodeList[i];
                if (target.nodeName === 'AU-MARKER') {
                    // note the renderer will still call this method, but it will just return the
                    // location if it sees it's already a location
                    targets[i] = DOM.convertToRenderLocation(target);
                }
                else {
                    // also store non-markers for consistent ordering
                    targets[i] = target;
                }
                ++i;
            }
            const childNodeList = fragment.childNodes;
            i = 0;
            ii = childNodeList.length;
            const childNodes = this.childNodes = Array(ii);
            while (i < ii) {
                childNodes[i] = childNodeList[i];
                ++i;
            }
            this.firstChild = fragment.firstChild;
            this.lastChild = fragment.lastChild;
            this.start = this.end = null;
        }
        findTargets() {
            // tslint:disable-next-line:no-any
            return this.targets;
        }
        insertBefore(refNode) {
            // tslint:disable-next-line:no-any
            refNode.parentNode.insertBefore(this.fragment, refNode);
            // internally we could generally assume that this is an IRenderLocation,
            // but since this is also public API we still need to double check
            // (or horrible things might happen)
            if (isRenderLocation(refNode)) {
                this.end = refNode;
                const start = this.start = refNode.$start;
                if (start.$nodes === null) {
                    start.$nodes = this;
                }
                else {
                    // if more than one NodeSequence uses the same RenderLocation, it's an child
                    // of a repeater (or something similar) and we shouldn't remove all nodes between
                    // start - end since that would always remove all items from a repeater, even
                    // when only one is removed
                    // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
                    // occupied and 2) prevent start.$nodes === this from ever evaluating to true
                    // during remove()
                    start.$nodes = kernel.PLATFORM.emptyObject;
                }
            }
        }
        appendTo(parent) {
            // tslint:disable-next-line:no-any
            parent.appendChild(this.fragment);
            // this can never be a RenderLocation, and if for whatever reason we moved
            // from a RenderLocation to a host, make sure "start" and "end" are null
            this.start = this.end = null;
        }
        remove() {
            const fragment = this.fragment;
            if (this.start !== null && this.start.$nodes === this) {
                // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
                // repeater with a single item) then simply remove everything in-between (but not
                // the comments themselves as they belong to the parent)
                const end = this.end;
                let next;
                let current = this.start.nextSibling;
                while (current !== end) {
                    next = current.nextSibling;
                    // tslint:disable-next-line:no-any
                    fragment.appendChild(current);
                    current = next;
                }
                this.start.$nodes = null;
                this.start = this.end = null;
            }
            else {
                // otherwise just remove from first to last child in the regular way
                let current = this.firstChild;
                if (current.parentNode !== fragment) {
                    const end = this.lastChild;
                    let next;
                    while (current !== null) {
                        next = current.nextSibling;
                        // tslint:disable-next-line:no-any
                        fragment.appendChild(current);
                        if (current === end) {
                            break;
                        }
                        current = next;
                    }
                }
            }
        }
    }
    class NodeSequenceFactory {
        constructor(fragment) {
            const childNodes = fragment.childNodes;
            switch (childNodes.length) {
                case 0:
                    this.createNodeSequence = () => NodeSequence.empty;
                    return;
                case 2:
                    const target = childNodes[0];
                    if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
                        const text = childNodes[1];
                        if (text.nodeType === TEXT_NODE && text.textContent === ' ') {
                            text.textContent = '';
                            this.deepClone = false;
                            this.node = text;
                            this.Type = TextNodeSequence;
                            return;
                        }
                    }
                // falls through if not returned
                default:
                    this.deepClone = true;
                    this.node = fragment;
                    this.Type = FragmentNodeSequence;
            }
        }
        static createFor(markupOrNode) {
            const fragment = DOM.createDocumentFragment(markupOrNode);
            return new NodeSequenceFactory(fragment);
        }
        createNodeSequence() {
            return new this.Type(this.node.cloneNode(this.deepClone));
        }
    }
    /*@internal*/
    class AuMarker {
        constructor(next) {
            this.textContent = '';
            this.nextSibling = next;
        }
        get parentNode() {
            return this.nextSibling.parentNode;
        }
        remove() { }
    }
    (proto => {
        proto.previousSibling = null;
        proto.firstChild = null;
        proto.lastChild = null;
        proto.childNodes = kernel.PLATFORM.emptyArray;
        proto.nodeName = 'AU-MARKER';
        proto.nodeType = ELEMENT_NODE;
    })(AuMarker.prototype);

    function subscriberCollection(mutationKind) {
        return function (target) {
            const proto = target.prototype;
            proto._subscriberFlags = 0 /* None */;
            proto._subscriber0 = null;
            proto._subscriber1 = null;
            proto._subscriber2 = null;
            proto._subscribersRest = null;
            proto.addSubscriber = addSubscriber;
            proto.removeSubscriber = removeSubscriber;
            proto.hasSubscriber = hasSubscriber;
            proto.hasSubscribers = hasSubscribers;
            proto.callSubscribers = (mutationKind === exports.MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
        };
    }
    function addSubscriber(subscriber) {
        if (this.hasSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._subscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._subscriber0 = subscriber;
            this._subscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._subscriber1 = subscriber;
            this._subscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._subscriber2 = subscriber;
            this._subscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._subscribersRest = [subscriber];
            this._subscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        this._subscribersRest.push(subscriber);
        return true;
    }
    function removeSubscriber(subscriber) {
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            this._subscriber0 = null;
            this._subscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            this._subscriber1 = null;
            this._subscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            this._subscriber2 = null;
            this._subscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._subscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callPropertySubscribers(newValue, previousValue, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(newValue, previousValue, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(newValue, previousValue, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(newValue, previousValue, flags);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(newValue, previousValue, flags);
                }
            }
        }
    }
    function callCollectionSubscribers(origin, args, flags) {
        const subscriber0 = this._subscriber0;
        const subscriber1 = this._subscriber1;
        const subscriber2 = this._subscriber2;
        let subscribers = this._subscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleChange(origin, args, flags);
        }
        if (subscriber1 !== null) {
            subscriber1.handleChange(origin, args, flags);
        }
        if (subscriber2 !== null) {
            subscriber2.handleChange(origin, args, flags);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleChange(origin, args, flags);
                }
            }
        }
        this.lifecycle.enqueueFlush(this);
    }
    function hasSubscribers() {
        return this._subscriberFlags !== 0 /* None */;
    }
    function hasSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._subscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._subscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    function batchedSubscriberCollection() {
        return function (target) {
            const proto = target.prototype;
            proto._batchedSubscriberFlags = 0 /* None */;
            proto._batchedSubscriber0 = null;
            proto._batchedSubscriber1 = null;
            proto._batchedSubscriber2 = null;
            proto._batchedSubscribersRest = null;
            proto.addBatchedSubscriber = addBatchedSubscriber;
            proto.removeBatchedSubscriber = removeBatchedSubscriber;
            proto.hasBatchedSubscriber = hasBatchedSubscriber;
            proto.hasBatchedSubscribers = hasBatchedSubscribers;
            proto.callBatchedSubscribers = callBatchedCollectionSubscribers;
        };
    }
    function addBatchedSubscriber(subscriber) {
        if (this.hasBatchedSubscriber(subscriber)) {
            return false;
        }
        const subscriberFlags = this._batchedSubscriberFlags;
        if (!(subscriberFlags & 1 /* Subscriber0 */)) {
            this._batchedSubscriber0 = subscriber;
            this._batchedSubscriberFlags |= 1 /* Subscriber0 */;
            return true;
        }
        if (!(subscriberFlags & 2 /* Subscriber1 */)) {
            this._batchedSubscriber1 = subscriber;
            this._batchedSubscriberFlags |= 2 /* Subscriber1 */;
            return true;
        }
        if (!(subscriberFlags & 4 /* Subscriber2 */)) {
            this._batchedSubscriber2 = subscriber;
            this._batchedSubscriberFlags |= 4 /* Subscriber2 */;
            return true;
        }
        if (!(subscriberFlags & 8 /* SubscribersRest */)) {
            this._batchedSubscribersRest = [subscriber];
            this._batchedSubscriberFlags |= 8 /* SubscribersRest */;
            return true;
        }
        this._batchedSubscribersRest.push(subscriber);
        return true;
    }
    function removeBatchedSubscriber(subscriber) {
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            this._batchedSubscriber0 = null;
            this._batchedSubscriberFlags &= ~1 /* Subscriber0 */;
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            this._batchedSubscriber1 = null;
            this._batchedSubscriberFlags &= ~2 /* Subscriber1 */;
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            this._batchedSubscriber2 = null;
            this._batchedSubscriberFlags &= ~4 /* Subscriber2 */;
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._batchedSubscriberFlags &= ~8 /* SubscribersRest */;
                    }
                    return true;
                }
            }
        }
        return false;
    }
    function callBatchedCollectionSubscribers(indexMap) {
        const subscriber0 = this._batchedSubscriber0;
        const subscriber1 = this._batchedSubscriber1;
        const subscriber2 = this._batchedSubscriber2;
        let subscribers = this._batchedSubscribersRest;
        if (subscribers !== null) {
            subscribers = subscribers.slice();
        }
        if (subscriber0 !== null) {
            subscriber0.handleBatchedChange(indexMap);
        }
        if (subscriber1 !== null) {
            subscriber1.handleBatchedChange(indexMap);
        }
        if (subscriber2 !== null) {
            subscriber2.handleBatchedChange(indexMap);
        }
        const length = subscribers && subscribers.length;
        if (length !== undefined && length > 0) {
            for (let i = 0; i < length; ++i) {
                const subscriber = subscribers[i];
                if (subscriber !== null) {
                    subscriber.handleBatchedChange(indexMap);
                }
            }
        }
    }
    function hasBatchedSubscribers() {
        return this._batchedSubscriberFlags !== 0 /* None */;
    }
    function hasBatchedSubscriber(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._batchedSubscriberFlags;
        if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
            return true;
        }
        if (subscriberFlags & 8 /* SubscribersRest */) {
            // no need to check length; if the flag is set, there's always at least one
            const subscribers = this._batchedSubscribersRest;
            for (let i = 0, ii = subscribers.length; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }

    function setValue(newValue, flags) {
        const currentValue = this.currentValue;
        newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if ((flags & (exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.fromBind)) &&
                !((flags & exports.LifecycleFlags.doNotUpdateDOM) && DOM.isNodeInstance(this.obj))) {
                this.setValueCore(newValue, flags);
            }
            else {
                this.currentFlags = flags;
                return this.lifecycle.enqueueFlush(this);
            }
        }
        return Promise.resolve();
    }
    function flush(flags) {
        if (flags & exports.LifecycleFlags.doNotUpdateDOM) {
            if (DOM.isNodeInstance(this.obj)) {
                // re-queue the change so it will still propagate on flush when it's attached again
                this.lifecycle.enqueueFlush(this);
                return;
            }
        }
        const currentValue = this.currentValue;
        // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
        // in which case the target doesn't need to be updated
        if (this.oldValue !== currentValue) {
            this.setValueCore(currentValue, this.currentFlags | flags | exports.LifecycleFlags.updateTargetInstance);
            this.oldValue = this.currentValue;
        }
    }
    function dispose() {
        this.currentValue = null;
        this.oldValue = null;
        this.defaultValue = null;
        this.obj = null;
        this.propertyKey = '';
    }
    function targetObserver(defaultValue = null) {
        return function (target) {
            subscriberCollection(exports.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.$nextFlush = null;
            proto.currentValue = defaultValue;
            proto.oldValue = defaultValue;
            proto.defaultValue = defaultValue;
            proto.obj = null;
            proto.propertyKey = '';
            proto.setValue = proto.setValue || setValue;
            proto.flush = proto.flush || flush;
            proto.dispose = proto.dispose || dispose;
        };
    }

    // tslint:disable-next-line:no-http-string
    const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';
    exports.XLinkAttributeAccessor = class XLinkAttributeAccessor {
        // xlink namespaced attributes require getAttributeNS/setAttributeNS
        // (even though the NS version doesn't work for other namespaces
        // in html5 documents)
        // Using very HTML-specific code here since this isn't likely to get
        // called unless operating against a real HTML element.
        constructor(lifecycle, obj, propertyKey, attributeName) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.attributeName = attributeName;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return this.obj.getAttributeNS(xlinkAttributeNS, this.attributeName);
        }
        setValueCore(newValue) {
            this.obj.setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
        }
    };
    exports.XLinkAttributeAccessor = __decorate([
        targetObserver('')
    ], exports.XLinkAttributeAccessor);
    exports.XLinkAttributeAccessor.prototype.attributeName = '';
    exports.DataAttributeAccessor = class DataAttributeAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return DOM.getAttribute(this.obj, this.propertyKey);
        }
        setValueCore(newValue) {
            if (newValue === null) {
                DOM.removeAttribute(this.obj, this.propertyKey);
            }
            else {
                DOM.setAttribute(this.obj, this.propertyKey, newValue);
            }
        }
    };
    exports.DataAttributeAccessor = __decorate([
        targetObserver()
    ], exports.DataAttributeAccessor);
    exports.StyleAttributeAccessor = class StyleAttributeAccessor {
        constructor(lifecycle, obj) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.oldValue = this.currentValue = obj.style.cssText;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        // tslint:disable-next-line:function-name
        _setProperty(style, value) {
            let priority = '';
            if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        setValueCore(newValue) {
            const styles = this.styles || {};
            let style;
            let version = this.version;
            if (newValue !== null) {
                if (newValue instanceof Object) {
                    let value;
                    for (style in newValue) {
                        if (newValue.hasOwnProperty(style)) {
                            value = newValue[style];
                            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                            styles[style] = version;
                            this._setProperty(style, value);
                        }
                    }
                }
                else if (newValue.length) {
                    const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    let pair;
                    while ((pair = rx.exec(newValue)) !== null) {
                        style = pair[1];
                        if (!style) {
                            continue;
                        }
                        styles[style] = version;
                        this._setProperty(style, pair[2]);
                    }
                }
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    };
    exports.StyleAttributeAccessor = __decorate([
        targetObserver()
    ], exports.StyleAttributeAccessor);
    exports.StyleAttributeAccessor.prototype.styles = null;
    exports.StyleAttributeAccessor.prototype.version = 0;
    exports.StyleAttributeAccessor.prototype.propertyKey = 'style';
    exports.ClassAttributeAccessor = class ClassAttributeAccessor {
        constructor(lifecycle, obj) {
            this.lifecycle = lifecycle;
            this.obj = obj;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue) {
            const nameIndex = this.nameIndex || {};
            let version = this.version;
            let names;
            let name;
            // Add the classes, tracking the version at which they were added.
            if (newValue.length) {
                const node = this.obj;
                names = newValue.split(/\s+/);
                for (let i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    if (!name.length) {
                        continue;
                    }
                    nameIndex[name] = version;
                    DOM.addClass(node, name);
                }
            }
            // Update state variables.
            this.nameIndex = nameIndex;
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                DOM.removeClass(this.obj, name);
            }
        }
    };
    exports.ClassAttributeAccessor = __decorate([
        targetObserver('')
    ], exports.ClassAttributeAccessor);
    exports.ClassAttributeAccessor.prototype.doNotCache = true;
    exports.ClassAttributeAccessor.prototype.version = 0;
    exports.ClassAttributeAccessor.prototype.nameIndex = null;
    exports.ElementPropertyAccessor = class ElementPropertyAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(value) {
            this.obj[this.propertyKey] = value;
        }
    };
    exports.ElementPropertyAccessor = __decorate([
        targetObserver('')
    ], exports.ElementPropertyAccessor);
    class PropertyAccessor {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value) {
            this.obj[this.propertyKey] = value;
        }
    }

    exports.AttrBindingBehavior = class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new exports.DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target, binding.targetProperty);
        }
        // tslint:disable-next-line:no-empty
        unbind(flags, scope, binding) { }
    };
    exports.AttrBindingBehavior = __decorate([
        bindingBehavior('attr')
    ], exports.AttrBindingBehavior);

    /*
    * Note: the oneTime binding now has a non-zero value for 2 reasons:
    *  - plays nicer with bitwise operations (more consistent code, more explicit settings)
    *  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
    *
    * Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
    * This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
    */
    (function (BindingMode) {
        BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
        BindingMode[BindingMode["toView"] = 2] = "toView";
        BindingMode[BindingMode["fromView"] = 4] = "fromView";
        BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
        BindingMode[BindingMode["default"] = 8] = "default";
    })(exports.BindingMode || (exports.BindingMode = {}));

    const { oneTime, toView, fromView, twoWay } = exports.BindingMode;
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
        }
        bind(flags, scope, binding) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        }
    }
    exports.OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime);
        }
    };
    exports.OneTimeBindingBehavior = __decorate([
        bindingBehavior('oneTime')
    ], exports.OneTimeBindingBehavior);
    exports.ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView);
        }
    };
    exports.ToViewBindingBehavior = __decorate([
        bindingBehavior('toView')
    ], exports.ToViewBindingBehavior);
    exports.FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView);
        }
    };
    exports.FromViewBindingBehavior = __decorate([
        bindingBehavior('fromView')
    ], exports.FromViewBindingBehavior);
    exports.TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    };
    exports.TwoWayBindingBehavior = __decorate([
        bindingBehavior('twoWay')
    ], exports.TwoWayBindingBehavior);

    const defineProperty = Reflect.defineProperty;
    // note: we're reusing the same object for setting all descriptors, just changing some properties as needed
    //   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
    // see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
    const observedPropertyDescriptor = {
        get: undefined,
        set: undefined,
        enumerable: true,
        configurable: true
    };
    function subscribe(subscriber) {
        if (this.observing === false) {
            this.observing = true;
            const { obj, propertyKey } = this;
            this.currentValue = obj[propertyKey];
            observedPropertyDescriptor.get = () => this.getValue();
            observedPropertyDescriptor.set = value => { this.setValue(value, exports.LifecycleFlags.updateTargetInstance); };
            if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
                kernel.Reporter.write(1, propertyKey, obj);
            }
        }
        this.addSubscriber(subscriber);
    }
    function dispose$1() {
        delete this.obj[this.propertyKey];
        this.obj = null;
        this.propertyKey = null;
        this.currentValue = null;
    }
    function propertyObserver() {
        return function (target) {
            subscriberCollection(exports.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.observing = false;
            proto.obj = null;
            proto.propertyKey = null;
            // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
            // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
            // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
            // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
            // This is likely not working correctly in vCurrent either.
            proto.currentValue = Symbol();
            proto.subscribe = proto.subscribe || subscribe;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.dispose = proto.dispose || dispose$1;
        };
    }

    const noop = kernel.PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
        }
        getStringLength() {
            return this.obj.length;
        }
        returnUndefined() {
            return undefined;
        }
    }
    PrimitiveObserver.prototype.setValue = noop;
    PrimitiveObserver.prototype.subscribe = noop;
    PrimitiveObserver.prototype.unsubscribe = noop;
    PrimitiveObserver.prototype.dispose = noop;
    exports.SetterObserver = class SetterObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & exports.LifecycleFlags.fromBind)) {
                    this.callSubscribers(newValue, currentValue, flags);
                }
                // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
                // so calling obj[propertyKey] will actually return this.currentValue.
                // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
                // is unmodified and we need to explicitly set the property value.
                // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
                // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
                if (!this.observing) {
                    this.obj[this.propertyKey] = newValue;
                }
            }
        }
    };
    exports.SetterObserver = __decorate([
        propertyObserver()
    ], exports.SetterObserver);
    exports.Observer = class Observer {
        constructor(instance, propertyName, callbackName) {
            this.obj = instance;
            this.propertyKey = propertyName;
            this.currentValue = instance[propertyName];
            this.callback = callbackName in instance
                ? instance[callbackName].bind(instance)
                : noop;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & exports.LifecycleFlags.fromBind)) {
                    const coercedValue = this.callback(newValue, currentValue);
                    if (coercedValue !== undefined) {
                        this.currentValue = newValue = coercedValue;
                    }
                    this.callSubscribers(newValue, currentValue, flags);
                }
            }
        }
    };
    exports.Observer = __decorate([
        propertyObserver()
    ], exports.Observer);

    /*@internal*/
    class InternalObserversLookup {
        getOrCreate(obj, key) {
            let observer = this[key];
            if (observer === undefined) {
                observer = this[key] = new exports.SetterObserver(obj, key);
            }
            return observer;
        }
    }
    class BindingContext {
        constructor(keyOrObj, value) {
            this.$synthetic = true;
            if (keyOrObj !== undefined) {
                if (value !== undefined) {
                    // if value is defined then it's just a property and a value to initialize with
                    // tslint:disable-next-line:no-any
                    this[keyOrObj] = value;
                }
                else {
                    // can either be some random object or another bindingContext to clone from
                    for (const prop in keyOrObj) {
                        if (keyOrObj.hasOwnProperty(prop)) {
                            this[prop] = keyOrObj[prop];
                        }
                    }
                }
            }
        }
        static create(keyOrObj, value) {
            return new BindingContext(keyOrObj, value);
        }
        // tslint:disable-next-line:no-reserved-keywords
        static get(scope, name, ancestor) {
            if (scope === undefined) {
                throw kernel.Reporter.error(250 /* UndefinedScope */);
            }
            if (scope === null) {
                throw kernel.Reporter.error(251 /* NullScope */);
            }
            let overrideContext = scope.overrideContext;
            if (ancestor > 0) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor > 0) {
                    if (overrideContext.parentOverrideContext === null) {
                        return undefined;
                    }
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // traverse the context and it's ancestors, searching for a context that has the name.
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                // we located a context with the property.  return it.
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // the name wasn't found.  return the root binding context.
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }
    class Scope {
        constructor(bindingContext, overrideContext) {
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
        }
        static create(bc, oc) {
            return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
        }
        static fromOverride(oc) {
            if (oc === null || oc === undefined) {
                throw kernel.Reporter.error(252 /* NilOverrideContext */);
            }
            return new Scope(oc.bindingContext, oc);
        }
        static fromParent(ps, bc) {
            if (ps === null || ps === undefined) {
                throw kernel.Reporter.error(253 /* NilParentScope */);
            }
            return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
        }
    }
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
            this.$synthetic = true;
        }
        static create(bc, poc) {
            return new OverrideContext(bc, poc === undefined ? null : poc);
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }

    const ISignaler = kernel.DI.createInterface().withDefault(x => x.singleton(Signaler));
    /*@internal*/
    class Signaler {
        constructor() {
            this.signals = Object.create(null);
        }
        dispatchSignal(name, flags) {
            const listeners = this.signals[name];
            if (listeners === undefined) {
                return;
            }
            for (const listener of listeners.keys()) {
                listener.handleChange(undefined, undefined, flags | exports.LifecycleFlags.updateTargetInstance);
            }
        }
        addSignalListener(name, listener) {
            const signals = this.signals;
            const listeners = signals[name];
            if (listeners === undefined) {
                signals[name] = new Set([listener]);
            }
            else {
                listeners.add(listener);
            }
        }
        removeSignalListener(name, listener) {
            const listeners = this.signals[name];
            if (listeners) {
                listeners.delete(listener);
            }
        }
    }

    function valueConverter(nameOrSource) {
        return function (target) {
            return ValueConverterResource.define(nameOrSource, target);
        };
    }
    const ValueConverterResource = {
        name: 'value-converter',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = typeof nameOrSource === 'string'
                ? { name: nameOrSource }
                : nameOrSource;
            Type.kind = ValueConverterResource;
            Type.description = description;
            Type.register = register$1;
            return Type;
        }
    };
    function register$1(container) {
        container.register(kernel.Registration.singleton(ValueConverterResource.keyFrom(this.description.name), this));
    }

    function connects(expr) {
        return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
    }
    function observes(expr) {
        return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
    }
    function callsFunction(expr) {
        return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
    }
    function hasAncestor(expr) {
        return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
    }
    function isAssignable(expr) {
        return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
    }
    function isLeftHandSide(expr) {
        return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
    }
    function isPrimary(expr) {
        return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
    }
    function isResource(expr) {
        return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
    }
    function hasBind(expr) {
        return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
    }
    function hasUnbind(expr) {
        return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
    }
    function isLiteral(expr) {
        return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
    }
    function arePureLiterals(expressions) {
        if (expressions === undefined || expressions.length === 0) {
            return true;
        }
        for (let i = 0; i < expressions.length; ++i) {
            if (!isPureLiteral(expressions[i])) {
                return false;
            }
        }
        return true;
    }
    function isPureLiteral(expr) {
        if (isLiteral(expr)) {
            switch (expr.$kind) {
                case 17955 /* ArrayLiteral */:
                    return arePureLiterals(expr.elements);
                case 17956 /* ObjectLiteral */:
                    return arePureLiterals(expr.values);
                case 17958 /* Template */:
                    return arePureLiterals(expr.expressions);
                case 17925 /* PrimitiveLiteral */:
                    return true;
            }
        }
        return false;
    }
    class BindingBehavior {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
            this.expressionHasBind = hasBind(expression);
            this.expressionHasUnbind = hasUnbind(expression);
        }
        evaluate(flags, scope, locator) {
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (scope === undefined) {
                throw kernel.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel.Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw kernel.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            if (this.expressionHasBind) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw kernel.Reporter.error(203 /* NoBehaviorFound */, this);
            }
            if (binding[behaviorKey] !== undefined && binding[behaviorKey] !== null) {
                throw kernel.Reporter.error(204 /* BehaviorAlreadyApplied */, this);
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = null;
            if (this.expressionHasUnbind) {
                this.expression.unbind(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitBindingBehavior(this);
        }
    }
    class ValueConverter {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.converterKey = ValueConverterResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('toView' in converter) {
                const args = this.args;
                const len = args.length;
                const result = Array(len + 1);
                result[0] = this.expression.evaluate(flags, scope, locator);
                for (let i = 0; i < len; ++i) {
                    result[i + 1] = args[i].evaluate(flags, scope, locator);
                }
                return converter.toView.apply(converter, result);
            }
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            if (scope === undefined) {
                throw kernel.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel.Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw kernel.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel.Reporter.error(202 /* NoLocator */, this);
            }
            this.expression.connect(flags, scope, binding);
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel.Reporter.error(205 /* NoConverterFound */, this);
            }
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.addSignalListener(signals[i], binding);
            }
        }
        unbind(flags, scope, binding) {
            const locator = binding.locator;
            const converter = locator.get(this.converterKey);
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.removeSignalListener(signals[i], binding);
            }
        }
        accept(visitor) {
            return visitor.visitValueConverter(this);
        }
    }
    class Assign {
        constructor(target, value) {
            this.target = target;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
        }
        connect(flags, scope, binding) {
            return;
        }
        assign(flags, scope, locator, value) {
            this.value.assign(flags, scope, locator, value);
            return this.target.assign(flags, scope, locator, value);
        }
        accept(visitor) {
            return visitor.visitAssign(this);
        }
    }
    class Conditional {
        constructor(condition, yes, no) {
            this.condition = condition;
            this.yes = yes;
            this.no = no;
        }
        evaluate(flags, scope, locator) {
            return (!!this.condition.evaluate(flags, scope, locator))
                ? this.yes.evaluate(flags, scope, locator)
                : this.no.evaluate(flags, scope, locator);
        }
        connect(flags, scope, binding) {
            const condition = this.condition;
            if (condition.evaluate(flags, scope, null)) {
                this.condition.connect(flags, scope, binding);
                this.yes.connect(flags, scope, binding);
            }
            else {
                this.condition.connect(flags, scope, binding);
                this.no.connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitConditional(this);
        }
    }
    class AccessThis {
        constructor(ancestor = 0) {
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            if (scope === undefined) {
                throw kernel.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel.Reporter.error(251 /* NullScope */, this);
            }
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        }
        accept(visitor) {
            return visitor.visitAccessThis(this);
        }
    }
    AccessThis.$this = new AccessThis(0);
    AccessThis.$parent = new AccessThis(1);
    class AccessScope {
        constructor(name, ancestor = 0) {
            this.name = name;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const name = this.name;
            return BindingContext.get(scope, name, this.ancestor)[name];
        }
        assign(flags, scope, locator, value) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor);
            return context ? (context[name] = value) : undefined;
        }
        connect(flags, scope, binding) {
            const name = this.name;
            const context = BindingContext.get(scope, name, this.ancestor);
            binding.observeProperty(context, name);
        }
        accept(visitor) {
            return visitor.visitAccessScope(this);
        }
    }
    class AccessMember {
        constructor(object, name) {
            this.object = object;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            return instance === null || instance === undefined ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            let instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || typeof instance !== 'object') {
                instance = {};
                this.object.assign(flags, scope, locator, instance);
            }
            instance[this.name] = value;
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj) {
                binding.observeProperty(obj, this.name);
            }
        }
        accept(visitor) {
            return visitor.visitAccessMember(this);
        }
    }
    class AccessKeyed {
        constructor(object, key) {
            this.object = object;
            this.key = key;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || instance === undefined) {
                return undefined;
            }
            const key = this.key.evaluate(flags, scope, locator);
            // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
            // and the runtime does this this faster
            // tslint:disable-next-line:no-any
            return instance[key];
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            // tslint:disable-next-line:no-any
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (typeof obj === 'object' && obj !== null) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                // observe the property represented by the key as long as it's not an array indexer
                // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                if (!(Array.isArray(obj) && isNumeric(key))) {
                    binding.observeProperty(obj, key);
                }
            }
        }
        accept(visitor) {
            return visitor.visitAccessKeyed(this);
        }
    }
    class CallScope {
        constructor(name, args, ancestor = 0) {
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const args = evalList(flags, scope, locator, this.args);
            const context = BindingContext.get(scope, this.name, this.ancestor);
            const func = getFunction(flags, context, this.name);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitCallScope(this);
        }
    }
    class CallMember {
        constructor(object, name, args) {
            this.object = object;
            this.name = name;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            const args = evalList(flags, scope, locator, this.args);
            const func = getFunction(flags, instance, this.name);
            if (func) {
                return func.apply(instance, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~exports.LifecycleFlags.mustEvaluate, obj, this.name)) {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallMember(this);
        }
    }
    class CallFunction {
        constructor(func, args) {
            this.func = func;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
            if (typeof func === 'function') {
                return func.apply(null, evalList(flags, scope, locator, this.args));
            }
            if (!(flags & exports.LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
                return undefined;
            }
            throw kernel.Reporter.error(207 /* NotAFunction */, this);
        }
        connect(flags, scope, binding) {
            const func = this.func.evaluate(flags, scope, null);
            this.func.connect(flags, scope, binding);
            if (typeof func === 'function') {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallFunction(this);
        }
    }
    class Binary {
        constructor(operation, left, right) {
            this.operation = operation;
            this.left = left;
            this.right = right;
            // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
            // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
            // work to do; we can do this because the operation can't change after it's parsed
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            const left = this.left.evaluate(flags, scope, null);
            this.left.connect(flags, scope, binding);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(flags, scope, binding);
        }
        ['&&'](f, s, l) {
            return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
        }
        ['||'](f, s, l) {
            return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
        }
        ['=='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
        }
        ['==='](f, s, l) {
            return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
        }
        ['!='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
        }
        ['!=='](f, s, l) {
            return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
        }
        ['instanceof'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (typeof right === 'function') {
                return this.left.evaluate(f, s, l) instanceof right;
            }
            return false;
        }
        ['in'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (right !== null && typeof right === 'object') {
                return this.left.evaluate(f, s, l) in right;
            }
            return false;
        }
        // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
        // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
        // this makes bugs in user code easier to track down for end users
        // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
        ['+'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
        }
        ['*'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
        }
        ['/'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
        }
        ['%'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
        }
        ['<'](f, s, l) {
            return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
        }
        ['>'](f, s, l) {
            return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
        }
        ['<='](f, s, l) {
            return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
        }
        ['>='](f, s, l) {
            return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitBinary(this);
        }
    }
    class Unary {
        constructor(operation, expression) {
            this.operation = operation;
            this.expression = expression;
            // see Binary (we're doing the same thing here)
            // tslint:disable-next-line:no-any
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        ['void'](f, s, l) {
            return void this.expression.evaluate(f, s, l);
        }
        ['typeof'](f, s, l) {
            return typeof this.expression.evaluate(f, s, l);
        }
        ['!'](f, s, l) {
            return !this.expression.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return -this.expression.evaluate(f, s, l);
        }
        ['+'](f, s, l) {
            return +this.expression.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitUnary(this);
        }
    }
    class PrimitiveLiteral {
        constructor(value) {
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.value;
        }
        accept(visitor) {
            return visitor.visitPrimitiveLiteral(this);
        }
    }
    PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
    PrimitiveLiteral.$null = new PrimitiveLiteral(null);
    PrimitiveLiteral.$true = new PrimitiveLiteral(true);
    PrimitiveLiteral.$false = new PrimitiveLiteral(false);
    PrimitiveLiteral.$empty = new PrimitiveLiteral('');
    class HtmlLiteral {
        constructor(parts) {
            this.parts = parts;
        }
        evaluate(flags, scope, locator) {
            const elements = this.parts;
            let result = '';
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                const value = elements[i].evaluate(flags, scope, locator);
                if (value === undefined || value === null) {
                    continue;
                }
                result += value;
            }
            return result;
        }
        connect(flags, scope, binding) {
            for (let i = 0, ii = this.parts.length; i < ii; ++i) {
                this.parts[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitHtmlLiteral(this);
        }
    }
    class ArrayLiteral {
        constructor(elements) {
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            const elements = this.elements;
            const length = elements.length;
            const result = Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = elements[i].evaluate(flags, scope, locator);
            }
            return result;
        }
        connect(flags, scope, binding) {
            const elements = this.elements;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                elements[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitArrayLiteral(this);
        }
    }
    ArrayLiteral.$empty = new ArrayLiteral(kernel.PLATFORM.emptyArray);
    class ObjectLiteral {
        constructor(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            const instance = {};
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                instance[keys[i]] = values[i].evaluate(flags, scope, locator);
            }
            return instance;
        }
        connect(flags, scope, binding) {
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                values[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitObjectLiteral(this);
        }
    }
    ObjectLiteral.$empty = new ObjectLiteral(kernel.PLATFORM.emptyArray, kernel.PLATFORM.emptyArray);
    class Template {
        constructor(cooked, expressions) {
            this.cooked = cooked;
            this.expressions = expressions;
            this.expressions = expressions || kernel.PLATFORM.emptyArray;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const cooked = this.cooked;
            let result = cooked[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += cooked[i + 1];
            }
            return result;
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
                i++;
            }
        }
        accept(visitor) {
            return visitor.visitTemplate(this);
        }
    }
    Template.$empty = new Template(['']);
    class TaggedTemplate {
        constructor(cooked, raw, func, expressions) {
            this.cooked = cooked;
            this.func = func;
            this.expressions = expressions;
            cooked.raw = raw;
            this.expressions = expressions || kernel.PLATFORM.emptyArray;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const len = expressions.length;
            const results = Array(len);
            for (let i = 0, ii = len; i < ii; ++i) {
                results[i] = expressions[i].evaluate(flags, scope, locator);
            }
            const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
            if (typeof func !== 'function') {
                throw kernel.Reporter.error(207 /* NotAFunction */, this);
            }
            return func.apply(null, [this.cooked].concat(results));
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
            }
            this.func.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitTaggedTemplate(this);
        }
    }
    class ArrayBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(elements) {
            this.elements = elements;
        }
        // tslint:disable-next-line:no-any
        evaluate(flags, scope, locator) {
            // TODO
        }
        // tslint:disable-next-line:no-any
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitArrayBindingPattern(this);
        }
    }
    class ObjectBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        // tslint:disable-next-line:no-any
        evaluate(flags, scope, locator) {
            // TODO
        }
        // tslint:disable-next-line:no-any
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitObjectBindingPattern(this);
        }
    }
    class BindingIdentifier {
        constructor(name) {
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            return this.name;
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitBindingIdentifier(this);
        }
    }
    const toStringTag = Object.prototype.toString;
    // https://tc39.github.io/ecma262/#sec-iteration-statements
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    class ForOfStatement {
        constructor(declaration, iterable) {
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(result) {
            return CountForOfStatement[toStringTag.call(result)](result);
        }
        // tslint:disable-next-line:no-any
        iterate(result, func) {
            IterateForOfStatement[toStringTag.call(result)](result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitForOfStatement(this);
        }
    }
    /*
    * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
    * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
    * but this class might be a candidate for removal if it turns out it does provide all we need
    */
    class Interpolation {
        constructor(parts, expressions) {
            this.parts = parts;
            this.expressions = expressions;
            this.isMulti = expressions.length > 1;
            this.firstExpression = expressions[0];
        }
        evaluate(flags, scope, locator) {
            if (this.isMulti) {
                const expressions = this.expressions;
                const parts = this.parts;
                let result = parts[0];
                for (let i = 0, ii = expressions.length; i < ii; ++i) {
                    result += expressions[i].evaluate(flags, scope, locator);
                    result += parts[i + 1];
                }
                return result;
            }
            else {
                const parts = this.parts;
                return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
            }
        }
        connect(flags, scope, binding) {
            return;
        }
        accept(visitor) {
            return visitor.visitInterpolation(this);
        }
    }
    /*
    * Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
    * (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
    *
    * This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
    */
    BindingBehavior.prototype.$kind = 38962 /* BindingBehavior */;
    ValueConverter.prototype.$kind = 36913 /* ValueConverter */;
    Assign.prototype.$kind = 8208 /* Assign */;
    Conditional.prototype.$kind = 63 /* Conditional */;
    AccessThis.prototype.$kind = 1793 /* AccessThis */;
    AccessScope.prototype.$kind = 10082 /* AccessScope */;
    AccessMember.prototype.$kind = 9323 /* AccessMember */;
    AccessKeyed.prototype.$kind = 9324 /* AccessKeyed */;
    CallScope.prototype.$kind = 1448 /* CallScope */;
    CallMember.prototype.$kind = 1161 /* CallMember */;
    CallFunction.prototype.$kind = 1162 /* CallFunction */;
    Binary.prototype.$kind = 46 /* Binary */;
    Unary.prototype.$kind = 39 /* Unary */;
    PrimitiveLiteral.prototype.$kind = 17925 /* PrimitiveLiteral */;
    HtmlLiteral.prototype.$kind = 51 /* HtmlLiteral */;
    ArrayLiteral.prototype.$kind = 17955 /* ArrayLiteral */;
    ObjectLiteral.prototype.$kind = 17956 /* ObjectLiteral */;
    Template.prototype.$kind = 17958 /* Template */;
    TaggedTemplate.prototype.$kind = 1197 /* TaggedTemplate */;
    ArrayBindingPattern.prototype.$kind = 65556 /* ArrayBindingPattern */;
    ObjectBindingPattern.prototype.$kind = 65557 /* ObjectBindingPattern */;
    BindingIdentifier.prototype.$kind = 65558 /* BindingIdentifier */;
    ForOfStatement.prototype.$kind = 55 /* ForOfStatement */;
    Interpolation.prototype.$kind = 24 /* Interpolation */;
    /// Evaluate the [list] in context of the [scope].
    function evalList(flags, scope, locator, list) {
        const len = list.length;
        const result = Array(len);
        for (let i = 0; i < len; ++i) {
            result[i] = list[i].evaluate(flags, scope, locator);
        }
        return result;
    }
    function getFunction(flags, obj, name) {
        const func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & exports.LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
            return null;
        }
        throw kernel.Reporter.error(207 /* NotAFunction */, obj, name, func);
    }
    function isNumeric(value) {
        const valueType = typeof value;
        if (valueType === 'number')
            return true;
        if (valueType !== 'string')
            return false;
        const len = value.length;
        if (len === 0)
            return false;
        for (let i = 0; i < len; ++i) {
            const char = value.charCodeAt(i);
            if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
                return false;
            }
        }
        return true;
    }
    /*@internal*/
    const IterateForOfStatement = {
        ['[object Array]'](result, func) {
            for (let i = 0, ii = result.length; i < ii; ++i) {
                func(result, i, result[i]);
            }
        },
        ['[object Map]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Set]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Number]'](result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Null]'](result, func) {
            return;
        },
        ['[object Undefined]'](result, func) {
            return;
        }
    };
    /*@internal*/
    const CountForOfStatement = {
        ['[object Array]'](result) { return result.length; },
        ['[object Map]'](result) { return result.size; },
        ['[object Set]'](result) { return result.size; },
        ['[object Number]'](result) { return result; },
        ['[object Null]'](result) { return 0; },
        ['[object Undefined]'](result) { return 0; }
    };
    // Give each AST class a noop for each interface method if and only if it's not already defined
    // This accomplishes the following:
    //   1) no runtime error due to bad AST structure (it's the parser's job to guard against that)
    //   2) no runtime error due to a bad binding such as two-way on a literal (no need, since it doesn't threaten the integrity of the app's state)
    //   3) should we decide something else, we can easily change the global behavior of 1) and 2) by simply assigning a different method here (either in the source or via AOT)
    const ast = [AccessThis, AccessScope, ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template, Unary, CallFunction, CallMember, CallScope, AccessMember, AccessKeyed, TaggedTemplate, Binary, Conditional, Assign, ForOfStatement];
    for (let i = 0, ii = ast.length; i < ii; ++i) {
        const proto = ast[i].prototype;
        // tslint:disable-next-line:no-any
        proto.assign = proto.assign || kernel.PLATFORM.noop;
        proto.connect = proto.connect || kernel.PLATFORM.noop;
    }

    // TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
    const slotNames = [];
    const versionSlotNames = [];
    let lastSlot = -1;
    function ensureEnoughSlotNames(currentSlot) {
        if (currentSlot === lastSlot) {
            lastSlot += 5;
            const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
            for (let i = currentSlot + 1; i < ii; ++i) {
                slotNames[i] = `_observer${i}`;
                versionSlotNames[i] = `_observerVersion${i}`;
            }
        }
    }
    ensureEnoughSlotNames(-1);
    /*@internal*/
    function addObserver(observer) {
        // find the observer.
        const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
        let i = observerSlots;
        while (i-- && this[slotNames[i]] !== observer)
            ;
        // if we are not already observing, put the observer in an open slot and subscribe.
        if (i === -1) {
            i = 0;
            while (this[slotNames[i]]) {
                i++;
            }
            this[slotNames[i]] = observer;
            observer.subscribe(this);
            // increment the slot count.
            if (i === observerSlots) {
                this.observerSlots = i + 1;
            }
        }
        // set the "version" when the observer was used.
        if (this.version === undefined) {
            this.version = 0;
        }
        this[versionSlotNames[i]] = this.version;
        ensureEnoughSlotNames(i);
    }
    /*@internal*/
    function observeProperty(obj, propertyName) {
        const observer = this.observerLocator.getObserver(obj, propertyName);
        /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
         *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
         *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
         *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
         *
         * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
         */
        this.addObserver(observer);
    }
    /*@internal*/
    function unobserve(all) {
        const slots = this.observerSlots;
        let slotName;
        let observer;
        if (all === true) {
            for (let i = 0; i < slots; ++i) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer !== null && observer !== undefined) {
                    this[slotName] = null;
                    observer.unsubscribe(this);
                }
            }
        }
        else {
            const version = this.version;
            for (let i = 0; i < slots; ++i) {
                if (this[versionSlotNames[i]] !== version) {
                    slotName = slotNames[i];
                    observer = this[slotName];
                    if (observer !== null && observer !== undefined) {
                        this[slotName] = null;
                        observer.unsubscribe(this);
                    }
                }
            }
        }
    }
    function connectableDecorator(target) {
        const proto = target.prototype;
        if (!proto.hasOwnProperty('observeProperty'))
            proto.observeProperty = observeProperty;
        if (!proto.hasOwnProperty('unobserve'))
            proto.unobserve = unobserve;
        if (!proto.hasOwnProperty('addObserver'))
            proto.addObserver = addObserver;
        return target;
    }
    function connectable(target) {
        return target === undefined ? connectableDecorator : connectableDecorator(target);
    }

    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime: oneTime$1, toView: toView$1, fromView: fromView$1 } = exports.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView$1 | oneTime$1;
    exports.Binding = class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.$nextConnect = null;
            this.$nextPatch = null;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            this.$lifecycle = locator.get(ILifecycle);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | exports.LifecycleFlags.updateTargetInstance);
        }
        updateSource(value, flags) {
            this.sourceExpression.assign(flags | exports.LifecycleFlags.updateSourceExpression, this.$scope, this.locator, value);
        }
        handleChange(newValue, previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            if (flags & exports.LifecycleFlags.updateTargetInstance) {
                const targetObserver = this.targetObserver;
                const mode = this.mode;
                previousValue = targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = sourceExpression.evaluate(flags, $scope, locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((mode & oneTime$1) === 0) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this);
                    this.unobserve(false);
                }
                return;
            }
            if (flags & exports.LifecycleFlags.updateSourceExpression) {
                if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                    this.updateSource(newValue, flags);
                }
                return;
            }
            throw kernel.Reporter.error(15, exports.LifecycleFlags[flags]);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            let sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            const mode = this.mode;
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (mode & fromView$1) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
                }
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (mode & toViewOrOneTime) {
                this.updateTarget(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (mode & toView$1) {
                this.$lifecycle.enqueueConnect(this);
            }
            if (mode & fromView$1) {
                targetObserver.subscribe(this);
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            const targetObserver = this.targetObserver;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this);
            }
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        connect(flags) {
            if (this.$state & 2 /* isBound */) {
                this.sourceExpression.connect(flags | exports.LifecycleFlags.mustEvaluate, this.$scope, this);
            }
        }
        patch(flags) {
            if (this.$state & 2 /* isBound */) {
                this.updateTarget(this.sourceExpression.evaluate(flags | exports.LifecycleFlags.mustEvaluate, this.$scope, this.locator), flags);
            }
        }
    };
    exports.Binding = __decorate([
        connectable()
    ], exports.Binding);

    const unset = {};
    /*@internal*/
    function debounceCallSource(event) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
    }
    /*@internal*/
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        state.timeoutId = setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
    }
    const fromView$2 = exports.BindingMode.fromView;
    exports.DebounceBindingBehavior = class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof exports.Binding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView$2 ? exports.LifecycleFlags.updateSourceExpression : exports.LifecycleFlags.updateTargetInstance;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = exports.LifecycleFlags.updateTargetInstance;
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            // replace the original method with the debouncing version.
            binding[methodToDebounce] = debouncer;
            // create the debounce state.
            binding.debounceState = {
                callContextToDebounce,
                delay,
                timeoutId: 0,
                oldValue: unset
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    };
    exports.DebounceBindingBehavior = __decorate([
        bindingBehavior('debounce')
    ], exports.DebounceBindingBehavior);

    const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const ISanitizer = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        sanitize(input) {
            return input.replace(SCRIPT_REGEX, '');
        }
    }));
    /**
     * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
     */
    exports.SanitizeValueConverter = class SanitizeValueConverter {
        constructor(sanitizer) {
            this.sanitizer = sanitizer;
            this.sanitizer = sanitizer;
        }
        /**
         * Process the provided markup that flows to the view.
         * @param untrustedMarkup The untrusted markup to be sanitized.
         */
        toView(untrustedMarkup) {
            if (untrustedMarkup === null || untrustedMarkup === undefined) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    };
    exports.SanitizeValueConverter = __decorate([
        valueConverter('sanitize'),
        kernel.inject(ISanitizer)
    ], exports.SanitizeValueConverter);

    //Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
    /*@internal*/
    function findOriginalEventTarget(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
    }
    function stopPropagation() {
        this.standardStopPropagation();
        this.propagationStopped = true;
    }
    function handleCapturedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget(event);
        const orderedCallbacks = [];
        /**
         * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
         */
        while (target) {
            if (target.capturedCallbacks) {
                const callback = target.capturedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    orderedCallbacks.push(callback);
                }
            }
            target = target.parentNode;
        }
        for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
            const orderedCallback = orderedCallbacks[i];
            if ('handleEvent' in orderedCallback) {
                orderedCallback.handleEvent(event);
            }
            else {
                orderedCallback(event);
            }
        }
    }
    function handleDelegatedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget(event);
        while (target && !event.propagationStopped) {
            if (target.delegatedCallbacks) {
                const callback = target.delegatedCallbacks[event.type];
                if (callback) {
                    if (event.stopPropagation !== stopPropagation) {
                        event.standardStopPropagation = event.stopPropagation;
                        event.stopPropagation = stopPropagation;
                    }
                    if ('handleEvent' in callback) {
                        callback.handleEvent(event);
                    }
                    else {
                        callback(event);
                    }
                }
            }
            target = target.parentNode;
        }
    }
    class ListenerTracker {
        constructor(eventName, listener, capture) {
            this.eventName = eventName;
            this.listener = listener;
            this.capture = capture;
            this.count = 0;
        }
        increment() {
            this.count++;
            if (this.count === 1) {
                DOM.addEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
        decrement() {
            this.count--;
            if (this.count === 0) {
                DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
    }
    /**
     * Enable dispose() pattern for `delegate` & `capture` commands
     */
    class DelegateOrCaptureSubscription {
        constructor(entry, lookup, targetEvent, callback) {
            this.entry = entry;
            this.lookup = lookup;
            this.targetEvent = targetEvent;
            lookup[targetEvent] = callback;
        }
        dispose() {
            this.entry.decrement();
            this.lookup[this.targetEvent] = null;
        }
    }
    /**
     * Enable dispose() pattern for addEventListener for `trigger`
     */
    class TriggerSubscription {
        constructor(target, targetEvent, callback) {
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            DOM.addEventListener(targetEvent, callback, target);
        }
        dispose() {
            DOM.removeEventListener(this.targetEvent, this.callback, this.target);
        }
    }
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(exports.DelegationStrategy || (exports.DelegationStrategy = {}));
    class EventSubscriber {
        constructor(events) {
            this.events = events;
            this.events = events;
            this.target = null;
            this.handler = null;
        }
        subscribe(node, callbackOrListener) {
            this.target = node;
            this.handler = callbackOrListener;
            const add = DOM.addEventListener;
            const events = this.events;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                add(events[i], callbackOrListener, node);
            }
        }
        dispose() {
            const node = this.target;
            const callbackOrListener = this.handler;
            const events = this.events;
            const remove = DOM.removeEventListener;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                remove(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        }
    }
    const IEventManager = kernel.DI.createInterface()
        .withDefault(x => x.singleton(EventManager));
    /*@internal*/
    class EventManager {
        constructor() {
            this.elementHandlerLookup = {};
            this.delegatedHandlers = {};
            this.capturedHandlers = {};
            this.registerElementConfiguration({
                tagName: 'INPUT',
                properties: {
                    value: ['change', 'input'],
                    checked: ['change', 'input'],
                    files: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'TEXTAREA',
                properties: {
                    value: ['change', 'input']
                }
            });
            this.registerElementConfiguration({
                tagName: 'SELECT',
                properties: {
                    value: ['change']
                }
            });
            this.registerElementConfiguration({
                tagName: 'content editable',
                properties: {
                    value: ['change', 'input', 'blur', 'keyup', 'paste']
                }
            });
            this.registerElementConfiguration({
                tagName: 'scrollable element',
                properties: {
                    scrollTop: ['scroll'],
                    scrollLeft: ['scroll']
                }
            });
        }
        registerElementConfiguration(config) {
            const properties = config.properties;
            const lookup = this.elementHandlerLookup[config.tagName] = {};
            for (const propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    lookup[propertyName] = properties[propertyName];
                }
            }
        }
        getElementHandler(target, propertyName) {
            const tagName = target['tagName'];
            const lookup = this.elementHandlerLookup;
            if (tagName) {
                if (lookup[tagName] && lookup[tagName][propertyName]) {
                    return new EventSubscriber(lookup[tagName][propertyName]);
                }
                if (propertyName === 'textContent' || propertyName === 'innerHTML') {
                    return new EventSubscriber(lookup['content editable'].value);
                }
                if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
                    return new EventSubscriber(lookup['scrollable element'][propertyName]);
                }
            }
            return null;
        }
        addEventListener(target, targetEvent, callbackOrListener, strategy) {
            let delegatedHandlers;
            let capturedHandlers;
            let handlerEntry;
            if (strategy === exports.DelegationStrategy.bubbling) {
                delegatedHandlers = this.delegatedHandlers;
                handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
                handlerEntry.increment();
                const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
            }
            if (strategy === exports.DelegationStrategy.capturing) {
                capturedHandlers = this.capturedHandlers;
                handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
                handlerEntry.increment();
                const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
                return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
            }
            return new TriggerSubscription(target, targetEvent, callbackOrListener);
        }
    }

    /*@internal*/
    function handleSelfEvent(event) {
        const target = findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        return this.selfEventCallSource(event);
    }
    exports.SelfBindingBehavior = class SelfBindingBehavior {
        bind(flags, scope, binding) {
            if (!binding.callSource || !binding.targetEvent) {
                throw kernel.Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        }
        unbind(flags, scope, binding) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        }
    };
    exports.SelfBindingBehavior = __decorate([
        bindingBehavior('self')
    ], exports.SelfBindingBehavior);

    exports.SignalBindingBehavior = class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding) {
            if (!binding.updateTarget) {
                throw kernel.Reporter.error(11);
            }
            if (arguments.length === 4) {
                const name = arguments[3];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                const names = Array.prototype.slice.call(arguments, 3);
                let i = names.length;
                while (i--) {
                    const name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw kernel.Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            const name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                const names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    };
    exports.SignalBindingBehavior = __decorate([
        bindingBehavior('signal'),
        kernel.inject(ISignaler)
    ], exports.SignalBindingBehavior);

    /*@internal*/
    function throttle(newValue) {
        const state = this.throttleState;
        const elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === null) {
            state.timeoutId = setTimeout(() => {
                state.timeoutId = null;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
        }
    }
    exports.ThrottleBindingBehavior = class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof exports.Binding) {
                if (binding.mode === exports.BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            // replace the original method with the throttling version.
            binding[methodToThrottle] = throttle;
            // create the throttle state.
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: null
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    };
    exports.ThrottleBindingBehavior = __decorate([
        bindingBehavior('throttle')
    ], exports.ThrottleBindingBehavior);

    function flush$1() {
        this.callBatchedSubscribers(this.indexMap);
        this.resetIndexMap();
    }
    function dispose$2() {
        this.collection.$observer = undefined;
        this.collection = null;
        this.indexMap = null;
    }
    function resetIndexMapIndexed() {
        const len = this.collection.length;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function resetIndexMapKeyed() {
        const len = this.collection.size;
        const indexMap = (this.indexMap = Array(len));
        let i = 0;
        while (i < len) {
            indexMap[i] = i++;
        }
        indexMap.deletedItems = [];
    }
    function getLengthObserver() {
        return this.lengthObserver || (this.lengthObserver = new exports.CollectionLengthObserver(this, this.lengthPropertyName));
    }
    function collectionObserver(kind) {
        return function (target) {
            subscriberCollection(exports.MutationKind.collection)(target);
            batchedSubscriberCollection()(target);
            const proto = target.prototype;
            proto.$nextFlush = null;
            proto.collection = null;
            proto.indexMap = null;
            proto.hasChanges = false;
            proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
            proto.collectionKind = kind;
            proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
            proto.flush = flush$1;
            proto.dispose = dispose$2;
            proto.getLengthObserver = getLengthObserver;
            proto.subscribe = proto.subscribe || proto.addSubscriber;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
            proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
        };
    }
    exports.CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
    };
    exports.CollectionLengthObserver = __decorate([
        targetObserver()
    ], exports.CollectionLengthObserver);

    const proto = Array.prototype;
    const nativePush = proto.push; // TODO: probably want to make these internal again
    const nativeUnshift = proto.unshift;
    const nativePop = proto.pop;
    const nativeShift = proto.shift;
    const nativeSplice = proto.splice;
    const nativeReverse = proto.reverse;
    const nativeSort = proto.sort;
    // https://tc39.github.io/ecma262/#sec-array.prototype.push
    function observePush() {
        const o = this.$observer;
        if (o === undefined) {
            return nativePush.apply(this, arguments);
        }
        const len = this.length;
        const argCount = arguments.length;
        if (argCount === 0) {
            return len;
        }
        this.length = o.indexMap.length = len + argCount;
        let i = len;
        while (i < this.length) {
            this[i] = arguments[i - len];
            o.indexMap[i] = -2;
            i++;
        }
        o.callSubscribers('push', arguments, exports.LifecycleFlags.isCollectionMutation);
        return this.length;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
    function observeUnshift() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeUnshift.apply(this, arguments);
        }
        const argCount = arguments.length;
        const inserts = new Array(argCount);
        let i = 0;
        while (i < argCount) {
            inserts[i++] = -2;
        }
        nativeUnshift.apply(o.indexMap, inserts);
        const len = nativeUnshift.apply(this, arguments);
        o.callSubscribers('unshift', arguments, exports.LifecycleFlags.isCollectionMutation);
        return len;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.pop
    function observePop() {
        const o = this.$observer;
        if (o === undefined) {
            return nativePop.call(this);
        }
        const indexMap = o.indexMap;
        const element = nativePop.call(this);
        // only mark indices as deleted if they actually existed in the original array
        const index = indexMap.length - 1;
        if (indexMap[index] > -1) {
            nativePush.call(indexMap.deletedItems, element);
        }
        nativePop.call(indexMap);
        o.callSubscribers('pop', arguments, exports.LifecycleFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    function observeShift() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeShift.call(this);
        }
        const indexMap = o.indexMap;
        const element = nativeShift.call(this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            nativePush.call(indexMap.deletedItems, element);
        }
        nativeShift.call(indexMap);
        o.callSubscribers('shift', arguments, exports.LifecycleFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    function observeSplice(start, deleteCount) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSplice.apply(this, arguments);
        }
        const indexMap = o.indexMap;
        if (deleteCount > 0) {
            let i = isNaN(start) ? 0 : start;
            const to = i + deleteCount;
            while (i < to) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, this[i]);
                }
                i++;
            }
        }
        const argCount = arguments.length;
        if (argCount > 2) {
            const itemCount = argCount - 2;
            const inserts = new Array(itemCount);
            let i = 0;
            while (i < itemCount) {
                inserts[i++] = -2;
            }
            nativeSplice.call(indexMap, start, deleteCount, ...inserts);
        }
        else if (argCount === 2) {
            nativeSplice.call(indexMap, start, deleteCount);
        }
        const deleted = nativeSplice.apply(this, arguments);
        o.callSubscribers('splice', arguments, exports.LifecycleFlags.isCollectionMutation);
        return deleted;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    function observeReverse() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeReverse.call(this);
        }
        const len = this.length;
        const middle = (len / 2) | 0;
        let lower = 0;
        while (lower !== middle) {
            const upper = len - lower - 1;
            const lowerValue = this[lower];
            const lowerIndex = o.indexMap[lower];
            const upperValue = this[upper];
            const upperIndex = o.indexMap[upper];
            this[lower] = upperValue;
            o.indexMap[lower] = upperIndex;
            this[upper] = lowerValue;
            o.indexMap[upper] = lowerIndex;
            lower++;
        }
        o.callSubscribers('reverse', arguments, exports.LifecycleFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    // https://github.com/v8/v8/blob/master/src/js/array.js
    function observeSort(compareFn) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSort.call(this, compareFn);
        }
        const len = this.length;
        if (len < 2) {
            return this;
        }
        quickSort(this, o.indexMap, 0, len, preSortCompare);
        let i = 0;
        while (i < len) {
            if (this[i] === undefined) {
                break;
            }
            i++;
        }
        if (compareFn === undefined || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
            compareFn = sortCompare;
        }
        quickSort(this, o.indexMap, 0, i, compareFn);
        o.callSubscribers('sort', arguments, exports.LifecycleFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-sortcompare
    function sortCompare(x, y) {
        if (x === y) {
            return 0;
        }
        x = x === null ? 'null' : x.toString();
        y = y === null ? 'null' : y.toString();
        return x < y ? -1 : 1;
    }
    function preSortCompare(x, y) {
        if (x === undefined) {
            if (y === undefined) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === undefined) {
            return -1;
        }
        return 0;
    }
    function insertionSort(arr, indexMap, fromIndex, toIndex, compareFn) {
        let velement, ielement, vtmp, itmp, order;
        let i, j;
        for (i = fromIndex + 1; i < toIndex; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            for (j = i - 1; j >= fromIndex; j--) {
                vtmp = arr[j];
                itmp = indexMap[j];
                order = compareFn(vtmp, velement);
                if (order > 0) {
                    arr[j + 1] = vtmp;
                    indexMap[j + 1] = itmp;
                }
                else {
                    break;
                }
            }
            arr[j + 1] = velement;
            indexMap[j + 1] = ielement;
        }
    }
    function quickSort(arr, indexMap, fromIndex, toIndex, compareFn) {
        let thirdIndex = 0, i = 0;
        let v0, v1, v2;
        let i0, i1, i2;
        let c01, c02, c12;
        let vtmp, itmp;
        let vpivot, ipivot, lowEnd, highStart;
        let velement, ielement, order, vtopElement;
        // tslint:disable-next-line:no-constant-condition
        while (true) {
            if (toIndex - fromIndex <= 10) {
                insertionSort(arr, indexMap, fromIndex, toIndex, compareFn);
                return;
            }
            thirdIndex = fromIndex + ((toIndex - fromIndex) >> 1);
            v0 = arr[fromIndex];
            i0 = indexMap[fromIndex];
            v1 = arr[toIndex - 1];
            i1 = indexMap[toIndex - 1];
            v2 = arr[thirdIndex];
            i2 = indexMap[thirdIndex];
            c01 = compareFn(v0, v1);
            if (c01 > 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v1;
                i0 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            c02 = compareFn(v0, v2);
            if (c02 >= 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v2;
                i0 = i2;
                v2 = v1;
                i2 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            else {
                c12 = compareFn(v1, v2);
                if (c12 > 0) {
                    vtmp = v1;
                    itmp = i1;
                    v1 = v2;
                    i1 = i2;
                    v2 = vtmp;
                    i2 = itmp;
                }
            }
            arr[fromIndex] = v0;
            indexMap[fromIndex] = i0;
            arr[toIndex - 1] = v2;
            indexMap[toIndex - 1] = i2;
            vpivot = v1;
            ipivot = i1;
            lowEnd = fromIndex + 1;
            highStart = toIndex - 1;
            arr[thirdIndex] = arr[lowEnd];
            indexMap[thirdIndex] = indexMap[lowEnd];
            arr[lowEnd] = vpivot;
            indexMap[lowEnd] = ipivot;
            partition: for (i = lowEnd + 1; i < highStart; i++) {
                velement = arr[i];
                ielement = indexMap[i];
                order = compareFn(velement, vpivot);
                if (order < 0) {
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
                else if (order > 0) {
                    do {
                        highStart--;
                        // tslint:disable-next-line:triple-equals
                        if (highStart == i) {
                            break partition;
                        }
                        vtopElement = arr[highStart];
                        order = compareFn(vtopElement, vpivot);
                    } while (order > 0);
                    arr[i] = arr[highStart];
                    indexMap[i] = indexMap[highStart];
                    arr[highStart] = velement;
                    indexMap[highStart] = ielement;
                    if (order < 0) {
                        velement = arr[i];
                        ielement = indexMap[i];
                        arr[i] = arr[lowEnd];
                        indexMap[i] = indexMap[lowEnd];
                        arr[lowEnd] = velement;
                        indexMap[lowEnd] = ielement;
                        lowEnd++;
                    }
                }
            }
            if (toIndex - highStart < lowEnd - fromIndex) {
                quickSort(arr, indexMap, highStart, toIndex, compareFn);
                toIndex = lowEnd;
            }
            else {
                quickSort(arr, indexMap, fromIndex, lowEnd, compareFn);
                fromIndex = highStart;
            }
        }
    }
    for (const observe of [observePush, observeUnshift, observePop, observeShift, observeSplice, observeReverse, observeSort]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableArrayObservation() {
        if (proto.push['observing'] !== true)
            proto.push = observePush;
        if (proto.unshift['observing'] !== true)
            proto.unshift = observeUnshift;
        if (proto.pop['observing'] !== true)
            proto.pop = observePop;
        if (proto.shift['observing'] !== true)
            proto.shift = observeShift;
        if (proto.splice['observing'] !== true)
            proto.splice = observeSplice;
        if (proto.reverse['observing'] !== true)
            proto.reverse = observeReverse;
        if (proto.sort['observing'] !== true)
            proto.sort = observeSort;
    }
    enableArrayObservation();
    function disableArrayObservation() {
        if (proto.push['observing'] === true)
            proto.push = nativePush;
        if (proto.unshift['observing'] === true)
            proto.unshift = nativeUnshift;
        if (proto.pop['observing'] === true)
            proto.pop = nativePop;
        if (proto.shift['observing'] === true)
            proto.shift = nativeShift;
        if (proto.splice['observing'] === true)
            proto.splice = nativeSplice;
        if (proto.reverse['observing'] === true)
            proto.reverse = nativeReverse;
        if (proto.sort['observing'] === true)
            proto.sort = nativeSort;
    }
    exports.ArrayObserver = class ArrayObserver {
        constructor(lifecycle, array) {
            this.lifecycle = lifecycle;
            array.$observer = this;
            this.collection = array;
            this.resetIndexMap();
        }
    };
    exports.ArrayObserver = __decorate([
        collectionObserver(9 /* array */)
    ], exports.ArrayObserver);
    function getArrayObserver(lifecycle, array) {
        return array.$observer || new exports.ArrayObserver(lifecycle, array);
    }

    function computed(config) {
        return function (target, key) {
            (target.computed || (target.computed = {}))[key] = config;
        };
    }
    const noProxy = !(typeof Proxy !== undefined);
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(observerLocator, dirtyChecker, lifecycle, 
    // tslint:disable-next-line:no-reserved-keywords
    instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = instance.constructor.computed
                ? instance.constructor.computed[propertyName] || computedOverrideDefaults
                : computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return noProxy
                        ? dirtyChecker.createProperty(instance, propertyName)
                        : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
                }
                return new exports.CustomSetterObserver(instance, propertyName, descriptor, lifecycle);
            }
            return noProxy
                ? dirtyChecker.createProperty(instance, propertyName)
                : new exports.GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
        }
        throw kernel.Reporter.error(18, propertyName);
    }
    // Used when the getter is dependent solely on changes that happen within the setter.
    exports.CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor, lifecycle) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.lifecycle = lifecycle;
            this.$nextFlush = null;
            this.observing = false;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
        }
        subscribe(subscriber) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        convertProperty() {
            const setter = this.descriptor.set;
            const that = this;
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            Reflect.defineProperty(this.obj, this.propertyKey, {
                set: function (newValue) {
                    setter.call(that.obj, newValue);
                    const oldValue = this.currentValue;
                    if (oldValue !== newValue) {
                        that.oldValue = oldValue;
                        this.lifecycle.queueFlush(that);
                        that.currentValue = newValue;
                    }
                }
            });
        }
    };
    exports.CustomSetterObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.CustomSetterObserver);
    exports.CustomSetterObserver.prototype.dispose = kernel.PLATFORM.noop;
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /*@internal*/
    exports.GetterObserver = class GetterObserver {
        constructor(overrides, obj, propertyKey, descriptor, observerLocator, lifecycle) {
            this.overrides = overrides;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.observerLocator = observerLocator;
            this.lifecycle = lifecycle;
            this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, lifecycle);
        }
        getValue() {
            return this.controller.value;
        }
        // tslint:disable-next-line:no-empty
        setValue(newValue) { }
        flush(flags) {
            const oldValue = this.controller.value;
            const newValue = this.controller.getValueAndCollectDependencies();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
            }
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            this.controller.onSubscriberAdded();
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            this.controller.onSubscriberRemoved();
        }
    };
    exports.GetterObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.GetterObserver);
    exports.GetterObserver.prototype.dispose = kernel.PLATFORM.noop;
    /*@internal*/
    class GetterController {
        constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, lifecycle) {
            this.overrides = overrides;
            this.instance = instance;
            this.propertyName = propertyName;
            this.owner = owner;
            this.lifecycle = lifecycle;
            this.isCollecting = false;
            this.dependencies = [];
            this.subscriberCount = 0;
            const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
            const getter = descriptor.get;
            const ctrl = this;
            Reflect.defineProperty(instance, propertyName, {
                get: function () {
                    if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                        ctrl.value = getter.apply(proxy);
                    }
                    return ctrl.value;
                }
            });
        }
        addDependency(subscribable) {
            if (this.dependencies.includes(subscribable)) {
                return;
            }
            this.dependencies.push(subscribable);
        }
        onSubscriberAdded() {
            this.subscriberCount++;
            if (this.subscriberCount > 1) {
                return;
            }
            this.getValueAndCollectDependencies(true);
        }
        getValueAndCollectDependencies(requireCollect = false) {
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.value = this.instance[this.propertyName]; // triggers observer collection
            if (dynamicDependencies) {
                this.isCollecting = false;
                this.dependencies.forEach(x => { x.subscribe(this); });
            }
            return this.value;
        }
        onSubscriberRemoved() {
            this.subscriberCount--;
            if (this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            this.lifecycle.enqueueFlush(this.owner);
        }
        unsubscribeAllDependencies() {
            this.dependencies.forEach(x => { x.unsubscribe(this); });
            this.dependencies.length = 0;
        }
    }
    function createGetterTraps(observerLocator, controller) {
        return {
            get: function (instance, key) {
                const value = instance[key];
                if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                    return value;
                }
                // TODO: fix this
                if (instance instanceof Array) {
                    controller.addDependency(observerLocator.getArrayObserver(instance));
                    if (key === 'length') {
                        controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Map) {
                    controller.addDependency(observerLocator.getMapObserver(instance));
                    if (key === 'size') {
                        controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Set) {
                    controller.addDependency(observerLocator.getSetObserver(instance));
                    if (key === 'size') {
                        return observerLocator.getSetObserver(instance).getLengthObserver();
                    }
                }
                else {
                    controller.addDependency(observerLocator.getObserver(instance, key));
                }
                return proxyOrValue(observerLocator, controller, value);
            }
        };
    }
    function proxyOrValue(observerLocator, controller, value) {
        if (!(value instanceof Object)) {
            return value;
        }
        return new Proxy(value, createGetterTraps(observerLocator, controller));
    }

    const IDirtyChecker = kernel.DI.createInterface()
        .withDefault(x => x.singleton(DirtyChecker));
    /*@internal*/
    class DirtyChecker {
        constructor() {
            this.tracked = [];
            this.checkDelay = 120;
        }
        createProperty(obj, propertyName) {
            return new exports.DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            const tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        }
        removeProperty(property) {
            const tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        }
        scheduleDirtyCheck() {
            setTimeout(() => { this.check(); }, this.checkDelay);
        }
        check() {
            const tracked = this.tracked;
            let i = tracked.length;
            while (i--) {
                const current = tracked[i];
                if (current.isDirty()) {
                    current.flush(exports.LifecycleFlags.fromFlush);
                }
            }
            if (tracked.length) {
                this.scheduleDirtyCheck();
            }
        }
    }
    /*@internal*/
    exports.DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            this.dirtyChecker = dirtyChecker;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flush(flags) {
            const oldValue = this.oldValue;
            const newValue = this.getValue();
            this.callSubscribers(newValue, oldValue, flags | exports.LifecycleFlags.updateTargetInstance);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.dirtyChecker.addProperty(this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.dirtyChecker.removeProperty(this);
            }
        }
    };
    exports.DirtyCheckProperty = __decorate([
        propertyObserver()
    ], exports.DirtyCheckProperty);

    const inputValueDefaults = {
        ['button']: '',
        ['checkbox']: 'on',
        ['color']: '#000000',
        ['date']: '',
        ['datetime-local']: '',
        ['email']: '',
        ['file']: '',
        ['hidden']: '',
        ['image']: '',
        ['month']: '',
        ['number']: '',
        ['password']: '',
        ['radio']: 'on',
        ['range']: '50',
        ['reset']: '',
        ['search']: '',
        ['submit']: '',
        ['tel']: '',
        ['text']: '',
        ['time']: '',
        ['url']: '',
        ['week']: ''
    };
    const handleEventFlags = exports.LifecycleFlags.fromDOMEvent | exports.LifecycleFlags.updateSourceExpression;
    exports.ValueAttributeObserver = class ValueAttributeObserver {
        constructor(lifecycle, obj, propertyKey, handler) {
            // note: input.files can be assigned and this was fixed in Firefox 57:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.handler = handler;
            // input.value (for type='file') however, can only be assigned an empty string
            if (propertyKey === 'value') {
                const nodeType = obj['type'];
                this.defaultValue = inputValueDefaults[nodeType || 'text'];
                if (nodeType === 'file') {
                    this.flush = this.flushFileChanges;
                }
            }
            else {
                this.defaultValue = '';
            }
            this.oldValue = this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue, flags) {
            this.obj[this.propertyKey] = newValue;
            if (flags & exports.LifecycleFlags.fromBind) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const newValue = this.currentValue = this.getValue();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, handleEventFlags);
                this.oldValue = newValue;
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        flushFileChanges() {
            const currentValue = this.currentValue;
            if (this.oldValue !== currentValue) {
                if (currentValue === '') {
                    this.setValueCore(currentValue, this.currentFlags);
                    this.oldValue = this.currentValue;
                }
            }
        }
    };
    exports.ValueAttributeObserver = __decorate([
        targetObserver('')
    ], exports.ValueAttributeObserver);
    exports.ValueAttributeObserver.prototype.propertyKey = '';
    exports.ValueAttributeObserver.prototype.handler = null;
    const defaultHandleBatchedChangeFlags = exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.updateTargetInstance;
    exports.CheckedObserver = class CheckedObserver {
        constructor(lifecycle, obj, handler, observerLocator) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            if (!this.valueObserver) {
                this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
                if (this.valueObserver) {
                    this.valueObserver.subscribe(this);
                }
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeElement();
        }
        // handleBatchedCollectionChange (todo: rename to make this explicit?)
        handleBatchedChange() {
            this.synchronizeElement();
            this.notify(defaultHandleBatchedChangeFlags);
        }
        // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
        handleChange(newValue, previousValue, flags) {
            this.synchronizeElement();
            this.notify(flags);
        }
        synchronizeElement() {
            const value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            const isRadio = element.type === 'radio';
            const matcher = element['matcher'] || ((a, b) => a === b);
            if (isRadio) {
                element.checked = !!matcher(value, elementValue);
            }
            else if (value === true) {
                element.checked = true;
            }
            else if (Array.isArray(value)) {
                element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else {
                element.checked = false;
            }
        }
        notify(flags) {
            if (flags & exports.LifecycleFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            let value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            let index;
            const matcher = element['matcher'] || defaultMatcher;
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    index = value.findIndex(item => !!matcher(item, elementValue));
                    if (element.checked && index === -1) {
                        value.push(elementValue);
                    }
                    else if (!element.checked && index !== -1) {
                        value.splice(index, 1);
                    }
                    // when existing value is array, do not invoke callback as only the array element has changed
                    return;
                }
                value = element.checked;
            }
            else if (element.checked) {
                value = elementValue;
            }
            else {
                return;
            }
            this.oldValue = this.currentValue;
            this.currentValue = value;
            this.notify(handleEventFlags);
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        unbind() {
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.valueObserver) {
                this.valueObserver.unsubscribe(this);
            }
        }
    };
    exports.CheckedObserver = __decorate([
        targetObserver()
    ], exports.CheckedObserver);
    exports.CheckedObserver.prototype.handler = null;
    exports.CheckedObserver.prototype.observerLocator = null;
    const childObserverOptions = {
        childList: true,
        subtree: true,
        characterData: true
    };
    function defaultMatcher(a, b) {
        return a === b;
    }
    exports.SelectValueObserver = class SelectValueObserver {
        constructor(lifecycle, obj, handler, observerLocator) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            const isArray = Array.isArray(newValue);
            if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (isArray) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeOptions();
            this.notify(flags);
        }
        // called when the array mutated (items sorted/added/removed, etc)
        handleBatchedChange(indexMap) {
            // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
            // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
            this.synchronizeOptions(indexMap);
        }
        // called when a different value was assigned
        handleChange(newValue, previousValue, flags) {
            this.setValue(newValue, flags);
        }
        notify(flags) {
            if (flags & exports.LifecycleFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(newValue, oldValue, flags);
        }
        handleEvent() {
            // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags);
            }
        }
        synchronizeOptions(indexMap) {
            const currentValue = this.currentValue;
            const isArray = Array.isArray(currentValue);
            const obj = this.obj;
            const matcher = obj.matcher || defaultMatcher;
            const options = obj.options;
            let i = options.length;
            while (i--) {
                const option = options[i];
                const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                if (isArray) {
                    option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                    continue;
                }
                option.selected = !!matcher(optionValue, currentValue);
            }
        }
        synchronizeValue() {
            // Spec for synchronizing value from `SelectObserver` to `<select/>`
            // When synchronizing value to observed <select/> element, do the following steps:
            // A. If `<select/>` is multiple
            //    1. Check if current value, called `currentValue` is an array
            //      a. If not an array, return true to signal value has changed
            //      b. If is an array:
            //        i. gather all current selected <option/>, in to array called `values`
            //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
            //        iii. loop through the `values` array and add items that are selected based on matcher
            //        iv. Return false to signal value hasn't changed
            // B. If the select is single
            //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
            //    2. assign `this.currentValue` to `this.oldValue`
            //    3. assign `value` to `this.currentValue`
            //    4. return `true` to signal value has changed
            const obj = this.obj;
            const options = obj.options;
            const len = options.length;
            const currentValue = this.currentValue;
            let i = 0;
            if (obj.multiple) {
                // A.
                if (!Array.isArray(currentValue)) {
                    // A.1.a
                    return true;
                }
                // A.1.b
                // multi select
                let option;
                const matcher = obj.matcher || defaultMatcher;
                // A.1.b.i
                const values = [];
                while (i < len) {
                    option = options[i];
                    if (option.selected) {
                        values.push(option.hasOwnProperty('model')
                            ? option.model
                            : option.value);
                    }
                    ++i;
                }
                // A.1.b.ii
                i = 0;
                while (i < currentValue.length) {
                    const a = currentValue[i];
                    // Todo: remove arrow fn
                    if (values.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.splice(i, 1);
                    }
                    else {
                        ++i;
                    }
                }
                // A.1.b.iii
                i = 0;
                while (i < values.length) {
                    const a = values[i];
                    // Todo: remove arrow fn
                    if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.push(a);
                    }
                    ++i;
                }
                // A.1.b.iv
                return false;
            }
            // B. single select
            // B.1
            let value = null;
            while (i < len) {
                const option = options[i];
                if (option.selected) {
                    value = option.hasOwnProperty('model')
                        ? option.model
                        : option.value;
                    break;
                }
                ++i;
            }
            // B.2
            this.oldValue = this.currentValue;
            // B.3
            this.currentValue = value;
            // B.4
            return true;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        bind() {
            this.nodeObserver = DOM.createNodeObserver(this.obj, this.handleNodeChange.bind(this), childObserverOptions);
        }
        unbind() {
            this.nodeObserver.disconnect();
            this.nodeObserver = null;
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
        }
        handleNodeChange() {
            this.synchronizeOptions();
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags);
            }
        }
    };
    exports.SelectValueObserver = __decorate([
        targetObserver()
    ], exports.SelectValueObserver);
    exports.SelectValueObserver.prototype.handler = null;
    exports.SelectValueObserver.prototype.observerLocator = null;

    const proto$1 = Map.prototype;
    const nativeSet = proto$1.set; // TODO: probably want to make these internal again
    const nativeClear = proto$1.clear;
    const nativeDelete = proto$1.delete;
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-map.prototype.map
    function observeSet(key, value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeSet.call(this, key, value);
        }
        const oldSize = this.size;
        nativeSet.call(this, key, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            let i = 0;
            for (const entry of this.entries()) {
                if (entry[0] === key) {
                    if (entry[1] !== value) {
                        o.indexMap[i] = -2;
                    }
                    return this;
                }
                i++;
            }
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.callSubscribers('set', arguments, exports.LifecycleFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-map.prototype.clear
    function observeClear() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeClear.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            for (const entry of this.keys()) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                i++;
            }
            nativeClear.call(this);
            indexMap.length = 0;
            o.callSubscribers('clear', arguments, exports.LifecycleFlags.isCollectionMutation);
        }
        return undefined;
    }
    // https://tc39.github.io/ecma262/#sec-map.prototype.delete
    function observeDelete(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeDelete.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                nativeSplice.call(indexMap, i, 1);
                return nativeDelete.call(this, value);
            }
            i++;
        }
        o.callSubscribers('delete', arguments, exports.LifecycleFlags.isCollectionMutation);
        return false;
    }
    for (const observe of [observeSet, observeClear, observeDelete]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableMapObservation() {
        if (proto$1.set['observing'] !== true)
            proto$1.set = observeSet;
        if (proto$1.clear['observing'] !== true)
            proto$1.clear = observeClear;
        if (proto$1.delete['observing'] !== true)
            proto$1.delete = observeDelete;
    }
    enableMapObservation();
    function disableMapObservation() {
        if (proto$1.set['observing'] === true)
            proto$1.set = nativeSet;
        if (proto$1.clear['observing'] === true)
            proto$1.clear = nativeClear;
        if (proto$1.delete['observing'] === true)
            proto$1.delete = nativeDelete;
    }
    exports.MapObserver = class MapObserver {
        constructor(lifecycle, map) {
            this.lifecycle = lifecycle;
            map.$observer = this;
            this.collection = map;
            this.resetIndexMap();
        }
    };
    exports.MapObserver = __decorate([
        collectionObserver(6 /* map */)
    ], exports.MapObserver);
    function getMapObserver(lifecycle, map) {
        return map.$observer || new exports.MapObserver(lifecycle, map);
    }

    const proto$2 = Set.prototype;
    const nativeAdd = proto$2.add; // TODO: probably want to make these internal again
    const nativeClear$1 = proto$2.clear;
    const nativeDelete$1 = proto$2.delete;
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    function observeAdd(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeAdd.call(this, value);
        }
        const oldSize = this.size;
        nativeAdd.call(this, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.callSubscribers('add', arguments, exports.LifecycleFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    function observeClear$1() {
        const o = this.$observer;
        if (o === undefined) {
            return nativeClear$1.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            for (const entry of this.keys()) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                i++;
            }
            nativeClear$1.call(this);
            indexMap.length = 0;
            o.callSubscribers('clear', arguments, exports.LifecycleFlags.isCollectionMutation);
        }
        return undefined;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    function observeDelete$1(value) {
        const o = this.$observer;
        if (o === undefined) {
            return nativeDelete$1.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    nativePush.call(indexMap.deletedItems, entry);
                }
                nativeSplice.call(indexMap, i, 1);
                return nativeDelete$1.call(this, value);
            }
            i++;
        }
        o.callSubscribers('delete', arguments, exports.LifecycleFlags.isCollectionMutation);
        return false;
    }
    for (const observe of [observeAdd, observeClear$1, observeDelete$1]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableSetObservation() {
        if (proto$2.add['observing'] !== true)
            proto$2.add = observeAdd;
        if (proto$2.clear['observing'] !== true)
            proto$2.clear = observeClear$1;
        if (proto$2.delete['observing'] !== true)
            proto$2.delete = observeDelete$1;
    }
    enableSetObservation();
    function disableSetObservation() {
        if (proto$2.add['observing'] === true)
            proto$2.add = nativeAdd;
        if (proto$2.clear['observing'] === true)
            proto$2.clear = nativeClear$1;
        if (proto$2.delete['observing'] === true)
            proto$2.delete = nativeDelete$1;
    }
    exports.SetObserver = class SetObserver {
        constructor(lifecycle, observedSet) {
            this.lifecycle = lifecycle;
            observedSet.$observer = this;
            this.collection = observedSet;
            this.resetIndexMap();
        }
    };
    exports.SetObserver = __decorate([
        collectionObserver(7 /* set */)
    ], exports.SetObserver);
    function getSetObserver(lifecycle, observedSet) {
        return observedSet.$observer || new exports.SetObserver(lifecycle, observedSet);
    }

    const ISVGAnalyzer = kernel.DI.createInterface()
        .withDefault(x => x.singleton(class {
        isStandardSvgAttribute(node, attributeName) {
            return false;
        }
    }));

    const toStringTag$1 = Object.prototype.toString;
    const IObserverLocator = kernel.DI.createInterface()
        .withDefault(x => x.singleton(exports.ObserverLocator));
    function getPropertyDescriptor(subject, name) {
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    exports.ObserverLocator = 
    /*@internal*/
    class ObserverLocator {
        constructor(lifecycle, eventManager, dirtyChecker, svgAnalyzer) {
            this.lifecycle = lifecycle;
            this.eventManager = eventManager;
            this.dirtyChecker = dirtyChecker;
            this.svgAnalyzer = svgAnalyzer;
            this.adapters = [];
        }
        getObserver(obj, propertyName) {
            if (obj.$synthetic === true) {
                return obj.getObservers().getOrCreate(obj, propertyName);
            }
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(obj, propertyName);
            if (!observer.doNotCache) {
                if (observersLookup === undefined) {
                    observersLookup = this.getOrCreateObserversLookup(obj);
                }
                observersLookup[propertyName] = observer;
            }
            return observer;
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getAccessor(obj, propertyName) {
            if (DOM.isNodeInstance(obj)) {
                const tagName = obj['tagName'];
                // this check comes first for hot path optimization
                if (propertyName === 'textContent') {
                    return new exports.ElementPropertyAccessor(this.lifecycle, obj, propertyName);
                }
                // TODO: optimize and make pluggable
                if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
                    || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
                    || propertyName === 'checked' && tagName === 'INPUT'
                    || propertyName === 'model' && tagName === 'INPUT'
                    || /^xlink:.+$/.exec(propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                if (/^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
                    || tagName === 'IMG' && propertyName === 'src'
                    || tagName === 'A' && propertyName === 'href') {
                    return new exports.DataAttributeAccessor(this.lifecycle, obj, propertyName);
                }
                return new exports.ElementPropertyAccessor(this.lifecycle, obj, propertyName);
            }
            return new PropertyAccessor(obj, propertyName);
        }
        getArrayObserver(observedArray) {
            return getArrayObserver(this.lifecycle, observedArray);
        }
        getMapObserver(observedMap) {
            return getMapObserver(this.lifecycle, observedMap);
        }
        getSetObserver(observedSet) {
            return getSetObserver(this.lifecycle, observedSet);
        }
        getOrCreateObserversLookup(obj) {
            return obj.$observers || this.createObserversLookup(obj);
        }
        createObserversLookup(obj) {
            const value = {};
            if (!Reflect.defineProperty(obj, '$observers', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: value
            })) {
                kernel.Reporter.write(0, obj);
            }
            return value;
        }
        getAdapterObserver(obj, propertyName, descriptor) {
            for (let i = 0, ii = this.adapters.length; i < ii; i++) {
                const adapter = this.adapters[i];
                const observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        }
        createPropertyObserver(obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new PrimitiveObserver(obj, propertyName);
            }
            let isNode;
            if (DOM.isNodeInstance(obj)) {
                if (propertyName === 'class') {
                    return new exports.ClassAttributeAccessor(this.lifecycle, obj);
                }
                if (propertyName === 'style' || propertyName === 'css') {
                    return new exports.StyleAttributeAccessor(this.lifecycle, obj);
                }
                const tagName = obj['tagName'];
                const handler = this.eventManager.getElementHandler(obj, propertyName);
                if (propertyName === 'value' && tagName === 'SELECT') {
                    return new exports.SelectValueObserver(this.lifecycle, obj, handler, this);
                }
                if (propertyName === 'checked' && tagName === 'INPUT') {
                    return new exports.CheckedObserver(this.lifecycle, obj, handler, this);
                }
                if (handler) {
                    return new exports.ValueAttributeObserver(this.lifecycle, obj, propertyName, handler);
                }
                const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
                if (xlinkResult) {
                    return new exports.XLinkAttributeAccessor(this.lifecycle, obj, propertyName, xlinkResult[1]);
                }
                if (propertyName === 'role'
                    || /^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
                    return new exports.DataAttributeAccessor(this.lifecycle, obj, propertyName);
                }
                isNode = true;
            }
            const tag = toStringTag$1.call(obj);
            switch (tag) {
                case '[object Array]':
                    if (propertyName === 'length') {
                        return this.getArrayObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor) {
                if (descriptor.get || descriptor.set) {
                    if (descriptor.get && descriptor.get.getObserver) {
                        return descriptor.get.getObserver(obj);
                    }
                    // attempt to use an adapter before resorting to dirty checking.
                    const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                    if (adapterObserver) {
                        return adapterObserver;
                    }
                    if (isNode) {
                        // TODO: use MutationObserver
                        return this.dirtyChecker.createProperty(obj, propertyName);
                    }
                    return createComputedObserver(this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
                }
            }
            return new exports.SetterObserver(obj, propertyName);
        }
    };
    exports.ObserverLocator = __decorate([
        kernel.inject(ILifecycle, IEventManager, IDirtyChecker, ISVGAnalyzer)
        /*@internal*/
    ], exports.ObserverLocator);
    function getCollectionObserver(lifecycle, collection) {
        switch (toStringTag$1.call(collection)) {
            case '[object Array]':
                return getArrayObserver(lifecycle, collection);
            case '[object Map]':
                return getMapObserver(lifecycle, collection);
            case '[object Set]':
                return getSetObserver(lifecycle, collection);
        }
        return null;
    }

    exports.UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        bind(flags, scope, binding, ...events) {
            if (events.length === 0) {
                throw kernel.Reporter.error(9);
            }
            if (binding.mode !== exports.BindingMode.twoWay && binding.mode !== exports.BindingMode.fromView) {
                throw kernel.Reporter.error(10);
            }
            // ensure the binding's target observer has been set.
            const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw kernel.Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            // stash the original element subscribe function.
            targetObserver.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver.handler = new EventSubscriber(events);
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        }
    };
    exports.UpdateTriggerBindingBehavior = __decorate([
        bindingBehavior('updateTrigger'),
        kernel.inject(IObserverLocator)
    ], exports.UpdateTriggerBindingBehavior);

    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.locator = locator;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.targetObserver = observerLocator.getObserver(target, targetProperty);
        }
        callSource(args) {
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(exports.LifecycleFlags.mustEvaluate, this.$scope, this.locator);
            for (const prop in args) {
                delete overrideContext[prop];
            }
            return result;
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue($args => this.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.targetObserver.setValue(null, flags);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }

    const IExpressionParser = kernel.DI.createInterface()
        .withDefault(x => x.singleton(ExpressionParser));
    /*@internal*/
    class ExpressionParser {
        constructor() {
            this.expressionLookup = Object.create(null);
            this.interpolationLookup = Object.create(null);
            this.forOfLookup = Object.create(null);
        }
        parse(expression, bindingType) {
            switch (bindingType) {
                case 2048 /* Interpolation */:
                    {
                        let found = this.interpolationLookup[expression];
                        if (found === undefined) {
                            found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
                case 539 /* ForCommand */:
                    {
                        let found = this.forOfLookup[expression];
                        if (found === undefined) {
                            found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
                default:
                    {
                        // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                        // But don't cache it, because empty strings are always invalid for any other type of binding
                        if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                            return PrimitiveLiteral.$empty;
                        }
                        let found = this.expressionLookup[expression];
                        if (found === undefined) {
                            found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
            }
        }
        cache(expressions) {
            const { forOfLookup, expressionLookup, interpolationLookup } = this;
            for (const expression in expressions) {
                const expr = expressions[expression];
                switch (expr.$kind) {
                    case 24 /* Interpolation */:
                        interpolationLookup[expression] = expr;
                        break;
                    case 55 /* ForOfStatement */:
                        forOfLookup[expression] = expr;
                        break;
                    default:
                        expressionLookup[expression] = expr;
                }
            }
        }
        parseCore(expression, bindingType) {
            try {
                const parts = expression.split('.');
                const firstPart = parts[0];
                let current;
                if (firstPart.endsWith('()')) {
                    current = new CallScope(firstPart.replace('()', ''), kernel.PLATFORM.emptyArray);
                }
                else {
                    current = new AccessScope(parts[0]);
                }
                let index = 1;
                while (index < parts.length) {
                    const currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new CallMember(current, currentPart.replace('()', ''), kernel.PLATFORM.emptyArray);
                    }
                    else {
                        current = new AccessMember(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw kernel.Reporter.error(3, e);
            }
        }
    }

    // tslint:disable:no-any
    const { toView: toView$2, oneTime: oneTime$2 } = exports.BindingMode;
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.observerLocator = observerLocator;
            this.interpolation = interpolation;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.locator = locator;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
            // value converters and binding behaviors.
            // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
            // in which case the renderer will create the TextBinding directly
            const expressions = interpolation.expressions;
            const parts = this.parts = Array(expressions.length);
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                parts[i] = new exports.InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 2 /* isBound */;
            this.$scope = scope;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            this.$state &= ~2 /* isBound */;
            this.$scope = null;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    exports.InterpolationBinding = class InterpolationBinding {
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            this.sourceExpression = sourceExpression;
            this.interpolation = interpolation;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.isFirst = isFirst;
            this.$state = 0 /* none */;
            this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | exports.LifecycleFlags.updateTargetInstance);
        }
        handleChange(newValue, previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            previousValue = this.targetObserver.getValue();
            newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime$2) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this);
                this.unobserve(false);
            }
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 2 /* isBound */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // since the interpolation already gets the whole value, we only need to let the first
            // text binding do the update if there are multiple
            if (this.isFirst) {
                this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
            }
            if (this.mode & toView$2) {
                sourceExpression.connect(flags, scope, this);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            this.$state &= ~2 /* isBound */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
        }
    };
    exports.InterpolationBinding = __decorate([
        connectable()
    ], exports.InterpolationBinding);

    exports.LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            this.sourceExpression = sourceExpression;
            this.targetProperty = targetProperty;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.toViewModel = toViewModel;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            this.target = null;
            this.$lifecycle = locator.get(ILifecycle);
        }
        handleChange(newValue, previousValue, flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            if (flags & exports.LifecycleFlags.updateTargetInstance) {
                const { target, targetProperty } = this;
                previousValue = target[targetProperty];
                newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw kernel.Reporter.error(15, flags);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(exports.LifecycleFlags.fromBind, scope, this.locator);
            this.sourceExpression.connect(flags, scope, this);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
    };
    exports.LetBinding = __decorate([
        connectable()
    ], exports.LetBinding);

    class Listener {
        constructor(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.eventManager = eventManager;
            this.locator = locator;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
        }
        callSource(event) {
            const overrideContext = this.$scope.overrideContext;
            overrideContext['$event'] = event;
            const result = this.sourceExpression.evaluate(exports.LifecycleFlags.mustEvaluate, this.$scope, this.locator);
            delete overrideContext['$event'];
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.handler = this.eventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.handler.dispose();
            this.handler = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }

    class Ref {
        constructor(sourceExpression, target, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.locator = locator;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$state = 0 /* none */;
        }
        $bind(flags, scope) {
            if (this.$state & 2 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags | exports.LifecycleFlags.fromBind);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
            // add isBound flag and remove isBinding flag
            this.$state |= 2 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 2 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            const sourceExpression = this.sourceExpression;
            if (hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }

    // tslint:disable:no-reserved-keywords
    /*@internal*/
    const customElementName = 'custom-element';
    /*@internal*/
    function customElementKey(name) {
        return `${customElementName}:${name}`;
    }
    /*@internal*/
    function customElementBehavior(node) {
        return node.$customElement || null;
    }
    /*@internal*/
    const customAttributeName = 'custom-attribute';
    /*@internal*/
    function customAttributeKey(name) {
        return `${customAttributeName}:${name}`;
    }
    const instructionTypeValues = 'abcdefghijkl';
    const ITargetedInstruction = kernel.DI.createInterface();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
    }
    /*@internal*/
    const buildRequired = Object.freeze({
        required: true,
        compiler: 'default'
    });
    const buildNotRequired = Object.freeze({
        required: false,
        compiler: 'default'
    });
    // Note: this is a little perf thing; having one predefined class with the properties always
    // assigned in the same order ensures the browser can keep reusing the same generated hidden
    // class
    class DefaultTemplateDefinition {
        constructor() {
            this.name = 'unnamed';
            this.template = null;
            this.cache = 0;
            this.build = buildNotRequired;
            this.bindables = kernel.PLATFORM.emptyObject;
            this.instructions = kernel.PLATFORM.emptyArray;
            this.dependencies = kernel.PLATFORM.emptyArray;
            this.surrogates = kernel.PLATFORM.emptyArray;
            this.containerless = false;
            this.shadowOptions = null;
            this.hasSlots = false;
        }
    }
    const templateDefinitionAssignables = [
        'name',
        'template',
        'cache',
        'build',
        'containerless',
        'shadowOptions',
        'hasSlots'
    ];
    const templateDefinitionArrays = [
        'instructions',
        'dependencies',
        'surrogates'
    ];
    function buildTemplateDefinition(ctor, nameOrDef, template, cache, build, bindables, instructions, dependencies, surrogates, containerless, shadowOptions, hasSlots) {
        const def = new DefaultTemplateDefinition();
        // all cases fall through intentionally
        const argLen = arguments.length;
        switch (argLen) {
            case 12: if (hasSlots !== null)
                def.hasSlots = hasSlots;
            case 11: if (shadowOptions !== null)
                def.shadowOptions = shadowOptions;
            case 10: if (containerless !== null)
                def.containerless = containerless;
            case 9: if (surrogates !== null)
                def.surrogates = kernel.PLATFORM.toArray(surrogates);
            case 8: if (dependencies !== null)
                def.dependencies = kernel.PLATFORM.toArray(dependencies);
            case 7: if (instructions !== null)
                def.instructions = kernel.PLATFORM.toArray(instructions);
            case 6: if (bindables !== null)
                def.bindables = Object.assign({}, bindables);
            case 5: if (build !== null)
                def.build = build === true ? buildRequired : build === false ? buildNotRequired : Object.assign({}, build);
            case 4: if (cache !== null)
                def.cache = cache;
            case 3: if (template !== null)
                def.template = template;
            case 2:
                if (ctor !== null) {
                    if (ctor['bindables']) {
                        def.bindables = Object.assign({}, ctor.bindables);
                    }
                    if (ctor['containerless']) {
                        def.containerless = ctor.containerless;
                    }
                    if (ctor['shadowOptions']) {
                        def.shadowOptions = ctor.shadowOptions;
                    }
                }
                if (typeof nameOrDef === 'string') {
                    if (nameOrDef.length > 0) {
                        def.name = nameOrDef;
                    }
                }
                else if (nameOrDef !== null) {
                    templateDefinitionAssignables.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = nameOrDef[prop];
                        }
                    });
                    templateDefinitionArrays.forEach(prop => {
                        if (nameOrDef[prop]) {
                            def[prop] = kernel.PLATFORM.toArray(nameOrDef[prop]);
                        }
                    });
                    if (nameOrDef['bindables']) {
                        if (def.bindables === kernel.PLATFORM.emptyObject) {
                            def.bindables = Object.assign({}, nameOrDef.bindables);
                        }
                        else {
                            Object.assign(def.bindables, nameOrDef.bindables);
                        }
                    }
                }
        }
        // special handling for invocations that quack like a @customElement decorator
        if (argLen === 2 && ctor !== null) {
            if (typeof nameOrDef === 'string' || !('build' in nameOrDef)) {
                def.build = buildRequired;
            }
        }
        return def;
    }

    function bindable(configOrTarget, prop) {
        let config;
        const decorator = function decorate($target, $prop) {
            const Type = $target.constructor;
            let bindables = Type.bindables;
            if (bindables === undefined) {
                bindables = Type.bindables = {};
            }
            if (!config.attribute) {
                config.attribute = kernel.PLATFORM.kebabCase($prop);
            }
            if (!config.callback) {
                config.callback = `${$prop}Changed`;
            }
            if (!config.mode) {
                config.mode = exports.BindingMode.toView;
            }
            if (arguments.length > 1) {
                // Non invocation:
                // - @bindable
                // Invocation with or w/o opts:
                // - @bindable()
                // - @bindable({...opts})
                config.property = $prop;
            }
            bindables[config.property] = config;
        };
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            config = {};
            return decorator(configOrTarget, prop);
        }
        else if (typeof configOrTarget === 'string') {
            // ClassDecorator
            // - @bindable('bar')
            // Direct call:
            // - @bindable('bar')(Foo)
            config = {};
            return decorator;
        }
        // Invocation with or w/o opts:
        // - @bindable()
        // - @bindable({...opts})
        config = (configOrTarget || {});
        return decorator;
    }

    function createElement(tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(tagOrType, props, children);
        }
        else {
            return createElementForType(tagOrType, props, children);
        }
    }
    class RenderPlan {
        constructor(node, instructions, dependencies) {
            this.node = node;
            this.instructions = instructions;
            this.dependencies = dependencies;
        }
        get definition() {
            return this.lazyDefinition || (this.lazyDefinition =
                buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
        }
        getElementTemplate(engine, Type) {
            return engine.getElementTemplate(this.definition, Type);
        }
        createView(engine, parentContext) {
            return this.getViewFactory(engine, parentContext).create();
        }
        getViewFactory(engine, parentContext) {
            return engine.getViewFactory(this.definition, parentContext);
        }
        /*@internal*/
        mergeInto(parent, instructions, dependencies) {
            DOM.appendChild(parent, this.node);
            instructions.push(...this.instructions);
            dependencies.push(...this.dependencies);
        }
    }
    function createElementForTag(tagName, props, children) {
        const instructions = [];
        const allInstructions = [];
        const dependencies = [];
        const element = DOM.createElement(tagName);
        let hasInstructions = false;
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (isTargetedInstruction(value)) {
                    hasInstructions = true;
                    instructions.push(value);
                }
                else {
                    DOM.setAttribute(element, to, value);
                }
            });
        }
        if (hasInstructions) {
            DOM.setAttribute(element, 'class', 'au');
            allInstructions.push(instructions);
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new RenderPlan(element, allInstructions, dependencies);
    }
    function createElementForType(Type, props, children) {
        const tagName = Type.description.name;
        const instructions = [];
        const allInstructions = [instructions];
        const dependencies = [];
        const childInstructions = [];
        const bindables = Type.description.bindables;
        const element = DOM.createElement(tagName);
        DOM.setAttribute(element, 'class', 'au');
        if (!dependencies.includes(Type)) {
            dependencies.push(Type);
        }
        instructions.push({
            type: "k" /* hydrateElement */,
            res: tagName,
            instructions: childInstructions
        });
        if (props) {
            Object.keys(props)
                .forEach(to => {
                const value = props[to];
                if (isTargetedInstruction(value)) {
                    childInstructions.push(value);
                }
                else {
                    const bindable = bindables[to];
                    if (bindable) {
                        childInstructions.push({
                            type: "i" /* setProperty */,
                            to,
                            value
                        });
                    }
                    else {
                        childInstructions.push({
                            type: "j" /* setAttribute */,
                            to,
                            value
                        });
                    }
                }
            });
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new RenderPlan(element, allInstructions, dependencies);
    }
    function addChildren(parent, children, allInstructions, dependencies) {
        for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];
            if (typeof current === 'string') {
                DOM.appendChild(parent, DOM.createTextNode(current));
            }
            else if (DOM.isNodeInstance(current)) {
                DOM.appendChild(parent, current);
            }
            else {
                current.mergeInto(parent, allInstructions, dependencies);
            }
        }
    }

    /*@internal*/
    function $attachAttribute(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginAttach();
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= exports.LifecycleFlags.fromAttach;
        const hooks = this.$hooks;
        if (hooks & 16 /* hasAttaching */) {
            this.attaching(flags);
        }
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
        if (hooks & 32 /* hasAttached */) {
            lifecycle.enqueueAttached(this);
        }
        lifecycle.endAttach(flags);
    }
    /*@internal*/
    function $attachElement(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginAttach();
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= exports.LifecycleFlags.fromAttach;
        const hooks = this.$hooks;
        if (hooks & 16 /* hasAttaching */) {
            this.attaching(flags);
        }
        let current = this.$attachableHead;
        while (current !== null) {
            current.$attach(flags);
            current = current.$nextAttach;
        }
        if (!(this.$state & 16 /* isMounted */)) {
            lifecycle.enqueueMount(this);
        }
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
        if (hooks & 32 /* hasAttached */) {
            lifecycle.enqueueAttached(this);
        }
        lifecycle.endAttach(flags);
    }
    /*@internal*/
    function $attachView(flags) {
        if (this.$state & 8 /* isAttached */) {
            return;
        }
        // add isAttaching flag
        this.$state |= 4 /* isAttaching */;
        flags |= exports.LifecycleFlags.fromAttach;
        let current = this.$attachableHead;
        while (current !== null) {
            current.$attach(flags);
            current = current.$nextAttach;
        }
        if (!(this.$state & 16 /* isMounted */)) {
            this.$lifecycle.enqueueMount(this);
        }
        // add isAttached flag, remove isAttaching flag
        this.$state |= 8 /* isAttached */;
        this.$state &= ~4 /* isAttaching */;
    }
    /*@internal*/
    function $detachAttribute(flags) {
        if (this.$state & 8 /* isAttached */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginDetach();
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= exports.LifecycleFlags.fromDetach;
            const hooks = this.$hooks;
            if (hooks & 64 /* hasDetaching */) {
                this.detaching(flags);
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
            if (hooks & 128 /* hasDetached */) {
                lifecycle.enqueueDetached(this);
            }
            lifecycle.endDetach(flags);
        }
    }
    /*@internal*/
    function $detachElement(flags) {
        if (this.$state & 8 /* isAttached */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginDetach();
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= exports.LifecycleFlags.fromDetach;
            if (this.$state & 16 /* isMounted */) {
                // Only unmount if either:
                // - No parent view/element is queued for unmount yet, or
                // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
                if (((flags & exports.LifecycleFlags.parentUnmountQueued) ^ exports.LifecycleFlags.parentUnmountQueued) | (flags & exports.LifecycleFlags.fromStopTask)) {
                    lifecycle.enqueueUnmount(this);
                    flags |= exports.LifecycleFlags.parentUnmountQueued;
                }
            }
            const hooks = this.$hooks;
            if (hooks & 64 /* hasDetaching */) {
                this.detaching(flags);
            }
            let current = this.$attachableTail;
            while (current !== null) {
                current.$detach(flags);
                current = current.$prevAttach;
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
            if (hooks & 128 /* hasDetached */) {
                lifecycle.enqueueDetached(this);
            }
            lifecycle.endDetach(flags);
        }
    }
    /*@internal*/
    function $detachView(flags) {
        if (this.$state & 8 /* isAttached */) {
            // add isDetaching flag
            this.$state |= 32 /* isDetaching */;
            flags |= exports.LifecycleFlags.fromDetach;
            if (this.$state & 16 /* isMounted */) {
                // Only unmount if either:
                // - No parent view/element is queued for unmount yet, or
                // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
                if (((flags & exports.LifecycleFlags.parentUnmountQueued) ^ exports.LifecycleFlags.parentUnmountQueued) | (flags & exports.LifecycleFlags.fromStopTask)) {
                    this.$lifecycle.enqueueUnmount(this);
                    flags |= exports.LifecycleFlags.parentUnmountQueued;
                }
            }
            let current = this.$attachableTail;
            while (current !== null) {
                current.$detach(flags);
                current = current.$prevAttach;
            }
            // remove isAttached and isDetaching flags
            this.$state &= ~(8 /* isAttached */ | 32 /* isDetaching */);
        }
    }
    /*@internal*/
    function $cacheAttribute(flags) {
        flags |= exports.LifecycleFlags.fromCache;
        if (this.$hooks & 2048 /* hasCaching */) {
            this.caching(flags);
        }
    }
    /*@internal*/
    function $cacheElement(flags) {
        flags |= exports.LifecycleFlags.fromCache;
        if (this.$hooks & 2048 /* hasCaching */) {
            this.caching(flags);
        }
        let current = this.$attachableTail;
        while (current !== null) {
            current.$cache(flags);
            current = current.$prevAttach;
        }
    }
    /*@internal*/
    function $cacheView(flags) {
        flags |= exports.LifecycleFlags.fromCache;
        let current = this.$attachableTail;
        while (current !== null) {
            current.$cache(flags);
            current = current.$prevAttach;
        }
    }
    /*@internal*/
    function $mountElement(flags) {
        this.$state |= 16 /* isMounted */;
        this.$projector.project(this.$nodes);
    }
    /*@internal*/
    function $unmountElement(flags) {
        this.$state &= ~16 /* isMounted */;
        this.$projector.take(this.$nodes);
    }
    /*@internal*/
    function $mountView(flags) {
        this.$state |= 16 /* isMounted */;
        this.$state &= ~256 /* needsMount */;
        this.$nodes.insertBefore(this.location);
    }
    /*@internal*/
    function $unmountView(flags) {
        this.$state &= ~16 /* isMounted */;
        this.$state |= 256 /* needsMount */;
        this.$nodes.remove();
        if (this.isFree) {
            this.isFree = false;
            if (this.cache.tryReturnToCache(this)) {
                this.$state |= 128 /* isCached */;
                return true;
            }
        }
        return false;
    }

    /*@internal*/
    function $bindAttribute(flags, scope) {
        flags |= exports.LifecycleFlags.fromBind;
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginBind();
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        const hooks = this.$hooks;
        if (hooks & 8 /* hasBound */) {
            lifecycle.enqueueBound(this);
        }
        this.$scope = scope;
        if (hooks & 4 /* hasBinding */) {
            this.binding(flags);
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        lifecycle.endBind(flags);
    }
    /*@internal*/
    function $bindElement(flags) {
        if (this.$state & 2 /* isBound */) {
            return;
        }
        const lifecycle = this.$lifecycle;
        lifecycle.beginBind();
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        const hooks = this.$hooks;
        flags |= exports.LifecycleFlags.fromBind;
        if (hooks & 8 /* hasBound */) {
            lifecycle.enqueueBound(this);
        }
        if (hooks & 4 /* hasBinding */) {
            this.binding(flags);
        }
        const scope = this.$scope;
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, scope);
            current = current.$nextBind;
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
        lifecycle.endBind(flags);
    }
    /*@internal*/
    function $bindView(flags, scope) {
        flags |= exports.LifecycleFlags.fromBind;
        if (this.$state & 2 /* isBound */) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        // add isBinding flag
        this.$state |= 1 /* isBinding */;
        this.$scope = scope;
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, scope);
            current = current.$nextBind;
        }
        // add isBound flag and remove isBinding flag
        this.$state |= 2 /* isBound */;
        this.$state &= ~1 /* isBinding */;
    }
    /*@internal*/
    function $unbindAttribute(flags) {
        if (this.$state & 2 /* isBound */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginUnbind();
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const hooks = this.$hooks;
            flags |= exports.LifecycleFlags.fromUnbind;
            if (hooks & 512 /* hasUnbound */) {
                lifecycle.enqueueUnbound(this);
            }
            if (hooks & 256 /* hasUnbinding */) {
                this.unbinding(flags);
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            lifecycle.endUnbind(flags);
        }
    }
    /*@internal*/
    function $unbindElement(flags) {
        if (this.$state & 2 /* isBound */) {
            const lifecycle = this.$lifecycle;
            lifecycle.beginUnbind();
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            const hooks = this.$hooks;
            flags |= exports.LifecycleFlags.fromUnbind;
            if (hooks & 512 /* hasUnbound */) {
                lifecycle.enqueueUnbound(this);
            }
            if (hooks & 256 /* hasUnbinding */) {
                this.unbinding(flags);
            }
            let current = this.$bindableTail;
            while (current !== null) {
                current.$unbind(flags);
                current = current.$prevBind;
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            lifecycle.endUnbind(flags);
        }
    }
    /*@internal*/
    function $unbindView(flags) {
        if (this.$state & 2 /* isBound */) {
            // add isUnbinding flag
            this.$state |= 64 /* isUnbinding */;
            flags |= exports.LifecycleFlags.fromUnbind;
            let current = this.$bindableTail;
            while (current !== null) {
                current.$unbind(flags);
                current = current.$prevBind;
            }
            // remove isBound and isUnbinding flags
            this.$state &= ~(2 /* isBound */ | 64 /* isUnbinding */);
            this.$scope = null;
        }
    }

    /*@internal*/
    class View {
        constructor($lifecycle, cache) {
            this.$lifecycle = $lifecycle;
            this.cache = cache;
            this.$bindableHead = null;
            this.$bindableTail = null;
            this.$nextBind = null;
            this.$prevBind = null;
            this.$attachableHead = null;
            this.$attachableTail = null;
            this.$nextAttach = null;
            this.$prevAttach = null;
            this.$nextMount = null;
            this.$mountFlags = 0;
            this.$nextUnmount = null;
            this.$unmountFlags = 0;
            this.$nextUnbindAfterDetach = null;
            this.$state = 0 /* none */;
            this.$scope = null;
            this.isFree = false;
        }
        hold(location, flags) {
            if (!location.parentNode) { // unmet invariant: location must be a child of some other node
                throw kernel.Reporter.error(60); // TODO: organize error codes
            }
            this.location = location;
            const lastChild = this.$nodes.lastChild;
            if (lastChild && lastChild.nextSibling === location) {
                this.$state &= ~256 /* needsMount */;
            }
            else {
                this.$state |= 256 /* needsMount */;
            }
        }
        lockScope(scope) {
            this.$scope = scope;
            this.$bind = lockedBind;
        }
        release(flags) {
            this.isFree = true;
            if (this.$state & 8 /* isAttached */) {
                return this.cache.canReturnToCache(this);
            }
            return this.$unmount(flags);
        }
    }
    /*@internal*/
    class ViewFactory {
        constructor(name, template, lifecycle) {
            this.name = name;
            this.template = template;
            this.lifecycle = lifecycle;
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = ViewFactory.maxCacheSize;
                }
                else if (typeof size === 'string') {
                    size = parseInt(size, 10);
                }
                if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                    this.cacheSize = size;
                }
            }
            if (this.cacheSize > 0) {
                this.cache = [];
            }
            else {
                this.cache = null;
            }
            this.isCaching = this.cacheSize > 0;
        }
        canReturnToCache(view) {
            return this.cache !== null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(view) {
            if (this.canReturnToCache(view)) {
                view.$cache(exports.LifecycleFlags.none);
                this.cache.push(view);
                return true;
            }
            return false;
        }
        create() {
            const cache = this.cache;
            let view;
            if (cache !== null && cache.length > 0) {
                view = cache.pop();
                view.$state &= ~128 /* isCached */;
                return view;
            }
            view = new View(this.lifecycle, this);
            this.template.render(view);
            if (!view.$nodes) {
                throw kernel.Reporter.error(90);
            }
            return view;
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;
    function lockedBind(flags) {
        if (this.$state & 2 /* isBound */) {
            return;
        }
        flags |= exports.LifecycleFlags.fromBind;
        const lockedScope = this.$scope;
        let current = this.$bindableHead;
        while (current !== null) {
            current.$bind(flags, lockedScope);
            current = current.$nextBind;
        }
        this.$state |= 2 /* isBound */;
    }
    ((proto) => {
        proto.$bind = $bindView;
        proto.$unbind = $unbindView;
        proto.$attach = $attachView;
        proto.$detach = $detachView;
        proto.$cache = $cacheView;
        proto.$mount = $mountView;
        proto.$unmount = $unmountView;
    })(View.prototype);

    function renderStrategy(nameOrSource) {
        return target => RenderStrategyResource.define(nameOrSource, target);
    }
    const RenderStrategyResource = {
        name: 'render-strategy',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === this;
        },
        define(nameOrSource, ctor) {
            const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
            const Type = ctor;
            Type.kind = RenderStrategyResource;
            Type.description = description;
            Type.register = registerRenderStrategy;
            return Type;
        }
    };
    /*@internal*/
    function registerRenderStrategy(container) {
        const resourceKey = RenderStrategyResource.keyFrom(this.description.name);
        container.register(kernel.Registration.singleton(resourceKey, this));
    }
    const ITemplateCompiler = kernel.DI.createInterface().noDefault();
    (function (ViewCompileFlags) {
        ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
        ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
        ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
    })(exports.ViewCompileFlags || (exports.ViewCompileFlags = {}));
    /*@internal*/
    function $hydrateAttribute(renderingEngine) {
        const Type = this.constructor;
        renderingEngine.applyRuntimeBehavior(Type, this);
        if (this.$hooks & 2 /* hasCreated */) {
            this.created();
        }
    }
    /*@internal*/
    function $hydrateElement(renderingEngine, host, options = kernel.PLATFORM.emptyObject) {
        const Type = this.constructor;
        const description = Type.description;
        this.$scope = Scope.create(this, null);
        renderingEngine.applyRuntimeBehavior(Type, this);
        if (this.$hooks & 1024 /* hasRender */) {
            const result = this.render(host, options.parts);
            if (result && 'getElementTemplate' in result) {
                const template = result.getElementTemplate(renderingEngine, Type);
                template.render(this, host, options.parts);
            }
        }
        else {
            const template = renderingEngine.getElementTemplate(description, Type);
            template.render(this, host, options.parts);
        }
        this.$host = host;
        this.$projector = determineProjector(this, host, description);
        if (this.$hooks & 2 /* hasCreated */) {
            this.created();
        }
    }
    /*@internal*/
    const defaultShadowOptions = {
        mode: 'open'
    };
    function determineProjector($customElement, host, definition) {
        if (definition.shadowOptions || definition.hasSlots) {
            if (definition.containerless) {
                throw kernel.Reporter.error(21);
            }
            return new ShadowDOMProjector($customElement, host, definition);
        }
        if (definition.containerless) {
            return new ContainerlessProjector($customElement, host);
        }
        return new HostProjector($customElement, host);
    }
    const IRenderingEngine = kernel.DI.createInterface()
        .withDefault(x => x.singleton(exports.RenderingEngine));
    const defaultCompilerName = 'default';
    exports.RenderingEngine = 
    /*@internal*/
    class RenderingEngine {
        constructor(container, lifecycle, observerLocator, eventManager, parser, templateCompilers) {
            this.container = container;
            this.lifecycle = lifecycle;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.templateLookup = new Map();
            this.factoryLookup = new Map();
            this.behaviorLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        getElementTemplate(definition, componentType) {
            if (!definition) {
                return null;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(definition);
                //If the element has a view, support Recursive Components by adding self to own view template container.
                if (found.renderContext !== null && componentType) {
                    componentType.register(found.renderContext);
                }
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(definition, parentContext) {
            if (!definition) {
                return null;
            }
            let factory = this.factoryLookup.get(definition);
            if (!factory) {
                const validSource = buildTemplateDefinition(null, definition);
                const template = this.templateFromSource(validSource, parentContext);
                factory = new ViewFactory(validSource.name, template, this.lifecycle);
                factory.setCacheSize(validSource.cache, true);
                this.factoryLookup.set(definition, factory);
            }
            return factory;
        }
        applyRuntimeBehavior(Type, instance) {
            let found = this.behaviorLookup.get(Type);
            if (!found) {
                found = RuntimeBehavior.create(Type, instance);
                this.behaviorLookup.set(Type, found);
            }
            found.applyTo(instance, this.lifecycle);
        }
        createRenderer(context) {
            return new Renderer(context, this.observerLocator, this.eventManager, this.parser, this);
        }
        templateFromSource(definition, parentContext) {
            parentContext = parentContext || this.container;
            if (definition && definition.template) {
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (!compiler) {
                        throw kernel.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(definition, new RuntimeCompilationResources(parentContext), exports.ViewCompileFlags.surrogate);
                }
                return new CompiledTemplate(this, parentContext, definition);
            }
            return noViewTemplate;
        }
    };
    exports.RenderingEngine = __decorate([
        kernel.inject(kernel.IContainer, ILifecycle, IObserverLocator, IEventManager, IExpressionParser, kernel.all(ITemplateCompiler))
        /*@internal*/
    ], exports.RenderingEngine);
    const childObserverOptions$1 = { childList: true };
    /*@internal*/
    class ShadowDOMProjector {
        constructor($customElement, host, definition) {
            this.host = host;
            this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
            host.$customElement = $customElement;
            this.shadowRoot.$customElement = $customElement;
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback) {
            DOM.createNodeObserver(this.host, callback, childObserverOptions$1);
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return this.shadowRoot;
        }
        project(nodes) {
            nodes.appendTo(this.host);
            this.project = kernel.PLATFORM.noop;
        }
        take(nodes) {
            // No special behavior is required because the host element removal
            // will result in the projected nodes being removed, since they are in
            // the ShadowDOM.
        }
    }
    /*@internal*/
    class ContainerlessProjector {
        constructor($customElement, host) {
            this.$customElement = $customElement;
            if (host.childNodes.length) {
                this.childNodes = kernel.PLATFORM.toArray(host.childNodes);
            }
            else {
                this.childNodes = kernel.PLATFORM.emptyArray;
            }
            this.host = DOM.convertToRenderLocation(host);
            this.host.$customElement = $customElement;
        }
        get children() {
            return this.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            if (!parentEncapsulationSource) {
                throw kernel.Reporter.error(22);
            }
            return parentEncapsulationSource;
        }
        project(nodes) {
            if (this.$customElement.$state & 256 /* needsMount */) {
                this.$customElement.$state &= ~256 /* needsMount */;
                nodes.insertBefore(this.host);
            }
        }
        take(nodes) {
            this.$customElement.$state |= 256 /* needsMount */;
            nodes.remove();
        }
    }
    /*@internal*/
    class HostProjector {
        constructor($customElement, host) {
            this.host = host;
            host.$customElement = $customElement;
            this.isAppHost = host.hasOwnProperty('$au');
        }
        get children() {
            return kernel.PLATFORM.emptyArray;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return parentEncapsulationSource || this.host;
        }
        project(nodes) {
            nodes.appendTo(this.host);
            if (!this.isAppHost) {
                this.project = kernel.PLATFORM.noop;
            }
        }
        take(nodes) {
            // No special behavior is required because the host element removal
            // will result in the projected nodes being removed, since they are children.
            if (this.isAppHost) {
                // The only exception to that is the app host, which is not part of a removable node sequence
                nodes.remove();
            }
        }
    }
    /** @internal */
    class RuntimeBehavior {
        constructor() { }
        static create(Component, instance) {
            const behavior = new RuntimeBehavior();
            behavior.bindables = Component.description.bindables;
            return behavior;
        }
        applyTo(instance, lifecycle) {
            instance.$lifecycle = lifecycle;
            if ('$projector' in instance) {
                this.applyToElement(lifecycle, instance);
            }
            else {
                this.applyToCore(instance);
            }
        }
        applyToElement(lifecycle, instance) {
            const observers = this.applyToCore(instance);
            observers.$children = new exports.ChildrenObserver(lifecycle, instance);
            Reflect.defineProperty(instance, '$children', {
                enumerable: false,
                get: function () {
                    return this.$observers.$children.getValue();
                }
            });
        }
        applyToCore(instance) {
            const observers = {};
            const bindables = this.bindables;
            const observableNames = Object.getOwnPropertyNames(bindables);
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new exports.Observer(instance, name, bindables[name].callback);
                createGetterSetter(instance, name);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
            return observers;
        }
    }
    function createGetterSetter(instance, name) {
        Reflect.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this.$observers[name].getValue(); },
            set: function (value) { this.$observers[name].setValue(value, exports.LifecycleFlags.updateTargetInstance); }
        });
    }
    /*@internal*/
    exports.ChildrenObserver = class ChildrenObserver {
        constructor(lifecycle, customElement) {
            this.lifecycle = lifecycle;
            this.customElement = customElement;
            this.hasChanges = false;
            this.children = null;
            this.observing = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
                this.children = findElements(this.customElement.$projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flush(flags) {
            this.callSubscribers(this.children, undefined, flags | exports.LifecycleFlags.updateTargetInstance);
            this.hasChanges = false;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        onChildrenChanged() {
            this.children = findElements(this.customElement.$projector.children);
            if ('$childrenChanged' in this.customElement) {
                this.customElement.$childrenChanged();
            }
            this.lifecycle.enqueueFlush(this);
            this.hasChanges = true;
        }
    };
    exports.ChildrenObserver = __decorate([
        subscriberCollection(exports.MutationKind.instance)
    ], exports.ChildrenObserver);
    /*@internal*/
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = customElementBehavior(current);
            if (component !== null) {
                components.push(component);
            }
        }
        return components;
    }
    /*@internal*/
    class RuntimeCompilationResources {
        constructor(context) {
            this.context = context;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            const resolver = this.context.getResolver(key, false);
            if (resolver !== null && resolver.getFactory) {
                const factory = resolver.getFactory(this.context);
                if (factory !== null) {
                    return factory.type.description || null;
                }
            }
            return null;
        }
        create(kind, name) {
            const key = kind.keyFrom(name);
            if (this.context.has(key, false)) {
                return this.context.get(key) || null;
            }
            return null;
        }
    }
    // This is the main implementation of ITemplate.
    // It is used to create instances of IView based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    /*@internal*/
    class CompiledTemplate {
        constructor(renderingEngine, parentRenderContext, templateDefinition) {
            this.templateDefinition = templateDefinition;
            this.factory = NodeSequenceFactory.createFor(templateDefinition.template);
            this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
        }
        render(renderable, host, parts) {
            const nodes = renderable.$nodes = this.factory.createNodeSequence();
            renderable.$context = this.renderContext;
            this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, parts);
        }
    }
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /*@internal*/
    const noViewTemplate = {
        renderContext: null,
        render(renderable) {
            renderable.$nodes = NodeSequence.empty;
            renderable.$context = null;
        }
    };
    function createRenderContext(renderingEngine, parentRenderContext, dependencies) {
        const context = parentRenderContext.createChild();
        const renderableProvider = new InstanceProvider();
        const elementProvider = new InstanceProvider();
        const instructionProvider = new InstanceProvider();
        const factoryProvider = new ViewFactoryProvider(renderingEngine);
        const renderLocationProvider = new InstanceProvider();
        const renderer = renderingEngine.createRenderer(context);
        DOM.registerElementResolver(context, elementProvider);
        context.registerResolver(IViewFactory, factoryProvider);
        context.registerResolver(IRenderable, renderableProvider);
        context.registerResolver(ITargetedInstruction, instructionProvider);
        context.registerResolver(IRenderLocation, renderLocationProvider);
        if (dependencies) {
            context.register(...dependencies);
        }
        context.render = function (renderable, targets, templateDefinition, host, parts) {
            renderer.render(renderable, targets, templateDefinition, host, parts);
        };
        context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
            renderableProvider.prepare(renderable);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (location) {
                renderLocationProvider.prepare(location);
            }
            return context;
        };
        context.dispose = function () {
            factoryProvider.dispose();
            renderableProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
            renderLocationProvider.dispose();
        };
        return context;
    }
    /*@internal*/
    class InstanceProvider {
        constructor() {
            this.instance = null;
        }
        prepare(instance) {
            this.instance = instance;
        }
        resolve(handler, requestor) {
            if (this.instance === undefined) { // unmet precondition: call prepare
                throw kernel.Reporter.error(50); // TODO: organize error codes
            }
            return this.instance;
        }
        dispose() {
            this.instance = null;
        }
    }
    /*@internal*/
    class ViewFactoryProvider {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        prepare(factory, parts) {
            this.factory = factory;
            this.replacements = parts || kernel.PLATFORM.emptyObject;
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory === undefined) { // unmet precondition: call prepare
                throw kernel.Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw kernel.Reporter.error(51); // TODO: organize error codes
            }
            const found = this.replacements[factory.name];
            if (found) {
                return this.renderingEngine.getViewFactory(found, requestor);
            }
            return this.factory;
        }
        dispose() {
            this.factory = null;
            this.replacements = null;
        }
    }
    function addBindable(renderable, bindable) {
        bindable.$prevBind = renderable.$bindableTail;
        bindable.$nextBind = null;
        if (renderable.$bindableTail === null) {
            renderable.$bindableHead = bindable;
        }
        else {
            renderable.$bindableTail.$nextBind = bindable;
        }
        renderable.$bindableTail = bindable;
    }
    function addAttachable(renderable, attachable) {
        attachable.$prevAttach = renderable.$attachableTail;
        attachable.$nextAttach = null;
        if (renderable.$attachableTail === null) {
            renderable.$attachableHead = attachable;
        }
        else {
            renderable.$attachableTail.$nextAttach = attachable;
        }
        renderable.$attachableTail = attachable;
    }
    // tslint:disable:function-name
    // tslint:disable:no-any
    /* @internal */
    class Renderer {
        constructor(context, observerLocator, eventManager, parser, renderingEngine) {
            this.context = context;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.renderingEngine = renderingEngine;
        }
        render(renderable, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            if (targets.length !== targetInstructions.length) {
                if (targets.length > targetInstructions.length) {
                    throw kernel.Reporter.error(30);
                }
                else {
                    throw kernel.Reporter.error(31);
                }
            }
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                const instructions = targetInstructions[i];
                const target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    const current = instructions[j];
                    this[current.type](renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    const current = surrogateInstructions[i];
                    this[current.type](renderable, host, current, parts);
                }
            }
        }
        hydrateElementInstance(renderable, target, instruction, component) {
            const childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine, target, instruction);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                const currentType = current.type;
                this[currentType](renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
        }
        ["a" /* textBinding */](renderable, target, instruction) {
            const next = target.nextSibling;
            DOM.treatAsNonWhitespace(next);
            DOM.remove(target);
            const $from = instruction.from;
            const expr = ($from.$kind ? $from : this.parser.parse($from, 2048 /* Interpolation */));
            if (expr.isMulti) {
                addBindable(renderable, new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', exports.BindingMode.toView, this.context));
            }
            else {
                addBindable(renderable, new exports.InterpolationBinding(expr.firstExpression, expr, next, 'textContent', exports.BindingMode.toView, this.observerLocator, this.context, true));
            }
        }
        ["b" /* interpolation */](renderable, target, instruction) {
            const $from = instruction.from;
            const expr = ($from.$kind ? $from : this.parser.parse($from, 2048 /* Interpolation */));
            if (expr.isMulti) {
                addBindable(renderable, new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, exports.BindingMode.toView, this.context));
            }
            else {
                addBindable(renderable, new exports.InterpolationBinding(expr.firstExpression, expr, target, instruction.to, exports.BindingMode.toView, this.observerLocator, this.context, true));
            }
        }
        ["c" /* propertyBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new exports.Binding($from.$kind ? $from : this.parser.parse($from, 48 /* IsPropertyCommand */ | instruction.mode), target, instruction.to, instruction.mode, this.observerLocator, this.context));
        }
        ["d" /* iteratorBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new exports.Binding($from.$kind ? $from : this.parser.parse($from, 539 /* ForCommand */), target, instruction.to, exports.BindingMode.toView, this.observerLocator, this.context));
        }
        ["e" /* listenerBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new Listener(instruction.to, instruction.strategy, $from.$kind ? $from : this.parser.parse($from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */)), target, instruction.preventDefault, this.eventManager, this.context));
        }
        ["f" /* callBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new Call($from.$kind ? $from : this.parser.parse($from, 153 /* CallCommand */), target, instruction.to, this.observerLocator, this.context));
        }
        ["g" /* refBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new Ref($from.$kind ? $from : this.parser.parse($from, 1280 /* IsRef */), target, this.context));
        }
        ["h" /* stylePropertyBinding */](renderable, target, instruction) {
            const $from = instruction.from;
            addBindable(renderable, new exports.Binding($from.$kind ? $from : this.parser.parse($from, 48 /* IsPropertyCommand */ | exports.BindingMode.toView), target.style, instruction.to, exports.BindingMode.toView, this.observerLocator, this.context));
        }
        ["i" /* setProperty */](renderable, target, instruction) {
            target[instruction.to] = instruction.value;
        }
        ["j" /* setAttribute */](renderable, target, instruction) {
            DOM.setAttribute(target, instruction.to, instruction.value);
        }
        ["k" /* hydrateElement */](renderable, target, instruction) {
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(customElementKey(instruction.res));
            this.hydrateElementInstance(renderable, target, instruction, component);
            operation.dispose();
        }
        ["l" /* hydrateAttribute */](renderable, target, instruction) {
            const childInstructions = instruction.instructions;
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(customAttributeKey(instruction.res));
            component.$hydrate(this.renderingEngine);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
            operation.dispose();
        }
        ["m" /* hydrateTemplateController */](renderable, target, instruction, parts) {
            const childInstructions = instruction.instructions;
            const factory = this.renderingEngine.getViewFactory(instruction.def, this.context);
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);
            const component = context.get(customAttributeKey(instruction.res));
            component.$hydrate(this.renderingEngine);
            if (instruction.link) {
                component.link(renderable.$attachableTail);
            }
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            addBindable(renderable, component);
            addAttachable(renderable, component);
            operation.dispose();
        }
        ["z" /* renderStrategy */](renderable, target, instruction) {
            const strategyName = instruction.name;
            if (this[strategyName] === undefined) {
                const strategy = this.context.get(RenderStrategyResource.keyFrom(strategyName));
                if (strategy === null || strategy === undefined) {
                    throw new Error(`Unknown renderStrategy "${strategyName}"`);
                }
                this[strategyName] = strategy.render.bind(strategy);
            }
            this[strategyName](renderable, target, instruction);
        }
        ["n" /* letElement */](renderable, target, instruction) {
            target.remove();
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const childInstruction = childInstructions[i];
                const $from = childInstruction.from;
                addBindable(renderable, new exports.LetBinding($from.$kind ? $from : this.parser.parse($from, 48 /* IsPropertyCommand */), childInstruction.to, this.observerLocator, this.context, toViewModel));
            }
        }
    }

    /**
     * Decorator: Indicates that the decorated class is a custom element.
     */
    function customElement(nameOrSource) {
        return target => CustomElementResource.define(nameOrSource, target);
    }
    function useShadowDOM(targetOrOptions) {
        const options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        function useShadowDOMDecorator(target) {
            target.shadowOptions = options;
            return target;
        }
        return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
    }
    function containerlessDecorator(target) {
        target.containerless = true;
        return target;
    }
    function containerless(target) {
        return target === undefined ? containerlessDecorator : containerlessDecorator(target);
    }
    const CustomElementResource = {
        name: customElementName,
        keyFrom: customElementKey,
        isType(Type) {
            return Type.kind === this;
        },
        behaviorFor: customElementBehavior,
        define(nameOrSource, ctor = null) {
            if (!nameOrSource) {
                throw kernel.Reporter.error(70);
            }
            const Type = (ctor === null ? class HTMLOnlyElement {
            } : ctor);
            const description = buildTemplateDefinition(Type, nameOrSource);
            const proto = Type.prototype;
            Type.kind = CustomElementResource;
            Type.description = description;
            Type.register = registerElement;
            proto.$hydrate = $hydrateElement;
            proto.$bind = $bindElement;
            proto.$attach = $attachElement;
            proto.$detach = $detachElement;
            proto.$unbind = $unbindElement;
            proto.$cache = $cacheElement;
            proto.$prevBind = null;
            proto.$nextBind = null;
            proto.$prevAttach = null;
            proto.$nextAttach = null;
            proto.$nextUnbindAfterDetach = null;
            proto.$scope = null;
            proto.$hooks = 0;
            proto.$state = 256 /* needsMount */;
            proto.$bindableHead = null;
            proto.$bindableTail = null;
            proto.$attachableHead = null;
            proto.$attachableTail = null;
            proto.$mount = $mountElement;
            proto.$unmount = $unmountElement;
            proto.$nextMount = null;
            proto.$nextUnmount = null;
            proto.$projector = null;
            if ('flush' in proto) {
                proto.$nextFlush = null;
            }
            if ('binding' in proto)
                proto.$hooks |= 4 /* hasBinding */;
            if ('bound' in proto) {
                proto.$hooks |= 8 /* hasBound */;
                proto.$nextBound = null;
            }
            if ('unbinding' in proto)
                proto.$hooks |= 256 /* hasUnbinding */;
            if ('unbound' in proto) {
                proto.$hooks |= 512 /* hasUnbound */;
                proto.$nextUnbound = null;
            }
            if ('render' in proto)
                proto.$hooks |= 1024 /* hasRender */;
            if ('created' in proto)
                proto.$hooks |= 2 /* hasCreated */;
            if ('attaching' in proto)
                proto.$hooks |= 16 /* hasAttaching */;
            if ('attached' in proto) {
                proto.$hooks |= 32 /* hasAttached */;
                proto.$nextAttached = null;
            }
            if ('detaching' in proto)
                proto.$hooks |= 64 /* hasDetaching */;
            if ('caching' in proto)
                proto.$hooks |= 2048 /* hasCaching */;
            if ('detached' in proto) {
                proto.$hooks |= 128 /* hasDetached */;
                proto.$nextDetached = null;
            }
            return Type;
        }
    };
    /*@internal*/
    function registerElement(container) {
        const resourceKey = CustomElementResource.keyFrom(this.description.name);
        container.register(kernel.Registration.transient(resourceKey, this));
    }
    // tslint:enable:align
    // TODO
    // ## DefaultSlotProjector
    // An implementation of IElementProjector that can handle a subset of default
    // slot projection scenarios without needing real Shadow DOM.
    // ### Conditions
    // We can do a one-time, static composition of the content and view,
    // to emulate shadow DOM, if the following constraints are met:
    // * There must be exactly one slot and it must be a default slot.
    // * The default slot must not have any fallback content.
    // * The default slot must not have a custom element as its immediate parent or
    //   a slot attribute (re-projection).
    // ### Projection
    // The projector copies all content nodes to the slot's location.
    // The copy process should inject a comment node before and after the slotted
    // content, so that the bounds of the content can be clearly determined,
    // even if the slotted content has template controllers or string interpolation.
    // ### Encapsulation Source
    // Uses the same strategy as HostProjector.
    // ### Children
    // The projector adds a mutation observer to the parent node of the
    // slot comment. When direct children of that node change, the projector
    // will gather up all nodes between the start and end slot comments.

    const composeSource = {
        name: 'au-compose',
        containerless: true
    };
    const composeProps = ['subject', 'composing'];
    exports.Compose = class Compose {
        constructor(renderable, instruction, renderingEngine, coordinator) {
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.coordinator = coordinator;
            this.subject = null;
            this.composing = false;
            this.properties = null;
            this.lastSubject = null;
            this.coordinator.onSwapComplete = () => {
                this.composing = false;
            };
            this.properties = instruction.instructions
                .filter((x) => !composeProps.includes(x.to))
                .reduce((acc, item) => {
                if (item.to) {
                    acc[item.to] = item;
                }
                return acc;
            }, {});
        }
        binding(flags) {
            this.startComposition(this.subject, undefined, flags);
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(flags) {
            this.coordinator.attaching(flags);
        }
        detaching(flags) {
            this.coordinator.detaching(flags);
        }
        unbinding(flags) {
            this.lastSubject = null;
            this.coordinator.unbinding(flags);
        }
        caching(flags) {
            this.coordinator.caching(flags);
        }
        subjectChanged(newValue, previousValue, flags) {
            this.startComposition(newValue, previousValue, flags);
        }
        startComposition(subject, previousSubject, flags) {
            if (this.lastSubject === subject) {
                return;
            }
            this.lastSubject = subject;
            if (subject instanceof Promise) {
                subject = subject.then(x => this.resolveView(x, flags));
            }
            else {
                subject = this.resolveView(subject, flags);
            }
            this.composing = true;
            this.coordinator.compose(subject, flags);
        }
        resolveView(subject, flags) {
            const view = this.provideViewFor(subject);
            if (view) {
                view.hold(this.$projector.host, flags);
                view.lockScope(this.renderable.$scope);
                return view;
            }
            return null;
        }
        provideViewFor(subject) {
            if (!subject) {
                return null;
            }
            if ('lockScope' in subject) { // IView
                return subject;
            }
            if ('createView' in subject) { // RenderPlan
                return subject.createView(this.renderingEngine, this.renderable.$context);
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('template' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(subject, this.renderable.$context).create();
            }
            // Constructable (Custom Element Constructor)
            return createElement(subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
        }
    };
    __decorate([
        bindable
    ], exports.Compose.prototype, "subject", void 0);
    __decorate([
        bindable
    ], exports.Compose.prototype, "composing", void 0);
    exports.Compose = __decorate([
        customElement(composeSource),
        kernel.inject(IRenderable, ITargetedInstruction, IRenderingEngine, exports.CompositionCoordinator)
    ], exports.Compose);

    /**
     * Decorator: Indicates that the decorated class is a custom attribute.
     */
    function customAttribute(nameOrDef) {
        return target => CustomAttributeResource.define(nameOrDef, target);
    }
    /**
     * Decorator: Applied to custom attributes. Indicates that whatever element the
     * attribute is placed on should be converted into a template and that this
     * attribute controls the instantiation of the template.
     */
    function templateController(nameOrDef) {
        return target => CustomAttributeResource.define(typeof nameOrDef === 'string'
            ? { isTemplateController: true, name: nameOrDef }
            : Object.assign({ isTemplateController: true }, nameOrDef), target);
    }
    const CustomAttributeResource = {
        name: customAttributeName,
        keyFrom: customAttributeKey,
        isType(Type) {
            return Type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            const proto = Type.prototype;
            Type.kind = CustomAttributeResource;
            Type.description = description;
            Type.register = registerAttribute;
            proto.$hydrate = $hydrateAttribute;
            proto.$bind = $bindAttribute;
            proto.$attach = $attachAttribute;
            proto.$detach = $detachAttribute;
            proto.$unbind = $unbindAttribute;
            proto.$cache = $cacheAttribute;
            proto.$prevBind = null;
            proto.$nextBind = null;
            proto.$prevAttach = null;
            proto.$nextAttach = null;
            proto.$nextUnbindAfterDetach = null;
            proto.$scope = null;
            proto.$hooks = 0;
            proto.$state = 0;
            if ('flush' in proto) {
                proto.$nextFlush = null;
            }
            if ('binding' in proto)
                proto.$hooks |= 4 /* hasBinding */;
            if ('bound' in proto) {
                proto.$hooks |= 8 /* hasBound */;
                proto.$nextBound = null;
            }
            if ('unbinding' in proto)
                proto.$hooks |= 256 /* hasUnbinding */;
            if ('unbound' in proto) {
                proto.$hooks |= 512 /* hasUnbound */;
                proto.$nextUnbound = null;
            }
            if ('created' in proto)
                proto.$hooks |= 2 /* hasCreated */;
            if ('attaching' in proto)
                proto.$hooks |= 16 /* hasAttaching */;
            if ('attached' in proto) {
                proto.$hooks |= 32 /* hasAttached */;
                proto.$nextAttached = null;
            }
            if ('detaching' in proto)
                proto.$hooks |= 64 /* hasDetaching */;
            if ('caching' in proto)
                proto.$hooks |= 2048 /* hasCaching */;
            if ('detached' in proto) {
                proto.$hooks |= 128 /* hasDetached */;
                proto.$nextDetached = null;
            }
            return Type;
        }
    };
    /*@internal*/
    function registerAttribute(container) {
        const description = this.description;
        const resourceKey = CustomAttributeResource.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(kernel.Registration.transient(resourceKey, this));
        for (let i = 0, ii = aliases.length; i < ii; ++i) {
            const aliasKey = CustomAttributeResource.keyFrom(aliases[i]);
            container.register(kernel.Registration.alias(resourceKey, aliasKey));
        }
    }
    /*@internal*/
    function createCustomAttributeDescription(def, Type) {
        return {
            name: def.name,
            aliases: def.aliases || kernel.PLATFORM.emptyArray,
            defaultBindingMode: def.defaultBindingMode || exports.BindingMode.toView,
            isTemplateController: def.isTemplateController || false,
            bindables: Object.assign({}, Type.bindables, def.bindables)
        };
    }

    exports.If = class If {
        constructor(ifFactory, location, coordinator) {
            this.ifFactory = ifFactory;
            this.location = location;
            this.coordinator = coordinator;
            this.value = false;
            this.elseFactory = null;
            this.ifView = null;
            this.elseView = null;
        }
        binding(flags) {
            const view = this.updateView(flags);
            this.coordinator.compose(view, flags);
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(flags) {
            this.coordinator.attaching(flags);
        }
        detaching(flags) {
            this.coordinator.detaching(flags);
        }
        unbinding(flags) {
            this.coordinator.unbinding(flags);
        }
        caching(flags) {
            if (this.ifView !== null && this.ifView.release(flags)) {
                this.ifView = null;
            }
            if (this.elseView !== null && this.elseView.release(flags)) {
                this.elseView = null;
            }
            this.coordinator.caching(flags);
        }
        valueChanged(newValue, oldValue, flags) {
            if (flags & exports.LifecycleFlags.fromFlush) {
                const view = this.updateView(flags);
                this.coordinator.compose(view, flags);
            }
            else {
                this.$lifecycle.enqueueFlush(this);
            }
        }
        flush(flags) {
            const view = this.updateView(flags);
            this.coordinator.compose(view, flags);
        }
        /*@internal*/
        updateView(flags) {
            let view;
            if (this.value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
            }
            else if (this.elseFactory !== null) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
            }
            else {
                view = null;
            }
            return view;
        }
        /*@internal*/
        ensureView(view, factory, flags) {
            if (view === null) {
                view = factory.create();
            }
            view.hold(this.location, flags);
            return view;
        }
    };
    __decorate([
        bindable
    ], exports.If.prototype, "value", void 0);
    exports.If = __decorate([
        templateController('if'),
        kernel.inject(IViewFactory, IRenderLocation, exports.CompositionCoordinator)
    ], exports.If);
    exports.Else = class Else {
        constructor(factory) {
            this.factory = factory;
        }
        link(ifBehavior) {
            ifBehavior.elseFactory = this.factory;
        }
    };
    exports.Else = __decorate([
        templateController('else'),
        kernel.inject(IViewFactory)
    ], exports.Else);

    exports.Repeat = class Repeat {
        constructor(location, renderable, factory) {
            this.location = location;
            this.renderable = renderable;
            this.factory = factory;
            this.encapsulationSource = null;
            this.views = [];
            this.observer = null;
            this.hasPendingInstanceMutation = false;
        }
        binding(flags) {
            this.checkCollectionObserver();
        }
        bound(flags) {
            let current = this.renderable.$bindableHead;
            while (current !== null) {
                if (current.target === this && current.targetProperty === 'items') {
                    this.forOf = current.sourceExpression;
                    break;
                }
                current = current.$nextBind;
            }
            this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);
            this.processViews(null, flags);
        }
        attaching(flags) {
            const { views, location } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.hold(location, flags);
                view.$attach(flags);
            }
        }
        detaching(flags) {
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$detach(flags);
                view.release(flags);
            }
        }
        unbound(flags) {
            this.checkCollectionObserver();
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$unbind(flags);
            }
        }
        // called by SetterObserver (sync)
        itemsChanged(newValue, oldValue, flags) {
            this.checkCollectionObserver();
            this.processViews(null, flags | exports.LifecycleFlags.updateTargetInstance);
        }
        // called by a CollectionObserver (async)
        handleBatchedChange(indexMap) {
            this.processViews(indexMap, exports.LifecycleFlags.fromFlush | exports.LifecycleFlags.updateTargetInstance);
        }
        // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
        processViews(indexMap, flags) {
            const { views, $lifecycle } = this;
            if (this.$state & 2 /* isBound */) {
                const { local, $scope, factory, forOf, items } = this;
                const oldLength = views.length;
                const newLength = forOf.count(items);
                if (oldLength < newLength) {
                    views.length = newLength;
                    for (let i = oldLength; i < newLength; ++i) {
                        views[i] = factory.create();
                    }
                }
                else if (newLength < oldLength) {
                    $lifecycle.beginDetach();
                    for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                        view.release(flags);
                        view.$detach(flags);
                    }
                    $lifecycle.endDetach(flags);
                    $lifecycle.beginUnbind();
                    for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                        view.$unbind(flags);
                    }
                    $lifecycle.endUnbind(flags);
                    views.length = newLength;
                    if (newLength === 0) {
                        return;
                    }
                }
                else if (newLength === 0) {
                    return;
                }
                $lifecycle.beginBind();
                if (indexMap === null) {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (!!view.$scope && view.$scope.bindingContext[local] === item) {
                            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                        }
                    });
                }
                else {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (indexMap[i] === i && !!view.$scope) {
                            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                        }
                    });
                }
                $lifecycle.endBind(flags);
            }
            if (this.$state & 8 /* isAttached */) {
                const { location } = this;
                $lifecycle.beginAttach();
                if (indexMap === null) {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        const view = views[i];
                        view.hold(location, flags);
                        view.$attach(flags);
                    }
                }
                else {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        if (indexMap[i] !== i) {
                            const view = views[i];
                            view.hold(location, flags);
                            view.$attach(flags);
                        }
                    }
                }
                $lifecycle.endAttach(flags);
            }
        }
        checkCollectionObserver() {
            const oldObserver = this.observer;
            if (this.$state & (2 /* isBound */ | 1 /* isBinding */)) {
                const newObserver = this.observer = getCollectionObserver(this.$lifecycle, this.items);
                if (oldObserver !== newObserver) {
                    if (oldObserver) {
                        oldObserver.unsubscribeBatched(this);
                    }
                }
                if (newObserver) {
                    newObserver.subscribeBatched(this);
                }
            }
            else if (oldObserver) {
                oldObserver.unsubscribeBatched(this);
            }
        }
    };
    __decorate([
        bindable
    ], exports.Repeat.prototype, "items", void 0);
    exports.Repeat = __decorate([
        kernel.inject(IRenderLocation, IRenderable, IViewFactory),
        templateController('repeat')
    ], exports.Repeat);

    exports.Replaceable = class Replaceable {
        constructor(factory, location) {
            this.factory = factory;
            this.currentView = this.factory.create();
            this.currentView.hold(location, exports.LifecycleFlags.fromCreate);
        }
        binding(flags) {
            this.currentView.$bind(flags, this.$scope);
        }
        attaching(flags) {
            this.currentView.$attach(flags);
        }
        detaching(flags) {
            this.currentView.$detach(flags);
        }
        unbinding(flags) {
            this.currentView.$unbind(flags);
        }
    };
    exports.Replaceable = __decorate([
        templateController('replaceable'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.Replaceable);

    exports.With = class With {
        constructor(factory, location) {
            this.factory = factory;
            this.value = null;
            this.currentView = null;
            this.currentView = this.factory.create();
            this.currentView.hold(location, exports.LifecycleFlags.fromCreate);
        }
        valueChanged() {
            if (this.$state & 2 /* isBound */) {
                this.bindChild(exports.LifecycleFlags.fromBindableHandler);
            }
        }
        binding(flags) {
            this.bindChild(flags);
        }
        attaching(flags) {
            this.currentView.$attach(flags);
        }
        detaching(flags) {
            this.currentView.$detach(flags);
        }
        unbinding(flags) {
            this.currentView.$unbind(flags);
        }
        bindChild(flags) {
            const scope = Scope.fromParent(this.$scope, this.value);
            this.currentView.$bind(flags, scope);
        }
    };
    __decorate([
        bindable
    ], exports.With.prototype, "value", void 0);
    exports.With = __decorate([
        templateController('with'),
        kernel.inject(IViewFactory, IRenderLocation)
    ], exports.With);

    class Aurelia {
        constructor(container = kernel.DI.createContainer()) {
            this.container = container;
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
            this._root = null;
            kernel.Registration
                .instance(Aurelia, this)
                .register(container, Aurelia);
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            const component = config.component;
            const host = config.host;
            const startTask = () => {
                host.$au = this;
                if (!this.components.includes(component)) {
                    this._root = component;
                    this.components.push(component);
                    const re = this.container.get(IRenderingEngine);
                    component.$hydrate(re, host);
                }
                component.$bind(exports.LifecycleFlags.fromStartTask | exports.LifecycleFlags.fromBind);
                component.$attach(exports.LifecycleFlags.fromStartTask);
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(() => {
                component.$detach(exports.LifecycleFlags.fromStopTask);
                component.$unbind(exports.LifecycleFlags.fromStopTask | exports.LifecycleFlags.fromUnbind);
                host.$au = null;
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        }
        root() {
            return this._root;
        }
        start() {
            for (const runStartTask of this.startTasks) {
                runStartTask();
            }
            this.isStarted = true;
            return this;
        }
        stop() {
            this.isStarted = false;
            for (const runStopTask of this.stopTasks) {
                runStopTask();
            }
            return this;
        }
    }
    kernel.PLATFORM.global.Aurelia = Aurelia;

    exports.enableArrayObservation = enableArrayObservation;
    exports.disableArrayObservation = disableArrayObservation;
    exports.nativePush = nativePush;
    exports.nativePop = nativePop;
    exports.nativeShift = nativeShift;
    exports.nativeUnshift = nativeUnshift;
    exports.nativeSplice = nativeSplice;
    exports.nativeReverse = nativeReverse;
    exports.nativeSort = nativeSort;
    exports.enableMapObservation = enableMapObservation;
    exports.disableMapObservation = disableMapObservation;
    exports.nativeSet = nativeSet;
    exports.nativeMapDelete = nativeDelete;
    exports.nativeMapClear = nativeClear;
    exports.enableSetObservation = enableSetObservation;
    exports.disableSetObservation = disableSetObservation;
    exports.nativeAdd = nativeAdd;
    exports.nativeSetDelete = nativeDelete$1;
    exports.nativeSetClear = nativeClear$1;
    exports.BindingModeBehavior = BindingModeBehavior;
    exports.debounceCallSource = debounceCallSource;
    exports.debounceCall = debounceCall;
    exports.ISanitizer = ISanitizer;
    exports.handleSelfEvent = handleSelfEvent;
    exports.throttle = throttle;
    exports.connects = connects;
    exports.observes = observes;
    exports.callsFunction = callsFunction;
    exports.hasAncestor = hasAncestor;
    exports.isAssignable = isAssignable;
    exports.isLeftHandSide = isLeftHandSide;
    exports.isPrimary = isPrimary;
    exports.isResource = isResource;
    exports.hasBind = hasBind;
    exports.hasUnbind = hasUnbind;
    exports.isLiteral = isLiteral;
    exports.arePureLiterals = arePureLiterals;
    exports.isPureLiteral = isPureLiteral;
    exports.BindingBehavior = BindingBehavior;
    exports.ValueConverter = ValueConverter;
    exports.Assign = Assign;
    exports.Conditional = Conditional;
    exports.AccessThis = AccessThis;
    exports.AccessScope = AccessScope;
    exports.AccessMember = AccessMember;
    exports.AccessKeyed = AccessKeyed;
    exports.CallScope = CallScope;
    exports.CallMember = CallMember;
    exports.CallFunction = CallFunction;
    exports.Binary = Binary;
    exports.Unary = Unary;
    exports.PrimitiveLiteral = PrimitiveLiteral;
    exports.HtmlLiteral = HtmlLiteral;
    exports.ArrayLiteral = ArrayLiteral;
    exports.ObjectLiteral = ObjectLiteral;
    exports.Template = Template;
    exports.TaggedTemplate = TaggedTemplate;
    exports.ArrayBindingPattern = ArrayBindingPattern;
    exports.ObjectBindingPattern = ObjectBindingPattern;
    exports.BindingIdentifier = BindingIdentifier;
    exports.ForOfStatement = ForOfStatement;
    exports.Interpolation = Interpolation;
    exports.IterateForOfStatement = IterateForOfStatement;
    exports.CountForOfStatement = CountForOfStatement;
    exports.bindingBehavior = bindingBehavior;
    exports.BindingBehaviorResource = BindingBehaviorResource;
    exports.InternalObserversLookup = InternalObserversLookup;
    exports.BindingContext = BindingContext;
    exports.Scope = Scope;
    exports.OverrideContext = OverrideContext;
    exports.Call = Call;
    exports.collectionObserver = collectionObserver;
    exports.computed = computed;
    exports.createComputedObserver = createComputedObserver;
    exports.GetterController = GetterController;
    exports.IDirtyChecker = IDirtyChecker;
    exports.DirtyChecker = DirtyChecker;
    exports.findOriginalEventTarget = findOriginalEventTarget;
    exports.ListenerTracker = ListenerTracker;
    exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
    exports.TriggerSubscription = TriggerSubscription;
    exports.EventSubscriber = EventSubscriber;
    exports.IEventManager = IEventManager;
    exports.EventManager = EventManager;
    exports.IExpressionParser = IExpressionParser;
    exports.ExpressionParser = ExpressionParser;
    exports.MultiInterpolationBinding = MultiInterpolationBinding;
    exports.Listener = Listener;
    exports.IObserverLocator = IObserverLocator;
    exports.getCollectionObserver = getCollectionObserver;
    exports.PrimitiveObserver = PrimitiveObserver;
    exports.Ref = Ref;
    exports.ISignaler = ISignaler;
    exports.Signaler = Signaler;
    exports.subscriberCollection = subscriberCollection;
    exports.batchedSubscriberCollection = batchedSubscriberCollection;
    exports.ISVGAnalyzer = ISVGAnalyzer;
    exports.PropertyAccessor = PropertyAccessor;
    exports.targetObserver = targetObserver;
    exports.valueConverter = valueConverter;
    exports.ValueConverterResource = ValueConverterResource;
    exports.bindable = bindable;
    exports.createElement = createElement;
    exports.RenderPlan = RenderPlan;
    exports.customAttribute = customAttribute;
    exports.templateController = templateController;
    exports.CustomAttributeResource = CustomAttributeResource;
    exports.registerAttribute = registerAttribute;
    exports.createCustomAttributeDescription = createCustomAttributeDescription;
    exports.customElement = customElement;
    exports.useShadowDOM = useShadowDOM;
    exports.containerless = containerless;
    exports.CustomElementResource = CustomElementResource;
    exports.registerElement = registerElement;
    exports.$attachAttribute = $attachAttribute;
    exports.$attachElement = $attachElement;
    exports.$attachView = $attachView;
    exports.$detachAttribute = $detachAttribute;
    exports.$detachElement = $detachElement;
    exports.$detachView = $detachView;
    exports.$cacheAttribute = $cacheAttribute;
    exports.$cacheElement = $cacheElement;
    exports.$cacheView = $cacheView;
    exports.$mountElement = $mountElement;
    exports.$unmountElement = $unmountElement;
    exports.$mountView = $mountView;
    exports.$unmountView = $unmountView;
    exports.$bindAttribute = $bindAttribute;
    exports.$bindElement = $bindElement;
    exports.$bindView = $bindView;
    exports.$unbindAttribute = $unbindAttribute;
    exports.$unbindElement = $unbindElement;
    exports.$unbindView = $unbindView;
    exports.renderStrategy = renderStrategy;
    exports.RenderStrategyResource = RenderStrategyResource;
    exports.registerRenderStrategy = registerRenderStrategy;
    exports.ITemplateCompiler = ITemplateCompiler;
    exports.$hydrateAttribute = $hydrateAttribute;
    exports.$hydrateElement = $hydrateElement;
    exports.defaultShadowOptions = defaultShadowOptions;
    exports.IRenderingEngine = IRenderingEngine;
    exports.ShadowDOMProjector = ShadowDOMProjector;
    exports.ContainerlessProjector = ContainerlessProjector;
    exports.HostProjector = HostProjector;
    exports.RuntimeBehavior = RuntimeBehavior;
    exports.findElements = findElements;
    exports.RuntimeCompilationResources = RuntimeCompilationResources;
    exports.CompiledTemplate = CompiledTemplate;
    exports.noViewTemplate = noViewTemplate;
    exports.createRenderContext = createRenderContext;
    exports.InstanceProvider = InstanceProvider;
    exports.ViewFactoryProvider = ViewFactoryProvider;
    exports.addBindable = addBindable;
    exports.addAttachable = addAttachable;
    exports.Renderer = Renderer;
    exports.View = View;
    exports.ViewFactory = ViewFactory;
    exports.Aurelia = Aurelia;
    exports.customElementName = customElementName;
    exports.customElementKey = customElementKey;
    exports.customElementBehavior = customElementBehavior;
    exports.customAttributeName = customAttributeName;
    exports.customAttributeKey = customAttributeKey;
    exports.ITargetedInstruction = ITargetedInstruction;
    exports.isTargetedInstruction = isTargetedInstruction;
    exports.buildRequired = buildRequired;
    exports.buildTemplateDefinition = buildTemplateDefinition;
    exports.ELEMENT_NODE = ELEMENT_NODE;
    exports.ATTRIBUTE_NODE = ATTRIBUTE_NODE;
    exports.TEXT_NODE = TEXT_NODE;
    exports.COMMENT_NODE = COMMENT_NODE;
    exports.DOCUMENT_FRAGMENT_NODE = DOCUMENT_FRAGMENT_NODE;
    exports.INode = INode;
    exports.IRenderLocation = IRenderLocation;
    exports.DOM = DOM;
    exports.NodeSequence = NodeSequence;
    exports.TextNodeSequence = TextNodeSequence;
    exports.FragmentNodeSequence = FragmentNodeSequence;
    exports.NodeSequenceFactory = NodeSequenceFactory;
    exports.AuMarker = AuMarker;
    exports.IRenderable = IRenderable;
    exports.IViewFactory = IViewFactory;
    exports.ILifecycle = ILifecycle;
    exports.IFlushLifecycle = IFlushLifecycle;
    exports.IBindLifecycle = IBindLifecycle;
    exports.IAttachLifecycle = IAttachLifecycle;
    exports.Lifecycle = Lifecycle;
    exports.LifecycleTask = LifecycleTask;
    exports.AggregateLifecycleTask = AggregateLifecycleTask;
    exports.PromiseSwap = PromiseSwap;
    exports.PromiseTask = PromiseTask;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map