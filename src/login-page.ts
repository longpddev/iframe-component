import { FrameConnectToMain } from "./frameConnect";
import 'animate.css';

export function init() {
    const button = document.createElement('button');
    const title = document.createElement('h1');
    title.innerHTML = 'login page'
    document.body.appendChild(title);
    document.body.appendChild(button);
    (new FrameConnectToMain()).render((props) => {
        button.innerHTML = props.name;
        button.onclick = () => {
            props.onCall({name: 'long'})
        }
    
        props.close();
    })
}