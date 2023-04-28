import { TinyEmitter } from "tiny-emitter";
import { FunAny, ZOID_EVENTS_NAME } from "./common";

export type FrameEventControlType = "Parent" | 'Child'
export interface FrameEventControlData {
    eventName: string,
    data: any,
    by: FrameEventControlType,
}

export class FrameEventControl {
    private readonly emitter = new TinyEmitter();
    private readonly destroyable: Array<() => void> = [];
    constructor(private readonly eventTarget: EventTarget, private readonly type: "Parent" | 'Child') {
        const handle = this.handle.bind(this);
        eventTarget.addEventListener(ZOID_EVENTS_NAME, handle);
        this.destroyable.push(() => {
            eventTarget.removeEventListener(ZOID_EVENTS_NAME, handle);
        })
    }

    handle(event: Event) {
        const { eventName, data, by } = (event as CustomEvent).detail as FrameEventControlData;
        if(by === this.type) return;
        this.emitter.emit(eventName, data);
    }

    on(eventName: string, cb: FunAny) {
        this.emitter.on(eventName, cb);

        this.destroyable.push(() => {
            this.emitter.off(eventName, cb);
        })
    }

    once(eventName: string, cb: FunAny) {
        this.emitter.once(eventName, cb);
    }

    emit(eventName: string, data?: any) {
        const event = new CustomEvent(ZOID_EVENTS_NAME, { detail: { eventName, data, by: this.type } });
        this.eventTarget.dispatchEvent(event);
    }

    off(eventName: string, cb: FunAny) {
        this.emitter.off(eventName, cb);
    }

    destroy() {
        this.destroyable.forEach(fn => fn());
    }
}