function dispatchEvent(event) {
  if (event.keyCode != 13) return;
  event.stopPropagation();
  event.preventDefault();
  const input = event.target;
  if (input.value == '') return;
  if (event.ctrlKey) {
    input.value += '\n';
    return;
  }
  input.send();
}

function send() {
  if (this.disabled) return;
  const dataEvent = new Event('data');
  dataEvent.value = this.value;
  this.dispatchEvent(dataEvent);
  this.value = '';
}

function enable(input) {
  input.removeEventListener('keydown', dispatchEvent);
  input.addEventListener('keydown', dispatchEvent);
  input.disabled = false;
  input.send = send;
  setTimeout(() => {
    input.focus();
  });
}

function disable(input) {
  input.disabled = true;
}

export default {
  enable,
  disable
}