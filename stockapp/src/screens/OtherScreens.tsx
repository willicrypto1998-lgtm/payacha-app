import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useStockStore } from '../store/stockStore';
import { COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, RETURN_REASONS } from '../utils/theme';
import { Card, Badge, SectionTitle, EmptyState, Divider } from '../components/UI';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export function OrdersScreen() {
  const { orders, updateOrderStatus } = useStockStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusKeys = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍 Commandes</Text>
        <Text style={styles.headerSub}>{orders.length} commandes · {orders.filter(o => o.status === 'pending').length} en attente</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: COLORS.primary }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10, gap: 6 }}>
        {statusKeys.map(k => {
          const lbl = k === 'all' ? 'Toutes' : ORDER_STATUS_LABELS[k];
          const count = k === 'all' ? orders.length : orders.filter(o => o.status === k).length;
          return (
            <TouchableOpacity key={k} style={[tabStyle.pill, filter === k && tabStyle.pillActive]} onPress={() => setFilter(k)}>
              <Text style={[tabStyle.pillText, filter === k && tabStyle.pillTextActive]}>{lbl} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="📭" title="Aucune commande" subtitle="Les commandes apparaissent ici automatiquement." />}
        renderItem={({ item: o }) => {
          const sc = ORDER_STATUS_COLORS[o.status];
          return (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View>
                  <Text style={orderStyle.id}>{o.id}</Text>
                  <Text style={orderStyle.date}>{o.customerName} · {format(new Date(o.createdAt), 'dd MMM HH:mm', { locale: fr })}</Text>
                </View>
                <Badge label={ORDER_STATUS_LABELS[o.status]} bg={sc.bg} color={sc.text} />
              </View>
              <Text style={orderStyle.items}>{o.items.map(i => `${i.quantity}× ${i.productName}`).join(' · ')}</Text>
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={orderStyle.total}>{o.total.toLocaleString()} DA</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {o.status === 'pending' && (
                    <TouchableOpacity style={actionBtn.btn} onPress={() => updateOrderStatus(o.id, 'processing')}>
                      <Text style={actionBtn.text}>Préparer</Text>
                    </TouchableOpacity>
                  )}
                  {o.status === 'processing' && (
                    <TouchableOpacity style={[actionBtn.btn, { backgroundColor: COLORS.infoBg }]} onPress={() => updateOrderStatus(o.id, 'shipped')}>
                      <Text style={[actionBtn.text, { color: COLORS.info }]}>Expédier</Text>
                    </TouchableOpacity>
                  )}
                  {o.status === 'shipped' && (
                    <TouchableOpacity style={[actionBtn.btn, { backgroundColor: COLORS.successBg }]} onPress={() => updateOrderStatus(o.id, 'delivered')}>
                      <Text style={[actionBtn.text, { color: COLORS.success }]}>Livré ✓</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

// ─── RETURNS ─────────────────────────────────────────────────────────────────
export function ReturnsScreen({ navigation }: any) {
  const { returns, products } = useStockStore();

  const totalReturns = returns.length;
  const restocked = returns.filter(r => r.action === 'restock').length;
  const discarded = returns.filter(r => r.action === 'discard').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>↩️ Retours</Text>
        <Text style={styles.headerSub}>{totalReturns} retours · {restocked} remis en stock · {discarded} écartés</Text>
      </View>

      {/* Stats */}
      <View style={retStyle.statsRow}>
        <View style={retStyle.statCard}>
          <Text style={retStyle.statVal}>{totalReturns}</Text>
          <Text style={retStyle.statLbl}>Total</Text>
        </View>
        <View style={retStyle.statCard}>
          <Text style={[retStyle.statVal, { color: COLORS.success }]}>{restocked}</Text>
          <Text style={retStyle.statLbl}>Remis stock</Text>
        </View>
        <View style={retStyle.statCard}>
          <Text style={[retStyle.statVal, { color: COLORS.danger }]}>{discarded}</Text>
          <Text style={retStyle.statLbl}>Écartés</Text>
        </View>
      </View>

      <FlatList
        data={returns}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>↩️</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textMain }}>Aucun retour enregistré</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSub, textAlign: 'center', marginTop: 6 }}>
              Scannez un produit retourné depuis l'onglet Scanner.
            </Text>
            <TouchableOpacity style={{ marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
              onPress={() => navigation?.navigate('Scanner')}>
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Aller au scanner</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: r }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textMain }}>{r.id}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSub }}>{format(new Date(r.createdAt), 'dd MMM HH:mm', { locale: fr })}</Text>
            </View>
            <Text style={{ fontSize: 13, color: COLORS.textSub, marginBottom: 8 }}>
              {products.find(p => p.id === r.productId)?.emoji || '📦'} {r.productName} · ×{r.quantity}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge label={RETURN_REASONS[r.reason] || r.reason} bg={COLORS.warningBg} color={COLORS.warning} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Badge label={r.scanMethod === 'barcode' ? '📷 Scan' : r.scanMethod === 'qr' ? '🔲 QR' : '⌨️ Manuel'} bg={COLORS.primaryLight} color={COLORS.primary} />
                <Badge
                  label={r.action === 'restock' ? '✅ Remis' : '🗑 Écarté'}
                  bg={r.action === 'restock' ? COLORS.successBg : COLORS.dangerBg}
                  color={r.action === 'restock' ? COLORS.success : COLORS.danger}
                />
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────
export function SuppliersScreen() {
  const { suppliers, products, getLowStockProducts, getOutOfStockProducts } = useStockStore();

  const needsReorder = (supId: string) => {
    const lowProds = [...getLowStockProducts(), ...getOutOfStockProducts()].filter(p => p.supplierId === supId);
    return lowProds;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏭 Fournisseurs</Text>
        <Text style={styles.headerSub}>{suppliers.length} fournisseurs actifs</Text>
      </View>

      <FlatList
        data={suppliers}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        renderItem={({ item: s }) => {
          const reorderProds = needsReorder(s.id);
          const supProds = products.filter(p => p.supplierId === s.id);
          return (
            <Card>
              <View style={supStyle.head}>
                <View style={supStyle.logo}>
                  <Text style={{ fontSize: 22 }}>{supProds[0]?.emoji || '🏭'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={supStyle.name}>{s.name}</Text>
                  <Text style={supStyle.meta}>📍 {s.city} · 📞 {s.phone}</Text>
                </View>
                {reorderProds.length > 0 && (
                  <Badge label={`${reorderProds.length} à commander`} bg={COLORS.warningBg} color={COLORS.warning} />
                )}
              </View>

              <View style={supStyle.statsRow}>
                <View style={supStyle.stat}>
                  <Text style={supStyle.statVal}>{s.productCount}</Text>
                  <Text style={supStyle.statLbl}>Produits</Text>
                </View>
                <View style={supStyle.stat}>
                  <Text style={supStyle.statVal}>J+{s.deliveryDays}</Text>
                  <Text style={supStyle.statLbl}>Délai</Text>
                </View>
                <View style={supStyle.stat}>
                  <Text style={[supStyle.statVal, { color: s.reliability >= 95 ? COLORS.success : COLORS.warning }]}>{s.reliability}%</Text>
                  <Text style={supStyle.statLbl}>Fiabilité</Text>
                </View>
              </View>

              {reorderProds.length > 0 && (
                <>
                  <Divider />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.warning, marginBottom: 4 }}>Produits à réapprovisionner :</Text>
                  {reorderProds.map(p => (
                    <Text key={p.id} style={{ fontSize: 12, color: COLORS.textSub, marginBottom: 2 }}>
                      {p.emoji} {p.name} — {p.stock === 0 ? '⚠️ Rupture' : `Stock bas (${p.stock})`}
                    </Text>
                  ))}
                  <TouchableOpacity style={supStyle.orderBtn}>
                    <Text style={supStyle.orderBtnText}>📋 Générer bon de commande</Text>
                  </TouchableOpacity>
                </>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const { products, orders, returns, getMonthlyStats, getLowStockProducts, getOutOfStockProducts } = useStockStore();
  const stats = getMonthlyStats();
  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();

  const weekData = [42, 58, 37, 51, 63, 48, 30];
  const weekLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const maxWeek = Math.max(...weekData);

  const topProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Tableau de bord</Text>
        <Text style={styles.headerSub}>Résumé du mois en cours</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
        {/* KPIs */}
        <View style={dashStyle.kpiGrid}>
          {[
            { label: 'Ventes/mois', value: String(stats.totalSales), sub: '+4% vs mois dernier', subColor: COLORS.success },
            { label: 'CA mensuel', value: `${(stats.revenue / 1000).toFixed(0)}K DA`, sub: '+7% vs mois dernier', subColor: COLORS.success },
            { label: 'Panier moyen', value: `${stats.avgBasket.toLocaleString()} DA`, sub: 'par commande' },
            { label: 'Taux retour', value: `${stats.returnRate}%`, sub: returns.length + ' retours', subColor: returns.length > 10 ? COLORS.warning : COLORS.success },
          ].map((k, i) => (
            <View key={i} style={dashStyle.kpiCard}>
              <Text style={dashStyle.kpiLbl}>{k.label}</Text>
              <Text style={dashStyle.kpiVal}>{k.value}</Text>
              <Text style={[dashStyle.kpiSub, { color: k.subColor || COLORS.textSub }]}>{k.sub}</Text>
            </View>
          ))}
        </View>

        {/* Alerts */}
        {(outOfStock.length > 0 || lowStock.length > 0) && (
          <>
            <SectionTitle title={`Alertes stock (${outOfStock.length + lowStock.length})`} />
            {outOfStock.slice(0, 3).map(p => (
              <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 3, borderLeftColor: COLORS.danger }}>
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textMain }}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.danger }}>Rupture · {p.supplierName}</Text>
                </View>
                <Badge label="Rupture" bg={COLORS.dangerBg} color={COLORS.danger} />
              </Card>
            ))}
            {lowStock.slice(0, 2).map(p => (
              <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 3, borderLeftColor: COLORS.warning }}>
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textMain }}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.warning }}>{p.stock} unité(s) restante(s)</Text>
                </View>
                <Badge label="Bas" bg={COLORS.warningBg} color={COLORS.warning} />
              </Card>
            ))}
          </>
        )}

        {/* Weekly chart */}
        <SectionTitle title="Ventes 7 derniers jours" />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {weekData.map((val, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 10, color: COLORS.textSub, fontWeight: '600' }}>{val}</Text>
                <View style={{ width: '100%', height: Math.round((val / maxWeek) * 64), backgroundColor: i === 4 ? COLORS.primary3 : i === 5 ? COLORS.primary2 : COLORS.primaryLight, borderRadius: 4 }} />
                <Text style={{ fontSize: 10, color: COLORS.textSub }}>{weekLabels[i]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top products */}
        <SectionTitle title="Produits — niveau de stock" />
        <Card>
          {topProducts.map((p, i) => (
            <View key={p.id} style={{ marginBottom: i < topProducts.length - 1 ? 10 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 14 }}>{p.emoji}</Text>
                <Text style={{ flex: 1, fontSize: 12, color: COLORS.textMain, fontWeight: '500' }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: p.stock === 0 ? COLORS.danger : p.stock <= p.minStock ? COLORS.warning : COLORS.success }}>{p.stock}</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.bg, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.min(100, (p.stock / 50) * 100)}%`, backgroundColor: p.stock === 0 ? COLORS.danger : p.stock <= p.minStock ? COLORS.warning : COLORS.primary3, borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </Card>

        {/* Recent orders */}
        <SectionTitle title="Commandes récentes" />
        {orders.slice(0, 3).map(o => {
          const sc = ORDER_STATUS_COLORS[o.status];
          return (
            <Card key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textMain }}>{o.id}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSub }}>{o.customerName} · {o.total.toLocaleString()} DA</Text>
              </View>
              <Badge label={ORDER_STATUS_LABELS[o.status]} bg={sc.bg} color={sc.text} />
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});

const tabStyle = StyleSheet.create({
  pill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  pillActive: { backgroundColor: COLORS.white },
  pillText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  pillTextActive: { color: COLORS.primary, fontWeight: '600' },
});

const orderStyle = StyleSheet.create({
  id: { fontSize: 13, fontWeight: '600', color: COLORS.textMain },
  date: { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
  items: { fontSize: 12, color: COLORS.textSub, marginBottom: 4 },
  total: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
});

const actionBtn = StyleSheet.create({
  btn: { backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});

const retStyle = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: COLORS.bg },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 0.5, borderColor: COLORS.border, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '700', color: COLORS.textMain },
  statLbl: { fontSize: 10, color: COLORS.textSub, marginTop: 2 },
});

const supStyle = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.textMain },
  meta: { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  statLbl: { fontSize: 10, color: COLORS.textSub, marginTop: 1 },
  orderBtn: { marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 10, padding: 10, alignItems: 'center' },
  orderBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
});

const dashStyle = StyleSheet.create({
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  kpiCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.border, padding: 12 },
  kpiLbl: { fontSize: 11, color: COLORS.textSub, marginBottom: 4 },
  kpiVal: { fontSize: 22, fontWeight: '700', color: COLORS.textMain },
  kpiSub: { fontSize: 11, color: COLORS.textSub, marginTop: 3 },
});
