import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Test user credentials for development
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'testpass123',
    fullName: 'Test Admin User'
  },
  user: {
    email: 'user@test.com', 
    password: 'testpass123',
    fullName: 'Test Regular User'
  },
  premium: {
    email: 'premium@test.com',
    password: 'testpass123', 
    fullName: 'Test Premium User'
  }
};

export class TestAuthManager {
  private static instance: TestAuthManager;
  private currentTestUser: any = null;

  static getInstance(): TestAuthManager {
    if (!TestAuthManager.instance) {
      TestAuthManager.instance = new TestAuthManager();
    }
    return TestAuthManager.instance;
  }

  // Create test users using regular signup (no admin permissions needed)
  async setupTestUsers() {
    console.log('Setting up test users...');
    
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      try {
        // Try to sign up the user (this will work even if they exist)
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              fullName: userData.fullName
            }
          }
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            console.log(`Test user ${userData.email} already exists`);
          } else {
            console.error(`Error creating ${key} user:`, error);
          }
        } else {
          console.log(`Created test user: ${userData.email}`);
          
          // Create profile for the user if signup was successful
          if (data.user) {
            await this.createUserProfile(data.user.id, userData.fullName);
          }
        }
      } catch (error) {
        console.error(`Error setting up ${key} user:`, error);
      }
    }
  }

  private async createUserProfile(userId: string, fullName: string, subscription?: { plan: 'free' | 'premium', status: 'active' | 'inactive' | 'cancelled', validUntil: string | null }) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          local_currency: 'USD',
          selected_currencies: ['USD', 'EUR'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(subscription ? { subscription } : {})
        });
      
      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Quick login for testing with persistent session
  async loginAsTestUser(userType: 'admin' | 'user' | 'premium' = 'user') {
    const userData = TEST_USERS[userType];
    
    try {
      // First, check if we already have a session for this user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === userData.email) {
        console.log(`Already logged in as ${userData.email}`);
        this.currentTestUser = session.user;
        return { success: true, user: session.user };
      }

      // Sign in with password - this creates a persistent session
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (error) {
        console.error('Test login error:', error);
        return { success: false, error };
      }

      this.currentTestUser = data.user;
      console.log(`Logged in as test user: ${userData.email}`);
      
      // Verify session was created
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession) {
        console.log('Session created successfully');
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Test login error:', error);
      return { success: false, error };
    }
  }

  // Get current test user
  getCurrentTestUser() {
    return this.currentTestUser;
  }

  // Logout test user
  async logoutTestUser() {
    try {
      await supabase.auth.signOut();
      this.currentTestUser = null;
      console.log('Logged out test user');
    } catch (error) {
      console.error('Test logout error:', error);
    }
  }

  // Get all test user credentials
  getTestUserCredentials() {
    return TEST_USERS;
  }

  // Manual user creation with custom email
  async createCustomTestUser(email: string, password: string, fullName: string, subscription?: { plan: 'free' | 'premium', status: 'active' | 'inactive' | 'cancelled', validUntil: string | null }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName
          }
        }
      });
      
      if (error) {
        console.error('Error creating custom test user:', error);
        return { success: false, error };
      }
      
      if (data.user) {
        await this.createUserProfile(data.user.id, fullName, subscription);
        console.log(`Created custom test user: ${email}`);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error creating custom test user:', error);
      return { success: false, error };
    }
  }

  // Check if user is currently logged in
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}

// Export singleton instance
export const testAuth = TestAuthManager.getInstance(); 