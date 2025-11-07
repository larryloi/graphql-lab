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
        // Query slayers with optional dynamic filters supplied via args.filter
        const filter = (args && args.filter) || {};
        const clauses = [];
        const params = [];

        if (filter.name) {
            clauses.push('name = ?');
            params.push(filter.name);
        }
        if (filter.prefix) {
            clauses.push('name LIKE ?');
            params.push(filter.prefix + '%');
        }
        if (filter.suffix) {
            clauses.push('name LIKE ?');
            params.push('%' + filter.suffix);
        }
        if (filter.contains) {
            clauses.push('name LIKE ?');
            params.push('%' + filter.contains + '%');
        }
        if (filter.ageEq !== undefined && filter.ageEq !== null) {
            clauses.push('age = ?');
            params.push(filter.ageEq);
        }
        if (filter.ageGt !== undefined && filter.ageGt !== null) {
            clauses.push('age > ?');
            params.push(filter.ageGt);
        }
        if (filter.ageLt !== undefined && filter.ageLt !== null) {
            clauses.push('age < ?');
            params.push(filter.ageLt);
        }

        // Build base SQL
        let sql = 'SELECT * FROM slayers';
        if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');

        // Whitelist ordering column names to avoid SQL injection
        const allowedOrderCols = new Set(['id', 'name', 'age']);
        let orderClause = '';
        if (filter.orderBy && allowedOrderCols.has(filter.orderBy)) {
            const dir = (filter.orderDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            orderClause = ` ORDER BY ${filter.orderBy} ${dir}`;
        }
        sql += orderClause;

        // Limit / offset with safe defaults
        const limit = Number.isInteger(filter.limit) ? Math.min(Math.max(filter.limit, 1), 1000) : 100;
        const offset = Number.isInteger(filter.offset) ? Math.max(filter.offset, 0) : 0;
        sql += ' LIMIT ' + limit + ' OFFSET ' + offset;

        return new Promise((resolve, reject) => {
            demonPool.query(sql, params, (error, results) => {
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
    },
    ordersByUpdatedDate: (args) => {
        const updatedDate = args.updatedDate;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE DATE(updated_at) = ? AND status = ?', [updatedDate, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
    ,
    ordersByUpdatedRange: (args) => {
        const start = args.start;
        const end = args.end;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE updated_at >= ? AND updated_at < ? AND status = ?', [start, end, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    ordersByIssuedRange: (args) => {
        const start = args.start;
        const end = args.end;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE issued_at >= ? AND issued_at < ? AND status = ?', [start, end, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    ordersByCompletedRange: (args) => {
        const start = args.start;
        const end = args.end;
        const status = args.status;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE completed_at >= ? AND completed_at < ? AND status = ?', [start, end, status], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    ordersByCompletedRangeBySpecType: (args) => {
        const start = args.start;
        const end = args.end;
        const specType = args.specType;
        return new Promise((resolve, reject) => {
            // Fetch rows in range then filter by spec.type in JS to handle both JSON and stringified-JSON stored values
            inventoryPool.query('SELECT * FROM orders WHERE completed_at >= ? AND completed_at < ?', [start, end], (error, results) => {
                if (error) return reject(error);
                try {
                    const filtered = results.filter(row => {
                        if (!row.spec) return false;
                        let specObj = null;
                        // If column is JSON type, row.spec may already be an object
                        if (typeof row.spec === 'object') {
                            specObj = row.spec;
                        } else if (typeof row.spec === 'string') {
                            try {
                                specObj = JSON.parse(row.spec);
                            } catch (e) {
                                // If parsing fails, attempt to unescape common double-encoded strings
                                try {
                                    const unescaped = row.spec.replace(/\\"/g, '"');
                                    specObj = JSON.parse(unescaped);
                                } catch (e2) {
                                    return false;
                                }
                            }
                        }
                        return specObj && specObj.type === specType;
                    });
                    resolve(filtered);
                } catch (e) {
                    return reject(e);
                }
            });
        });
    },
    orderByOrderId: (args) => {
        const orderId = args.order_id;
        return new Promise((resolve, reject) => {
            inventoryPool.query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [orderId], (error, results) => {
                if (error) return reject(error);
                resolve(results[0] || null);
            });
        });
    },
    ordersByCompletedSpecAndMinValue: (args) => {
        const start = args.start;
        const end = args.end;
        const specType = args.specType;
        const minValue = args.minValue;
        return new Promise((resolve, reject) => {
            // Fetch rows in range and with value filter, then filter spec.type in JS to handle stringified JSON
            inventoryPool.query('SELECT * FROM orders WHERE completed_at >= ? AND completed_at < ? AND qty * net_price >= ?', [start, end, minValue], (error, results) => {
                if (error) return reject(error);
                try {
                    const filtered = results.filter(row => {
                        if (!row.spec) return false;
                        let specObj = null;
                        if (typeof row.spec === 'object') {
                            specObj = row.spec;
                        } else if (typeof row.spec === 'string') {
                            try {
                                specObj = JSON.parse(row.spec);
                            } catch (e) {
                                try {
                                    const unescaped = row.spec.replace(/\\"/g, '"');
                                    specObj = JSON.parse(unescaped);
                                } catch (e2) {
                                    return false;
                                }
                            }
                        }
                        return specObj && specObj.type === specType;
                    });
                    resolve(filtered);
                } catch (e) {
                    return reject(e);
                }
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

