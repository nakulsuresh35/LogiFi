import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH THE KEYS KARTHIK GIVES YOU
const supabaseUrl = 'https://pyoihgqkwtalghcuukcw.supabase.co/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b2loZ3Frd3RhbGdoY3V1a2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTgwNzgsImV4cCI6MjA4MzQ5NDA3OH0.oFMEJfPKClsxV-dIFBkdDHUp_dX--6bK4efjTmqzjdE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});