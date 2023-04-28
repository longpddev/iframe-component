import { FrameConnectToMain } from "./frameConnect";
const button = document.createElement('button');
document.body.appendChild(button);
(new FrameConnectToMain()).render((props) => {
    button.innerHTML = props.name;
    button.onclick = () => {
        props.onCall({name: 'long'})
    }
})