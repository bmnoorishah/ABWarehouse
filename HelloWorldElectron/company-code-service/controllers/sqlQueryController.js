/**
 * SQL Query Controller for ABWarehouse
 * Provides SQL-like query interface for the in-memory database
 */

class SQLQueryController {
  constructor(database) {
    this.db = database;
  }

  /**
   * Execute SQL-like query on the in-memory database
   */
  async executeQuery(req, res) {
    try {
      const { 
        query, 
        page = 1, 
        limit = 50, 
        sortField = 'company_code', 
        sortDirection = 'asc' 
      } = req.body;

      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'SQL query is required'
        });
      }

      // Get all data from database
      const allData = await this.db.findAll();
      
      // Parse and execute the query
      const result = this.parseAndExecuteQuery(query.trim(), allData);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // Apply sorting
      const sortedData = this.applySorting(result.data, sortField, sortDirection);
      
      // Apply pagination
      const totalRecords = sortedData.length;
      const totalPages = Math.ceil(totalRecords / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = sortedData.slice(startIndex, endIndex);

      // Get column information
      const columns = this.getColumns(paginatedData);

      res.json({
        success: true,
        data: {
          records: paginatedData,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRecords,
            recordsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          columns,
          query: query.trim(),
          executionTime: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('SQL Query execution error:', error);
      res.status(500).json({
        success: false,
        message: 'Query execution failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Parse and execute SQL-like query
   */
  parseAndExecuteQuery(query, data) {
    try {
      const queryLower = query.toLowerCase();
      
      // Basic SELECT query parsing
      if (queryLower.startsWith('select')) {
        return this.executeSelectQuery(query, data);
      } else {
        return {
          error: 'Only SELECT queries are supported. Use: SELECT * FROM companies or SELECT column1, column2 FROM companies WHERE condition'
        };
      }
    } catch (error) {
      return {
        error: `Query parsing error: ${error.message}`
      };
    }
  }

  /**
   * Execute SELECT query
   */
  executeSelectQuery(query, data) {
    try {
      const queryLower = query.toLowerCase();
      
      // Parse SELECT fields
      const selectMatch = query.match(/select\s+(.*?)\s+from/i);
      if (!selectMatch) {
        return { error: 'Invalid SELECT syntax. Use: SELECT fields FROM companies' };
      }
      
      const fieldsStr = selectMatch[1].trim();
      const isSelectAll = fieldsStr === '*';
      const selectedFields = isSelectAll ? null : fieldsStr.split(',').map(f => f.trim());

      // Parse WHERE clause
      let filteredData = [...data];
      const whereMatch = query.match(/where\s+(.+?)(?:\s+order\s+by|$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        filteredData = this.applyWhereClause(data, whereClause);
      }

      // Parse ORDER BY clause
      const orderMatch = query.match(/order\s+by\s+(.+?)(?:\s+limit|$)/i);
      if (orderMatch) {
        const orderClause = orderMatch[1].trim();
        filteredData = this.applyOrderBy(filteredData, orderClause);
      }

      // Parse LIMIT clause
      const limitMatch = query.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        filteredData = filteredData.slice(0, limit);
      }

      // Select specific fields if not SELECT *
      if (!isSelectAll && selectedFields) {
        filteredData = filteredData.map(record => {
          const newRecord = {};
          selectedFields.forEach(field => {
            const fieldName = field.trim();
            if (record.hasOwnProperty(fieldName)) {
              newRecord[fieldName] = record[fieldName];
            }
          });
          return newRecord;
        });
      }

      return { data: filteredData };
    } catch (error) {
      return { error: `SELECT query error: ${error.message}` };
    }
  }

  /**
   * Apply WHERE clause filtering
   */
  applyWhereClause(data, whereClause) {
    try {
      return data.filter(record => {
        // Simple condition parsing - supports basic operators
        const conditions = whereClause.split(/\s+and\s+/i);
        
        return conditions.every(condition => {
          // Parse condition: field operator value
          const match = condition.match(/(\w+)\s*(=|!=|<>|<|>|<=|>=|like)\s*(.+)/i);
          if (!match) return true;
          
          const [, field, operator, valueStr] = match;
          const value = valueStr.replace(/^['"]|['"]$/g, ''); // Remove quotes
          const recordValue = record[field];
          
          if (recordValue === undefined) return false;
          
          switch (operator.toLowerCase()) {
            case '=':
              return String(recordValue).toLowerCase() === value.toLowerCase();
            case '!=':
            case '<>':
              return String(recordValue).toLowerCase() !== value.toLowerCase();
            case '<':
              return recordValue < value;
            case '>':
              return recordValue > value;
            case '<=':
              return recordValue <= value;
            case '>=':
              return recordValue >= value;
            case 'like':
              const pattern = value.replace(/%/g, '.*');
              const regex = new RegExp(pattern, 'i');
              return regex.test(String(recordValue));
            default:
              return true;
          }
        });
      });
    } catch (error) {
      console.error('WHERE clause error:', error);
      return data;
    }
  }

  /**
   * Apply ORDER BY clause
   */
  applyOrderBy(data, orderClause) {
    try {
      const parts = orderClause.split(',');
      
      return data.sort((a, b) => {
        for (const part of parts) {
          const match = part.trim().match(/(\w+)\s*(asc|desc)?/i);
          if (!match) continue;
          
          const [, field, direction = 'asc'] = match;
          const aVal = a[field];
          const bVal = b[field];
          
          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;
          
          if (direction.toLowerCase() === 'desc') {
            comparison = -comparison;
          }
          
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    } catch (error) {
      console.error('ORDER BY error:', error);
      return data;
    }
  }

  /**
   * Apply sorting to data
   */
  applySorting(data, field, direction) {
    if (!data.length || !field) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get column information from data
   */
  getColumns(data) {
    if (!data.length) return [];
    
    const sample = data[0];
    return Object.keys(sample).map(key => ({
      field: key,
      header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: this.getFieldType(sample[key]),
      sortable: true,
      filterable: true
    }));
  }

  /**
   * Determine field type
   */
  getFieldType(value) {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    return 'string';
  }

  /**
   * Get database schema information
   */
  async getSchema(req, res) {
    try {
      const sampleData = await this.db.findAll();
      const schema = sampleData.length > 0 ? this.getColumns(sampleData) : [];
      
      res.json({
        success: true,
        data: {
          tableName: 'companies',
          totalRecords: sampleData.length,
          columns: schema,
          sampleQueries: [
            'SELECT * FROM companies',
            'SELECT company_code, company_name, city FROM companies',
            'SELECT * FROM companies WHERE country = \'US\'',
            'SELECT * FROM companies WHERE company_name LIKE \'%Warehouse%\'',
            'SELECT * FROM companies ORDER BY company_code ASC',
            'SELECT * FROM companies WHERE currency = \'USD\' ORDER BY company_name LIMIT 10'
          ]
        }
      });
    } catch (error) {
      console.error('Schema error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get database schema'
      });
    }
  }
}

module.exports = SQLQueryController;