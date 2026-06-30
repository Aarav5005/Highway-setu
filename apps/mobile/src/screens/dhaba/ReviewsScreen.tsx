import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import StarRating from '../../components/StarRating';
import FeatherIcon from 'react-native-vector-icons/Feather';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([
    { id: '1', driver: 'Gurpreet Singh', rating: 5, text: 'Best dal makhani on NH44!', date: 'Oct 15, 2023', reply: '' },
    { id: '2', driver: 'Rahul Kumar', rating: 3, text: 'Service was a bit slow today.', date: 'Oct 14, 2023', reply: 'Sorry about that Rahul, we were short staffed. Will do better next time!' },
  ]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleReply = (id: string) => {
    if (!replyInputs[id]) {return;}
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyInputs[id] } : r));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: theme.colors.white}}>
        <View style={styles.header}>
          <Text style={styles.title}>Customer Reviews</Text>
          <View style={styles.avgBox}>
            <Text style={styles.avgNum}>4.2</Text>
            <StarRating rating={4.2} size={14} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.list}>
        {reviews.map(r => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{r.driver.substring(0, 1)}</Text>
                </View>
                <View>
                  <Text style={styles.driver}>{r.driver}</Text>
                  <Text style={styles.date}>{r.date}</Text>
                </View>
              </View>
              <StarRating rating={r.rating} size={16} />
            </View>
            <Text style={styles.reviewTxt}>{r.text}</Text>

            {r.reply ? (
              <View style={styles.replyBox}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                  <FeatherIcon name="corner-down-right" size={16} color={theme.colors.dhabaPrimary} style={{marginRight: 8}} />
                  <Text style={styles.replyLbl}>Your Reply</Text>
                </View>
                <Text style={styles.replyTxt}>{r.reply}</Text>
              </View>
            ) : (
              <View style={styles.replyInputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Write a reply..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={replyInputs[r.id] || ''}
                  onChangeText={t => setReplyInputs({...replyInputs, [r.id]: t})}
                />
                <TouchableOpacity style={styles.replyBtn} onPress={() => handleReply(r.id)}>
                  <FeatherIcon name="send" size={18} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  title: { ...theme.typography.h2, color: theme.colors.text },
  avgBox: { alignItems: 'flex-end' },
  avgNum: { ...theme.typography.h3, color: theme.colors.dhabaPrimary, fontWeight: 'bold' },

  list: { padding: theme.spacing.md },
  card: { backgroundColor: theme.colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, ...theme.shadows.sm, borderWidth: 1, borderColor: theme.colors.borderLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  avatarTxt: { ...theme.typography.h3, color: theme.colors.textSecondary },
  driver: { ...theme.typography.h3, color: theme.colors.text },
  date: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 2 },

  reviewTxt: { ...theme.typography.body, color: theme.colors.text, marginTop: theme.spacing.sm, lineHeight: 22 },

  replyBox: { backgroundColor: theme.colors.dhabaPrimary + '10', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.lg, borderLeftWidth: 3, borderLeftColor: theme.colors.dhabaPrimary },
  replyLbl: { ...theme.typography.small, color: theme.colors.textSecondary, fontWeight: 'bold' },
  replyTxt: { ...theme.typography.body, color: theme.colors.text, marginTop: 4, lineHeight: 20 },

  replyInputBox: { flexDirection: 'row', marginTop: theme.spacing.lg },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: 20, paddingHorizontal: theme.spacing.lg, height: 44, backgroundColor: theme.colors.surface, color: theme.colors.text },
  replyBtn: { backgroundColor: theme.colors.dhabaPrimary, justifyContent: 'center', alignItems: 'center', width: 44, height: 44, borderRadius: 22, marginLeft: 8, ...theme.shadows.sm },
});
