import { InjectArray } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';
export interface QueuedBrowserHistory extends History {
    activate(callback: (ev?: PopStateEvent) => void): void;
    deactivate(): void;
}
export declare class QueuedBrowserHistory implements QueuedBrowserHistory {
    static readonly inject: InjectArray;
    private readonly lifecycle;
    private readonly queue;
    private isActive;
    private currentHistoryActivity;
    private callback;
    private goResolve;
    private suppressPopstateResolve;
    constructor(lifecycle: ILifecycle);
    readonly length: number;
    readonly state: any;
    readonly scrollRestoration: ScrollRestoration;
    go(delta?: number, suppressPopstate?: boolean): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    pushState(data: any, title: string, url?: string | null): Promise<void>;
    replaceState(data: any, title: string, url?: string | null): Promise<void>;
    private readonly handlePopstate;
    private popstate;
    private _go;
    private suppressPopstate;
    private enqueue;
    private dequeue;
}
//# sourceMappingURL=queued-browser-history.d.ts.map