const { db, uuidv4 } = require('../config/database');

// Mock data for vendors
const mockVendors = [
  {
    id: 1,
    name: 'Office Supplies Ltd',
    email: 'contact@officesupplies.com',
    phone: '+1234567890',
    address: '123 Business Park, City',
    contact_person: 'John Smith',
    payment_terms: 'Net 30',
    tax_number: 'TX123456789',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Tech Solutions Inc',
    email: 'sales@techsolutions.com',
    phone: '+1234567891',
    address: '456 Tech Avenue, City',
    contact_person: 'Jane Doe',
    payment_terms: 'Net 15',
    tax_number: 'TX987654321',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Print Media Co',
    email: 'orders@printmedia.com',
    phone: '+1234567892',
    address: '789 Print Street, City',
    contact_person: 'Bob Johnson',
    payment_terms: 'Net 45',
    tax_number: 'TX456789123',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const getVendors = async (req, res) => {
  try {
    const { order, status, search } = req.query;
    
    let query = 'SELECT * FROM vendors';
    let params = [];
    let whereClause = [];
    
    if (search) {
      whereClause.push('(MATCH(name, company_name, email) AGAINST(?) OR name LIKE ? OR company_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(search, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Filter by status if provided
    if (status) {
      whereClause.push('status = ?');
      params.push(status);
    }
    
    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }
    
    // Sort by order if provided
    if (order) {
      const [field, direction] = order.split('.');
      const validFields = ['name', 'email', 'created_at', 'updated_at'];
      const validDirections = ['asc', 'desc'];
      
      if (validFields.includes(field) && validDirections.includes(direction)) {
        query += ` ORDER BY ${field} ${direction.toUpperCase()}`;
      }
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    const [rows] = await db.execute(query, params);
    
    // Format the response to match frontend expectations
    const vendors = rows.map(row => ({
      id: row.id,
      vendor_number: row.vendor_number,
      name: row.name,
      company_name: row.company_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      zip: row.zip,
      tax_number: row.tax_number,
      payment_terms: row.payment_terms,
      preferred_currency: row.preferred_currency,
      lead_time: row.lead_time,
      capabilities: row.capabilities,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = mockVendors.find(v => v.id === parseInt(id));
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createVendor = async (req, res) => {
  try {
    const {
      name,
      company_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip,
      tax_number,
      payment_terms,
      preferred_currency,
      lead_time,
      capabilities,
      status = 'active',
      notes
    } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Generate UUID for new vendor
    const vendorId = uuidv4();
    
    // Generate vendor number using the number generation system
    let vendorNumber;
    try {
      const getSettingsQuery = `
        SELECT * FROM number_generation_settings 
        WHERE document_type = 'vendor' AND is_active = 1
      `;
      
      const [settingsRows] = await db.execute(getSettingsQuery);
      const settings = settingsRows[0];
      
      if (settings) {
        const paddedNumber = String(settings.next_number).padStart(settings.number_length, '0');
        vendorNumber = `${settings.prefix}${settings.separator}${paddedNumber}`;
        
        await db.execute(
          'UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE document_type = "vendor"'
        );
        
        await db.execute(
          'INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)',
          [uuidv4(), 'vendor', vendorNumber, settings.next_number]
        );
      } else {
        vendorNumber = `VEN-${Date.now()}`;
      }
    } catch (error) {
      console.error('Error generating vendor number:', error);
      vendorNumber = `VEN-${Date.now()}`;
    }
    
    // Insert into database
    const query = `
      INSERT INTO vendors (
        id, vendor_number, name, company_name, email, phone, address, city, state, country, zip,
        tax_number, payment_terms, preferred_currency, lead_time, capabilities, status, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    await db.execute(query, [
      vendorId,
      vendorNumber,
      name,
      company_name || null,
      email,
      phone || null,
      address || null,
      city || null,
      state || null,
      country || null,
      zip || null,
      tax_number || null,
      payment_terms || null,
      preferred_currency || null,
      lead_time || null,
      capabilities || null,
      status,
      notes || null
    ]);
    
    // Return the created vendor
    const newVendor = {
      id: vendorId,
      vendor_number: vendorNumber,
      name,
      company_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      zip,
      tax_number,
      payment_terms,
      preferred_currency,
      lead_time,
      capabilities,
      status,
      notes,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const vendorIndex = mockVendors.findIndex(v => v.id === parseInt(id));
    if (vendorIndex === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    mockVendors[vendorIndex] = {
      ...mockVendors[vendorIndex],
      ...updates,
      id: parseInt(id), // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };
    
    res.json(mockVendors[vendorIndex]);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorIndex = mockVendors.findIndex(v => v.id === parseInt(id));
    
    if (vendorIndex === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const deletedVendor = mockVendors.splice(vendorIndex, 1)[0];
    res.json(deletedVendor);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
};
