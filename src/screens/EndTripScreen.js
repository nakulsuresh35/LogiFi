import { CheckCircle, Gauge, IndianRupee } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

export default function EndTripScreen({ route, navigation }) {
  const { trip } = route.params; 
  
  // State for Inputs
  const [endKm, setEndKm] = useState('');
  const [freight, setFreight] = useState(''); // Total Revenue
  const [bata, setBata] = useState('');       // Driver Wage
  
  const [loading, setLoading] = useState(false);

  const handleEndTrip = async () => {
    // 1. Validation
    if (!endKm || !freight || !bata) {
      Alert.alert("Missing Info", "Please fill in End KM, Freight, and Bata.");
      return;
    }

    const finalKm = parseFloat(endKm);
    const startKm = parseFloat(trip.start_km);

    if (finalKm <= startKm) {
      Alert.alert("Error", `End KM must be greater than Start KM (${startKm})`);
      return;
    }

    setLoading(true);

    try {
      // 2. Update Supabase (CORRECTED COLUMN NAMES)
      const { error } = await supabase
        .from('trips')
        .update({ 
          end_km: finalKm,
          total_freight: parseFloat(freight), // <--- MATCHES DB 'total_freight'
          driver_bata: parseFloat(bata),      // <--- MATCHES DB 'driver_bata'
          status: 'completed' 
        })
        .eq('id', trip.id);

      if (error) throw error;

      Alert.alert("Success", "Trip Closed! Financials saved.");
      navigation.navigate('DriverHome'); 

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <CheckCircle size={50} color={COLORS.success} />
          <Text style={styles.title}>Trip Summary</Text>
          <Text style={styles.subtitle}>{trip.from_location} ➝ {trip.to_location}</Text>
        </View>

        <View style={styles.form}>
          
          {/* SECTION 1: ODOMETER */}
          <View style={styles.sectionHeader}>
            <Gauge size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
          </View>
          
          <View style={styles.row}>
             <View style={{flex: 1}}>
                <Text style={styles.label}>Start KM</Text>
                <Text style={styles.staticValue}>{trip.start_km}</Text>
             </View>
             <View style={{flex: 1}}>
                <Text style={styles.label}>End KM</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 45500" 
                  keyboardType="numeric"
                  value={endKm}
                  onChangeText={setEndKm}
                />
             </View>
          </View>

          <View style={styles.divider} />

          {/* SECTION 2: FINANCIALS */}
          <View style={styles.sectionHeader}>
            <IndianRupee size={20} color="green" />
            <Text style={styles.sectionTitle}>Trip Financials</Text>
          </View>

          <Text style={styles.label}>Total Freight / Revenue (₹)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 25000" 
            keyboardType="numeric"
            value={freight}
            onChangeText={setFreight}
          />

          <Text style={styles.label}>Driver Bata / Wage (₹)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 1500" 
            keyboardType="numeric"
            value={bata}
            onChangeText={setBata}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleEndTrip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>CLOSE TRIP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 16, color: COLORS.textLight },
  
  form: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 3 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  
  row: { flexDirection: 'row', gap: 15 },
  label: { fontWeight: '600', marginBottom: 8, color: COLORS.textLight, fontSize: 14 },
  staticValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  
  input: { backgroundColor: '#F3F4F6', padding: 14, borderRadius: 10, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  submitBtn: { backgroundColor: COLORS.success, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelText: { color: COLORS.textLight, fontWeight: 'bold' }
});