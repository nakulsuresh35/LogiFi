import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* For Day 1, we just show the Login Screen directly */}
      <LoginScreen />
    </SafeAreaProvider>
  );
}