import { TinyEmitter } from "tiny-emitter";

type Props = Record<string, any>;

const checkTypeAllow = (key: any, value: any) => {
    const type = typeof key;
    switch(type) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'undefined':
        case 'function':
            return true;
        default: {
            if(key === null) {
                return true;
            } else if(Array.isArray(key)){
                return true;
            }
        }
    }

    return false;
}

const FUNCTION_MARK = 'function_haGZFYY7Yjwe137X'

const serializeProps = (props: Props = {}) => {
    const _props = {...props}
    for(const key in _props) {
        const value = _props[key];
        if(!checkTypeAllow(key, value)) {
            console.error(`property`,key, `with value`, typeof value, `not allow`)
            throw new Error(`property ${key} with value ${typeof value} not allow`);
        }

        if(typeof value === 'function') {
            _props[key] = FUNCTION_MARK;
        }
    }

    return _props;
}

const deserializeProps = (props: Props, onMethodCall: (method: string, args?: any) => void) => {
    for(const key in props) {
        const value = props[key];
        if(value === FUNCTION_MARK) {
            props[key] = (...args: any) => {
                onMethodCall(key, args);
            }
        }
    }

    return props;
}

type propsToEventReturn = {
    'Main': { props: Props, connect: () => Promise<void> },
    'Client': { onPropsChange: (cb: (props: Props) => void) => () => TinyEmitter, connect: () => Promise<void> }
}

export function propsToEvent(type: 'Client', emitter: TinyEmitter): propsToEventReturn['Client'];
export function propsToEvent(type: 'Main', emitter: TinyEmitter, props: Props): propsToEventReturn['Main'];
export function propsToEvent(type: 'Main' | 'Client', emitter: TinyEmitter, props?: Props) {
    let _draft: Props | undefined;
    let onPropsChangeCalling = false;

    function _props () {
        if(!props) throw new Error('props is not defined');
        const validate = (target: Props, key: string, value: any) => {
            if(!(key in target)) {
                throw new Error(`Property: ${key} do not exist in props default`)
            }
            if(!checkTypeAllow(key, value)) {
                console.error(`property`,key, `with value`, typeof value, `not allow`)
                throw new Error(`property ${key} with value ${typeof value} not allow`);
            }

            if(value !== target[key as keyof typeof target]) {
                return true;
            } 

            return false;
        }
        return new Proxy(props, {
            set: (target, key, value) => {
                if(validate(target, key.toString(), value)) {
                    setDraft({
                        [key]: value
                    })
                }
                return value;
            },
            get: (target, key) => {
                console.log(key)
                if(key === 'setProperties') {
                    return (props: Props) => {
                        const tmp: Props = {}
                        for(const key in props) {
                            if(!validate(target, key, props[key])) {
                                continue;
                            }

                            tmp[key] = props[key];
                        }
                        Object.keys(tmp).length > 0 && setDraft(tmp);
                    }
                }
                return target[key as keyof typeof target];
            }
        })
    }

    function applyDraft() {
        if(!props) throw new Error('props is not defined');
        if(!_draft) return;
        if(onPropsChangeCalling) return;
        Object.assign(props, _draft);
        emitter.emit('props-change', serializeProps(_draft));
    }

    function setDraft(props: Props) {
        _draft = props;
        applyDraft();
    }

    function onPropsChange(cb: (props: Props) => void) {
        const handle = async (props: Props) => {
            onPropsChangeCalling = true;
            cb(deserializeProps(props, (method, args) => {
                emitter.emit('method-call', [method, args]);
            }));
            await Promise.resolve();
            onPropsChangeCalling = false;
        }
        emitter.on('props-change', handle);
        return () => emitter.off('props-change', handle);
    }

    const result = {
        Main: () => ({
            props: _props(),
            async connect() {
                await new Promise(res => {
                    emitter.on('client-init', res)
                })
                emitter.emit('main-init-props', serializeProps(props as Props))
            }
        }),
        Client: () => ({
            onPropsChange,
            async connect() {
                emitter.emit('client-init');
                const props = await new Promise(res => {
                    emitter.on('main-init-props', (props: Props) => res(props))
                })
                emitter.emit('props-change', props);
            }
        })
    }
    return result[type]();
}

export class PropsToEventCenter {
    private _draft: Props | undefined;
    private onPropsChangeCalling = false;
    constructor(
        private readonly _props: Props,
        private readonly emitter = new TinyEmitter()
    ) {}

    applyDraft() {
        if(!this._draft) return;
        if(this.onPropsChangeCalling) return;
        Object.assign(this._props, this._draft);
        this.emitter.emit('props-change', serializeProps(this._props));
    }

    setDraft(props: Props) {
        this._draft = props;
        this.applyDraft();
    }

    onPropsChange(cb: (props: Props) => void) {
        const handle = async (props: Props) => {
            this.onPropsChangeCalling = true;
            cb({...props, ...deserializeProps(props, (method, args) => {
                this.emitter.emit('method-call', [method, args]);
            })});
            await Promise.resolve();
            this.onPropsChangeCalling = false;
            this.applyDraft()
        }
        this.emitter.on('props-change', handle);
        return () => this.emitter.off('props-change', handle);
    }

    get props () {
        const validate = (target: Props, key: string, value: any) => {
            if(!(key in target)) {
                throw new Error(`Property: ${key} do not exist in props default`)
            }
            if(!checkTypeAllow(key, value)) {
                console.error(`property`,key, `with value`, typeof value, `not allow`)
                throw new Error(`property ${key} with value ${typeof value} not allow`);
            }

            if(value !== target[key as keyof typeof target]) {
                return true;
            } 

            return false;
        }
        const handle= (target: Props, key: string, value: any) => {
            
        }
        return new Proxy(this._props, {
            set: (target, key, value) => {
                if(validate(target, key.toString(), value)) {
                    this.setDraft({
                        [key]: value
                    })
                }
                return value;
            },
            get: (target, key) => {
                console.log(key)
                if(key === 'setProperties') {
                    return (props: Props) => {
                        const tmp: Props = {}
                        for(const key in props) {
                            if(!validate(target, key, props[key])) {
                                continue;
                            }

                            tmp[key] = props[key];
                        }
                        console.log(tmp)
                        Object.keys(tmp).length > 0 && this.setDraft(tmp);
                    }
                }
                return target[key as keyof typeof target];
            }
        })
    }

}

// export class EmitterTransportsProps {
//     constructor(
//         private readonly emitter: TinyEmitter,
//         private props: Props,
//         private readonly type: 'Main' | 'Client'
//     ) {}

//     getEventName(name: string) {
//         return `${this.type}-${name}`;
//     }

//     private _draft: Props | undefined;
//     private onPropsChangeCalling = false;

//     applyDraft() {
//         if(!this._draft) return;
//         if(this.onPropsChangeCalling) return;
//         Object.assign(this.props, this._draft);
//         this.emitter.emit('client__props-change', serializeProps(this.props));
//     }

//     setDraft(props: Props) {
//         this._draft = props;
//         this.applyDraft();
//     }

//     onPropsChange(cb: (props: Props) => void) {
//         const handle = async (props: Props) => {
//             this.onPropsChangeCalling = true;
//             const props
//             cb(deserializeProps(props, (method, args) => {
//                 this.emitter.emit('main__method-call', [method, args]);
//             }));
//             await Promise.resolve();
//             this.onPropsChangeCalling = false;
//             this.applyDraft()
//         }
//         this.emitter.on('client__props-change', handle);
//         return () => this.emitter.off('client__props-change', handle);
//     }
// }