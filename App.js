import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { supabase } from './src/lib/supabase'; // Ensure this path is correct

// Import Screens
import AddAdvanceScreen from './src/screens/AddAdvanceScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import DriverHomeScreen from './src/screens/DriverHomeScreen';
import EndTripScreen from './src/screens/EndTripScreen';
import LoginScreen from './src/screens/LoginScreen';
import StartTripScreen from './src/screens/StartTripScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for login/logout events automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* MAGIC SWITCH: If Session exists, show App. If not, show Login. */}
        {session && session.user ? (
          // --- AUTHENTICATED STACK (User is logged in) ---
          <>
            <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
            <Stack.Screen name="StartTrip" component={StartTripScreen} />
            <Stack.Screen name="EndTrip" component={EndTripScreen} />
            
            {/* Modals */}
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen} 
              options={{ presentation: 'modal' }} 
            />
            <Stack.Screen 
              name="AddAdvance" 
              component={AddAdvanceScreen} 
              options={{ presentation: 'modal' }} 
            />
          </>
        ) : (
          // --- GUEST STACK (User is logged out) ---
          <Stack.Screen name="Login" component={LoginScreen} />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}