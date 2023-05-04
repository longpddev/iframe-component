import { TinyEmitter } from "tiny-emitter";
import {run} from "./common";

// const createDelayedStatusEmitter = (/** @type {TinyEmitter} */emitter) => ({
//     when: (/** @type {string} */status) => ({
//         wait: (/** @type {number} */wait) => ({
//             trigger: (/** @type {string} */newStatus) => {
//                 async function handle () {
//                     if(wait) {
//                         await new Promise(res => {
//                             setTimeout(res, wait);
//                         })
//                     }

//                     emitter.emit(newStatus)
//                 }

//                 emitter.on(status, handle);
//                 return () => emitter.off(status, handle);
//             }
//         })
//     })
// })

const createDelayedStatusEmitter = (emitter: TinyEmitter) => ({
    when: (status: string) => ({
        wait: (wait: number) => ({
            trigger: (newStatus: string) => {
                async function handle () {
                    if(wait) {
                        await new Promise(res => {
                            setTimeout(res, wait);
                        })
                    }

                    emitter.emit(newStatus)
                }

                emitter.on(status, handle);
                return () => emitter.off(status, handle);
            }
        })
    })
})

function setStyle(el: HTMLElement, style: string) {
    el.setAttribute('style', style.replace(/\s\s/g, ''))
    return el;
}

export class ContentWrapper {
    private readonly destroyable: Array<() => void> = [];
    private readonly emitter = new TinyEmitter();
    public iframe: HTMLIFrameElement | undefined;
    constructor(
        private readonly container: HTMLElement,
        private readonly url: string
    ) {}

    renderPopUp() {
        const iframe = document.createElement('iframe');
        iframe.src = this.url;
    }

    render() {
        const iframe = document.createElement('iframe');
        this.iframe = iframe
        const main = document.createElement('div');
        const overlay = document.createElement('div');
        const wrapIframe = document.createElement('div');
        const style = document.createElement('style');
        wrapIframe.appendChild(iframe)
        iframe.src = this.url;
        const animationTime = 0;
        style.innerHTML = `
          :root {
            --animate-duration: ${animationTime}ms;
          }
        `

        setStyle(overlay, `
            position: fixed;
            bottom: 0;
            right: 0;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: black;
            opacity: 0.1;
        `)

        setStyle(main, `
            position: fixed;
            bottom: 0;
            right: 0;
            top: 0;
            left: 0;
            z-index: 999999;
            width: 100%;
            height: 100%;
            border: 0;
            outline: 0;
            opacity: 1;
            background-color: white;
        `)

        setStyle(wrapIframe, `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `)

        setStyle(iframe, `
            border: 0;
            outline: 0;
            width: 500px;
            height: 500px;
            background-color: white;
            border-radius: 10px;
        `)

        overlay.addEventListener('click', () => {
            this.emitter.emit('close');
        })

        createDelayedStatusEmitter(this.emitter).when('open').wait(animationTime).trigger('opened');
        createDelayedStatusEmitter(this.emitter).when('close').wait(animationTime).trigger('closed');
        
        main.appendChild(style);
        main.appendChild(overlay);
        main.appendChild(wrapIframe);
        this.container.appendChild(main);

        const addAndRemovePrev = run(() => {
            let prev: Array<string>;
            return (className: string | Array<string>) => {
                const listClassName = Array.isArray(className) ? className : [className]
                if(prev) {
                    iframe.classList.remove(...prev);
                }

                prev = listClassName;
                iframe.classList.add(...listClassName)
            }
        })
        
        this.emitter.on('open', () => {
            addAndRemovePrev(['animate__animated' ,'animate__fadeInUp'])
        })
        this.emitter.on('opened', () => {
        })
        this.emitter.on('close', () => {
            addAndRemovePrev(['animate__animated' ,'animate__fadeOutUp'])
        })
        this.emitter.on('closed', () => {
            main.remove();
        })
        this.emitter.emit('open')
        return iframe;
    }

    onClose(cb: () => void) {
        this.emitter.on('closed', cb);
        this.destroyable.push(() => {
            this.emitter.off('closed', cb);
        })
    }

    onOpen(cb: () => void) {
        this.emitter.on('open', cb);
        this.destroyable.push(() => {
            this.emitter.off('open', cb);
        })
    }

    close() {
        this.emitter.emit('close');
    }

    destroy () {
        this.destroyable.forEach(fn => fn());
    }

}