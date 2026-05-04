import { v4 as uuidv4 } from 'uuid';
import pool from './config/database.js';

// Define the groups to seed
const groups = [
  // Standard Accounting Groups
  { name: 'Cash', type: 'Assets' },
  { name: 'Bank Accounts', type: 'Assets' },
  { name: 'Sundry Debtors', type: 'Assets' },
  { name: 'Stock-in-Hand', type: 'Assets' },
  { name: 'Fixed Assets', type: 'Assets' },
  { name: 'Investments', type: 'Assets' },
  { name: 'Loans & Advances', type: 'Assets' },  // Fixed: changed from 'Asset' to 'Assets'
  { name: 'Deposits', type: 'Assets' },
  { name: 'Sundry Creditors', type: 'Liabilities' },
  { name: 'Duties & Taxes', type: 'Liabilities' },
  { name: 'Loans (Liability)', type: 'Liabilities' },
  { name: 'Provisions', type: 'Liabilities' },
  { name: 'Sales', type: 'Income' },
  { name: 'Service Income', type: 'Income' },
  { name: 'Other Income', type: 'Income' },
  { name: 'Purchases', type: 'Expenditure' },
  { name: 'Direct Expenses', type: 'Expenditure' },
  { name: 'Indirect Expenses', type: 'Expenditure' },
  { name: 'Bank Charges', type: 'Expenditure' },
  { name: 'Depreciation', type: 'Expenditure' },
  
  // GST Input Groups
  { name: 'CGST Input', type: 'Assets' },
  { name: 'SGST Input', type: 'Assets' },
  { name: 'IGST Input', type: 'Assets' },
  
  // GST Output Groups
  { name: 'CGST Output', type: 'Liabilities' },
  { name: 'SGST Output', type: 'Liabilities' },
  { name: 'IGST Output', type: 'Liabilities' },
  
  // TDS Payable
  { name: 'TDS Payable', type: 'Liabilities' }
];

async function seed() {
  try {
    // Create array of promises for inserting groups
    const insertPromises = groups.map(group => {
      return pool.query(
        'INSERT INTO groups (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [uuidv4(), group.name, group.type]
      );
    });

    // Execute all insertions
    await Promise.all(insertPromises);
    
    console.log('Groups seeded successfully');
  } catch (error) {
    console.error('Error seeding groups:', error);
    throw error;
  }
}

export default seed;