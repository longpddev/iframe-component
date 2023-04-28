import { run } from "./common";
import { ContentWrapper } from "./contentWrapper";
import { MainConnectToFrame } from "./frameConnect";
const button = document.createElement('button');
button.innerHTML = 'run';
document.body.appendChild(button);
run(async () => {
  const contentWrapper = new ContentWrapper(document.body, 'pop-up', 'http://localhost:5173/login.html');

  contentWrapper.onOpen(async () => {
    // const src = new URL("login.html", window.location.href).href;
    const iframe = contentWrapper.iframe;
    if(!iframe) throw new Error('iframe is not defined');
    const _iframe = new MainConnectToFrame(iframe);

    await _iframe.connect();

    let count = 0
    const props = {name: 'long', onCall: (props: any) => {
      console.log("call", props);
    }}
    const handle = () => {
      count++
      props.name = 'long' + count
      _iframe.setProps(props)
    }

    _iframe.onMethodCall(({ method, args }) => {
      console.log("method", method);
      console.log("args", args);
      handle();
    });


    _iframe.setProps(props)
  })
  
  button.addEventListener('click', () => {
    contentWrapper.render();
    contentWrapper.onClose(() => {
      
    })
  })
})