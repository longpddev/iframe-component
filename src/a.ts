import { element, EventRPC, pipeline } from "./common";

const rpc = new EventRPC(element, pipeline);

rpc.define('test', () => {
    console.log('test');
});

rpc.init();