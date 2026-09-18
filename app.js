const accountKey = 'bloxtip-account';
const archivePath = '../default%20rbxl%20places.zip';

const getAccount = () => {
  try {
    return JSON.parse(localStorage.getItem(accountKey));
  } catch {
    return null;
  }
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[character]));

const placeTitle = (filename) => filename
  .replace(/^.*[\\/]/, '')
  .replace(/\.rbxlx?$/i, '')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim() || 'Untitled place';

const placeArt = (title) => title.split(' ').slice(0, 3).join(' ');

function renderGames(places) {
  const row = document.querySelector('#game-row');
  if (!row) return;

  if (!places.length) {
    row.innerHTML = '<p class="empty-state">No RBXL places were found in the archive.</p>';
    return;
  }

  row.innerHTML = places.map((place) => {
    const title = escapeHtml(place.title);
    const filename = escapeHtml(place.filename);
    return `<article class="game-card" data-place="${filename}">
      <div class="game-art">${escapeHtml(placeArt(place.title))}</div>
      <div class="game-body">
        <div class="game-name">${title}</div>
        <div class="game-meta"><span>RBXL place</span><span>0 Playing</span></div>
        <button class="play-button" type="button" data-place="${filename}">Play</button>
      </div>
    </article>`;
  }).join('');
}

function openBloxtipProtocol(filename) {
  const status = document.querySelector('#zip-status');

  if (!filename) {
    if (status) status.textContent = 'No place was provided for launch.';
    return;
  }

  const protocolUrl = `bloxtip://play?place=${encodeURIComponent(filename)}`;

  if (status) status.textContent = `Opening Bloxtip…`;

  const link = document.createElement('a');
  link.href = protocolUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    if (status) {
      status.textContent = 'If Bloxtip did not open, make sure the Bloxtip protocol is installed and registered on this PC.';
    }
  }, 1800);
}

function bindPlayButtons() {
  document.querySelector('#game-row')?.addEventListener('click', (event) => {
    const button = event.target.closest('.play-button');
    if (!button) return;

    event.preventDefault();
    const filename = button.dataset.place;
    if (!filename) return;

    openBloxtipProtocol(filename);
  });
}

async function loadPlaces() {
  const status = document.querySelector('#zip-status');
  try {
    if (!window.JSZip) throw new Error('The archive reader did not load.');

    const response = await fetch(archivePath, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Archive request failed (${response.status}).`);

    const archive = await JSZip.loadAsync(await response.arrayBuffer());
    const places = Object.values(archive.files)
      .filter((entry) => !entry.dir && /\.rbxlx?$/i.test(entry.name))
      .map((entry) => ({ filename: entry.name, title: placeTitle(entry.name) }))
      .sort((a, b) => a.title.localeCompare(b.title));

    renderGames(places);
    if (status) status.textContent = `${places.length} place${places.length === 1 ? '' : 's'} loaded from the default archive.`;
  } catch (error) {
    renderGames([]);
    if (status) status.textContent = `Could not load the default places archive: ${error.message}`;
  }
}

function updateHeader() {
  const account = getAccount();
  document.querySelectorAll('.user-name').forEach((element) => {
    element.textContent = account?.username || 'Guest';
  });
}

function renderCreation() {
  const root = document.querySelector('#creation-content');
  if (!root) return;

  const account = getAccount();
  root.innerHTML = `<section class="account-panel">
    <h1>${account ? `Welcome, ${escapeHtml(account.username)}` : 'Create an account'}</h1>
    <p>${account ? 'Your account is saved in this browser.' : 'Accounts are stored locally for this demo.'}</p>
    ${account ? '<button id="sign-out" type="button">Sign out</button>' : '<form id="account-form"><input name="username" placeholder="Username" required maxlength="20"><button type="submit">Create</button></form>'}
  </section>`;

  document.querySelector('#sign-out')?.addEventListener('click', () => {
    localStorage.removeItem(accountKey);
    window.location.reload();
  });
  document.querySelector('#account-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = new FormData(event.currentTarget).get('username').trim();
    if (username) {
      localStorage.setItem(accountKey, JSON.stringify({ username }));
      window.location.reload();
    }
  });
}

if (document.body.dataset.page === 'home') {
  bindPlayButtons();
  loadPlaces();
}
if (document.body.dataset.page === 'creation') renderCreation();
updateHeader();
