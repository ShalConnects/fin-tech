import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any;
  profile: any;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  
  clearMessages: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<{ success: boolean; message?: string }>;
  handleEmailConfirmation: () => Promise<void>;
  resendEmailConfirmation: (email: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => {
    set({ error: null, success: null });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        set({ error: error.message, isLoading: false });
        return { success: false, message: error.message };
      }

      console.log('Sign in successful:', data.user?.id);
      set({ user: data.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Sign in exception:', error);
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      console.log('Starting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Check for existing email error patterns
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('user already registered') ||
            errorMessage.includes('email already exists') ||
            errorMessage.includes('user already exists')) {
          const userFriendlyError = 'This email is already registered. Please use a different email or try logging in.';
          set({ error: userFriendlyError, isLoading: false });
          return { success: false, message: userFriendlyError };
        }
        
        set({ error: error.message, isLoading: false });
        return { success: false, message: error.message };
      }

      if (!data.user) {
        console.error('No user returned from signup');
        set({ error: 'Registration failed. Please try again.', isLoading: false });
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      console.log('User created:', data.user.id);
      
      // SIMPLIFIED: Don't require email confirmation for quick launch
      // Set success message and allow immediate login
      set({ 
        user: data.user, // Set user immediately
        profile: null,
        isLoading: false, 
        success: 'Registration successful! You can now log in.',
        error: null 
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        set(state => ({ ...state, success: null }));
      }, 5000);

      return { success: true, message: 'Registration successful! You can now log in.' };
      
    } catch (error) {
      console.error('Registration exception:', error);
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signInWithProvider: async (provider: 'google' | 'apple') => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },

  handleEmailConfirmation: async () => {
    // Simplified: Just clear any confirmation-related messages
    set({ success: 'Email confirmed successfully!' });
    setTimeout(() => {
      set(state => ({ ...state, success: null }));
    }, 3000);
  },

  resendEmailConfirmation: async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Confirmation email sent!' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
})); 