import { element, EventRPC, pipeline } from "./common";

const rpc = new EventRPC(element, pipeline);

const button = document.createElement('button');
button.innerText = 'Click me';
document.body.appendChild(button);
rpc.init();

button.addEventListener('click', async () => {
    const result = await rpc.call('test');
    console.log(result);
})