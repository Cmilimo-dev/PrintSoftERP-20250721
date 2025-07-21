const { db } = require('../config/database');

// Mock data for development
const mockCustomers = [
  {
    id: 1,
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1234567890',
    address: '123 Business St',
    type: 'Business',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1234567891',
    address: '456 Innovation Ave',
    type: 'Business',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Unnamed Customer',
    email: 'calmil@gmail.com',
    phone: '+19283839',
    address: '',
    type: 'Individual',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Mock leads data
const mockLeads = [
  {
    id: 1,
    name: 'Potential Client A',
    email: 'lead1@example.com',
    phone: '+1234567892',
    company: 'Future Corp',
    status: 'new',
    source: 'website',
    value: 5000,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Potential Client B',
    email: 'lead2@example.com',
    phone: '+1234567893',
    company: 'Growth Ltd',
    status: 'qualified',
    source: 'referral',
    value: 8000,
    created_at: new Date().toISOString()
  }
];

const getCustomers = async (req, res) => {
  try {
    const { order, status, search } = req.query;
    
    let query = 'SELECT * FROM customers';
    let params = [];
    let whereClause = [];
    
    if (search) {
      whereClause.push('(MATCH(name, email, phone) AGAINST(?) OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ?)');
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
    const customers = rows.map(row => ({
      id: row.id,
      customer_number: row.customer_number,
      name: row.name,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      type: row.customer_type,
      status: row.status,
      credit_limit: row.credit_limit,
      payment_terms: row.payment_terms,
      currency: row.preferred_currency,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { 
      name, 
      first_name, 
      last_name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      type, 
      status,
      credit_limit,
      payment_terms,
      currency,
      notes
    } = req.body;
    
    // Handle name - either use provided name or combine first_name and last_name
    let customerName;
    if (name) {
      customerName = name;
    } else if (first_name || last_name) {
      customerName = `${first_name || ''} ${last_name || ''}`.trim();
    } else {
      return res.status(400).json({ error: 'Name (or first_name/last_name) and email are required' });
    }
    
    // Validate required fields
    if (!customerName || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Generate UUID for new customer
    const { uuidv4 } = require('../config/database');
    const customerId = uuidv4();
    
    // Generate customer number using the number generation system
    let customerNumber;
    try {
      // Get customer number generation settings
      const getSettingsQuery = `
        SELECT * FROM number_generation_settings 
        WHERE document_type = 'customer' AND is_active = 1
      `;
      
      const [settingsRows] = await db.execute(getSettingsQuery);
      const settings = settingsRows[0];
      
      if (settings) {
        // Generate formatted customer number
        const paddedNumber = String(settings.next_number).padStart(settings.number_length, '0');
        customerNumber = `${settings.prefix}${settings.separator}${paddedNumber}`;
        
        // Update next number in database
        const updateQuery = `
          UPDATE number_generation_settings 
          SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP
          WHERE document_type = 'customer'
        `;
        
        await db.execute(updateQuery);
        
        // Record the generated number in sequences table
        const recordQuery = `
          INSERT INTO document_sequences (id, document_type, document_number, sequence_number)
          VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(recordQuery, [uuidv4(), 'customer', customerNumber, settings.next_number]);
      } else {
        // Fallback to auto-increment if no settings found
        customerNumber = `CUST-${Date.now()}`;
      }
    } catch (error) {
      console.error('Error generating customer number:', error);
      // Fallback to timestamp-based number
      customerNumber = `CUST-${Date.now()}`;
    }
    
    // Combine address fields if provided separately
    let fullAddress = address;
    if (!fullAddress && (city || state || country)) {
      const addressParts = [address, city, state, country].filter(Boolean);
      fullAddress = addressParts.join(', ');
    }
    
    // Insert into database
    const query = `
      INSERT INTO customers (
        id, customer_number, name, first_name, last_name, email, phone, address, city, state, country,
        customer_type, status, credit_limit, payment_terms, preferred_currency, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    await db.execute(query, [
      customerId,
      customerNumber,
      customerName,
      first_name || null,
      last_name || null,
      email,
      phone || null,
      fullAddress || null,
      city || null,
      state || null,
      country || null,
      type || 'individual',
      status || 'active',
      credit_limit || null,
      payment_terms || null,
      currency || null,
      notes || null
    ]);
    
    // Return the created customer
    const newCustomer = {
      id: customerId,
      customer_number: customerNumber,
      name: customerName,
      first_name,
      last_name,
      email,
      phone,
      address: fullAddress,
      city,
      state,
      country,
      type: type || 'Individual',
      status: status || 'active',
      credit_limit,
      payment_terms,
      currency,
      notes,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      first_name, 
      last_name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      type, 
      status,
      credit_limit,
      payment_terms,
      currency,
      notes
    } = req.body;
    
    // Find the customer in the database
    const query = 'SELECT * FROM customers WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const existingCustomer = rows[0];
    
    // Handle name - either use provided name or combine first_name and last_name
    let customerName = name;
    if (!customerName && (first_name || last_name)) {
      customerName = `${first_name || ''} ${last_name || ''}`.trim();
    }
    
    // Combine address fields if provided separately
    let fullAddress = address;
    if (!fullAddress && (city || state || country)) {
      const addressParts = [address, city, state, country].filter(Boolean);
      fullAddress = addressParts.join(', ');
    }
    
    // Update the customer in the database
    const updateQuery = `
      UPDATE customers SET 
        name = ?, 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        phone = ?, 
        address = ?, 
        city = ?, 
        state = ?, 
        country = ?, 
        customer_type = ?, 
        status = ?, 
        credit_limit = ?, 
        payment_terms = ?, 
        preferred_currency = ?, 
        notes = ?, 
        updated_at = NOW() 
      WHERE id = ?
    `;
    
    await db.execute(updateQuery, [
      customerName || existingCustomer.name,
      first_name || existingCustomer.first_name,
      last_name || existingCustomer.last_name,
      email || existingCustomer.email,
      phone || existingCustomer.phone,
      fullAddress || existingCustomer.address,
      city || existingCustomer.city,
      state || existingCustomer.state,
      country || existingCustomer.country,
      type || existingCustomer.customer_type,
      status || existingCustomer.status,
      credit_limit || existingCustomer.credit_limit,
      payment_terms || existingCustomer.payment_terms,
      currency || existingCustomer.preferred_currency,
      notes || existingCustomer.notes,
      id
    ]);
    
    // Get the updated customer
    const [updatedRows] = await db.execute(query, [id]);
    const updatedCustomer = updatedRows[0];
    
    // Format the response to match frontend expectations
    const formattedCustomer = {
      id: updatedCustomer.id,
      customer_number: updatedCustomer.customer_number,
      name: updatedCustomer.name,
      first_name: updatedCustomer.first_name,
      last_name: updatedCustomer.last_name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      city: updatedCustomer.city,
      state: updatedCustomer.state,
      country: updatedCustomer.country,
      type: updatedCustomer.customer_type,
      status: updatedCustomer.status,
      credit_limit: updatedCustomer.credit_limit,
      payment_terms: updatedCustomer.payment_terms,
      currency: updatedCustomer.preferred_currency,
      notes: updatedCustomer.notes,
      created_at: updatedCustomer.created_at,
      updated_at: updatedCustomer.updated_at
    };
    
    res.json(formattedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the customer in the database
    const query = 'SELECT * FROM customers WHERE id = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete the customer from the database
    const deleteQuery = 'DELETE FROM customers WHERE id = ?';
    await db.execute(deleteQuery, [id]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLeads = async (req, res) => {
  try {
    const { order, status } = req.query;
    
    let filteredLeads = [...mockLeads];
    
    // Filter by status if provided
    if (status) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.status && lead.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Sort by order if provided
    if (order) {
      const [field, direction] = order.split('.');
      filteredLeads.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        
        if (direction === 'desc') {
          return new Date(bVal) - new Date(aVal);
        } else {
          return new Date(aVal) - new Date(bVal);
        }
      });
    }
    
    res.json(filteredLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, value } = req.body;
    
    // TODO: Implement actual database insert
    const newLead = {
      id: mockLeads.length + 1,
      name,
      email,
      phone,
      company,
      status: 'new',
      source,
      value,
      created_at: new Date().toISOString()
    };
    
    mockLeads.push(newLead);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getLeads,
  createLead
};
