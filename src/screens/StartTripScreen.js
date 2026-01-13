import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { MapPin, Truck, User } from 'lucide-react-native'; // Added User Icon

export default function StartTripScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [truckId, setTruckId] = useState(null);
  
  // Form State
  const [driverName, setDriverName] = useState(''); // <--- NEW FIELD
  const [startKm, setStartKm] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  useEffect(() => {
    fetchTruckId();
  }, []);

  const fetchTruckId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const plateFromEmail = user.email.split('@')[0].toUpperCase();
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id')
        .eq('plate_number', plateFromEmail)
        .maybeSingle();

      if (error || !data) {
        Alert.alert("Error", "Truck not found in database. Please contact Admin.");
        navigation.goBack();
      } else {
        setTruckId(data.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartTrip = async () => {
    // 1. Validation
    if (!driverName || !startKm || !fromLocation || !toLocation) {
      Alert.alert("Missing Info", "Please fill in all fields, including Driver Name.");
      return;
    }

    if (!truckId) {
      Alert.alert("Error", "Vehicle ID missing. Cannot start trip.");
      return;
    }

    setLoading(true);

    try {
      // 2. Insert into Supabase
      const { error } = await supabase.from('trips').insert([
        {
          vehicle_id: truckId,
          driver_name: driverName, // <--- SAVING NAME
          start_km: parseFloat(startKm),
          from_location: fromLocation,
          to_location: toLocation,
          status: 'active',
          advance_amount: 0 // Default start value
        }
      ]);

      if (error) throw error;

      Alert.alert("Success", "Trip Started! Safe Journey.");
      
      // Force refresh on Dashboard
      navigation.navigate('DriverHome', { refresh: new Date().getTime() });

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
          <Truck size={48} color={COLORS.primary} />
          <Text style={styles.title}>Start New Trip</Text>
          <Text style={styles.subtitle}>Enter trip details to begin tracking</Text>
        </View>

        <View style={styles.form}>
          
          {/* NEW DRIVER NAME FIELD */}
          <Text style={styles.label}>Driver Name</Text>
          <View style={styles.inputRow}>
            <User size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Who is driving?" 
              value={driverName}
              onChangeText={setDriverName}
            />
          </View>

          <Text style={styles.label}>Start Odometer (km)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 45200" 
            keyboardType="numeric"
            value={startKm}
            onChangeText={setStartKm}
          />

          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>From</Text>
                <View style={styles.inputRow}>
                    <MapPin size={20} color="green" style={styles.icon} />
                    <TextInput 
                        style={styles.inputWithIcon} 
                        placeholder="City" 
                        value={fromLocation}
                        onChangeText={setFromLocation}
                    />
                </View>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>To</Text>
                <View style={styles.inputRow}>
                    <MapPin size={20} color="red" style={styles.icon} />
                    <TextInput 
                        style={styles.inputWithIcon} 
                        placeholder="City" 
                        value={toLocation}
                        onChangeText={setToLocation}
                    />
                </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleStartTrip} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>START TRIP</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 5 },
  form: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 4 },
  
  label: { fontWeight: '600', marginBottom: 8, color: COLORS.textLight },
  input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  
  // New Styles for Icons inside Inputs
  row: { flexDirection: 'row', marginBottom: 20 },
  inputRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', 
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 12 
  },
  icon: { marginRight: 8 },
  inputWithIcon: { flex: 1, paddingVertical: 16, fontSize: 16 },

  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});