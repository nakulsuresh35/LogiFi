import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

export default function StartTripScreen({ navigation }) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [startKm, setStartKm] = useState('');
  const [advance, setAdvance] = useState('');
  const [loading, setLoading] = useState(false);
  const [truckId, setTruckId] = useState(null);

  useEffect(() => {
    fetchTruckId();
  }, []);

  const fetchTruckId = async () => {
    // 1. Get Logged in User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Extract Plate Number (KA01AB1234 from email)
    const plateNumber = user.email.split('@')[0].toUpperCase();

    // 3. Find the Vehicle ID from the 'vehicles' table
    const { data, error } = await supabase
      .from('vehicles')
      .select('id')
      .eq('plate_number', plateNumber)
      .single();

    if (error || !data) {
      Alert.alert("Error", "Truck not found in database. Contact Admin.");
      navigation.goBack();
    } else {
      setTruckId(data.id);
    }
  };

  const handleStartTrip = async () => {
    if (!fromLocation || !toLocation || !startKm) {
      Alert.alert("Missing Info", "Please fill in From, To, and Start KM.");
      return;
    }

    setLoading(true);

    try {
      // 4. Insert the new trip into Supabase
      const { error } = await supabase.from('trips').insert([
        {
          vehicle_id: truckId,
          from_location: fromLocation,
          to_location: toLocation,
          start_km: parseFloat(startKm),
          advance_amount: parseFloat(advance) || 0,
          status: 'active'
        }
      ]);

      if (error) throw error;

      Alert.alert("Success", "Trip Started! Safe Driving.");
      navigation.replace("DriverHome"); // Go back and refresh

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!truckId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Identifying Truck...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Start New Trip</Text>
        <Text style={styles.subtitle}>Enter the initial details carefully.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>From Location</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Mumbai" 
            value={fromLocation}
            onChangeText={setFromLocation}
          />

          <Text style={styles.label}>To Destination</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Delhi" 
            value={toLocation}
            onChangeText={setToLocation}
          />

          <Text style={styles.label}>Starting Odometer (KM)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 45000" 
            keyboardType="numeric"
            value={startKm}
            onChangeText={setStartKm}
          />

          <Text style={styles.label}>Advance Cash Received (₹)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 5000" 
            keyboardType="numeric"
            value={advance}
            onChangeText={setAdvance}
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleStartTrip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitBtnText}>CONFIRM START</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginTop: 20 },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginBottom: 30 },
  form: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: COLORS.background, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, fontSize: 16 },
  submitBtn: { backgroundColor: COLORS.success, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});