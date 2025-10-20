/**
 * Company Code Controller
 * Handles CRUD operations for company code management
 */

const { getDatabase } = require('../database/database');
const { 
  createCompanyCodeValidation, 
  updateCompanyCodeValidation,
  dropdownOptions 
} = require('../models/CompanyCode');

class CompanyCodeController {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * @swagger
   * /api/company-codes:
   *   post:
   *     summary: Create a new company code
   *     tags: [Company Codes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCompanyCode'
   *     responses:
   *       201:
   *         description: Company code created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CompanyCode'
   *       400:
   *         description: Validation error
   *       409:
   *         description: Company code already exists
   */
  async create(req, res) {
    try {
      // Validate request body
      const { error, value } = createCompanyCodeValidation.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Create company code
      const companyCode = this.db.create(value);

      res.status(201).json({
        success: true,
        message: 'Company code created successfully',
        data: companyCode
      });
    } catch (error) {
      console.error('Create company code error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes:
   *   get:
   *     summary: Get all company codes
   *     tags: [Company Codes]
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type: string
   *         description: Filter by country code
   *       - in: query
   *         name: currency
   *         schema:
   *           type: string
   *         description: Filter by currency code
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in company name or company code
   *     responses:
   *       200:
   *         description: List of company codes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CompanyCode'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   */
  async getAll(req, res) {
    try {
      let companies = this.db.findAll();

      // Apply filters
      const { country, currency, search } = req.query;

      if (country) {
        companies = companies.filter(c => c.country.toLowerCase() === country.toLowerCase());
      }

      if (currency) {
        companies = companies.filter(c => c.currency.toLowerCase() === currency.toLowerCase());
      }

      if (search) {
        const searchTerm = search.toLowerCase();
        companies = companies.filter(c => 
          c.companyName.toLowerCase().includes(searchTerm) ||
          c.companyCode.toLowerCase().includes(searchTerm)
        );
      }

      res.json({
        success: true,
        data: companies,
        meta: {
          total: companies.length,
          filters: { country, currency, search }
        }
      });
    } catch (error) {
      console.error('Get all company codes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/{id}:
   *   get:
   *     summary: Get company code by ID
   *     tags: [Company Codes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Company code ID
   *     responses:
   *       200:
   *         description: Company code details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/CompanyCode'
   *       404:
   *         description: Company code not found
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const companyCode = this.db.findById(id);

      if (!companyCode) {
        return res.status(404).json({
          success: false,
          message: 'Company code not found'
        });
      }

      res.json({
        success: true,
        data: companyCode
      });
    } catch (error) {
      console.error('Get company code by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/{id}:
   *   put:
   *     summary: Update company code
   *     tags: [Company Codes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Company code ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCompanyCode'
   *     responses:
   *       200:
   *         description: Company code updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CompanyCode'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Company code not found
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateCompanyCodeValidation.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Update company code
      const updatedCompanyCode = this.db.update(id, value);

      if (!updatedCompanyCode) {
        return res.status(404).json({
          success: false,
          message: 'Company code not found'
        });
      }

      res.json({
        success: true,
        message: 'Company code updated successfully',
        data: updatedCompanyCode
      });
    } catch (error) {
      console.error('Update company code error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/{id}:
   *   delete:
   *     summary: Delete company code
   *     tags: [Company Codes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Company code ID
   *     responses:
   *       200:
   *         description: Company code deleted successfully
   *       404:
   *         description: Company code not found
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = this.db.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Company code not found'
        });
      }

      res.json({
        success: true,
        message: 'Company code deleted successfully'
      });
    } catch (error) {
      console.error('Delete company code error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/search/{companyCode}:
   *   get:
   *     summary: Get company code by company code
   *     tags: [Company Codes]
   *     parameters:
   *       - in: path
   *         name: companyCode
   *         required: true
   *         schema:
   *           type: string
   *         description: Company code (4 characters)
   *     responses:
   *       200:
   *         description: Company code details
   *       404:
   *         description: Company code not found
   */
  async getByCompanyCode(req, res) {
    try {
      const { companyCode } = req.params;
      const company = this.db.findByCompanyCode(companyCode);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company code not found'
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Get company code by code error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/stats:
   *   get:
   *     summary: Get company code statistics
   *     tags: [Company Codes]
   *     responses:
   *       200:
   *         description: Statistics about company codes
   */
  async getStats(req, res) {
    try {
      const stats = this.db.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * @swagger
   * /api/company-codes/options:
   *   get:
   *     summary: Get dropdown options for form fields
   *     tags: [Company Codes]
   *     responses:
   *       200:
   *         description: Dropdown options for currencies, countries, and languages
   */
  async getOptions(req, res) {
    try {
      res.json({
        success: true,
        data: dropdownOptions
      });
    } catch (error) {
      console.error('Get options error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CompanyCodeController();