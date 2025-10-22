/**
 * In-Memory Database for Company Code Service
 * Pure JavaScript implementation without native dependencies
 */

const { v4: uuidv4 } = require('uuid');

class InMemoryDatabase {
  constructor() {
    this.data = new Map();
    this.initializeWithSampleData();
  }

  initializeWithSampleData() {
    const sampleData = [
      {
        id: uuidv4(),
        company_code: 'US01',
        company_name: 'ABWarehouse USA Headquarters',
        city: 'New York',
        country: 'US',
        currency: 'USD',
        language: 'EN',
        vat_registration_number: 'US-VAT-001',
        input_tax_code: 'INPUT-001',
        output_tax_code: 'OUTPUT-001',
        house_number: 123,
        address_line1: '123 Business Avenue',
        address_line2: 'Suite 100',
        address_line3: '',
        region: 'Northeast',
        district: 'Manhattan',
        county: 'New York County',
        state: 'New York',
        post_code: '10001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    sampleData.forEach(record => {
      this.data.set(record.id, record);
    });

    console.log(`✅ Initialized in-memory database with ${sampleData.length} sample company codes`);
  }

  async findAll() {
    const records = Array.from(this.data.values());
    console.log('📋 findAll called - returning', records.length, 'records');
    return records.sort((a, b) => {
      const aCode = a.company_code || '';
      const bCode = b.company_code || '';
      return aCode.localeCompare(bCode);
    });
  }

  async findById(id) {
    return this.data.get(id) || null;
  }

  async findByCompanyCode(companyCode) {
    const records = Array.from(this.data.values());
    return records.find(record => record.company_code === companyCode) || null;
  }

  async create(companyCodeData) {
    console.log('📝 Creating new company code:', companyCodeData);
    
    // Validate that company_code is provided
    if (!companyCodeData.company_code || companyCodeData.company_code.trim() === '') {
      throw new Error('Company code is required and cannot be empty');
    }

    const existing = await this.findByCompanyCode(companyCodeData.company_code);
    if (existing) {
      throw new Error(`Company code ${companyCodeData.company_code} already exists`);
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newRecord = {
      id,
      company_code: companyCodeData.company_code,
      company_name: companyCodeData.company_name || '',
      city: companyCodeData.city || '',
      country: companyCodeData.country || '',
      currency: companyCodeData.currency || '',
      language: companyCodeData.language || '',
      vat_registration_number: companyCodeData.vat_registration_number || '',
      input_tax_code: companyCodeData.input_tax_code || '',
      output_tax_code: companyCodeData.output_tax_code || '',
      house_number: companyCodeData.house_number || '',
      address_line1: companyCodeData.address_line1 || '',
      address_line2: companyCodeData.address_line2 || '',
      address_line3: companyCodeData.address_line3 || '',
      region: companyCodeData.region || '',
      district: companyCodeData.district || '',
      county: companyCodeData.county || '',
      state: companyCodeData.state || '',
      post_code: companyCodeData.post_code || '',
      created_at: now,
      updated_at: now
    };

    this.data.set(id, newRecord);
    console.log('✅ Successfully created company code:', newRecord);
    console.log('📊 Total records in database:', this.data.size);
    return newRecord;
  }

  async update(id, updateData) {
    const existingRecord = this.data.get(id);
    if (!existingRecord) {
      return null;
    }

    const updatedRecord = {
      ...existingRecord,
      ...updateData,
      id,
      created_at: existingRecord.created_at,
      updated_at: new Date().toISOString()
    };

    this.data.set(id, updatedRecord);
    return updatedRecord;
  }

  async delete(id) {
    if (this.data.has(id)) {
      this.data.delete(id);
      return true;
    }
    return false;
  }

  async getStats() {
    return {
      totalRecords: this.data.size
    };
  }
}

let databaseInstance = null;

function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = new InMemoryDatabase();
  }
  return databaseInstance;
}

module.exports = {
  getDatabase,
  InMemoryDatabase
};
