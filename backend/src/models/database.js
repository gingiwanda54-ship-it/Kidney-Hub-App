/**
 * Database module using sql.js (pure JavaScript SQLite)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './database/kidney_hub.db';
const dbDir = path.dirname(path.resolve(dbPath));

let db = null;
let SQL = null;

// Initialize database
const initDatabase = async () => {
    if (db) return db;
    
    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Initialize SQL.js with local WASM file (avoid CDN fetch in Cloud Run)
    SQL = await initSqlJs({
        locateFile: file => require('path').join(require('path').resolve(__dirname, '../../node_modules/sql.js/dist'), file)
    });
    
    // Load existing database or create new one
    try {
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        console.log('Creating new database');
        db = new SQL.Database();
    }
    
    // Initialize schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.run(schema);
        console.log('Database schema initialized');
    }
    
    // Save database periodically
    setInterval(() => {
        saveDatabase();
    }, 30000); // Every 30 seconds
    
    return db;
};

// Save database to file
const saveDatabase = () => {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
};

// Get database instance
const getDatabase = () => db;

// Sanitize params - convert undefined/null to appropriate values
const sanitizeParams = (params) => {
    return params.map(p => {
        if (p === undefined || p === null) return null;
        if (typeof p === 'object') return JSON.stringify(p);
        return p;
    });
};

// Execute a query and return all results
const all = (sql, params = []) => {
    const sanitized = sanitizeParams(params);
    const stmt = db.prepare(sql);
    if (sanitized.length > 0) {
        stmt.bind(sanitized);
    }
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
};

// Execute a query and return one result
const get = (sql, params = []) => {
    const sanitized = sanitizeParams(params);
    const stmt = db.prepare(sql);
    if (sanitized.length > 0) {
        stmt.bind(sanitized);
    }
    let result = null;
    if (stmt.step()) {
        result = stmt.getAsObject();
    }
    stmt.free();
    return result;
};

// Execute a query and return lastInsertRowid
const run = (sql, params = []) => {
    const sanitized = sanitizeParams(params);
    db.run(sql, sanitized);
    const result = db.exec("SELECT last_insert_rowid() as id, changes() as changes");
    const lastId = result[0]?.values[0][0] || 0;
    const changes = result[0]?.values[0][1] || 0;
    return { lastID: lastId, changes };
};

// Close database
const closeDatabase = () => {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
};

// Export wrapper that mimics sqlite3 API for compatibility
const dbWrapper = {
    all: (sql, params, callback) => {
        try {
            const results = all(sql, params);
            callback(null, results);
        } catch (err) {
            callback(err, null);
        }
    },
    get: (sql, params, callback) => {
        try {
            const result = get(sql, params);
            callback(null, result);
        } catch (err) {
            callback(err, null);
        }
    },
    run: (sql, params, callback) => {
        try {
            const sanitized = sanitizeParams(params || []);
            db.run(sql, sanitized);
            const result = db.exec("SELECT last_insert_rowid() as id, changes() as changes");
            const lastId = result[0]?.values[0][0] || 0;
            const changes = result[0]?.values[0][1] || 0;
            if (callback) {
                callback(null, { lastID: lastId, changes });
            }
        } catch (err) {
            if (callback) {
                callback(err, null);
            }
        }
    },
    exec: (sql, callback) => {
        try {
            db.run(sql);
            if (callback) {
                callback(null);
            }
        } catch (err) {
            if (callback) {
                callback(err);
            }
        }
    },
    serialize: (callback) => {
        if (callback) callback();
    },
    close: (callback) => {
        closeDatabase();
        if (callback) callback();
    }
};

// Initialize on module load
initDatabase().then(() => {
    console.log('Connected to SQLite database (sql.js)');
}).catch(err => {
    console.error('Database initialization error:', err);
});

module.exports = { 
    db: dbWrapper, 
    getDatabase,
    initDatabase,
    saveDatabase,
    closeDatabase 
};
