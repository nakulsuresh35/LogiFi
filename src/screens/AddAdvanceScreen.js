import { IndianRupee } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

export default function AddAdvanceScreen({ route, navigation }) {
  const { trip } = route.params; 
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateAdvance = async () => {
    // --- 1. IRONCLAD VALIDATION WALL ---
    const addedAmount = parseFloat(amount);

    // Check for empty, NaN, or zero/negative amounts
    if (!amount || isNaN(addedAmount) || addedAmount <= 0) {
      Alert.alert(
        "Invalid Amount", 
        "Please enter a valid amount greater than zero."
      );
      return; // ⛔ Stops here
    }

    // Sanity check to prevent accidental 10-digit typos
    if (addedAmount > 500000) {
      Alert.alert(
        "Amount Too High", 
        "This advance seems unusually high. Please check for typos before saving."
      );
      return; // ⛔ Stops here
    }
    // --- END OF VALIDATION ---

    setLoading(true);
    try {
      // 2. Calculate new total
      const newTotal = (trip.advance_amount || 0) + addedAmount;

      // 3. Update Supabase
      const { error } = await supabase
        .from('trips')
        .update({ advance_amount: newTotal })
        .eq('id', trip.id);

      if (error) throw error;

      Alert.alert("Success", `Added ₹${addedAmount} to Trip Advance.`);
      navigation.navigate('DriverHome'); // Go home to refresh the total

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <IndianRupee size={50} color={COLORS.success} />
        <Text style={styles.title}>Receive Advance</Text>
        <Text style={styles.subtitle}>Current Total: ₹{trip.advance_amount}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Additional Amount Received (₹)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2000" 
          keyboardType="numeric"
          value={amount}
          // The UI Lock is perfectly implemented here:
          onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
          autoFocus={true}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateAdvance} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>UPDATE TOTAL</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 18, color: COLORS.textLight, marginTop: 5 },
  form: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 4 },
  label: { fontWeight: '600', marginBottom: 8, color: COLORS.textLight },
  input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 18, marginBottom: 20 },
  submitBtn: { backgroundColor: COLORS.success, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelText: { color: COLORS.textLight, fontWeight: 'bold' }
});