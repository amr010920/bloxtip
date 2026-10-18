const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');

// Ensure accounts.json exists
if (!fs.existsSync(ACCOUNTS_FILE)) {
  const initialData = [
    {
      "accountId": 1,
      "username": "bloxtip",
      "avatar": "https://raw.githubusercontent.com/amr010920/bloxtip/images/more/Untitled-removebg-preview.png"
    }
  ];
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(initialData, null, 2));
}

// Function to read accounts safely
function getAccounts() {
  try {
    const rawData = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(rawData);
  } catch (e) {
    return [];
  }
}

// Function to save accounts safely
function saveAccounts(accounts) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

// API Endpoint for Account Register/Login
app.post('/api/auth', (req, res) => {
  const { username, password, discord } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  let accounts = getAccounts();
  let existingUser = accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());

  if (existingUser) {
    // Account exists -> check password
    if (existingUser.password && existingUser.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    if (discord) existingUser.discord = discord;
  } else {
    // Generate new account ID or smth idc
    const nextId = accounts.length > 0 ? Math.max(...accounts.map(a => a.accountId || 0)) + 1 : 1;
    
    existingUser = {
      accountId: nextId,
      username: username,
      password: password,
      discord: discord || '',
      avatar: "https://raw.githubusercontent.com/amr010920/bloxtip/images/more/Untitled-removebg-preview.png",
      inventory: [] // Ready for future catalog integration
    };
    accounts.push(existingUser);
  }

  saveAccounts(accounts);

  res.json({
    success: true,
    user: {
      accountId: existingUser.accountId,
      username: existingUser.username,
      avatar: existingUser.avatar,
      discord: existingUser.discord
    }
  });
});

app.listen(3000, () => console.log('Bloxtip Auth Server running on port 3000'));
