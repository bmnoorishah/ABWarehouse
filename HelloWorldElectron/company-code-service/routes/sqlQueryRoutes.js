/**
 * SQL Query Routes for ABWarehouse
 * Provides REST API endpoints for SQL query interface
 */

const express = require('express');
const router = express.Router();
const SQLQueryController = require('../controllers/sqlQueryController');
const { getDatabase } = require('../database/database');

// Initialize controller with database instance
const db = getDatabase();
const sqlController = new SQLQueryController(db);

/**
 * @swagger
 * /api/sql/execute:
 *   post:
 *     summary: Execute SQL query
 *     description: Execute a SQL query on the company database with pagination and sorting
 *     tags: [SQL Query]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: SQL query to execute
 *                 example: "SELECT * FROM companies WHERE country = 'US'"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 default: 1
 *                 minimum: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 default: 50
 *                 minimum: 1
 *                 maximum: 1000
 *               sortField:
 *                 type: string
 *                 description: Field to sort by
 *                 example: "company_code"
 *               sortDirection:
 *                 type: string
 *                 enum: [asc, desc]
 *                 description: Sort direction
 *                 default: "asc"
 *     responses:
 *       200:
 *         description: Query executed successfully
 *       400:
 *         description: Invalid query or parameters
 *       500:
 *         description: Server error
 */
router.post('/execute', async (req, res) => {
  await sqlController.executeQuery(req, res);
});

/**
 * @swagger
 * /api/sql/schema:
 *   get:
 *     summary: Get database schema
 *     description: Get database schema information including tables, columns, and sample queries
 *     tags: [SQL Query]
 *     responses:
 *       200:
 *         description: Schema information retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/schema', async (req, res) => {
  await sqlController.getSchema(req, res);
});

module.exports = router;