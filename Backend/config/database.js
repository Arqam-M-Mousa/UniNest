const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = [
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_HOST",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const postgresConfig = {
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  retry: {
    max: 3,
  },

  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
};

const sequelize = new Sequelize(postgresConfig);

class DatabaseConnection {
  static async connect() {
    try {
      await sequelize.authenticate();
      console.log(
        "✅ PostgreSQL database connection established successfully."
      );

      // Import models to ensure they're registered
      require("../models");

      // Always sync models in development, or if SYNC_DATABASE is explicitly set to true
      if (
        process.env.NODE_ENV === "development" ||
        process.env.SYNC_DATABASE === "true"
      ) {
        await sequelize.sync({ alter: true });
        console.log("✅ Database models synchronized.");
      }
    } catch (error) {
      console.error("❌ Unable to connect to PostgreSQL database:", error);
      await this.retryConnection();
    }
  }

  static async retryConnection(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await sequelize.authenticate();
        console.log(
          "✅ Database connection established successfully after retry."
        );
        return;
      } catch (error) {
        console.error(`❌ Retry ${i + 1}/${retries} failed:`, error);
        if (i === retries - 1) {
          console.error(
            "❌ All connection retries failed. Exiting application..."
          );
          process.exit(1);
        }
      }
    }
  }

  static async disconnect() {
    try {
      await sequelize.close();
      console.log("PostgreSQL database connection closed.");
    } catch (error) {
      console.error("Error while closing database connection:", error);
      process.exit(1);
    }
  }

  static async executeTransaction(callback, options = {}) {
    const defaultOptions = {
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      retry: {
        max: 3,
        match: [
          /Deadlock/i,
          /Lock wait timeout exceeded/i,
          /could not serialize access/i,
        ],
        backoffBase: 1000,
        backoffExponent: 1.5,
      },
    };

    const transactionOptions = { ...defaultOptions, ...options };
    let attempt = 0;

    while (true) {
      const transaction = await sequelize.transaction(transactionOptions);

      try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
      } catch (error) {
        await transaction.rollback();

        const shouldRetry = transactionOptions.retry.match.some((pattern) =>
          pattern.test(error.message)
        );

        if (!shouldRetry || attempt >= transactionOptions.retry.max) {
          throw error;
        }

        const delay =
          transactionOptions.retry.backoffBase *
          Math.pow(transactionOptions.retry.backoffExponent, attempt);

        console.log(
          `Transaction failed, retrying in ${delay}ms... (Attempt ${
            attempt + 1
          }/${transactionOptions.retry.max})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }
  }
}

process.on("SIGINT", async () => {
  await DatabaseConnection.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await DatabaseConnection.disconnect();
  process.exit(0);
});

module.exports = sequelize;
module.exports.DatabaseConnection = DatabaseConnection;
// DatabaseConnection.connect(); // Removed duplicate connection call
