/**
 * Company Code Data Model
 * Defines the structure and validation rules for company code entities
 */

const Joi = require('joi');

// Company Code Schema Definition
const companyCodeSchema = {
  // Primary identifier
  id: {
    type: 'TEXT',
    primaryKey: true,
    required: true
  },
  
  // Core company information
  companyCode: {
    type: 'CHAR(4)',
    required: true,
    unique: true,
    validation: Joi.string().length(4).required()
  },
  
  companyName: {
    type: 'CHAR(132)',
    required: true,
    validation: Joi.string().max(132).required()
  },
  
  city: {
    type: 'CHAR(132)',
    required: true,
    validation: Joi.string().max(132).required()
  },
  
  country: {
    type: 'CHAR(2)',
    required: true,
    validation: Joi.string().length(2).required()
  },
  
  currency: {
    type: 'CHAR(3)',
    required: true,
    validation: Joi.string().length(3).required()
  },
  
  language: {
    type: 'CHAR(2)',
    required: true,
    validation: Joi.string().length(2).required()
  },
  
  // Tax information
  vatRegistrationNumber: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  inputTaxCode: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  outputTaxCode: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  // Address information
  houseNumber: {
    type: 'INTEGER',
    required: false,
    validation: Joi.number().integer().allow(null)
  },
  
  addressLine1: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  addressLine2: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  addressLine3: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  region: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  district: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  county: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  state: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  postCode: {
    type: 'CHAR(132)',
    required: false,
    validation: Joi.string().max(132).allow('', null)
  },
  
  // Metadata
  createdAt: {
    type: 'DATETIME',
    default: 'CURRENT_TIMESTAMP'
  },
  
  updatedAt: {
    type: 'DATETIME',
    default: 'CURRENT_TIMESTAMP'
  }
};

// Joi validation schema for API requests
const createCompanyCodeValidation = Joi.object({
  companyCode: Joi.string().length(4).required().messages({
    'string.length': 'Company Code must be exactly 4 characters',
    'any.required': 'Company Code is required'
  }),
  companyName: Joi.string().max(132).required().messages({
    'string.max': 'Company Name cannot exceed 132 characters',
    'any.required': 'Company Name is required'
  }),
  city: Joi.string().max(132).required().messages({
    'string.max': 'City cannot exceed 132 characters',
    'any.required': 'City is required'
  }),
  country: Joi.string().length(2).required().messages({
    'string.length': 'Country code must be exactly 2 characters',
    'any.required': 'Country is required'
  }),
  currency: Joi.string().length(3).required().messages({
    'string.length': 'Currency code must be exactly 3 characters',
    'any.required': 'Currency is required'
  }),
  language: Joi.string().length(2).required().messages({
    'string.length': 'Language code must be exactly 2 characters',
    'any.required': 'Language is required'
  }),
  vatRegistrationNumber: Joi.string().max(132).allow('', null),
  inputTaxCode: Joi.string().max(132).allow('', null),
  outputTaxCode: Joi.string().max(132).allow('', null),
  houseNumber: Joi.number().integer().allow(null),
  addressLine1: Joi.string().max(132).allow('', null),
  addressLine2: Joi.string().max(132).allow('', null),
  addressLine3: Joi.string().max(132).allow('', null),
  region: Joi.string().max(132).allow('', null),
  district: Joi.string().max(132).allow('', null),
  county: Joi.string().max(132).allow('', null),
  state: Joi.string().max(132).allow('', null),
  postCode: Joi.string().max(132).allow('', null)
});

const updateCompanyCodeValidation = Joi.object({
  companyName: Joi.string().max(132),
  city: Joi.string().max(132),
  country: Joi.string().length(2),
  currency: Joi.string().length(3),
  language: Joi.string().length(2),
  vatRegistrationNumber: Joi.string().max(132).allow('', null),
  inputTaxCode: Joi.string().max(132).allow('', null),
  outputTaxCode: Joi.string().max(132).allow('', null),
  houseNumber: Joi.number().integer().allow(null),
  addressLine1: Joi.string().max(132).allow('', null),
  addressLine2: Joi.string().max(132).allow('', null),
  addressLine3: Joi.string().max(132).allow('', null),
  region: Joi.string().max(132).allow('', null),
  district: Joi.string().max(132).allow('', null),
  county: Joi.string().max(132).allow('', null),
  state: Joi.string().max(132).allow('', null),
  postCode: Joi.string().max(132).allow('', null)
}).min(1); // At least one field must be provided for update

// Default dropdown options
const dropdownOptions = {
  currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'],
  countries: [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' }
  ],
  languages: [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'ES', name: 'Spanish' },
    { code: 'IT', name: 'Italian' },
    { code: 'JA', name: 'Japanese' },
    { code: 'ZH', name: 'Chinese' },
    { code: 'PT', name: 'Portuguese' },
    { code: 'RU', name: 'Russian' },
    { code: 'AR', name: 'Arabic' }
  ]
};

module.exports = {
  companyCodeSchema,
  createCompanyCodeValidation,
  updateCompanyCodeValidation,
  dropdownOptions
};