const { db, uuidv4, bcrypt } = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login controller
const login = async (req, res) => {
  console.log('Login attempt:', JSON.stringify(req.body));
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing credentials - email:', email, 'password:', password);
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = userRows[0];

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get company details if user has a company
    let company = null;
    if (user.company_id) {
      const [companyRows] = await db.execute('SELECT * FROM companies WHERE id = ?', [user.company_id]);
      company = companyRows[0];
    }

    // Check if trial has expired (only for non-super admins)
    if (user.role !== 'super_admin' && company && company.subscription_plan === 'trial' && company.trial_end_date < new Date()) {
      return res.status(401).json({ error: 'Trial period has ended. Please upgrade your plan.' });
    }

    // Check if premium membership
    const isPremium = !company || company.subscription_plan !== 'trial' || user.role === 'super_admin';

    // Check if password exists
    if (!user.password_hash) {
      console.error('User has no password_hash:', email);
      return res.status(500).json({ error: 'User account is not properly configured' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.status(500).json({ error: 'Authentication error' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Database error during login:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

// Register controller
const register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const companyId = uuidv4();
    const username = email.split('@')[0]; // Generate username from email

    // Set trial period end date
    const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const inviteToken = uuidv4();

    // Create a new company with trial plan
    await db.execute(
      'INSERT INTO companies (id, name, subscription_plan, trial_end_date, invite_token) VALUES (?, ?, ?, ?, ?)',
      [companyId, `${username}'s Company`, 'trial', trialEndDate, inviteToken]
    );

    // Register the primary user (admin) for the company
    await db.execute(
      'INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, first_name, last_name, 'company_admin', companyId]
    );

    const token = jwt.sign(
      { id: userId, email, role: 'company_admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: `Registration successful. You are on a trial plan for 3 days with full features.`,
      token: token,
      inviteToken: inviteToken,
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        role: 'company_admin'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Sub-user registration with invite token
const registerSubUser = async (req, res) => {
  const { email, password, first_name, last_name, invite_token } = req.body;

  if (!email || !password || !invite_token) {
    return res.status(400).json({ error: 'Email, password and invite token required' });
  }

  try {
    // Find company by invite token
    const [companyRows] = await db.execute('SELECT * FROM companies WHERE invite_token = ?', [invite_token]);
    const company = companyRows[0];

    if (!company) {
      return res.status(400).json({ error: 'Invalid invite token' });
    }

    // Check if company is active
    if (!company.is_active) {
      return res.status(400).json({ error: 'Company is not active' });
    }

    // Check user limit
    const [userCountRows] = await db.execute('SELECT COUNT(*) as count FROM users WHERE company_id = ?', [company.id]);
    const userCount = userCountRows[0].count;

    if (userCount >= company.max_users) {
      return res.status(400).json({ error: 'Maximum number of users reached for this company' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const username = email.split('@')[0];

    // Register the sub-user
    await db.execute(
      'INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, user_type, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, first_name, last_name, 'user', 'sub_user', company.id]
    );

    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: `Sub-user registration successful. You are now part of ${company.name}.`,
      token: token,
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        role: 'user',
        company_name: company.name
      }
    });
  } catch (error) {
    console.error('Sub-user registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user subscription status
const getUserSubscriptionStatus = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    
    if (!user.company_id) {
      return res.json({ subscription_status: 'no_company' });
    }
    
    const [companyRows] = await db.execute('SELECT * FROM companies WHERE id = ?', [user.company_id]);
    const company = companyRows[0];
    
    const isTrialExpired = company.subscription_plan === 'trial' && company.trial_end_date < new Date();
    
    res.json({
      subscription_status: company.subscription_plan,
      trial_end_date: company.trial_end_date,
      subscription_end_date: company.subscription_end_date,
      is_trial_expired: isTrialExpired,
      is_premium: company.subscription_plan !== 'trial' || user.role === 'super_admin',
      company_name: company.name,
      invite_token: company.invite_token
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  registerSubUser,
  getUserSubscriptionStatus
};
