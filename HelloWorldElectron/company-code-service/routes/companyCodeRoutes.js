/**
 * Company Code Routes
 * Defines all REST API endpoints for company code management
 */

const express = require('express');
const router = express.Router();
const companyCodeController = require('../controllers/companyCodeController');

// Company Code CRUD Routes
router.post('/company-codes', companyCodeController.create.bind(companyCodeController));
router.get('/company-codes', companyCodeController.getAll.bind(companyCodeController));
router.get('/company-codes/stats', companyCodeController.getStats.bind(companyCodeController));
router.get('/company-codes/options', companyCodeController.getOptions.bind(companyCodeController));
router.get('/company-codes/search/:companyCode', companyCodeController.getByCompanyCode.bind(companyCodeController));
router.get('/company-codes/:id', companyCodeController.getById.bind(companyCodeController));
router.put('/company-codes/:id', companyCodeController.update.bind(companyCodeController));
router.delete('/company-codes/:id', companyCodeController.delete.bind(companyCodeController));

module.exports = router;