import { TinyEmitter } from "tiny-emitter";

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
        private readonly type: 'pop-up' | 'new-window',
        private readonly url: string
    ) {}

    renderPopUp() {
        const iframe = document.createElement('iframe');
        iframe.src = this.url;
    }

    render() {
        const iframe = document.createElement('iframe');
        this.iframe = iframe
        const wrapper = document.createElement('div');
        const overlay = document.createElement('div');
        const style = document.createElement('style');
        iframe.src = this.url;
        
        style.innerHTML = `
            .popup-status-open {
                opacity: 0;
                top: -100%;
            }

            .popup-status-opened {
                opacity: 1;
                top: 0;
            }

            .popup-status-close {
                opacity: 0;
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

        setStyle(wrapper, `
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
            transition: all 3s;
        `)

        setStyle(iframe, `
            position: absolute;
            border-radius: 10px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            border: 0;
            outline: 0;
            background-color: white;
        `)

        overlay.addEventListener('click', () => {
            this.emitter.emit('close');
        })

        createDelayedStatusEmitter(this.emitter).when('open').wait(50).trigger('opened');
        createDelayedStatusEmitter(this.emitter).when('close').wait(300).trigger('closed');
        
        wrapper.appendChild(style);
        wrapper.appendChild(overlay);
        wrapper.appendChild(iframe);
        this.container.appendChild(wrapper);

        const wrapperAddStatus = (status: 'open' | 'close' | 'opened' | 'closed') => {
            const addPrefix = (str: string) => `popup-status-${str}`
            const listClass = ['open' , 'close' , 'opened' , 'closed'].map(addPrefix)
            wrapper.classList.remove(...listClass)
            wrapper.classList.add(addPrefix(status))
        }
        
        this.emitter.on('open', () => {
            wrapperAddStatus('open')
        })
        this.emitter.on('opened', () => {
            wrapperAddStatus('opened')
        })
        this.emitter.on('close', () => {
            wrapperAddStatus('close')
        })
        this.emitter.on('closed', () => {
            wrapperAddStatus('closed');
            wrapper.remove();
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