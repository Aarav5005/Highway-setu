import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { mechanicsApi } from '../../api/mechanics';
import ErrorBanner from '../../components/ErrorBanner';
import ConfirmDialog from '../../components/ConfirmDialog';
import BottomSheet from '../../components/BottomSheet';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function JobsScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [quoteVisible, setQuoteVisible] = useState(false);
  const [quoteVal, setQuoteVal] = useState('');
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [completeDialog, setCompleteDialog] = useState(false);

  useEffect(() => {
    if (isOnline) {
      fetchData();
    }
  }, [isOnline]);

  const fetchData = async () => {
    try {
      setError('');
      const [incRes, histRes] = await Promise.all([
        mechanicsApi.getIncomingRequests(),
        mechanicsApi.getMechanicHistory(),
      ]);
      setRequests(incRes.data?.data || []);
      setHistory(histRes.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch jobs');
    }
  };

  const handleAccept = (req: any) => {
    setSelectedReq(req);
    setQuoteVisible(true);
  };

  const confirmAccept = async () => {
    if (!quoteVal) {return;}
    setLoading(true);
    try {
      const res = await mechanicsApi.acceptRequest(selectedReq.id, Number(quoteVal));
      setActiveJob({ ...selectedReq, quote: quoteVal });
      setRequests(requests.filter(r => r.id !== selectedReq.id));
      setQuoteVisible(false);
      setSelectedReq(null);
    } catch(e: any) {
      setError(e?.response?.data?.message || 'Failed to accept job');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await mechanicsApi.completeRequest(activeJob.id, Number(activeJob.quote));
      setActiveJob(null);
      setCompleteDialog(false);
      fetchData(); // refresh history
    } catch(e: any) {
      setError(e?.response?.data?.message || 'Failed to complete job');
    }
  };

  const fee = quoteVal ? (parseInt(quoteVal) * 0.1).toFixed(0) : 0;
  const net = quoteVal ? (parseInt(quoteVal) * 0.9).toFixed(0) : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.mechanicIconBg}>
              <FeatherIcon name="tool" size={24} color={theme.colors.mechanicPrimary} />
            </View>
            <View>
              <Text style={styles.title}>Incoming Jobs</Text>
              <Text style={styles.subtitle}>Highway Setu Mechanic</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, isOnline ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.toggleDot, isOnline ? {backgroundColor: theme.colors.white} : null]} />
            <Text style={[styles.toggleTxt, !isOnline && {color: theme.colors.textSecondary}]}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ErrorBanner message={error} />

      <ScrollView contentContainerStyle={styles.content}>
        {activeJob ? (
          <View style={styles.activeCard}>
            <View style={styles.activeTagBox}>
              <FeatherIcon name="activity" size={14} color={theme.colors.mechanicPrimary} style={{marginRight: 4}} />
              <Text style={styles.activeTag}>ACTIVE JOB</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <Text style={styles.driver}>{activeJob.driver}</Text>
              <TouchableOpacity style={styles.callBtn}>
                <FeatherIcon name="phone" size={16} color={theme.colors.mechanicPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.issue}>{activeJob.issue}</Text>
            <Text style={styles.desc}>{activeJob.desc}</Text>
            <View style={styles.mapThumb}>
              <FeatherIcon name="map-pin" size={24} color={theme.colors.textSecondary} style={{marginBottom: 8}} />
              <Text style={{color: theme.colors.textSecondary}}>Map location</Text>
            </View>
            <TouchableOpacity style={styles.completeBtn} onPress={() => setCompleteDialog(true)}>
              <Text style={styles.completeTxt}>Mark Complete & Collect ₹{activeJob.quote}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md}}>
              <FeatherIcon name="bell" size={20} color={theme.colors.text} style={{marginRight: 8}} />
              <Text style={styles.sectionTitle}>Pending Requests</Text>
            </View>

            {!isOnline ? (
              <View style={styles.emptyState}>
                <FeatherIcon name="power" size={40} color={theme.colors.textSecondary} style={{marginBottom: 16}} />
                <Text style={styles.offlineTxt}>You are offline. Go online to receive jobs.</Text>
              </View>
            ) : requests.length === 0 ? (
              <View style={styles.emptyState}>
                <FeatherIcon name="search" size={40} color={theme.colors.mechanicPrimary} style={{marginBottom: 16}} />
                <Text style={styles.offlineTxt}>Looking for jobs nearby...</Text>
              </View>
            ) : (
              requests.map(r => (
                <View key={r.id} style={styles.reqCard}>
                  <View style={styles.reqHeader}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarTxt}>D</Text>
                      </View>
                      <View>
                        <Text style={styles.driver}>Driver #{r.driver_id.substring(0, 4)}</Text>
                        <Text style={styles.dist}>{Number(r.distance_km).toFixed(1)} km away</Text>
                      </View>
                    </View>
                    <View style={styles.issueBadge}>
                      <Text style={styles.issueBadgeTxt}>Help Needed</Text>
                    </View>
                  </View>

                  <View style={styles.issueBox}>
                    <Text style={styles.issue}>{r.issue_type}</Text>
                    <Text style={styles.desc}>{r.description}</Text>
                  </View>

                  <View style={styles.btnRow}>
                    <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => setRequests(requests.filter(req => req.id !== r.id))}>
                      <Text style={styles.rejectTxt}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAccept(r)}>
                      <Text style={styles.acceptTxt}>Send Quote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing.md}}>
          <FeatherIcon name="clock" size={20} color={theme.colors.text} style={{marginRight: 8}} />
          <Text style={styles.sectionTitle}>Job History</Text>
        </View>

        {history.map(h => (
          <View key={h.id} style={styles.historyCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.historyIconBg}>
                <FeatherIcon name="check-circle" size={20} color={theme.colors.success} />
              </View>
              <View>
                <Text style={styles.historyIssue}>{h.issue_type}</Text>
                <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.historyAmt}>+₹ {h.net_amount || 0}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomSheet visible={quoteVisible} onClose={() => setQuoteVisible(false)} title="Quote Your Price">
        <Text style={styles.label}>Enter your quoted price for this job (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="1000"
          placeholderTextColor={theme.colors.textSecondary}
          value={quoteVal}
          onChangeText={setQuoteVal}
          autoFocus
        />

        {quoteVal ? (
          <View style={styles.calcBox}>
            <View style={styles.calcRow}>
              <Text style={styles.feeTxt}>Highway Setu fee (10%)</Text>
              <Text style={styles.feeTxt}>-₹ {fee}</Text>
            </View>
            <View style={styles.calcDivider} />
            <View style={styles.calcRow}>
              <Text style={styles.netLbl}>You will receive</Text>
              <Text style={styles.netTxt}>₹ {net}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.confirmQuoteBtn, (!quoteVal || loading) && {opacity: 0.5}]} onPress={confirmAccept} disabled={!quoteVal || loading}>
          <Text style={styles.confirmQuoteTxt}>{loading ? 'Sending...' : 'Send Quote & Accept Job'}</Text>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  mechanicIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.mechanicPrimary + '15', justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  title: { ...theme.typography.h3, color: theme.colors.text },
  subtitle: { ...theme.typography.small, color: theme.colors.textSecondary },

  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  toggleOn: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  toggleOff: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight },
  toggleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.textSecondary, marginRight: 6 },
  toggleTxt: { ...theme.typography.small, color: theme.colors.white, fontWeight: 'bold' },

  content: { padding: theme.spacing.md, paddingBottom: 40 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text },

  emptyState: { padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.borderLight, borderStyle: 'dashed' },
  offlineTxt: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' },

  reqCard: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  avatarTxt: { ...theme.typography.h3, color: theme.colors.textSecondary },
  driver: { ...theme.typography.h3, color: theme.colors.text },
  dist: { ...theme.typography.small, color: theme.colors.mechanicPrimary, fontWeight: 'bold', marginTop: 2 },

  issueBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  issueBadgeTxt: { ...theme.typography.tiny, color: theme.colors.error, fontWeight: 'bold' },

  issueBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg },
  issue: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  desc: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },

  btnRow: { flexDirection: 'row', gap: theme.spacing.md },
  btn: { flex: 1, paddingVertical: 14, borderRadius: theme.borderRadius.lg, alignItems: 'center' },
  rejectBtn: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.error },
  rejectTxt: { ...theme.typography.h3, color: theme.colors.error },
  acceptBtn: { backgroundColor: theme.colors.mechanicPrimary },
  acceptTxt: { ...theme.typography.h3, color: theme.colors.white },

  activeCard: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, borderWidth: 2, borderColor: theme.colors.mechanicPrimary, marginBottom: theme.spacing.xl, ...theme.shadows.md },
  activeTagBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.mechanicPrimary + '15', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: theme.spacing.md },
  activeTag: { ...theme.typography.tiny, color: theme.colors.mechanicPrimary, fontWeight: 'bold' },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.mechanicPrimary + '15', justifyContent: 'center', alignItems: 'center' },

  mapThumb: { height: 140, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.borderLight },
  completeBtn: { backgroundColor: theme.colors.success, padding: 16, borderRadius: theme.borderRadius.lg, alignItems: 'center' },
  completeTxt: { ...theme.typography.h3, color: theme.colors.white },

  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.sm, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  historyIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.successLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  historyIssue: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold', marginBottom: 2 },
  historyDate: { ...theme.typography.small, color: theme.colors.textSecondary },
  historyAmt: { ...theme.typography.h3, color: theme.colors.success },

  label: { ...theme.typography.body, color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: 24, backgroundColor: theme.colors.surface, color: theme.colors.text, fontWeight: 'bold', textAlign: 'center' },

  calcBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.borderLight },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeTxt: { ...theme.typography.small, color: theme.colors.textSecondary },
  calcDivider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.sm },
  netLbl: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  netTxt: { ...theme.typography.h3, color: theme.colors.success },

  confirmQuoteBtn: { backgroundColor: theme.colors.mechanicPrimary, padding: 16, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: theme.spacing.xl },
  confirmQuoteTxt: { ...theme.typography.h3, color: theme.colors.white },
});
