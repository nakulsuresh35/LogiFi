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
    if (!amount) {
      Alert.alert("Missing Info", "Please enter the amount received.");
      return;
    }

    setLoading(true);
    try {
      // 1. Calculate new total
      const addedAmount = parseFloat(amount);
      const newTotal = (trip.advance_amount || 0) + addedAmount;

      // 2. Update Supabase
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
          onChangeText={setAmount}
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