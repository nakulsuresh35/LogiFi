import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';

// --- IMPORT ALL SCREENS ---
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import FinancialsScreen from './src/screens/FinancialsScreen';
import InsuranceScreen from './src/screens/InsuranceScreen';
import LoginScreen from './src/screens/LoginScreen';
import MonthlyPLScreen from './src/screens/MonthlyPLScreen';
import TaxScreen from './src/screens/TaxScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if user is logged in when app opens
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for login/logout changes in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Show a spinner while checking if user is logged in
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* AUTH LOGIC: If session exists, show Admin. If not, show Login. */}
          {session && session.user ? (
            <>
              {/* Main Dashboard */}
              <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
              
              {/* Sub Pages (We enable the Header/Back Button for these) */}
              <Stack.Screen 
                name="Financials" 
                component={FinancialsScreen} 
                options={{ 
                  headerShown: true, 
                  title: 'Truck Financials',
                  headerTintColor: '#1e3a8a'
                }} 
              />
              <Stack.Screen 
                name="MonthlyPL" 
                component={MonthlyPLScreen} 
                options={{ 
                  headerShown: true, 
                  title: 'Monthly P&L',
                  headerTintColor: '#1e3a8a'
                }} 
              />
              <Stack.Screen 
                name="Insurance" 
                component={InsuranceScreen} 
                options={{ 
                  headerShown: true, 
                  title: 'Insurance Tracker',
                  headerTintColor: '#1e3a8a'
                }} 
              />
              <Stack.Screen 
                name="Tax" 
                component={TaxScreen} 
                options={{ 
                  headerShown: true, 
                  title: 'Tax Tracker',
                  headerTintColor: '#1e3a8a'
                }} 
              />
            </>
          ) : (
            // Login Screen
            <Stack.Screen name="Login" component={LoginScreen} />
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}