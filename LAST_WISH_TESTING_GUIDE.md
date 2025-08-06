# Last Wish Feature Testing Guide

## Overview
The Last Wish feature is a digital time capsule system that automatically delivers financial data to designated recipients if a user doesn't check in within a specified timeframe.

## Testing Methods

### 1. **Frontend UI Testing**

#### Access the Feature:
- **Method 1**: Navigate to Dashboard → Last Wish tab
- **Method 2**: Use test panel → Click "🧪 Test Auth" → "Test Last Wish (Free Access)"

#### Test Scenarios:

**Basic Functionality:**
- ✅ Toggle Last Wish on/off
- ✅ Set check-in frequency (7, 14, 30, 60, 90 days)
- ✅ Add/remove recipients
- ✅ Select data types to include
- ✅ Add personal message
- ✅ Manual check-in functionality

**Advanced Testing:**
- ✅ Test with different currencies
- ✅ Test with various data combinations
- ✅ Test recipient validation
- ✅ Test message length limits
- ✅ Test countdown widget display

### 2. **Database Testing**

#### Manual SQL Testing:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('last_wish_settings', 'last_wish_deliveries');

-- Check table structure
\d last_wish_settings;
\d last_wish_deliveries;

-- Test overdue function
SELECT * FROM check_overdue_last_wish();

-- Create test settings
INSERT INTO last_wish_settings (
  user_id,
  is_enabled,
  check_in_frequency,
  last_check_in,
  recipients,
  include_data,
  message,
  is_active
) VALUES (
  'your-test-user-id',
  true,
  7,
  NOW() - INTERVAL '8 days',
  '[{"email": "test@example.com", "name": "Test", "relationship": "Family"}]',
  '{"accounts": true, "transactions": true, "purchases": true, "lendBorrow": true, "savings": true, "analytics": true}',
  'Test message',
  true
);
```

### 3. **Automated Testing**

#### Run the Test Suite:
```bash
# Run comprehensive tests
npm run test:last-wish

# Test the service directly
npm run test:last-wish-service
```

#### Test Coverage:
- ✅ Database connection
- ✅ Table accessibility
- ✅ Overdue function
- ✅ Test user creation
- ✅ Settings management
- ✅ Data gathering
- ✅ Delivery trigger
- ✅ Cleanup procedures

### 4. **Service Testing**

#### Manual Service Testing:
```bash
# Run the service manually
node last-wish-service.js

# Check logs
tail -f last-wish-logs.txt
```

#### Service Test Scenarios:
- ✅ Check for overdue users
- ✅ Process overdue users
- ✅ Send emails to recipients
- ✅ Update delivery status
- ✅ Handle errors gracefully

### 5. **Email Testing**

#### Test Email Delivery:
1. Set up test Last Wish settings with your email
2. Make the user overdue (set last_check_in to past date)
3. Run the service manually
4. Check your email for delivery

#### Email Content Verification:
- ✅ Personal message included
- ✅ Data summary correct
- ✅ JSON attachment present
- ✅ Proper formatting
- ✅ Security notices included

### 6. **Integration Testing**

#### End-to-End Testing:
1. **Setup**: Create test user with Last Wish enabled
2. **Configure**: Set 7-day frequency, add recipients
3. **Simulate**: Set last_check_in to 8 days ago
4. **Trigger**: Run service manually
5. **Verify**: Check email delivery and database updates

#### Test Data Requirements:
```javascript
// Minimum test data needed
const testData = {
  accounts: [{ id: 1, name: 'Test Account', balance: 1000 }],
  transactions: [{ id: 1, amount: 100, description: 'Test Transaction' }],
  purchases: [{ id: 1, amount: 50, description: 'Test Purchase' }],
  lendBorrow: [{ id: 1, amount: 200, type: 'lend', person_name: 'Test Person' }],
  donationSavings: [{ id: 1, amount: 300, type: 'savings' }]
};
```

### 7. **Security Testing**

#### Access Control Testing:
- ✅ Users can only access their own settings
- ✅ RLS policies working correctly
- ✅ Service account has minimal permissions
- ✅ Data encryption in transit and at rest

#### Privacy Testing:
- ✅ Personal data properly filtered
- ✅ Recipient information secure
- ✅ Audit logs maintained
- ✅ GDPR compliance

### 8. **Performance Testing**

#### Load Testing:
- ✅ Multiple overdue users
- ✅ Large data sets
- ✅ Concurrent deliveries
- ✅ Memory usage monitoring

#### Stress Testing:
- ✅ Invalid email addresses
- ✅ Network failures
- ✅ Database connection issues
- ✅ Service recovery

## Testing Checklist

### Pre-Testing Setup:
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Service account set up
- [ ] SMTP credentials configured
- [ ] Test email addresses ready

### Core Functionality:
- [ ] Last Wish settings CRUD operations
- [ ] Check-in functionality
- [ ] Overdue detection
- [ ] Data gathering
- [ ] Email delivery
- [ ] Status tracking

### Edge Cases:
- [ ] Empty recipient list
- [ ] Invalid email formats
- [ ] Large message content
- [ ] Network timeouts
- [ ] Database errors
- [ ] Service crashes

### Integration:
- [ ] Frontend ↔ Backend communication
- [ ] Database ↔ Service communication
- [ ] Email service integration
- [ ] Logging system
- [ ] Error handling

## Troubleshooting

### Common Issues:

**Service Won't Start:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
echo $SMTP_USER
echo $SMTP_PASS

# Check dependencies
npm install @supabase/supabase-js nodemailer
```

**Database Connection Issues:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'last_wish_settings';

-- Check permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON last_wish_settings TO authenticated;
```

**Email Delivery Issues:**
```javascript
// Test SMTP connection
const testTransporter = nodemailer.createTransporter({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

testTransporter.verify((error, success) => {
  if (error) console.log('SMTP Error:', error);
  else console.log('SMTP Ready:', success);
});
```

## Test Environment Setup

### Required Environment Variables:
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Test Data Setup:
```sql
-- Create test user
INSERT INTO auth.users (id, email) VALUES 
('test-user-id', 'test@example.com');

-- Create test settings
INSERT INTO last_wish_settings (...) VALUES (...);
```

## Reporting

### Test Results Format:
```markdown
## Last Wish Test Results

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Development/Staging/Production]

### Test Results:
- [ ] Database Connection: ✅/❌
- [ ] UI Functionality: ✅/❌
- [ ] Service Operations: ✅/❌
- [ ] Email Delivery: ✅/❌
- [ ] Security: ✅/❌

### Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

This comprehensive testing guide ensures thorough validation of the Last Wish feature across all aspects of functionality, security, and performance. 