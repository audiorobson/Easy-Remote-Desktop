const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const redirect = require('./official-panel.cjs');

test('legacy entry points redirect without credentials while backend endpoints remain available', async t => {
    const app = express();
    app.all(['/', '/login', '/tokenlogin', '/logout'], redirect('http://127.0.0.1:4070/'));
    app.get('/control.ashx', (_req, res) => res.send('transport'));
    app.get('/meshagents', (_req, res) => res.send('agent'));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => { server.closeAllConnections(); server.close(); });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const route of ['/', '/login', '/LOGIN/', '/tokenlogin', '/logout']) {
        for (const method of ['GET', 'POST']) {
            const response = await fetch(base + route + '?key=do-not-forward', { method, redirect: 'manual', headers: { Cookie: 'session=old-login' } });
            assert.equal(response.status, 303);
            assert.equal(response.headers.get('location'), 'http://127.0.0.1:4070/');
            assert.equal(response.headers.get('cache-control'), 'no-store');
        }
    }
    assert.equal(await (await fetch(base + '/control.ashx')).text(), 'transport');
    assert.equal(await (await fetch(base + '/meshagents')).text(), 'agent');
});

test('reject invalid redirect protocols and embedded credentials', () => {
    for (const url of ['javascript:alert(1)', 'http://user:secret@localhost/']) assert.throws(() => redirect(url));
});
