// import { run } from "./common";
// import { ContentWrapper } from "./contentWrapper";
// import { MainConnectToFrame } from "./frameConnect";
// const button = document.createElement('button');
// button.innerHTML = 'run';
// document.body.appendChild(button);
// run(async () => {
//   const contentWrapper = new ContentWrapper(document.body, 'pop-up', 'http://localhost:5173/login.html');

//   contentWrapper.onOpen(async () => {
//     // const src = new URL("login.html", window.location.href).href;
//     const iframe = contentWrapper.iframe;
//     if(!iframe) throw new Error('iframe is not defined');
//     const _iframe = new MainConnectToFrame(iframe);

//     await _iframe.connect();

//     let count = 0
//     const props = {name: 'long', onCall: (props: any) => {
//       console.log("call", props);
//     }}
//     const handle = () => {
//       count++
//       props.name = 'long' + count
//       _iframe.setProps(props)
//     }

//     _iframe.onMethodCall(({ method, args }) => {
//       console.log("method", method);
//       console.log("args", args);
//       handle();
//     });


//     _iframe.setProps(props)
//   })
  
//   button.addEventListener('click', () => {
//     contentWrapper.render();
//     contentWrapper.onClose(() => {
      
//     })
//   })
// })

import { TinyEmitter } from 'tiny-emitter';
import { propsToEvent } from './PropsToEvent';
import { run } from './common';

const btn = document.createElement('button');
btn.innerHTML = 'run';
document.body.appendChild(btn);
// const tmp = new PropsToEventCenter({long: 'long', pham: [], setName: function handle(name: string) {
//   tmp.props.long = name;
// }})

// tmp.onPropsChange((props) => {
//   tmp.props.pham = []; 
//   console.log(props)
// })
// let count = 0;
// btn.addEventListener('click', () => {
//   count++
//   tmp.props.setName('long2' + count);
// })
const emitter = new TinyEmitter()
let count = 0;
run(async () => {
  const main = propsToEvent('Main', emitter, {long: 'long', pham: [], setName: function handle(name: string) {
    main.props.setProperties({
      long: name,
      pham: [123]
    });
  }});

  btn.addEventListener('click', () => {
    count++
    main.props.setName('long2' + count);
  })

  await main.connect();
})

run(async () => {
  const client = propsToEvent('Client', emitter)
  
  client.onPropsChange((props) => {
    console.log(props)
  })

  await client.connect()
})



