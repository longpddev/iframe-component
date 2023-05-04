import { TinyEmitter } from "tiny-emitter"
import { FunAny, ZOID_EVENTS_NAME, parseMessage } from "./common";



interface FunctionCall {
    method: string;
    data: any;
}

interface ChangeProps { prop: string, value: any }

class ZoidMainPageEvent {
    private emitter = new TinyEmitter();
    private destroyable: Array<() => void> = [];
    constructor(private frame: HTMLIFrameElement) {}

    public setupIframe () {
        const handle = this.handle.bind(this);
        const contentWindow = this.frame?.contentWindow;

        if(!contentWindow) throw new Error('cosntentWindow is null');

        contentWindow.addEventListener(ZOID_EVENTS_NAME, handle);
        this.emitter.on('change-prop', ({ prop, value }: ChangeProps) => {
            contentWindow.dispatchEvent(new CustomEvent(ZOID_EVENTS_NAME, { detail: { type: 'change-prop', eventName: prop, data: value } }));
        })
    }

    private handle(event: Event) {
        const { type, eventName, data } = parseMessage(event);
        if(type === 'request') {
            this.emitter.emit('function-call', { method: eventName, data });
        } else if(type === 'response') {
            // this.emitter.emit(eventName, data);
        }
    }

    public subscriber(cb: (arg: FunctionCall) => void) {
        this.emitter.on('function-call', cb);

        this.destroyable.push(() => {
            this.emitter.off('function-call', cb);
        })
    }

    public changeProps(prop: string, value: any) {
        this.emitter.emit('change-prop', { prop, value });
    }

    destroy () {
        this.destroyable.forEach(fn => fn());
    }
}

class ZoidIframeEvent {
    private emitter = new TinyEmitter();
    private destroyable: Array<() => void> = [];
    constructor() {
        const handle = this.handle.bind(this);
        window.addEventListener(ZOID_EVENTS_NAME, handle);
    }

    handle(event: Event) {
        const { type, eventName, data } = parseMessage(event);
        
    }
}
