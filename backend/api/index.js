// Vercel serverless wrapper for backend
// Initializes env, connects (best-effort) to MongoDB and loads models, then exports Express app as handler
/*
  Notes:
  - This file does NOT call app.listen().
  - Place under `backend/` project root so backend/vercel.json can point to it.
*/
require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Load environment variables relative to backend folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Attempt a MongoDB connection if DATABASE is provided. Don't crash the function on connect errors.
const mongoUri = process.env.DATABASE;
if (mongoUri) {
  // Avoid multiple connections across warm invocations
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(mongoUri)
      .then(() => {
        // Connected
        console.log('MongoDB connected (serverless wrapper)');
      })
      .catch((err) => {
        console.error('MongoDB connect error (serverless wrapper):', err && err.message ? err.message : err);
      });
  }
} else {
  console.warn('DATABASE env var not set; backend will run without DB connection.');
}

// Load models (safe require)
const modelsPattern = path.resolve(__dirname, '../src/models/**/*.js');
try {
  const files = globSync(modelsPattern);
  for (const f of files) {
    try {
      require(f);
    } catch (e) {
      console.warn('Failed to require model', f, e && e.message ? e.message : e);
    }
  }
} catch (e) {
  console.warn('Glob models error', e && e.message ? e.message : e);
}

// Import the app (Express instance) and export a handler
const app = require(path.resolve(__dirname, '../src/app'));

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled error in serverless handler:', err && err.message ? err.message : err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
