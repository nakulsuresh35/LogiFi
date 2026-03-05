import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av'; // <--- NEW: Audio Library
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Droplets, FileText, Fuel, IndianRupee, LogOut, MapPin, Navigation, Play, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

export default function DriverHomeScreen({ navigation }) {
  const [truckName, setTruckName] = useState('Loading...');
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- NEW: ALARM STATES ---
  const [alertActive, setAlertActive] = useState(false);
  const [soundObject, setSoundObject] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const plate = user.email.split('@')[0].toUpperCase();
      setTruckName(plate);

      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('plate_number', plate)
        .single();

      if (vehicle) {
        const { data: trip } = await supabase
          .from('trips')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false }) 
          .limit(1)                                  
          .maybeSingle();

        setCurrentTrip(trip);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: SUPABASE REALTIME ALARM LISTENER ---
  useEffect(() => {
    console.log("STATE CHECK: truckName is currently ->", truckName);
    
    if (truckName === 'Loading...') return;

    let soundInstance = null;

    const playLoudAlarm = async () => {
      setAlertActive(true);
      try {
        const { sound } = await Audio.Sound.createAsync(
<<<<<<< HEAD
           require('../../assets/audio/police_siren.wav') 
=======
           { uri: 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg' } 
>>>>>>> 069a527d3cb50eebf35b382a13be416b5380ec65
        );
        soundInstance = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (error) {
        console.log("Error playing sound", error);
      }
    };

    // NEW FUNCTION: Kills the alarm
    const stopLoudAlarm = async () => {
      if (soundInstance) {
        console.log("Stopping phone alarm automatically!");
        await soundInstance.stopAsync();
        await soundInstance.unloadAsync();
        soundInstance = null;
      }
      setAlertActive(false);
    };

    const alertSubscription = supabase
      .channel('driver-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'driver_alerts',
        filter: `vehicle_id=eq.${truckName.toLowerCase().trim()}` 
      }, (payload) => {
        
        console.log('CLOUD UPDATE:', payload.new.alert_type);
        
        // IF ASLEEP: Play alarm
        if (payload.new.alert_type === 'drowsiness_critical') {
           playLoudAlarm();
        } 
        // IF AWAKE: Stop alarm
        else if (payload.new.alert_type === 'drowsiness_resolved') {
           stopLoudAlarm();
        }
        
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertSubscription);
      if (soundInstance) {
        soundInstance.unloadAsync();
      }
    };
  }, [truckName]);

  // --- NEW: DISMISS ALARM HANDLER ---
  const handleDismissAlarm = async () => {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      setSoundObject(null);
    }
    setAlertActive(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- 1. THE STUNNING START BUTTON ---
  const renderStartTripView = () => (
    <View style={styles.centerContent}>
      <View style={styles.idleContainer}>
        <View style={styles.idleIconBg}>
           <Navigation size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.idleTitle}>No Active Trip</Text>
        <Text style={styles.idleSubtitle}>Ready to hit the road?</Text>
      </View>

      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('StartTrip')}
        style={styles.shadowProp}
      >
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startBtnGradient}
        >
          <Play size={32} color="white" fill="white" style={{ marginRight: 10 }} />
          <Text style={styles.startBtnText}>START NEW TRIP</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // --- 2. THE STUNNING DASHBOARD ---
  const renderActiveTripView = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* A. The "Hero" Trip Card */}
      <View style={styles.shadowProp}>
        <LinearGradient
          colors={['#1e3a8a', '#172554']} 
          style={styles.heroCard}
        >
          <View style={styles.statusBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.statusText}>LIVE TRACKING</Text>
          </View>

          <View style={styles.routeRow}>
            <View>
                <Text style={styles.locLabel}>FROM</Text>
                <Text style={styles.locValue}>{currentTrip.from_location}</Text>
            </View>
            
            <View style={styles.connector}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <Navigation size={20} color="#60a5fa" style={{transform: [{ rotate: '90deg' }]}} />
                <View style={styles.line} />
                <View style={styles.dot} />
            </View>

            <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.locLabel}>TO</Text>
                <Text style={styles.locValue}>{currentTrip.to_location}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <MapPin size={18} color="#93c5fd" />
                <Text style={styles.statLabel}>Start KM</Text>
                <Text style={styles.statValue}>{currentTrip.start_km}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <IndianRupee size={18} color="#86efac" />
                <Text style={styles.statLabel}>Total Adv</Text>
                <Text style={styles.statValue}>₹{currentTrip.advance_amount}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* B. Action Grid */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      
      <View style={styles.gridContainer}>
        <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('AddExpense', { trip: currentTrip, category: 'Diesel' })}
        >
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Fuel size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Diesel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('AddExpense', { trip: currentTrip, category: 'AdBlue' })}
        >
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Droplets size={28} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>AdBlue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('AddExpense', { trip: currentTrip, category: 'Other' })}
        >
            <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                <FileText size={28} color="#f97316" />
            </View>
            <Text style={styles.actionText}>Expenses</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('AddAdvance', { trip: currentTrip })}
        >
            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <IndianRupee size={28} color="#16a34a" />
            </View>
            <Text style={styles.actionText}>+ Advance</Text>
        </TouchableOpacity>
      </View>

      {/* C. End Trip Button */}
      <TouchableOpacity 
        style={styles.endButtonContainer}
        onPress={() => navigation.navigate('EndTrip', { trip: currentTrip })}
      >
        <LinearGradient
            colors={['#991b1b', '#dc2626']} 
            style={styles.endButtonGradient}
        >
            <Text style={styles.endButtonText}>END TRIP & FINALIZE</Text>
        </LinearGradient>
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.truckId}>{truckName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* --- NEW: CRITICAL ALERT BANNER --- */}
      {alertActive && (
        <View style={styles.alertBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <AlertTriangle size={28} color="white" />
             <View style={{ marginLeft: 15 }}>
                <Text style={styles.alertTitle}>WAKE UP ALARM</Text>
                <Text style={styles.alertSub}>Drowsiness detected!</Text>
             </View>
          </View>
          <TouchableOpacity onPress={handleDismissAlarm} style={styles.dismissBtn}>
             <XCircle size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {currentTrip ? renderActiveTripView() : renderStartTripView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20,
    backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10
  },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  truckId: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5 },
  logoutBtn: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 12 },

  // --- NEW: ALARM STYLES ---
  alertBanner: {
    backgroundColor: '#dc2626',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#dc2626',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  alertTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  alertSub: { color: '#fca5a5', fontSize: 14, marginTop: 2 },
  dismissBtn: { padding: 5 },

  // IDLE STATE
  centerContent: { flex: 1, justifyContent: 'center', padding: 24 },
  idleContainer: { alignItems: 'center', marginBottom: 40 },
  idleIconBg: { padding: 25, backgroundColor: '#dbeafe', borderRadius: 100, marginBottom: 20 },
  idleTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  idleSubtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  startBtnGradient: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    paddingVertical: 20, borderRadius: 20 
  },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

  // ACTIVE STATE
  scrollContent: { padding: 24, paddingBottom: 50 },
  shadowProp: { 
    elevation: 10, shadowColor: '#1e3a8a', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: {width: 0, height: 8} 
  },
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 30 },
  
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 
  },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 8 },
  statusText: { color: '#4ade80', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  locLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  locValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  
  connector: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', marginHorizontal: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#60a5fa' },
  line: { flex: 1, height: 2, backgroundColor: '#60a5fa', marginHorizontal: 4, opacity: 0.5 },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 15 },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  statValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  verticalDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // ACTION GRID
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
  actionCard: { 
    width: '47%', backgroundColor: 'white', padding: 16, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 
  },
  iconBox: { padding: 12, borderRadius: 14, marginBottom: 10 },
  actionText: { fontWeight: '700', color: '#334155' },

  endButtonContainer: { borderRadius: 20, overflow: 'hidden', elevation: 4 },
  endButtonGradient: { paddingVertical: 18, alignItems: 'center' },
  endButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});