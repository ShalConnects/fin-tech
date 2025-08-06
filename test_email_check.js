const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailCheck() {
  const testEmails = [
    'nonexistent@example.com',
    'test@example.com', // if this exists in your database
    'another@test.com'
  ];

  for (const email of testEmails) {
    console.log(`\nTesting email: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-for-check'
      });
      
      if (error) {
        console.log('Error message:', error.message);
        console.log('Error status:', error.status);
        console.log('Full error:', error);
      } else {
        console.log('Unexpected success with dummy password');
      }
    } catch (err) {
      console.log('Exception:', err.message);
    }
  }
}

testEmailCheck(); 