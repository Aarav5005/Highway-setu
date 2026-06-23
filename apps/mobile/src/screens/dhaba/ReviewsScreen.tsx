import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import StarRating from '../../components/StarRating';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([
    { id: '1', driver: 'Gurpreet Singh', rating: 5, text: 'Best dal makhani on NH44!', date: 'Oct 15, 2023', reply: '' },
    { id: '2', driver: 'Rahul Kumar', rating: 3, text: 'Service was a bit slow today.', date: 'Oct 14, 2023', reply: 'Sorry about that Rahul, we were short staffed. Will do better next time!' }
  ]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleReply = (id: string) => {
    if (!replyInputs[id]) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyInputs[id] } : r));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <View style={styles.avgBox}>
          <Text style={styles.avgNum}>4.2</Text>
          <StarRating rating={4.2} size={14} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {reviews.map(r => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.driver}>{r.driver}</Text>
              <Text style={styles.date}>{r.date}</Text>
            </View>
            <StarRating rating={r.rating} size={16} />
            <Text style={styles.reviewTxt}>{r.text}</Text>

            {r.reply ? (
              <View style={styles.replyBox}>
                <Text style={styles.replyLbl}>Your Reply:</Text>
                <Text style={styles.replyTxt}>{r.reply}</Text>
              </View>
            ) : (
              <View style={styles.replyInputBox}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Write a reply..." 
                  value={replyInputs[r.id] || ''}
                  onChangeText={t => setReplyInputs({...replyInputs, [r.id]: t})}
                />
                <TouchableOpacity style={styles.replyBtn} onPress={() => handleReply(r.id)}>
                  <Text style={styles.replyBtnTxt}>Post</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { ...theme.typography.h2, color: theme.colors.text },
  avgBox: { alignItems: 'flex-end' },
  avgNum: { ...theme.typography.h3, color: theme.colors.primary },
  list: { padding: theme.spacing.md },
  card: { backgroundColor: theme.colors.white, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  driver: { ...theme.typography.body, color: theme.colors.text, fontWeight: 'bold' },
  date: { ...theme.typography.small, color: theme.colors.textSecondary },
  reviewTxt: { ...theme.typography.body, color: theme.colors.text, marginTop: theme.spacing.sm },
  replyBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.md },
  replyLbl: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  replyTxt: { ...theme.typography.body, color: theme.colors.text },
  replyInputBox: { flexDirection: 'row', marginTop: theme.spacing.md },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md, height: 40 },
  replyBtn: { backgroundColor: theme.colors.primary, justifyContent: 'center', paddingHorizontal: 16, borderRadius: theme.borderRadius.sm, marginLeft: 8 },
  replyBtnTxt: { color: theme.colors.white, fontWeight: 'bold' }
});
