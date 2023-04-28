import { FunAny } from "./common";
import { FrameEventControl } from "./frameEventControl";

const ZOID_FUNCTION_TYPE = 'zoid-function-sdfjlks234902873sc,msdh';

const lazyRun = (cb: FunAny) => {
    ('queueMicrotask' in window ? window.queueMicrotask : setTimeout)(cb);
}

const decodeProps = (props: Record<string, any>, onMethodCall: (method: string, args: any) => void) => {
    const result: Record<string, any> = {};
    Object.entries(props).forEach(([key, value]) => {
        if(value === ZOID_FUNCTION_TYPE) {
            result[key] = (...args: any) => {
                onMethodCall(key, args);
            };
            return;
        } else {
            result[key] = value;
        }
    })
    return result;
}

const encodeProps = (props: Record<string, any>) => {
    const result: Record<string, any> = {};

    Object.entries(props).forEach(([key, value]) => {
        if(typeof value === 'function') {
            result[key] = ZOID_FUNCTION_TYPE
            return;
        } else {
            result[key] = value;
        }
    });

    return result;
}
export class MainConnectToFrame {
    private eventControl: FrameEventControl;
    private readonly destroyable: Array<() => void> = [];
    constructor(iframe: HTMLIFrameElement) {
        const contentWindow = iframe?.contentWindow;
        if(!contentWindow) {
            console.error('contentWindow is null')
            throw new Error('contentWindow is null');
        }

        window._run = () => console.log(contentWindow)
        this.eventControl = new FrameEventControl(contentWindow, 'Parent')
    }

    async connect() {
        await new Promise(res => {
            this.eventControl.once('connect-frame-to-main', res);
        })

        console.log('connect-frame-to-main')
        this.eventControl.emit('connect-main-to-frame');
    }

    onMethodCall(cb: (method: string, args: any) => void) {
        this.eventControl.on('method-call', cb);
    }

    setProps(props: Record<string, any>) {
        lazyRun(() => {
            this.eventControl.emit('props', encodeProps(props));
        })
    }

    destroy() {
        this.eventControl.destroy();
        this.destroyable.forEach(fn => fn());
    }
}

export class FrameConnectToMain {
    private eventControl = new FrameEventControl(window, 'Child');
    private readonly destroyable: Array<() => void> = [];

    async render(cb: (props: Record<string, any>) => any) {
        await new Promise(res => {
            this.eventControl.once('connect-main-to-frame', res);
            this.eventControl.emit('connect-frame-to-main');
        })
        this.eventControl.on('props', (props: Record<string, any>) => {
            cb(decodeProps(props, (method, args) => {
                this.eventControl.emit('method-call', { method, args });
            }));
        })
    }
    destroy() {
        this.eventControl.destroy();
        this.destroyable.forEach(fn => fn());
    }
}