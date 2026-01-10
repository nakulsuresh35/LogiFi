import { Truck } from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    alert('Login clicked! (Logic coming on Day 2)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {/* The Icon */}
        <View style={styles.iconCircle}>
            <Truck size={40} color={COLORS.surface} />
        </View>
        
        <Text style={styles.title}>LogiFi</Text>
        <Text style={styles.subtitle}>Logistics Management System</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="driver@mainmast.com"
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={COLORS.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5, // Shadow for Android
    shadowColor: COLORS.primary, // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.secondary, // Dark Red
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});