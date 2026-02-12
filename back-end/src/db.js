import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

// Cria tabelas se não existirem
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        wallet TEXT,
        username TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS file (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        hash TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        size REAL NOT NULL,
        original_filename TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
`);

console.log('✅ Database persistente inicializado');

export default db;

export function debugDatabase() {
    const users = db.prepare('SELECT * FROM users').all();
    const files = db.prepare('SELECT * FROM file').all();
    
    return {users, files}
}