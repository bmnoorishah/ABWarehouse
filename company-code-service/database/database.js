/**
 * Database Configuration for Company Code Service
 * Uses SQLite in-memory database for H2-like functionality
 */

const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
  constructor() {
    // Create in-memory SQLite database (H2 equivalent)
    this.db = new Database(':memory:');
    this.initializeDatabase();
  }

  initializeDatabase() {
    try {
      // Create company_codes table with all specified fields
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS company_codes (
          id TEXT PRIMARY KEY,
          company_code CHAR(4) UNIQUE NOT NULL,
          company_name CHAR(132) NOT NULL,
          city CHAR(132) NOT NULL,
          country CHAR(2) NOT NULL,
          currency CHAR(3) NOT NULL,
          language CHAR(2) NOT NULL,
          vat_registration_number CHAR(132),
          input_tax_code CHAR(132),
          output_tax_code CHAR(132),
          house_number INTEGER,
          address_line1 CHAR(132),
          address_line2 CHAR(132),
          address_line3 CHAR(132),
          region CHAR(132),
          district CHAR(132),
          county CHAR(132),
          state CHAR(132),
          post_code CHAR(132),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.exec(createTableSQL);

      // Create indexes for better performance
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_company_code ON company_codes(company_code)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_company_name ON company_codes(company_name)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_country ON company_codes(country)');

      // Insert sample data for testing
      this.insertSampleData();

      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  insertSampleData() {
    const sampleCompanies = [
      {
        id: uuidv4(),
        company_code: 'US01',
        company_name: 'ABC Corporation USA',
        city: 'New York',
        country: 'US',
        currency: 'USD',
        language: 'EN',
        vat_registration_number: 'US123456789',
        input_tax_code: 'IT001',
        output_tax_code: 'OT001',
        house_number: 123,
        address_line1: '123 Main Street',
        address_line2: 'Suite 100',
        address_line3: '',
        region: 'Northeast',
        district: 'Manhattan',
        county: 'New York County',
        state: 'New York',
        post_code: '10001'
      },
      {
        id: uuidv4(),
        company_code: 'DE01',
        company_name: 'Deutsche Firma GmbH',
        city: 'Berlin',
        country: 'DE',
        currency: 'EUR',
        language: 'DE',
        vat_registration_number: 'DE987654321',
        input_tax_code: 'IT002',
        output_tax_code: 'OT002',
        house_number: 45,
        address_line1: 'Berliner Straße 45',
        address_line2: '',
        address_line3: '',
        region: 'Brandenburg',
        district: 'Mitte',
        county: 'Berlin',
        state: 'Berlin',
        post_code: '10115'
      }
    ];

    const insertStmt = this.db.prepare(`
      INSERT INTO company_codes (
        id, company_code, company_name, city, country, currency, language,
        vat_registration_number, input_tax_code, output_tax_code, house_number,
        address_line1, address_line2, address_line3, region, district,
        county, state, post_code
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    sampleCompanies.forEach(company => {
      insertStmt.run(
        company.id, company.company_code, company.company_name, company.city,
        company.country, company.currency, company.language, company.vat_registration_number,
        company.input_tax_code, company.output_tax_code, company.house_number,
        company.address_line1, company.address_line2, company.address_line3,
        company.region, company.district, company.county, company.state, company.post_code
      );
    });

    console.log('✅ Sample data inserted successfully');
  }

  // CRUD Operations
  create(companyData) {
    const id = uuidv4();
    const insertStmt = this.db.prepare(`
      INSERT INTO company_codes (
        id, company_code, company_name, city, country, currency, language,
        vat_registration_number, input_tax_code, output_tax_code, house_number,
        address_line1, address_line2, address_line3, region, district,
        county, state, post_code
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    try {
      insertStmt.run(
        id, companyData.companyCode, companyData.companyName, companyData.city,
        companyData.country, companyData.currency, companyData.language,
        companyData.vatRegistrationNumber || null, companyData.inputTaxCode || null,
        companyData.outputTaxCode || null, companyData.houseNumber || null,
        companyData.addressLine1 || null, companyData.addressLine2 || null,
        companyData.addressLine3 || null, companyData.region || null,
        companyData.district || null, companyData.county || null,
        companyData.state || null, companyData.postCode || null
      );

      return this.findById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Company code '${companyData.companyCode}' already exists`);
      }
      throw error;
    }
  }

  findAll() {
    const selectStmt = this.db.prepare('SELECT * FROM company_codes ORDER BY created_at DESC');
    return selectStmt.all().map(this.formatDatabaseRecord);
  }

  findById(id) {
    const selectStmt = this.db.prepare('SELECT * FROM company_codes WHERE id = ?');
    const record = selectStmt.get(id);
    return record ? this.formatDatabaseRecord(record) : null;
  }

  findByCompanyCode(companyCode) {
    const selectStmt = this.db.prepare('SELECT * FROM company_codes WHERE company_code = ?');
    const record = selectStmt.get(companyCode);
    return record ? this.formatDatabaseRecord(record) : null;
  }

  update(id, updateData) {
    const existingRecord = this.findById(id);
    if (!existingRecord) {
      return null;
    }

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        updateFields.push(`${dbField} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return existingRecord;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateSQL = `UPDATE company_codes SET ${updateFields.join(', ')} WHERE id = ?`;
    const updateStmt = this.db.prepare(updateSQL);

    try {
      updateStmt.run(...updateValues);
      return this.findById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Company code '${updateData.companyCode}' already exists`);
      }
      throw error;
    }
  }

  delete(id) {
    const existingRecord = this.findById(id);
    if (!existingRecord) {
      return false;
    }

    const deleteStmt = this.db.prepare('DELETE FROM company_codes WHERE id = ?');
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Utility methods
  formatDatabaseRecord(record) {
    return {
      id: record.id,
      companyCode: record.company_code,
      companyName: record.company_name,
      city: record.city,
      country: record.country,
      currency: record.currency,
      language: record.language,
      vatRegistrationNumber: record.vat_registration_number,
      inputTaxCode: record.input_tax_code,
      outputTaxCode: record.output_tax_code,
      houseNumber: record.house_number,
      addressLine1: record.address_line1,
      addressLine2: record.address_line2,
      addressLine3: record.address_line3,
      region: record.region,
      district: record.district,
      county: record.county,
      state: record.state,
      postCode: record.post_code,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  getStats() {
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM company_codes');
    const countriesStmt = this.db.prepare('SELECT country, COUNT(*) as count FROM company_codes GROUP BY country');
    const currenciesStmt = this.db.prepare('SELECT currency, COUNT(*) as count FROM company_codes GROUP BY currency');

    return {
      totalCompanies: countStmt.get().total,
      byCountry: countriesStmt.all(),
      byCurrency: currenciesStmt.all()
    };
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}

module.exports = { DatabaseManager, getDatabase };