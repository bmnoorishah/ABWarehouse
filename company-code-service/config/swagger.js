/**
 * Swagger Configuration
 * API documentation setup using swagger-jsdoc and swagger-ui-express
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Company Code Management API',
      version: '1.0.0',
      description: 'A comprehensive microservice for managing company code configurations with CRUD operations',
      contact: {
        name: 'ABWarehouse Development Team',
        email: 'dev@abwarehouse.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Company Codes',
        description: 'Company code management operations'
      }
    ],
    components: {
      schemas: {
        CompanyCode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            companyCode: {
              type: 'string',
              minLength: 4,
              maxLength: 4,
              description: 'Company code (4 characters)',
              example: 'US01'
            },
            companyName: {
              type: 'string',
              maxLength: 132,
              description: 'Company name',
              example: 'ABC Corporation USA'
            },
            city: {
              type: 'string',
              maxLength: 132,
              description: 'City',
              example: 'New York'
            },
            country: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Country code (2 characters)',
              example: 'US'
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code (3 characters)',
              example: 'USD'
            },
            language: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Language code (2 characters)',
              example: 'EN'
            },
            vatRegistrationNumber: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'VAT registration number',
              example: 'US123456789'
            },
            inputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Input tax code',
              example: 'IT001'
            },
            outputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Output tax code',
              example: 'OT001'
            },
            houseNumber: {
              type: 'integer',
              nullable: true,
              description: 'House number',
              example: 123
            },
            addressLine1: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 1',
              example: '123 Main Street'
            },
            addressLine2: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 2',
              example: 'Suite 100'
            },
            addressLine3: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 3',
              example: ''
            },
            region: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Region',
              example: 'Northeast'
            },
            district: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'District',
              example: 'Manhattan'
            },
            county: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'County',
              example: 'New York County'
            },
            state: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'State',
              example: 'New York'
            },
            postCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Post code / PO Box',
              example: '10001'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['id', 'companyCode', 'companyName', 'city', 'country', 'currency', 'language']
        },
        CreateCompanyCode: {
          type: 'object',
          properties: {
            companyCode: {
              type: 'string',
              minLength: 4,
              maxLength: 4,
              description: 'Company code (4 characters)',
              example: 'US02'
            },
            companyName: {
              type: 'string',
              maxLength: 132,
              description: 'Company name',
              example: 'New Company Inc.'
            },
            city: {
              type: 'string',
              maxLength: 132,
              description: 'City',
              example: 'Los Angeles'
            },
            country: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Country code (2 characters)',
              example: 'US'
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code (3 characters)',
              example: 'USD'
            },
            language: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Language code (2 characters)',
              example: 'EN'
            },
            vatRegistrationNumber: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'VAT registration number'
            },
            inputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Input tax code'
            },
            outputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Output tax code'
            },
            houseNumber: {
              type: 'integer',
              nullable: true,
              description: 'House number'
            },
            addressLine1: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 1'
            },
            addressLine2: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 2'
            },
            addressLine3: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 3'
            },
            region: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Region'
            },
            district: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'District'
            },
            county: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'County'
            },
            state: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'State'
            },
            postCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Post code / PO Box'
            }
          },
          required: ['companyCode', 'companyName', 'city', 'country', 'currency', 'language']
        },
        UpdateCompanyCode: {
          type: 'object',
          properties: {
            companyName: {
              type: 'string',
              maxLength: 132,
              description: 'Company name'
            },
            city: {
              type: 'string',
              maxLength: 132,
              description: 'City'
            },
            country: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Country code (2 characters)'
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code (3 characters)'
            },
            language: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Language code (2 characters)'
            },
            vatRegistrationNumber: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'VAT registration number'
            },
            inputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Input tax code'
            },
            outputTaxCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Output tax code'
            },
            houseNumber: {
              type: 'integer',
              nullable: true,
              description: 'House number'
            },
            addressLine1: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 1'
            },
            addressLine2: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 2'
            },
            addressLine3: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Address line 3'
            },
            region: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Region'
            },
            district: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'District'
            },
            county: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'County'
            },
            state: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'State'
            },
            postCode: {
              type: 'string',
              maxLength: 132,
              nullable: true,
              description: 'Post code / PO Box'
            }
          },
          minProperties: 1
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./controllers/*.js', './routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = specs;