const express =         require('express');
const { graphqlHTTP } = require('express-graphql');
const mysql =           require('mysql2');
const schema =          require('./schema.js');

// Primary DB pool (demo1)
const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'mysql',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'demo1',
});

// Secondary DB pool for demonslayer (can point to same server or another server)
const demonPool = mysql.createPool({
    host: process.env.DEMON_DATABASE_HOST || process.env.DATABASE_HOST || 'mysql',
    user: process.env.DEMON_DATABASE_USER || process.env.DATABASE_USER || 'root',
    password: process.env.DEMON_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD || '',
    database: process.env.DEMON_DATABASE_NAME || 'demonslayer',
});

const root = {
    users: (args) => {
        // Query all users
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM users', (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    },
    user: (args) => {
        const id = args.id;
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (error, results) => {
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
};

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000, () => {
    console.log('Listening for GraphQL requests on http://localhost:4000/graphql');
});

