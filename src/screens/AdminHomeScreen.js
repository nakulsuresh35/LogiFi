import { Calendar, FileText, IndianRupee, Shield } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

const AdminHomeScreen = ({ navigation }) => {
  
  // Reusable Component for the Grid Buttons
  const MenuButton = ({ title, icon, color, screenName }) => (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]} 
      onPress={() => navigation.navigate(screenName)}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.companyName}>Main Mast Logistics</Text>
        <Text style={styles.dashboardTitle}>Owner Dashboard</Text>
      </View>

      {/* Grid Menu */}
      <View style={styles.gridContainer}>
        
        {/* 1. Financials */}
        <MenuButton 
          title="Truck Financials" 
          icon={<IndianRupee size={32} color={COLORS.primary} />} 
          color={COLORS.primary}
          screenName="Financials"
        />

        {/* 2. Monthly P&L */}
        <MenuButton 
          title="Monthly P&L" 
          icon={<Calendar size={32} color={COLORS.success} />} 
          color={COLORS.success}
          screenName="MonthlyPL"
        />

        {/* 3. Insurance */}
        <MenuButton 
          title="Insurance Tracker" 
          icon={<Shield size={32} color={COLORS.secondary} />} 
          color={COLORS.secondary}
          screenName="Insurance"
        />

        {/* 4. Tax */}
        <MenuButton 
          title="Road Tax Tracker" 
          icon={<FileText size={32} color="#F59E0B" />} 
          color="#F59E0B"
          screenName="Tax"
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dashboardTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', // Approx half width for 2 columns
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 4,
    // Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default AdminHomeScreen;