import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file for:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSocialLoginSetup() {
  console.log('🔍 Testing Social Login Configuration...\n');

  try {
    // Test 1: Check if Supabase client is working
    console.log('1. Testing Supabase connection...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('   ⚠️  No authenticated user (expected for this test)');
    } else {
      console.log('   ✅ Supabase connection working');
    }

    // Test 2: Check if OAuth providers are configured
    console.log('\n2. Testing OAuth provider configuration...');
    
    // Note: We can't directly test OAuth without user interaction
    // But we can check if the client is properly configured
    console.log('   ℹ️  OAuth providers need to be configured in Supabase dashboard');
    console.log('   ℹ️  Google: Authentication > Providers > Google');
    console.log('   ℹ️  Apple: Authentication > Providers > Apple');

    // Test 3: Check environment variables
    console.log('\n3. Checking environment variables...');
    console.log(`   ✅ VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
    console.log(`   ✅ VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Set' : 'Missing'}`);

    // Test 4: Check if we can access auth methods
    console.log('\n4. Testing auth methods availability...');
    
    // This will throw an error if auth is not properly configured
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/test'
        }
      });
      
      if (error && error.message.includes('provider not enabled')) {
        console.log('   ❌ Google OAuth not enabled in Supabase');
        console.log('   💡 Enable it in: Authentication > Providers > Google');
      } else if (error) {
        console.log(`   ⚠️  OAuth test error: ${error.message}`);
      } else {
        console.log('   ✅ OAuth methods available');
      }
    } catch (error) {
      console.log(`   ⚠️  OAuth test exception: ${error.message}`);
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Configure Google OAuth in Supabase dashboard');
    console.log('2. Configure Apple Sign-In in Supabase dashboard');
    console.log('3. Test social login buttons in your app');
    console.log('4. Check browser console for any errors');
    console.log('5. Verify redirect URLs are correct');

    console.log('\n🔗 Useful Links:');
    console.log('- Supabase Auth Docs: https://supabase.com/docs/guides/auth');
    console.log('- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2');
    console.log('- Apple Sign-In Setup: https://developer.apple.com/sign-in-with-apple/');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSocialLoginSetup(); 