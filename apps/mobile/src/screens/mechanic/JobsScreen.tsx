import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../../theme';
import ConfirmDialog from '../../components/ConfirmDialog';
import BottomSheet from '../../components/BottomSheet';

export default function JobsScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState([
    { id: '1', driver: 'Arjun Singh', issue: 'Tyre Puncture', distance: '12 km', desc: 'Front left tyre burst on highway.' }
  ]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [history, setHistory] = useState([
    { id: '101', issue: 'Engine overheating', amount: 800, date: 'Today' }
  ]);
  
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [quoteVal, setQuoteVal] = useState('');
  const [selectedReq, setSelectedReq] = useState<any>(null);
  
  const [completeDialog, setCompleteDialog] = useState(false);

  const handleAccept = (req: any) => {
    setSelectedReq(req);
    setQuoteVisible(true);
  };

  const confirmAccept = () => {
    setActiveJob({ ...selectedReq, quote: quoteVal });
    setRequests(requests.filter(r => r.id !== selectedReq.id));
    setQuoteVisible(false);
    setSelectedReq(null);
  };

  const handleComplete = () => {
    setHistory([{ id: Date.now().toString(), issue: activeJob.issue, amount: activeJob.quote * 0.9, date: 'Just now' }, ...history]);
    setActiveJob(null);
    setCompleteDialog(false);
  };

  const fee = quoteVal ? (parseInt(quoteVal) * 0.1).toFixed(0) : 0;
  const net = quoteVal ? (parseInt(quoteVal) * 0.9).toFixed(0) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Jobs</Text>
        <TouchableOpacity style={[styles.toggleBtn, isOnline ? styles.toggleOn : styles.toggleOff]} onPress={() => setIsOnline(!isOnline)}>
          <Text style={styles.toggleTxt}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeJob ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeTag}>ACTIVE JOB</Text>
            <Text style={styles.driver}>{activeJob.driver} 📞</Text>
            <Text style={styles.issue}>{activeJob.issue}</Text>
            <Text style={styles.desc}>{activeJob.desc}</Text>
            <View style={styles.mapThumb}><Text style={{color: '#999'}}>Map location</Text></View>
            <TouchableOpacity style={styles.completeBtn} onPress={() => setCompleteDialog(true)}>
              <Text style={styles.completeTxt}>Mark Complete + Collect ₹{activeJob.quote}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {!isOnline ? (
              <Text style={styles.offlineTxt}>You are offline. Go online to receive jobs.</Text>
            ) : requests.length === 0 ? (
              <Text style={styles.offlineTxt}>Looking for jobs nearby...</Text>
            ) : (
              requests.map(r => (
                <View key={r.id} style={styles.reqCard}>
                  <View style={styles.reqHeader}>
                    <Text style={styles.driver}>{r.driver}</Text>
                    <Text style={styles.dist}>{r.distance} away</Text>
                  </View>
                  <Text style={styles.issue}>{r.issue}</Text>
                  <Text style={styles.desc}>{r.desc}</Text>
                  <View style={styles.btnRow}>
                    <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setRequests(requests.filter(req => req.id !== r.id))}>
                      <Text style={styles.rejectTxt}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAccept(r)}>
                      <Text style={styles.acceptTxt}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.xl }]}>Job History</Text>
        {history.map(h => (
          <View key={h.id} style={styles.historyCard}>
            <View>
              <Text style={styles.historyIssue}>{h.issue}</Text>
              <Text style={styles.historyDate}>{h.date}</Text>
            </View>
            <Text style={styles.historyAmt}>+₹{h.amount}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomSheet visible={quoteVisible} onClose={() => setQuoteVisible(false)} title="Quote Your Price">
        <Text style={styles.label}>Enter your quoted price for this job (₹)</Text>
        <TextInput style={styles.input} keyboardType="number-pad" placeholder="1000" value={quoteVal} onChangeText={setQuoteVal} />
        
        {quoteVal ? (
          <View style={styles.calcBox}>
            <Text style={styles.feeTxt}>Highway Setu fee (10%): -₹{fee}</Text>
            <Text style={styles.netTxt}>You will receive: ₹{net}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.confirmQuoteBtn} onPress={confirmAccept} disabled={!quoteVal}>
          <Text style={styles.confirmQuoteTxt}>Send Quote</Text>
        </TouchableOpacity>
      </BottomSheet>

      <ConfirmDialog 
        visible={completeDialog} 
        title="Complete Job" 
        message={`Collect ₹${activeJob?.quote} cash from the driver before confirming.`} 
        onConfirm={handleComplete} 
        onCancel={() => setCompleteDialog(false)} 
        confirmText="Confirm Paid" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white },
  title: { ...theme.typography.h2, color: theme.colors.text },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  toggleOn: { backgroundColor: theme.colors.success },
  toggleOff: { backgroundColor: theme.colors.border },
  toggleTxt: { ...theme.typography.small, color: theme.colors.white, fontWeight: 'bold' },
  content: { padding: theme.spacing.md },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  offlineTxt: { ...theme.typography.body, color: theme.colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  reqCard: { backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, elevation: 1 },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  driver: { ...theme.typography.h3, color: theme.colors.text },
  dist: { ...theme.typography.small, color: theme.colors.primary, fontWeight: 'bold' },
  issue: { ...theme.typography.body, color: theme.colors.text, fontWeight: '500' },
  desc: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4, marginBottom: theme.spacing.md },
  btnRow: { flexDirection: 'row', gap: theme.spacing.md },
  btn: { flex: 1, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#ffebe6' },
  rejectTxt: { color: theme.colors.error, fontWeight: 'bold' },
  acceptBtn: { backgroundColor: theme.colors.success },
  acceptTxt: { color: theme.colors.white, fontWeight: 'bold' },
  activeCard: { backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 2, borderColor: theme.colors.primary, marginBottom: theme.spacing.xl },
  activeTag: { ...theme.typography.tiny, color: theme.colors.primary, fontWeight: 'bold', marginBottom: 8 },
  mapThumb: { height: 120, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.md },
  completeBtn: { backgroundColor: theme.colors.success, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  completeTxt: { ...theme.typography.h3, color: theme.colors.white },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.sm, marginBottom: 8 },
  historyIssue: { ...theme.typography.body, color: theme.colors.text },
  historyDate: { ...theme.typography.tiny, color: theme.colors.textSecondary },
  historyAmt: { ...theme.typography.h3, color: theme.colors.success },
  label: { ...theme.typography.body, color: theme.colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 24 },
  calcBox: { backgroundColor: '#e6f4ea', padding: theme.spacing.md, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.md },
  feeTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  netTxt: { ...theme.typography.body, color: theme.colors.success, fontWeight: 'bold', marginTop: 4 },
  confirmQuoteBtn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: theme.spacing.xl },
  confirmQuoteTxt: { ...theme.typography.h3, color: theme.colors.white }
});
