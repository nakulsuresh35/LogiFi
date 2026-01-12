import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Truck } from 'lucide-react-native';
import { supabase } from '../lib/supabase'; // Ensure this path is correct

export default function LoginScreen({ navigation }) { // Receive navigation prop
  const [plateNumber, setPlateNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!plateNumber || !password) {
      Alert.alert('Error', 'Please enter Truck Number and Password');
      return;
    }

    setLoading(true);

    // 1. Format the input: "KA 01 AB 1234" -> "KA01AB1234"
    const cleanPlate = plateNumber.replace(/\s/g, '').toUpperCase();
    
    // 2. Create the secret email
    const fakeEmail = `${cleanPlate}@logifi.com`;

    try {
      // 3. Attempt Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (error) throw error;

      // 4. Success! (The App.js listener will handle navigation usually, 
      // but for now we can alert or navigate manually if set up)
      console.log('Logged in user:', data.user);
      
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
            <Truck size={40} color={COLORS.surface} />
        </View>
        <Text style={styles.title}>LogiFi</Text>
        <Text style={styles.subtitle}>Fleet Management System</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Truck Number</Text>
        <TextInput
          style={styles.input}
          placeholder="KA01AB1234"
          placeholderTextColor={COLORS.textLight}
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor={COLORS.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Login to Truck'}
          </Text>
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
    elevation: 5,
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
    backgroundColor: COLORS.secondary,
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