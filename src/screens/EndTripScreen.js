import { CheckCircle } from 'lucide-react-native';
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

export default function EndTripScreen({ route, navigation }) {
  // We passed the entire trip object from the dashboard
  const { trip } = route.params; 
  
  const [endKm, setEndKm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEndTrip = async () => {
    if (!endKm) {
      Alert.alert("Missing Info", "Please enter the final odometer reading.");
      return;
    }

    const finalKm = parseFloat(endKm);
    const startKm = parseFloat(trip.start_km);

    // VALIDATION: You can't end a trip with less KM than you started!
    if (finalKm <= startKm) {
      Alert.alert("Error", `End KM must be greater than Start KM (${startKm})`);
      return;
    }

    setLoading(true);

    try {
      // Update the trip in Supabase
      const { error } = await supabase
        .from('trips')
        .update({ 
          end_km: finalKm,
          status: 'completed' // This changes the dashboard back to "Start Trip" mode
        })
        .eq('id', trip.id);

      if (error) throw error;

      Alert.alert("Trip Completed", "Great job! Drive details saved.");
      
      // Navigate back to Home, which will refresh and show the "Start Trip" button again
      navigation.navigate('DriverHome'); 

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <CheckCircle size={60} color={COLORS.success} />
        <Text style={styles.title}>End Trip</Text>
        <Text style={styles.subtitle}>{trip.from_location} ➝ {trip.to_location}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
            <Text style={styles.label}>Start Odometer:</Text>
            <Text style={styles.value}>{trip.start_km} km</Text>
        </View>

        <Text style={[styles.label, {marginTop: 20}]}>End Odometer Reading</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 45500" 
          keyboardType="numeric"
          value={endKm}
          onChangeText={setEndKm}
          autoFocus={true}
        />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleEndTrip}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>CONFIRM & FINISH</Text>
          )}
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
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 18, color: COLORS.textLight, marginTop: 5 },
  
  card: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  value: { fontWeight: 'bold', fontSize: 18, color: COLORS.text },
  
  label: { fontWeight: '600', marginBottom: 8, color: COLORS.textLight },
  input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 18, marginBottom: 20 },
  
  submitBtn: { backgroundColor: COLORS.success, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelText: { color: COLORS.textLight, fontWeight: 'bold' }
});