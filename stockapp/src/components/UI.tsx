import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, SIZES } from '../utils/theme';

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; bg?: string; color?: string; size?: number }
export const Badge = ({ label, bg = COLORS.primaryLight, color = COLORS.primary, size = SIZES.xs }: BadgeProps) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color, fontSize: size }]}>{label}</Text>
  </View>
);

// ─── StockBadge ───────────────────────────────────────────────────────────────
export const StockBadge = ({ stock, min }: { stock: number; min: number }) => {
  if (stock === 0) return <Badge label="Rupture" bg={COLORS.dangerBg} color={COLORS.danger} />;
  if (stock <= min) return <Badge label="Stock bas" bg={COLORS.warningBg} color={COLORS.warning} />;
  return <Badge label="Dispo" bg={COLORS.successBg} color={COLORS.success} />;
};

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }
export const Card = ({ children, style, onPress }: CardProps) => {
  const C = onPress ? TouchableOpacity : View;
  return <C style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>{children}</C>;
};

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ title, style }: { title: string; style?: TextStyle }) => (
  <Text style={[styles.sectionTitle, style]}>{title}</Text>
);

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps {
  label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean; style?: ViewStyle; disabled?: boolean; icon?: string;
}
export const Btn = ({ label, onPress, variant = 'primary', loading, style, disabled, icon }: BtnProps) => {
  const bgMap = {
    primary: COLORS.primary, secondary: COLORS.primaryLight,
    danger: COLORS.dangerBg, outline: 'transparent',
  };
  const textMap = {
    primary: COLORS.white, secondary: COLORS.primary,
    danger: COLORS.danger, outline: COLORS.primary,
  };
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgMap[variant], borderColor: variant === 'outline' ? COLORS.primary : 'transparent', borderWidth: variant === 'outline' ? 1 : 0, opacity: disabled ? 0.5 : 1 }, style]}
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.82}>
      {loading
        ? <ActivityIndicator color={textMap[variant]} size="small" />
        : <Text style={[styles.btnText, { color: textMap[variant] }]}>{icon ? `${icon}  ` : ''}{label}</Text>}
    </TouchableOpacity>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
  value: string; onChangeText: (t: string) => void; placeholder?: string;
  label?: string; keyboardType?: any; style?: ViewStyle; multiline?: boolean;
  secureTextEntry?: boolean; returnKeyType?: any; onSubmitEditing?: () => void;
}
export const Input = ({ value, onChangeText, placeholder, label, keyboardType, style, multiline, secureTextEntry, returnKeyType, onSubmitEditing }: InputProps) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor={COLORS.textHint} keyboardType={keyboardType}
      multiline={multiline} secureTextEntry={secureTextEntry}
      returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing} />
  </View>
);

// ─── Header ───────────────────────────────────────────────────────────────────
interface HeaderProps { title: string; subtitle?: string; right?: React.ReactNode; onBack?: () => void }
export const Header = ({ title, subtitle, right, onBack }: HeaderProps) => (
  <View style={styles.header}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: COLORS.white, fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      )}
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
      </View>
    </View>
    {right}
  </View>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = () => <View style={styles.divider} />;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontWeight: '600', letterSpacing: 0.2 },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, borderWidth: 0.5, borderColor: COLORS.border, padding: 12, marginBottom: 8 },
  sectionTitle: { fontSize: SIZES.xs, fontWeight: '600', color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 12, marginBottom: 6 },
  btn: { borderRadius: SIZES.radius, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnText: { fontSize: SIZES.md, fontWeight: '600' },
  inputWrapper: { marginBottom: 12 },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSub, marginBottom: 4 },
  input: { backgroundColor: COLORS.bg, borderRadius: SIZES.radiusSm, borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: SIZES.md, color: COLORS.textMain, height: 44 },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '600', color: COLORS.textMain, textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSub, textAlign: 'center', lineHeight: 22 },
  divider: { height: 0.5, backgroundColor: COLORS.border, marginVertical: 8 },
});
