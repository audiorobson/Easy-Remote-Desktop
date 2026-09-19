// Easywall laboratory bootstrap. Upstream MeshCentral remains Apache-2.0.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const host = process.argv[2];
if (net.isIP(host) !== 4) throw new Error('Usage: node easywall/setup.cjs <server IPv4>');
const data = path.join(root, 'meshcentral-data');
const resume = process.argv.includes('--resume');
if (fs.existsSync(data) && !resume) throw new Error('Existing data: setup refuses to overwrite accounts/configuration.');
if (resume && fs.existsSync(path.join(data, 'meshcentral.db'))) throw new Error('Database exists; refusing to repeat bootstrap.');
fs.mkdirSync(data, { recursive: true });
fs.mkdirSync(path.join(root, '.easywall'), { recursive: true });
const config = {
  settings: { cert: host, port: 4430, portBind: host, redirPort: 0, mpsPort: 0,
    exactPorts: true, WANonly: true, selfUpdate: false,
    sessionKey: crypto.randomBytes(48).toString('hex') },
  domains: { '': { title: 'Easy Remote Desktop', title2: 'Easywall | Laboratorio',
    newAccounts: false, userNameIsEmail: false } }
};
fs.writeFileSync(path.join(data, 'config.json'), JSON.stringify(config, null, 2));
const password = crypto.randomBytes(24).toString('base64url') + '!aA9';
fs.writeFileSync(path.join(root, '.easywall', 'ACESSO-LOCAL.txt'),
  `Easywall laboratorio\nURL: https://${host}:4430\nUsuario: easywall-admin\nSenha: ${password}\nAtive MFA na conta. Este arquivo nao deve ser compartilhado nem versionado.\n`);
for (const args of [['--createaccount', 'easywall-admin', '--pass', password], ['--adminaccount', 'easywall-admin']]) {
  const result = spawnSync(process.execPath, [path.join(root, 'meshcentral.js'), '--datapath', data, ...args], { cwd: root, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0 || !/Done\./.test(result.stdout)) {
    throw new Error('Account bootstrap failed: ' + (result.error || result.stdout + result.stderr));
  }
}
console.log(`Configured https://${host}:4430. Credentials: .easywall/ACESSO-LOCAL.txt`);
