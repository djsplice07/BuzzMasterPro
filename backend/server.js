
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'buzz_user',
  password: process.env.DB_PASS || 'buzz_password',
  database: process.env.DB_NAME || 'buzzmaster'
};

let pool;

async function initDb() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('Connected to MariaDB');
  } catch (e) {
    console.warn('Database not available. Running in mock mode.');
  }
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/game/:id', async (req, res) => {
  // In a full implementation, you'd fetch from `pool`
  res.json({ id: req.params.id, state: 'LOBBY', players: [] });
});

app.post('/api/game/:id/join', async (req, res) => {
  const { name, team } = req.body;
  res.json({ id: Date.now().toString(), name, teamId: team, status: 'PENDING' });
});

app.patch('/api/game/:id/state', async (req, res) => {
  res.status(200).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  initDb().catch(console.error);
});
