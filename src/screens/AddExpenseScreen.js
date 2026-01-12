import { Picker } from '@react-native-picker/picker'; // <--- NEW IMPORT
import { Droplets, FileText, Fuel } from 'lucide-react-native';
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

export default function AddExpenseScreen({ route, navigation }) {
  const { trip, category } = route.params; 
  
  // State for Amount
  const [amount, setAmount] = useState('');
  
  // State for "Other" Dropdown
  const [selectedType, setSelectedType] = useState('Toll'); // Default
  const [customDescription, setCustomDescription] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Helper to get Icon based on category
  const getIcon = () => {
    if (category === 'Diesel') return <Fuel size={50} color={COLORS.primary} />;
    if (category === 'AdBlue') return <Droplets size={50} color="#3b82f6" />; // Blue for AdBlue
    return <FileText size={50} color={COLORS.secondary} />;
  };

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Missing Info", "Please enter the amount.");
      return;
    }

    // Determine the final description
    let finalDescription = '';
    if (category === 'Other') {
        finalDescription = selectedType === 'Custom' ? customDescription : selectedType;
        if (selectedType === 'Custom' && !customDescription) {
            Alert.alert("Missing Info", "Please enter a description for Custom expense.");
            return;
        }
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').insert([
        {
          trip_id: trip.id,
          type: category === 'Other' ? 'Other' : category, // Saves 'Diesel', 'AdBlue', or 'Other'
          amount: parseFloat(amount),
          // We save the specific subtype (Toll/Grease) in description column
          description: category === 'Other' ? finalDescription : null 
        }
      ]);

      if (error) throw error;

      Alert.alert("Success", "Expense added successfully!");
      navigation.goBack(); 
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        {getIcon()}
        <Text style={styles.title}>Add {category}</Text>
        <Text style={styles.subtitle}>{trip.from_location} ➝ {trip.to_location}</Text>
      </View>

      <View style={styles.form}>
        
        {/* DROPDOWN SECTION (Only for 'Other') */}
        {category === 'Other' && (
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Expense Type</Text>
                <View style={styles.pickerBorder}>
                    <Picker
                        selectedValue={selectedType}
                        onValueChange={(itemValue) => setSelectedType(itemValue)}
                    >
                        <Picker.Item label="Toll" value="Toll" />
                        <Picker.Item label="Grease" value="Grease" />
                        <Picker.Item label="Tire Retreading" value="Tire Retreading" />
                        <Picker.Item label="Custom" value="Custom" />
                    </Picker>
                </View>
            </View>
        )}

        {/* CUSTOM DESCRIPTION INPUT (Only if Custom is selected) */}
        {category === 'Other' && selectedType === 'Custom' && (
            <View>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="What was this for?" 
                    value={customDescription}
                    onChangeText={setCustomDescription}
                />
            </View>
        )}

        {/* AMOUNT INPUT (Always Visible) */}
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 500" 
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus={category !== 'Other'} // Auto-focus only if not using dropdown first
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SAVE EXPENSE</Text>}
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
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 5 },
  form: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 4 },
  label: { fontWeight: '600', marginBottom: 8, color: COLORS.textLight },
  input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 18, marginBottom: 20 },
  pickerContainer: { marginBottom: 20 },
  pickerBorder: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, overflow: 'hidden' },
  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelText: { color: COLORS.textLight, fontWeight: 'bold' }
});