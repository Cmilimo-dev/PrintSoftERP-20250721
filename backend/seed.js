const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./printsoft.db');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    db.run(
      'INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, 'admin@printsoft.com', hashedPassword, 'Admin', 'User', 'admin'],
      function(err) {
        if (err) console.error('Error inserting admin user:', err);
        else console.log('Admin user created');
      }
    );

    // Sample customers
    const customers = [
      {
        id: uuidv4(),
        first_name: 'John',
        last_name: 'Doe',
        company_name: 'ABC Corporation',
        customer_type: 'business',
        email: 'john@abc.com',
        phone: '+1-555-0101',
        address: '123 Business St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001'
      },
      {
        id: uuidv4(),
        first_name: 'Sarah',
        last_name: 'Johnson',
        company_name: 'Johnson Enterprises',
        customer_type: 'business',
        email: 'sarah@johnson.com',
        phone: '+1-555-0102',
        address: '456 Commerce Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210'
      },
      {
        id: uuidv4(),
        first_name: 'Mike',
        last_name: 'Smith',
        company_name: null,
        customer_type: 'individual',
        email: 'mike@email.com',
        phone: '+1-555-0103',
        address: '789 Residential Rd',
        city: 'Chicago',
        state: 'IL',
        postal_code: '60601'
      }
    ];

    customers.forEach((customer) => {
      db.run(
        `INSERT OR IGNORE INTO customers (id, first_name, last_name, company_name, customer_type, email, phone, address, city, state, postal_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer.id, customer.first_name, customer.last_name, customer.company_name, customer.customer_type, customer.email, customer.phone, customer.address, customer.city, customer.state, customer.postal_code],
        function(err) {
          if (err) console.error('Error inserting customer:', err);
          else console.log(`Customer ${customer.first_name} ${customer.last_name} created`);
        }
      );
    });

    // Sample products
    const products = [
      {
        id: uuidv4(),
        name: 'Business Cards',
        sku: 'BC-001',
        description: 'Premium business cards, double-sided printing',
        price: 25.00,
        cost: 12.50,
        stock_quantity: 1000,
        unit_of_measure: 'set',
        category: 'Print Materials'
      },
      {
        id: uuidv4(),
        name: 'Brochures',
        sku: 'BR-001',
        description: 'Tri-fold brochures, full color',
        price: 150.00,
        cost: 75.00,
        stock_quantity: 500,
        unit_of_measure: 'pcs',
        category: 'Print Materials'
      },
      {
        id: uuidv4(),
        name: 'Banners',
        sku: 'BN-001',
        description: 'Vinyl banners, weather resistant',
        price: 120.00,
        cost: 60.00,
        stock_quantity: 50,
        unit_of_measure: 'pcs',
        category: 'Large Format'
      },
      {
        id: uuidv4(),
        name: 'Flyers',
        sku: 'FL-001',
        description: 'Single-sided flyers, A4 size',
        price: 80.00,
        cost: 40.00,
        stock_quantity: 2000,
        unit_of_measure: 'pcs',
        category: 'Print Materials'
      }
    ];

    products.forEach((product) => {
      db.run(
        `INSERT OR IGNORE INTO products (id, name, sku, description, price, cost, stock_quantity, unit_of_measure, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.sku, product.description, product.price, product.cost, product.stock_quantity, product.unit_of_measure, product.category],
        function(err) {
          if (err) console.error('Error inserting product:', err);
          else console.log(`Product ${product.name} created`);
        }
      );
    });

    // Sample parts
    const parts = [
      {
        id: uuidv4(),
        name: 'Paper - A4 Premium',
        sku: 'PP-A4-001',
        description: 'Premium A4 paper, 250gsm',
        cost: 0.25,
        stock_quantity: 10000,
        unit_of_measure: 'sheet',
        category: 'Paper'
      },
      {
        id: uuidv4(),
        name: 'Ink Cartridge - Black',
        sku: 'IC-BK-001',
        description: 'Black ink cartridge for digital printing',
        cost: 45.00,
        stock_quantity: 50,
        unit_of_measure: 'pcs',
        category: 'Ink'
      },
      {
        id: uuidv4(),
        name: 'Vinyl Material',
        sku: 'VM-001',
        description: 'Weather-resistant vinyl material',
        cost: 5.50,
        stock_quantity: 500,
        unit_of_measure: 'm',
        category: 'Material'
      }
    ];

    parts.forEach((part) => {
      db.run(
        `INSERT OR IGNORE INTO parts (id, name, sku, description, cost, stock_quantity, unit_of_measure, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [part.id, part.name, part.sku, part.description, part.cost, part.stock_quantity, part.unit_of_measure, part.category],
        function(err) {
          if (err) console.error('Error inserting part:', err);
          else console.log(`Part ${part.name} created`);
        }
      );
    });

    // Sample quotations
    const quotationId = uuidv4();
    db.run(
      `INSERT OR IGNORE INTO quotations (id, quote_number, customer_id, total_amount, status, valid_until, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quotationId, 'Q-2025-001', customers[0].id, 300.00, 'sent', '2025-08-15', 'Initial quote for business cards and brochures'],
      function(err) {
        if (err) console.error('Error inserting quotation:', err);
        else {
          console.log('Sample quotation created');
          
          // Add quotation items
          db.run(
            `INSERT OR IGNORE INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), quotationId, products[0].id, 'Business cards - premium quality', 4, 25.00, 100.00]
          );
          
          db.run(
            `INSERT OR IGNORE INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), quotationId, products[1].id, 'Tri-fold brochures', 1, 150.00, 150.00]
          );
        }
      }
    );

    // Sample sales order
    const salesOrderId = uuidv4();
    db.run(
      `INSERT OR IGNORE INTO sales_orders (id, order_number, customer_id, total_amount, status, order_date, delivery_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [salesOrderId, 'SO-2025-001', customers[1].id, 240.00, 'confirmed', '2025-07-08', '2025-07-15', 'Rush order for marketing campaign'],
      function(err) {
        if (err) console.error('Error inserting sales order:', err);
        else {
          console.log('Sample sales order created');
          
          // Add sales order items
          db.run(
            `INSERT OR IGNORE INTO sales_order_items (id, sales_order_id, product_id, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), salesOrderId, products[2].id, 'Vinyl banners for outdoor advertising', 2, 120.00, 240.00]
          );
        }
      }
    );

    console.log('Database seeding completed!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    setTimeout(() => {
      db.close();
    }, 1000);
  }
}

seedDatabase();
