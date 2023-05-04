import { TinyEmitter } from "tiny-emitter";
export function byteToHex(val: number) {
    const str = val.toString(16);
    return str.length === 1 ? '0' + str : str;
  }

  export function generateHexString(len: number) {
    const bytes = new Uint8Array(len / 2);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(byteToHex).join('');
  }
  
export const element = document.body;
export const pipeline = generateHexString(8);
const dataEvent = (eventName: string, data: any, type: 'request' | 'response', id?: string) => {
    return {
        type, eventName, data, id
    }
}

type FnHandle = (data: any) => void | Promise<void>;

export class EventRPC {
    destroyable: Array<() => void> = [];
    callbacks = new Map<string, FnHandle>();
    listeners = new Map<string, FnHandle>();
    private _init = false;
    constructor(
        private readonly element: HTMLElement,
        private readonly pipeline: string,
    ) {}

    public init() {
        if(this._init) throw new Error('EventRPC already initialized');
        this._init = true;
        const handle = async (event: Event) => {
            const { type, eventName, data, id } = (event as CustomEvent).detail;
            if (type === 'request') {
                if(this.listeners.has(eventName)) {
                    const fn = (this.listeners.get(eventName)) as FnHandle;
                    let result = fn(data);
                    if(result instanceof Promise) {
                        result = await result
                    }
                    const responseEvent = new CustomEvent(eventName, { detail: dataEvent(eventName, result, 'response', id) });
                    this.element.dispatchEvent(responseEvent);
                }
            } else if (type === 'response') {
                if(this.callbacks.has(id)) {
                    const fn = this.callbacks.get(id) as FnHandle;
                    fn(data);
                    this.callbacks.delete(id);
                }
            }
        }
        this.element.addEventListener(this.pipeline, handle);

        this.destroyable.push(() => {
            this.element.removeEventListener(this.pipeline, handle);
        })
    }

    public async call(fnName: string, ...args: any[]) {
        const id = generateHexString(8);
        const event = new CustomEvent(this.pipeline, { detail: dataEvent(fnName, args, 'request', id) });
        this.element.dispatchEvent(event);
        return new Promise((resolve) => {
            this.callbacks.set(id, (data: any) => resolve(data));
        })
    }

    public async define(fnName: string, fn: FnHandle) {
        if(this._init) throw new Error('EventRPC already initialized');
        this.listeners.set(fnName, fn);
    }

    public destroy() {
        this.destroyable.forEach(fn => fn());
    }
}

export const run = <F extends (...args: any) => any> (fn: F): ReturnType<F> => {
    return fn();
}

export type FunAny = (...args: any[]) => any;
export type ZoidProps = Record<string, string>;
export type ZoidEvents = Record<string, FunAny>;
export interface ZoidMessage {
  type: 'request' | 'response';
  eventName: string;
  data?: any;
}  
export const zoid_id = 'aslkdjflksjadlkfjalksdjflksajdflkjs';
export const ZOID_EVENTS_NAME = 'sdjflk7f98sd7f'
export const isIframe = window.top !== window.self;

export const emitter = new TinyEmitter();


export function makeEvent (eventTarget: EventTarget, eventName: string, data?: any) {
  const message: ZoidMessage = {
    type: 'request',
    eventName,
    data,
  }
  const customEvent = new CustomEvent(zoid_id, { detail: message });

  eventTarget.dispatchEvent(customEvent);
}

export function parseMessage(event: Event) {
  const { type, eventName, data } = (event as CustomEvent).detail as ZoidMessage;
  return { type, eventName, data };
}

