const express =         require('express');
const { graphqlHTTP } = require('express-graphql');
const mysql =           require('mysql2');
const schema =          require('./schema.js');

// Primary DB pool (demo1)
const demo1Pool = mysql.createPool({
    host: process.env.DEMO1_DATABASE_HOST || 'mysql',
    user: process.env.DEMO1_DATABASE_USER || 'root',
    password: process.env.DEMO1_DATABASE_PASSWORD || '',
    database: process.env.DEMO1_DATABASE_NAME || 'demo1',
    charset: 'utf8mb4',
});

// Secondary DB pool for demonslayer (can point to same server or another server)
const demonPool = mysql.createPool({
    host: process.env.DEMON_DATABASE_HOST || process.env.DATABASE_HOST || 'mysql',
    user: process.env.DEMON_DATABASE_USER || process.env.DATABASE_USER || 'root',
    password: process.env.DEMON_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || '',
    database: process.env.DEMON_DATABASE_NAME || 'demonslayer',
    charset: 'utf8mb4',
});

// inventory DB pool
const inventoryPool = mysql.createPool({
    host: process.env.INVENTORY_DATABASE_HOST || process.env.DATABASE_HOST || 'mysql',
    user: process.env.INVENTORY_DATABASE_USER || process.env.DATABASE_USER || 'root',
    password: process.env.INVENTORY_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || '',
    database: process.env.INVENTORY_DATABASE_NAME || 'inventory',
    charset: 'utf8mb4',
});

const root = {
    users: (args) => {
        // Query all users
        return new Promise((resolve, reject) => {
            demo1Pool.query('SELECT * FROM users', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    user: (args) => {
        const id = args.id;
        return new Promise((resolve, reject) => {
            demo1Pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (error, results) => {
                if (error) return reject(error);
                resolve(results[0] || null);
            });
        });
    },
    slayers: (args) => {
        // Query all slayers from demonslayer DB
        return new Promise((resolve, reject) => {
            demonPool.query('SELECT * FROM slayers', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    slayer: (args) => {
        const id = args.id;
        return new Promise((resolve, reject) => {
            demonPool.query('SELECT * FROM slayers WHERE id = ? LIMIT 1', [id], (error, results) => {
                if (error) return reject(error);
                resolve(results[0] || null);
            });
        });
    },
    demons: (args) => {
        // Query all demons from demons table
        return new Promise((resolve, reject) => {
            demonPool.query('SELECT * FROM demons', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    demon: (args) => {
        const id = args.id;
        return new Promise((resolve, reject) => {
            demonPool.query('SELECT * FROM demons WHERE id = ? LIMIT 1', [id], (error, results) => {
                if (error) return reject(error);
                resolve(results[0] || null);
            });
        });
    },
    ordersByIssuedAt: (args) => {
        const issuedAt = args.issued_at;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE issued_at >= ? AND status = ?', [issuedAt, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    ordersByIssuedAtMins: (args) => {
        const issuedAtMins = args.issuedAtMins;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE issued_at >= TIMESTAMPADD(MINUTE, ? * -1, NOW()) AND status = ?', [issuedAtMins, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
};

const app = express();

// Ensure JSON responses are served with UTF-8 charset. GraphiQL (HTML) will still be
// served as text/html by express-graphql and browsers will decode it as UTF-8.
// Middleware to ensure final Content-Type header includes a utf-8 charset
// We wrap writeHead so headers set later (by express-graphql) still get a charset appended
app.use((req, res, next) => {
    const originalWriteHead = res.writeHead;
    res.writeHead = function writeHead(statusCode, reasonPhrase, headers) {
        try {
            // If headers were passed as the second arg (node variations), normalize
            let hdrs = headers;
            if (typeof reasonPhrase === 'object' && reasonPhrase !== null) {
                hdrs = reasonPhrase;
            }

            // Check header already set on the response or in the headers arg
            const current = res.getHeader('Content-Type') || (hdrs && (hdrs['Content-Type'] || hdrs['content-type']));
            if (current && !/charset=/i.test(current)) {
                const newCt = current + '; charset=utf-8';
                res.setHeader('Content-Type', newCt);
                if (hdrs) {
                    // ensure the headers arg also contains the charset when node uses it
                    hdrs['Content-Type'] = newCt;
                    hdrs['content-type'] = newCt;
                }
            } else if (!current && !hdrs) {
                // No content-type set anywhere — set a sensible default for JSON
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
        } catch (err) {
            // don't break response flow if header manipulation fails
            // fall through to originalWriteHead
        }
        return originalWriteHead.apply(this, arguments);
    };
    next();
});

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000, () => {
    console.log('Listening for GraphQL requests on http://localhost:4000/graphql');
});

