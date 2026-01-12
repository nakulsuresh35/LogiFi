import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

// CHANGE THE COMPONENT NAME AND TEXT FOR EACH FILE
export default function FinancialsScreen() { 
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Financials Screen</Text>
      <Text style={styles.subText}>(Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  subText: { fontSize: 16, color: COLORS.textLight, marginTop: 8 }
});