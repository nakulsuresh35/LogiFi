import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/colors'; // Assumed existing
import { supabase } from '../lib/supabase';
// Added MapPin and Fuel for the active dashboard visualization
import { FileText, Fuel, LogOut, MapPin, Play } from 'lucide-react-native';

export default function DriverHomeScreen({ navigation }) {
  const [truckName, setTruckName] = useState('Loading...');
  const [currentTrip, setCurrentTrip] = useState(null); // Stores active trip data
  const [loading, setLoading] = useState(true);

  // useFocusEffect runs every time this screen becomes visible
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const plate = user.email.split('@')[0].toUpperCase();
      setTruckName(plate);

      // 2. Get Vehicle ID
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('plate_number', plate)
        .single();

      if (vehicle) {
        // 3. Check for ACTIVE trip
        const { data: trip } = await supabase
          .from('trips')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .eq('status', 'active')
          .maybeSingle(); // Returns null if no active trip

        setCurrentTrip(trip);
      }
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- RENDER HELPERS ---

  const renderStartTripView = () => (
    <View style={styles.actionContainer}>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>IDLE (No Active Trip)</Text>
      </View>

      <TouchableOpacity 
        style={styles.startBtn} 
        onPress={() => navigation.navigate('StartTrip')} // <--- NAVIGATION LINKED HERE
      >
        <Play size={40} color="white" fill="white" />
        <Text style={styles.startBtnText}>START NEW TRIP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveTripView = () => (
    <ScrollView contentContainerStyle={styles.activeContainer}>
      {/* Trip Info Card */}
      <View style={styles.activeCard}>
        <View style={styles.activeHeader}>
          <Text style={styles.activeLabel}>ONGOING TRIP</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>IN TRANSIT</Text>
          </View>
        </View>
        
        <View style={styles.routeContainer}>
            <View>
                <Text style={styles.routeLabel}>FROM</Text>
                <Text style={styles.routeValue}>{currentTrip.from_location}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View>
                <Text style={styles.routeLabel}>TO</Text>
                <Text style={styles.routeValue}>{currentTrip.to_location}</Text>
            </View>
        </View>

        <View style={styles.metaRow}>
            <View style={styles.metaItem}>
                <MapPin size={16} color={COLORS.textLight} />
                <Text style={styles.metaText}>Start: {currentTrip.start_km} km</Text>
            </View>
            <View style={styles.metaItem}>
                <Text style={styles.metaText}>Adv: ₹{currentTrip.advance_amount}</Text>
            </View>
        </View>
      </View>

      {/* Action Grid for Expenses */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert("Coming Soon", "Diesel Form")}>
            <Fuel size={32} color={COLORS.primary} />
            <Text style={styles.gridText}>Log Diesel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert("Coming Soon", "Expense Form")}>
            <FileText size={32} color={COLORS.secondary} />
            <Text style={styles.gridText}>Other Expense</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.endBtn} onPress={() => Alert.alert("Coming Soon", "End Trip Logic")}>
        <Text style={styles.endBtnText}>END TRIP</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) {
    return (
        <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar (Always Visible) */}
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.truckId}>{truckName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Dynamic Content Area */}
      {currentTrip ? renderActiveTripView() : renderStartTripView()}

      {!currentTrip && <Text style={styles.footerText}>Main Mast Logistics Driver App v1.0</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  header: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 16, color: COLORS.textLight },
  truckId: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  logoutBtn: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 50 },
  
  // IDLE STATE STYLES
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
  footerText: { textAlign: 'center', color: COLORS.textLight, marginTop: 'auto' },

  // ACTIVE STATE STYLES
  activeContainer: { paddingBottom: 20 },
  activeCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 4, marginBottom: 30, borderLeftWidth: 5, borderLeftColor: COLORS.success },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  activeLabel: { fontWeight: 'bold', color: COLORS.textLight, letterSpacing: 1 },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: 'green', fontWeight: 'bold', fontSize: 12 },
  routeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  routeLabel: { fontSize: 12, color: COLORS.textLight },
  routeValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  arrow: { fontSize: 24, color: COLORS.textLight, marginHorizontal: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: COLORS.text, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  grid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  gridBtn: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 2, gap: 10 },
  gridText: { fontWeight: '600', color: COLORS.text },
  
  endBtn: { backgroundColor: COLORS.secondary, padding: 18, borderRadius: 12, alignItems: 'center' },
  endBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});