const stick1 = document.getElementsByClassName ('color')[0]
const stick2 = document.getElementsByClassName ('color2')[0]
const stick3 = document.getElementsByClassName ('brush3')[0]
const lines = document.getElementsByClassName ('lines')[0]
setTimeout(() => {
  stick2.style.animation = 'movedown 0.5s ease forwards'
}, 5000)

setTimeout(() => {
  stick3.style.animation = 'movedown 0.5s ease forwards'
}, 6000)

setTimeout(() => {
  stick1.style.animation = 'opacity 5s ease forwards'
  lines.style.display = 'flex'
}, 7000)

let colors = [
  '#4a7fcb',
  '#133286',
  '#3062af',
  '#628ace',
  '#949fd9',
  '#821e12',
  '#c34821',
  'red',
  '#d3ab94',
  '#yellow',
  '#4a7fcb',
  '#133286',
  '#3062af',
  '#628ace',
  '#949fd9',
  '#821e12',
  '#c34821',
  'blue',
  '#4a7fcb',
  '#133286',
  '#3062af',
  '#628ace',
  '#949fd9',
  '#821e12',
  '#c34821',
  'red',
  'blue',
  '#4a7fcb',
  '#133286',
  '#3062af',
  '#628ace',
  'blue',
  '#4a7fcb',
  '#133286',
  '#3062af',
  '#628ace',
  'yellow',
  'red',
  'blue',
]

colors.map((color) => {
  const line = document.createElement('div');
  const randomMargin = Math.floor(Math.random() * 1000);

  line.className = 'line';
  line.style.setProperty('--m', `${randomMargin}px`);
  line.style.setProperty('--c', color);
  lines.appendChild(line)
})