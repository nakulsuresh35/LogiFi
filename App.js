import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-url-polyfill/auto'; // Required for Supabase on React Native
import { supabase } from './lib/supabase';

// --- IMPORT YOUR SCREENS HERE ---
// Note: Keeping your "./src/screens/" path structure
import AddAdvanceScreen from './src/screens/AddAdvanceScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import DriverHomeScreen from './src/screens/DriverHomeScreen';
import EndTripScreen from './src/screens/EndTripScreen'; // <--- NEW IMPORT
import LoginScreen from './src/screens/LoginScreen';
import StartTripScreen from './src/screens/StartTripScreen';

// Define the Stack
const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'driver' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) determineRole(session.user.email);
      setLoading(false);
    });

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        determineRole(session.user.email);
      } else {
        setUserRole(null); // Clear role on logout
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- THE "HACK" LOGIC ---
  const determineRole = (email) => {
    if (email.includes('admin@mainmast.com')) {
      setUserRole('admin');
    } else {
      // Assuming anything else is a truck/driver
      setUserRole('driver');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* SCENARIO 1: NOT LOGGED IN */}
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : 
        
        /* SCENARIO 2: LOGGED IN AS ADMIN */
        userRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
            {/* Add other Admin screens here later */}
          </>
        ) : 
        
        /* SCENARIO 3: LOGGED IN AS DRIVER (Truck) */
        (
          <>
            <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
            
            <Stack.Screen 
              name="StartTrip" 
              component={StartTripScreen} 
              options={{ headerShown: true, title: 'Start New Trip' }} 
            />
            
            {/* 👇 NEW SCREEN ADDED HERE 👇 */}
            <Stack.Screen 
              name="EndTrip" 
              component={EndTripScreen} 
              options={{ headerShown: true, title: 'End Current Trip' }} 
            />

            <Stack.Screen 
              name="AddAdvance" 
              component={AddAdvanceScreen} 
              options={{ presentation: 'modal', headerShown: false }} 
            />

            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen} 
              options={{ presentation: 'modal', headerShown: false }} 
            />
            
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}