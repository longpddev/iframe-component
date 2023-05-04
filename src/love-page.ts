export function init() {
  const title = document.createElement('h1');
  document.title = 'Đức Long yêu Phương Nhiên';
  title.setAttribute('style', `
    text-align: center;
    color: red;
  `)
  title.innerHTML = 'Nhiên ơi anh yêu em moaaaaa?';
  document.body.appendChild(title)
}