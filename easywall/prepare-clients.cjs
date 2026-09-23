// Verify HTTPS and authenticated WebSocket; prepare the Windows x64 lab agent.
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const { pipeline } = require('node:stream/promises');
const WebSocket = require('ws');
const root = path.resolve(__dirname, '..');
const config = require('../meshcentral-data/config.json');
const base = `https://${config.settings.cert}:${config.settings.port}`;
const ca = fs.readFileSync(path.join(root, 'meshcentral-data/root-cert-public.crt'));
const password = fs.readFileSync(path.join(root, '.easywall/ACESSO-LOCAL.txt'), 'utf8').match(/^Senha: (.+)$/m)[1];
function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { ca, timeout: 20000 }, res => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode}`)); } else resolve(res);
    });
    req.on('timeout', () => req.destroy(new Error('HTTPS timeout')));
    req.on('error', reject);
  });
}
async function main() {
  const page = await get(base + '/health.ashx');
  let html = ''; for await (const chunk of page) html += chunk;
  if (html !== 'ok') throw new Error('Backend health check failed');
  console.log('PASS: Backend HTTPS health with local CA validation. Official UI: Control Room.');
  const ws = new WebSocket(base.replace('https:', 'wss:') + '/control.ashx', { ca,
    headers: { 'x-meshauth': Buffer.from('easywall-admin').toString('base64') + ',' + Buffer.from(password).toString('base64') } });
  const pending = new Map(); let sequence = 0;
  function request(action) {
    return new Promise((resolve, reject) => {
      const responseid = String(++sequence);
      const timer = setTimeout(() => { pending.delete(responseid); reject(new Error('WebSocket timeout')); }, 20000);
      pending.set(responseid, msg => { clearTimeout(timer); resolve(msg); });
      ws.send(JSON.stringify({ ...action, responseid, tag: responseid }));
    });
  }
  ws.on('message', data => {
    const msg = JSON.parse(data);
    const id = msg.responseid || msg.tag;
    if (pending.has(id)) { pending.get(id)(msg); pending.delete(id); }
  });
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  try {
    let groups = await request({ action: 'meshes' });
    if (!Array.isArray(groups.meshes)) throw new Error('Authentication/group listing failed');
    let group = groups.meshes.find(g => g.name === 'Easywall - Laboratorio');
    if (!group) {
      const created = await request({ action: 'createmesh', meshname: 'Easywall - Laboratorio', meshtype: 2, desc: 'Clientes Windows 11 do laboratorio Easywall', consent: 7 });
      if (created.result !== 'ok') throw new Error(JSON.stringify(created));
      groups = await request({ action: 'meshes' });
      group = groups.meshes.find(g => g.name === 'Easywall - Laboratorio');
    }
    if (!group) throw new Error('Lab group missing');
    console.log('PASS: authenticated administration and laboratory device group.');
    const directory = path.join(root, '.easywall', 'client'); fs.mkdirSync(directory, { recursive: true });
    const agent = await get(`${base}/meshagents?id=4&meshid=${encodeURIComponent(group._id.split('/').pop())}`);
    const destination = path.join(directory, 'Easywall-Windows-x64.exe');
    await pipeline(agent, fs.createWriteStream(destination));
    const file = fs.readFileSync(destination);
    if (file.length < 100000 || file.subarray(0, 2).toString() !== 'MZ') throw new Error('Invalid agent executable');
    const devices = await request({ action: 'nodes' });
    const count = Object.values(devices.nodes || {}).reduce((total, list) => total + list.length, 0);
    console.log(`PASS: Windows x64 installer (${file.length} bytes). Enrolled devices: ${count}.`);
  } finally { ws.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
