import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { Play, LogOut } from 'lucide-react-native';

export default function DriverHomeScreen({ navigation }) {
  const [truckName, setTruckName] = useState('Loading...');

  useEffect(() => {
    // Get the truck number from the email (e.g., KA01AB1234@logifi.com -> KA01AB1234)
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const plate = user.email.split('@')[0];
        setTruckName(plate);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleStartTrip = () => {
    Alert.alert("Coming Soon", "We will build the Start Trip form next!");
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.truckId}>{truckName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Main Action Area */}
      <View style={styles.actionContainer}>
        <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <Text style={styles.statusText}>IDLE (No Active Trip)</Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStartTrip}>
            <Play size={40} color="white" fill="white" />
            <Text style={styles.startBtnText}>START NEW TRIP</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Main Mast Logistics Driver App v1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  header: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 16, color: COLORS.textLight },
  truckId: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  logoutBtn: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 50 },
  
  actionContainer: { flex: 1, justifyContent: 'center' },
  statusCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 40, alignItems: 'center', elevation: 2 },
  statusTitle: { color: COLORS.textLight, fontSize: 14, textTransform: 'uppercase' },
  statusText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 5 },

  startBtn: {
    backgroundColor: COLORS.success,
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  startBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  footerText: { textAlign: 'center', color: COLORS.textLight, marginTop: 'auto' }
});