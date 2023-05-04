import { TinyEmitter } from 'tiny-emitter';
import { propsToEvent } from './PropsToEvent';
import { run } from './common';

export function init () {
  const btn = document.createElement('button');
  btn.innerHTML = 'run';
  document.body.appendChild(btn);

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
}