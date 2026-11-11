const assert = require('node:assert/strict');
const fs = require('node:fs');
let browserSocket;

(async () => {
  const sourceId = Number(process.argv[2]);
  const codes = process.argv.slice(3, 5);
  const groupCode = process.argv[5];
  assert.ok(Number.isSafeInteger(sourceId) && codes.length === 2);
  const pages = await (await fetch('http://127.0.0.1:9231/json')).json();
  const ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  browserSocket = ws;
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    const task = pending.get(message.id);
    if (task) { pending.delete(message.id); message.error ? task.reject(message.error) : task.resolve(message.result); }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 200; attempt++) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 250)); }
    throw new Error('Timed out: ' + expression + '\n' + await evaluate('document.body.innerText.slice(-2500)'));
  }
  await call('Runtime.enable'); await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: `http://127.0.0.1:3418/orders/${sourceId}/a2d` });
  await waitFor('document.body?.innerText.includes("Review conversion")');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const setInput = async (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); if (!input) throw new Error('Missing input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  if (groupCode) {
    await setInput('input[aria-label="Search end-user schools"]', 'stale search hiding all schools');
    await evaluate(`(() => { const select = document.querySelector('select'); select.value = 'multiple_group'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await waitFor(`!!document.querySelector('input[aria-label="Search end-school groups"]')`);
    assert.equal(await evaluate(`document.querySelector('input[aria-label="Search end-user schools"]').value`), '');
    await setInput('input[aria-label="Search end-school groups"]', 'no such group exists here');
    await waitFor(`document.body.innerText.includes('No groups match this search.')`);
    await setInput('input[aria-label="Search end-school groups"]', 'A2D verification group');
    await waitFor(`Array.from(document.querySelectorAll('#a2d-group-results button')).some(button => button.innerText.includes(${JSON.stringify(groupCode)}))`);
    await setInput('input[aria-label="Search end-school groups"]', groupCode);
    await waitFor(`document.querySelectorAll('#a2d-group-results button').length === 1`);
    await evaluate(`document.querySelector('#a2d-group-results button').click()`);
    await setInput('input[aria-label="Search end-school groups"]', 'no matching group after selection');
    await waitFor(`document.querySelectorAll('#a2d-group-results button').length === 0 && document.body.innerText.includes('No groups match this search.')`);
    await setInput('input[aria-label="Search end-school groups"]', groupCode);
    await waitFor(`document.body.innerText.includes('2 end users selected') && document.body.innerText.includes('Pooled item quantities')`);
    assert.equal(await evaluate(`document.querySelectorAll('input[type=checkbox]:checked').length`), 2);
    await setInput('input[aria-label="Search end-user schools"]', codes[0]);
    await waitFor(`document.querySelectorAll('input[type=checkbox]').length === 1`);
    await setInput('input[aria-label="Search end-user schools"]', 'missing school search');
    await waitFor(`document.body.innerText.includes('No schools match this search.')`);
    await setInput('input[aria-label="Search end-user schools"]', 'A2D verification school');
    await waitFor(`document.querySelectorAll('input[type=checkbox]').length === 2`);
    await setInput('input[aria-label="Search end-user schools"]', '');
  }
  for (const code of groupCode ? [] : codes) {
    await setInput('input[aria-label="Search end-user schools"]', code);
    await waitFor(`Array.from(document.querySelectorAll('label')).some(label => label.innerText.includes(${JSON.stringify(code)}) && label.querySelector('input[type=checkbox]'))`);
    await evaluate(`Array.from(document.querySelectorAll('label')).find(label => label.innerText.includes(${JSON.stringify(code)}) && label.querySelector('input[type=checkbox]')).querySelector('input').click()`);
  }
  await waitFor(`document.querySelectorAll('input[placeholder="Search name or incumbent code"]').length === 2`);
  assert.equal(await evaluate(`document.querySelector('select').querySelectorAll('option').length`), 3);
  await setInput('input[aria-label="Pooled A2D-A quantity"]', '41');
  await setInput('input[aria-label="Pooled A2D-B quantity"]', '10');
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.innerText === 'Review conversion').click()`);
  await waitFor('document.querySelector("[role=alert]")?.innerText.includes("exceeds")');
  await setInput('input[aria-label="Pooled A2D-A quantity"]', '10');
  for (let index = 0; index < 2; index++) {
    await evaluate(`(() => { const input = document.querySelectorAll('input[placeholder="Search name or incumbent code"]')[${index}]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Browser executive ${index + 1}'); input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); })()`);
    await evaluate(`document.querySelector('input[aria-label="Search end-user schools"]').focus()`);
  }
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.innerText === 'Review conversion').click()`);
  await waitFor('document.body.innerText.includes("Confirm conversion")');
  assert.equal(await evaluate('document.body.innerText.includes("Browser executive 1") && document.body.innerText.includes("Browser executive 2")'), true);
  fs.writeFileSync('tmp/a2d-review.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.innerText === 'Confirm conversion').click()`);
  await waitFor('!location.pathname.endsWith("/a2d") && document.body.innerText.includes("A2D conversion history")');
  const resultPath = await evaluate('location.pathname');
  await call('Page.navigate', { url: `http://127.0.0.1:3418${resultPath}/edit` });
  await waitFor('document.body?.innerText.includes("Order Sheet 1") && document.querySelector("form")');
  await new Promise(resolve => setTimeout(resolve, 700));
  assert.equal(await evaluate('Array.from(document.querySelectorAll("input")).some(input => input.value.includes("Browser executive 1")) && Array.from(document.querySelectorAll("input")).some(input => input.value.includes("Browser executive 2"))'), true);
  assert.deepEqual(errors, []);
  console.log('Browser A2D checks passed: school selectors, independent executives, over-allocation error, review, conversion, history and edit persistence. Result: ' + resultPath);
  ws.close();
})().catch(error => { console.error(error); browserSocket?.close(); process.exitCode = 1; });
