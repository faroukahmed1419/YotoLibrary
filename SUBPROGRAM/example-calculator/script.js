let calcVal = '0';

function calcInput(v) {
  if (calcVal === '0' && v !== '.') calcVal = v;
  else calcVal += v;
  document.getElementById('calcScreen').value = calcVal;
}
function calcClear() {
  calcVal = '0';
  document.getElementById('calcScreen').value = calcVal;
}
function calcBackspace() {
  calcVal = calcVal.length > 1 ? calcVal.slice(0, -1) : '0';
  document.getElementById('calcScreen').value = calcVal;
}
function calcEquals() {
  try {
    // simple safe eval for + - * / . and digits only
    if (!/^[0-9+\-*/.]+$/.test(calcVal)) throw new Error('invalid');
    calcVal = String(Function('"use strict";return (' + calcVal + ')')());
  } catch (e) {
    calcVal = 'خطأ';
  }
  document.getElementById('calcScreen').value = calcVal;
}
