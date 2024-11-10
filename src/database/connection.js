const mysql2 = require("mysql2/promise");

class Connection {
    constructor(DATABASE_HOST = process.env.DATABASE_HOST, DATABASE_USER_NAME = process.env.DATABASE_USER, DATABASE_PASS_WORD = process.env.DATABASE_PASSWORD, DATABASE_NAME = process.env.DATABASE_NAME, DATABASE_PORT = process.env.DATABASE_PORT) {
        this.DATABASE_HOST = DATABASE_HOST;
        this.DATABASE_USER_NAME = DATABASE_USER_NAME;
        this.DATABASE_PASS_WORD = DATABASE_PASS_WORD;
        this.DATABASE_NAME = DATABASE_NAME;
        this.DATABASE_PORT = DATABASE_PORT;
        this.connection = null;
    }

    async connect() {
        if (this.connection) {
            return "Already connected to database";
        }
        try {
            this.connection = await mysql2.createConnection({
                host: this.DATABASE_HOST,
                user: this.DATABASE_USER_NAME,
                password: this.DATABASE_PASS_WORD,
                database: this.DATABASE_NAME,
                port: this.DATABASE_PORT,
            });
            console.log("Connected successfully to the database: " + this.DATABASE_NAME);
        } catch (err) {
            console.log("Error when connecting to database " + this.DATABASE_NAME + " err: " + err.message);
        }
    }

    async disconnect() {
        try {
            await this.connection.end();
            console.log("Disconnect success database name " + this.DATABASE_NAME);
        } catch (error) {
            console.log("Error when disconnecting from database name " + this.DATABASE_NAME + " err: " + error.message);
        }
    }

    async executeQuery(statement, placeholders = []) {
        try {
            const [results] = await this.connection.query(statement, placeholders);
            console.log("Execute success statement ");
            return results;
        } catch (error) {
            console.log("Execute fail statement: ", statement, " placeholders: ", placeholders.join("  "), "error: ", error);
        }
    }
}

module.exports = { Connection }