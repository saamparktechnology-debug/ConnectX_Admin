import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert, TextInput, Dimensions, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../../utils/constants';
import { getAvatarSource } from '../../utils/avatar';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'star', label: 'Star' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'confidence', label: 'Confidence' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const AUTO_SCROLL_INTERVAL = 3500;

const friendshipQuotes = [
  { quote: "A real friend is one who walks in when the rest of the world walks out.", emoji: "💗", gradient: ['#FF6B6B', '#FF8E8E'], author: "Walter Winchell" },
  { quote: "Friendship is the golden thread that ties the hearts of the world together.", emoji: "🤝", gradient: ['#A78BFA', '#818CF8'], author: "" },
  { quote: "True friendship is a rare treasure — honest, unconditional, and always near.", emoji: "💛", gradient: ['#FBBF24', '#F59E0B'], author: "" },
  { quote: "A friend is someone who knows all about you and still loves you.", emoji: "✨", gradient: ['#34D399', '#10B981'], author: "Elbert Hubbard" },
  { quote: "The language of friendship is not words but meanings.", emoji: "🌸", gradient: ['#F472B6', '#EC4899'], author: "Henry David Thoreau" },
  { quote: "Friendship multiplies the joys and divides the sorrows.", emoji: "🤗", gradient: ['#60A5FA', '#3B82F6'], author: "Unknown" },
  { quote: "A sweet friendship refreshes the soul like morning dew.", emoji: "🌅", gradient: ['#FB923C', '#F97316'], author: "" },
];

const FemaleHomeSection = () => {
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % friendshipQuotes.length;
        RNAnimated.sequence([
          RNAnimated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          RNAnimated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: next * CARD_WIDTH, animated: true });
        }
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const onScroll = useRef(RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={femaleStyles.container}>
      <View style={femaleStyles.header}>
        <View>
          <Text style={femaleStyles.welcomeText}>Welcome to ConnectX</Text>
          <Text style={femaleStyles.subtitle}>Where friendships bloom</Text>
        </View>
      </View>

      <RNAnimated.View style={{ opacity: fadeAnim }}>
        <RNAnimated.FlatList
          ref={flatListRef}
          data={friendshipQuotes}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToInterval={CARD_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={[femaleStyles.quoteCard, { width: CARD_WIDTH }]}>
              <LinearGradient colors={item.gradient} style={femaleStyles.quoteGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={femaleStyles.quoteEmoji}>{item.emoji}</Text>
                <Text style={femaleStyles.quoteText}>"{item.quote}"</Text>
                {item.author ? <Text style={femaleStyles.quoteAuthor}>— {item.author}</Text> : null}
              </LinearGradient>
            </View>
          )}
        />
      </RNAnimated.View>

      <View style={femaleStyles.dotsContainer}>
        {friendshipQuotes.map((_, i) => (
          <View key={i} style={[femaleStyles.dot, currentIndex === i && femaleStyles.dotActive]} />
        ))}
      </View>

      <View style={femaleStyles.bottomSection}>
        <View style={femaleStyles.infoCard}>
          <Text style={femaleStyles.infoEmoji}>🎯</Text>
          <View style={femaleStyles.infoContent}>
            <Text style={femaleStyles.infoTitle}>Start Earning Today</Text>
            <Text style={femaleStyles.infoText}>Receive calls from verified users and earn money. Complete your KYC to start.</Text>
          </View>
        </View>
        <View style={femaleStyles.infoCard}>
          <Text style={femaleStyles.infoEmoji}>🔒</Text>
          <View style={femaleStyles.infoContent}>
            <Text style={femaleStyles.infoTitle}>Safe & Secure</Text>
            <Text style={femaleStyles.infoText}>Your privacy is our priority. All calls are confidential and secure.</Text>
          </View>
        </View>
        <View style={femaleStyles.infoCard}>
          <Text style={femaleStyles.infoEmoji}>💎</Text>
          <View style={femaleStyles.infoContent}>
            <Text style={femaleStyles.infoTitle}>Bonus Offers</Text>
            <Text style={femaleStyles.infoText}>Accept bonus offers from admin and earn extra rewards for talking.</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ExpertCard = ({ expert, onCall, callRate, isFemale }) => (
  <View style={styles.expertCard}>
    <View style={styles.expertTop}>
      <View style={styles.expertImageContainer}>
        <Image source={{ uri: expert.primary_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}` }} style={styles.expertImage} />
        {expert.is_online ? <View style={styles.onlineDot} /> : <View style={styles.offlineDot} />}
      </View>
      <View style={styles.expertInfo}>
        <View style={styles.expertNameRow}>
          <Text style={styles.expertName}>{expert.name}</Text>
          {expert.age && <Text style={styles.expertAge}>{expert.age} Y</Text>}
        </View>
        {(expert.city || expert.state) && (
          <Text style={styles.expertLocation}>{expert.city}{expert.city && expert.state ? ', ' : ''}{expert.state}</Text>
        )}
        <View style={styles.expertTags}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{expert.category || 'Confidence'}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.warning} />
            <Text style={styles.ratingText}>{expert.rating ? Number(expert.rating).toFixed(1) : '4.5'}</Text>
          </View>
        </View>
        {expert.language && <Text style={styles.expertLanguage}>{expert.language}</Text>}
      </View>
      <View style={styles.expertRight}>
        {!isFemale && (
          <>
            <Text style={styles.price}>₹{callRate}/min</Text>
            <TouchableOpacity style={styles.callButton} onPress={() => onCall(expert)} activeOpacity={0.8}>
              <LinearGradient colors={COLORS.gradient.call} style={styles.callButtonGradient}>
                <Ionicons name="call" size={16} color={COLORS.white} />
                <Text style={styles.callButtonText}>Call Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
    {expert.quote && (
      <Text style={styles.expertQuote} numberOfLines={2}>"{expert.quote}"</Text>
    )}
  </View>
);

const isFemaleUser = (u) => (u?.gender || '').toLowerCase() === 'female';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const isFemale = isFemaleUser(user);
  const [wallet, setWallet] = useState(0);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSale, setShowSale] = useState(true);
  const [error, setError] = useState(null);
  const [callRate, setCallRate] = useState(3.00);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimer = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setError(null);
    try {
      const [walletRes, expertsRes] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/user/experts'),
      ]);
      setWallet(walletRes.data.data?.balance || 0);
      setExperts(expertsRes.data.data?.experts || []);
      try {
        const settingsRes = await api.get('/admin/settings');
        const rateSetting = settingsRes.data.data?.settings?.find(s => s.setting_key === 'call_rate_per_minute');
        if (rateSetting) setCallRate(parseFloat(rateSetting.setting_value));
      } catch (e) {}
    } catch (err) {
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        return;
      }
      console.log('Fetch error:', err.message);
      setError('Failed to load data. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleCall = (expert) => {
    if (wallet < callRate) {
      Alert.alert('Insufficient Balance', `Your balance: ₹${wallet}. Minimum ₹${callRate} required.`, [
        { text: 'Recharge', onPress: () => router.push('/(modals)/recharge') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    router.push(`/(modals)/call?expertId=${expert.id}&name=${expert.name}&photo=${expert.primary_photo || ''}&price=${callRate}&callType=audio`);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      fetchData();
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const expertsRes = await api.get(`/user/experts?search=${encodeURIComponent(text.trim())}`);
        setExperts(expertsRes.data.data?.experts || []);
      } catch (err) {
        console.log('Search error:', err.message);
      }
    }, 500);
  };

  const handleRandomCall = () => {
    const onlineExperts = experts.filter(e => e.is_online);
    if (onlineExperts.length === 0) {
      Alert.alert('No Experts Available', 'No experts are online right now. Please try again later.');
      return;
    }
    const randomExpert = onlineExperts[Math.floor(Math.random() * onlineExperts.length)];
    handleCall(randomExpert);
  };

  const filteredExperts = selectedCategory === 'all'
    ? experts
    : experts.filter(e => e.category?.toLowerCase() === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>ConnectX</Text>
          </View>
          <View style={styles.headerRight}>
            {showSale && (
              <TouchableOpacity style={styles.saleBadge} onPress={() => setShowSale(false)}>
                <Text style={styles.saleText}>₹ Sale</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.walletBadge} onPress={() => router.push('/(modals)/recharge')}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
              <Text style={styles.walletText}>₹{wallet}.00</Text>
              <View style={styles.addBadge}>
                <Ionicons name="add" size={12} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Image source={getAvatarSource(user)} style={styles.headerAvatar} />
            </TouchableOpacity>
          </View>
        </View>

        {!isFemale && (
          <View style={styles.bannerContainer}>
            <LinearGradient colors={COLORS.gradient.banner} style={styles.banner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Avail cashbacks</Text>
                <Text style={styles.bannerSubtitle}>upto 60% on recharges</Text>
              </View>
              <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/(modals)/recharge')}>
                <Text style={styles.bannerButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {!isFemale && (
          <View style={styles.randomCallContainer}>
            <View style={styles.randomCallLeft}>
              <Ionicons name="call-outline" size={24} color={COLORS.primary} />
              <View>
                <Text style={styles.randomCallTitle}>Connect & Make Friends</Text>
                <Text style={styles.randomCallPrice}>₹{callRate}/min only!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.randomCallButton} onPress={handleRandomCall}>
              <Text style={styles.randomCallButtonText}>Random Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isFemale && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by dating ID..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); fetchData(); }}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isFemale && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Experts</Text>
            <Text style={styles.sectionCount}>{experts.length} available</Text>
          </View>
        )}

        {!isFemale && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, selectedCategory === cat.id && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.categoryTabText, selectedCategory === cat.id && styles.categoryTabTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 40 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isFemale ? (
          <FemaleHomeSection />
        ) : filteredExperts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name={searchQuery ? "search-outline" : "people-outline"} size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>{searchQuery ? 'No data found!' : 'No experts found'}</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? `No user found with ID "${searchQuery}"` : experts.length === 0 ? 'No experts registered yet' : 'Try a different category'}
            </Text>
          </View>
        ) : (
          <View style={styles.expertsList}>
            {filteredExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} onCall={handleCall} callRate={callRate} isFemale={isFemale} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 50, paddingBottom: SPACING.md,
  },
  headerLeft: { flex: 1 },
  logo: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, fontStyle: 'italic' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saleBadge: {
    backgroundColor: COLORS.error, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  saleText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  walletBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  walletText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  addBadge: {
    backgroundColor: COLORS.primary, width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border },
  bannerContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg, borderRadius: RADIUS.xl,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  bannerButton: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  bannerButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  randomCallContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
  },
  randomCallLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  randomCallTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  randomCallPrice: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  randomCallButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  randomCallButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.full,
    paddingHorizontal: 16, height: 44, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  sectionCount: { fontSize: 13, color: COLORS.textMuted },
  categoriesContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full,
    backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  categoryTabTextActive: { color: COLORS.white },
  expertsList: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  expertCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  expertTop: { flexDirection: 'row', alignItems: 'flex-start' },
  expertImageContainer: { position: 'relative' },
  expertImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.border },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.white,
  },
  offlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.textMuted, borderWidth: 2, borderColor: COLORS.white,
  },
  expertInfo: { flex: 1, marginLeft: 12 },
  expertNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expertName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  expertAge: { fontSize: 14, color: COLORS.textSecondary },
  expertLocation: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  expertTags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  categoryBadge: {
    backgroundColor: COLORS.pink, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  expertLanguage: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  expertRight: { alignItems: 'flex-end', gap: 8 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  callButton: { borderRadius: RADIUS.full, overflow: 'hidden' },
  callButtonGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  callButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  expertQuote: {
    fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic',
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  errorContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center' },
  retryButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: RADIUS.full, marginTop: 8,
  },
  retryText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted },
});

const femaleStyles = StyleSheet.create({
  container: { paddingBottom: 100 },
  header: {
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg,
  },
  welcomeText: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  quoteCard: {
    height: 220, borderRadius: RADIUS.xl, overflow: 'hidden',
    marginRight: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
    shadowRadius: 12, elevation: 6,
  },
  quoteGradient: {
    flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center',
  },
  quoteEmoji: { fontSize: 40, marginBottom: 16 },
  quoteText: {
    fontSize: 17, fontWeight: '600', color: COLORS.white, textAlign: 'center',
    lineHeight: 26, fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 12, fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: SPACING.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border,
  },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  bottomSection: {
    paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, gap: 12,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  infoEmoji: { fontSize: 32 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  infoText: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
});
