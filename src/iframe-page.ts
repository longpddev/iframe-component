export function init () {

  const makeOnceIframe = () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
  
    const _window = iframe.contentWindow;
    if(!_window) throw new Error('Cors origin');
  
    const _document = _window.document;
  
    const title = document.createElement('h1');
    title.innerHTML = 'long 123'
    _document.body.appendChild(title)
  }
  
  for(let i = 0; i < 1000; i++) {
    makeOnceIframe();
  }
}