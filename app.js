const app = document.querySelector('#app');
const usernameLabel = document.querySelector('#username-label');
const userKey = 'bloxtip-account';

const games = [
  ['Brickbound Valley', 'Explore', '2.4K'], ['Tip Top Town', 'Hangout', '1.8K'],
  ['Tower Rush', 'Challenge', '934'], ['Natural Block Survival', 'Survival', '621']
];

function account() { try { return JSON.parse(localStorage.getItem(userKey)); } catch { return null; } }
function updateUser() { const user = account(); usernameLabel.textContent = user ? `${user.username}` : 'Guest'; }
function gameCards() { return games.map(([title, tag, players]) => `<article class="card"><div class="card-art">${title}</div><div class="card-body"><div class="card-title">${title}</div><div class="card-meta"><span>${players} playing</span><span>${tag}</span></div><div class="rating"></div></div></article>`).join(''); }

function home() {
  app.innerHTML = `<section class="hero"><h1>Make something<br>awesome.</h1><p>Play community-made games, discover new worlds, and build your own place on bloxtip.</p><a class="button" href="/creation">Start creating</a></section><div class="content"><div class="section-heading"><h2>Featured games</h2><a class="link-button" href="#catalog">See all</a></div><div class="cards">${gameCards()}</div><div class="section-heading"><h2>Place files</h2></div><div class="zip-check"><div><strong>Default RBXL places</strong><div>Check the bundled place archive before downloading.</div><div id="zip-status" class="status">Archive checker is ready.</div></div><button class="button" id="check-zip">Check archive</button></div></div>`;
  document.querySelector('#check-zip').addEventListener('click', checkArchive);
}

async function checkArchive() {
  const status = document.querySelector('#zip-status'); const button = document.querySelector('#check-zip');
  button.disabled = true; button.textContent = 'Checking…'; status.className = 'status'; status.textContent = 'Reading default rbxl places.zip…';
  try {
    const response = await fetch('/default%20rbxl%20places.zip', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Archive returned HTTP ${response.status}`);
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    const files = Object.keys(zip.files); const places = files.filter(name => /\.rbxlx?$/i.test(name));
    status.className = 'status ok'; status.textContent = `✓ Archive is available and contains ${places.length} RBXL place${places.length === 1 ? '' : 's'}.`;
  } catch (error) { status.className = 'status error'; status.textContent = `Could not check archive: ${error.message}`; }
  button.disabled = false; button.textContent = 'Check again';
}

function creation() {
  const user = account();
  app.innerHTML = `<section class="panel"><h1>${user ? 'Your bloxtip account' : 'Create your account'}</h1><p>${user ? 'Your account is stored locally in this browser for this static site.' : 'Join the community and start creating your own places.'}</p>${user ? `<div class="notice success">You are signed in as <strong>${user.username}</strong>.</div><button class="button" id="sign-out">Sign out</button>` : `<form id="account-form"><div class="form-row"><label for="username">Username</label><input id="username" name="username" minlength="3" maxlength="20" pattern="[A-Za-z0-9_]+" required placeholder="your_username" /></div><div class="form-row"><label for="email">Email</label><input id="email" name="email" type="email" required placeholder="you@example.com" /></div><div class="form-row"><label for="password">Password</label><input id="password" name="password" type="password" minlength="8" required placeholder="At least 8 characters" /></div><div id="form-message" class="notice" hidden></div><button class="button" type="submit">Create account</button></form>`}</section>`;
  document.querySelector('#sign-out')?.addEventListener('click', () => { localStorage.removeItem(userKey); updateUser(); creation(); });
  document.querySelector('#account-form')?.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const newUser = { username: data.get('username'), email: data.get('email') }; localStorage.setItem(userKey, JSON.stringify(newUser)); updateUser(); creation(); });
}
function route() { updateUser(); location.pathname === '/creation' ? creation() : home(); }
window.addEventListener('popstate', route); document.addEventListener('click', event => { const link = event.target.closest('a[href^="/"]'); if (link && new URL(link.href).origin === location.origin) { event.preventDefault(); history.pushState({}, '', link.href); route(); } }); route();
