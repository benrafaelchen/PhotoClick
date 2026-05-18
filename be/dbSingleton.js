const mysql = require("mysql");

class DatabaseSingleton {
  constructor() {
    this.connection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "photodb",
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("Database connection failed:", err.message);
      }
    });
  }

  query(sql, values, callback) {
    return this.connection.query(sql, values, callback);
  }

  promiseQuery(sql, values = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseSingleton();
    }
    return this.instance;
  }
}

module.exports = DatabaseSingleton.getInstance();
