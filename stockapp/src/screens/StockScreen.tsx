import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { useStockStore, Product } from '../store/stockStore';
import { COLORS, SIZES, CATEGORIES } from '../utils/theme';
import { Badge, StockBadge, Card, SectionTitle, Btn, Input, Divider, EmptyState } from '../components/UI';

export default function StockScreen() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useStockStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', ean: '', price: '', stock: '', minStock: '5', category: 'Vêtements', supplierId: '', emoji: '📦' });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search) || p.ean.includes(search);
      const matchCat = catFilter === 'Tous' || p.category === catFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'out' && p.stock === 0) || (statusFilter === 'low' && p.stock > 0 && p.stock <= p.minStock);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, sku: p.sku, ean: p.ean, price: String(p.price), stock: String(p.stock), minStock: String(p.minStock), category: p.category, supplierId: p.supplierId, emoji: p.emoji });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', sku: '', ean: '', price: '', stock: '', minStock: '5', category: 'Vêtements', supplierId: suppliers[0]?.id || '', emoji: '📦' });
    setShowModal(true);
  };

  const saveProduct = () => {
    if (!form.name || !form.sku || !form.price) {
      Alert.alert('Erreur', 'Nom, SKU et prix sont obligatoires.');
      return;
    }
    const data = {
      name: form.name, sku: form.sku, ean: form.ean,
      price: parseInt(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 5,
      category: form.category,
      supplierId: form.supplierId,
      supplierName: suppliers.find(s => s.id === form.supplierId)?.name || '',
      emoji: form.emoji,
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const confirmDelete = (p: Product) => {
    Alert.alert('Supprimer', `Supprimer "${p.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteProduct(p.id) },
    ]);
  };

  const renderProduct = ({ item: p }: { item: Product }) => {
    const stockColor = p.stock === 0 ? COLORS.danger : p.stock <= p.minStock ? COLORS.warning : COLORS.success;
    return (
      <Card onPress={() => openEdit(p)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.pIcon, { backgroundColor: p.stock === 0 ? COLORS.dangerBg : p.stock <= p.minStock ? COLORS.warningBg : COLORS.primaryLight }]}>
          <Text style={styles.pEmoji}>{p.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pName} numberOfLines={1}>{p.name}</Text>
          <Text style={styles.pMeta}>{p.sku} · {p.category}</Text>
          <Text style={styles.pSupplier}>{p.supplierName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          <Text style={[styles.pStock, { color: stockColor }]}>{p.stock}</Text>
          <Text style={styles.pStockLbl}>unités</Text>
          <StockBadge stock={p.stock} min={p.minStock} />
        </View>
      </Card>
    );
  };

  const emojis = ['📦', '👕', '👗', '👟', '👜', '🕶', '🧴', '💄', '👒', '🧣', '💍', '⌚', '👔', '👖', '🧥'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📦 Stock</Text>
          <Text style={styles.headerSub}>{products.length} produits · {outOfStock.length} ruptures · {lowStock.length} alertes</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Status pills */}
      <View style={styles.pillRow}>
        {([['all', 'Tous'], ['out', `Ruptures (${outOfStock.length})`], ['low', `Alertes (${lowStock.length})`]] as const).map(([val, lbl]) => (
          <TouchableOpacity key={val} style={[styles.pill, statusFilter === val && styles.pillActive]} onPress={() => setStatusFilter(val)}>
            <Text style={[styles.pillText, statusFilter === val && styles.pillTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Rechercher nom, SKU, EAN..." placeholderTextColor={COLORS.textHint} />
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.catPill, catFilter === cat && styles.catPillActive]} onPress={() => setCatFilter(cat)}>
            <Text style={[styles.catPillText, catFilter === cat && styles.catPillTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="📭" title="Aucun produit trouvé" subtitle="Modifiez les filtres ou ajoutez un produit." />}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingProduct ? 'Modifier produit' : 'Nouveau produit'}</Text>

              {/* Emoji picker */}
              <Text style={styles.formLabel}>Icône</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {emojis.map(e => (
                    <TouchableOpacity key={e} style={[styles.emojiBtn, form.emoji === e && styles.emojiBtnActive]} onPress={() => setForm(f => ({ ...f, emoji: e }))}>
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Input label="Nom du produit *" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} placeholder="Ex: Nike Air Max 270" />
              <Input label="SKU *" value={form.sku} onChangeText={t => setForm(f => ({ ...f, sku: t }))} placeholder="SKU-00001" />
              <Input label="Code EAN / QR" value={form.ean} onChangeText={t => setForm(f => ({ ...f, ean: t }))} placeholder="3614524061049" keyboardType="numeric" />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Input label="Prix (DA) *" value={form.price} onChangeText={t => setForm(f => ({ ...f, price: t }))} placeholder="12500" keyboardType="numeric" style={{ flex: 1 }} />
                <Input label="Stock initial" value={form.stock} onChangeText={t => setForm(f => ({ ...f, stock: t }))} placeholder="0" keyboardType="numeric" style={{ flex: 1 }} />
                <Input label="Seuil alerte" value={form.minStock} onChangeText={t => setForm(f => ({ ...f, minStock: t }))} placeholder="5" keyboardType="numeric" style={{ flex: 1 }} />
              </View>

              <Text style={styles.formLabel}>Catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                    <TouchableOpacity key={cat} style={[styles.catPill, form.category === cat && styles.catPillActive]} onPress={() => setForm(f => ({ ...f, category: cat }))}>
                      <Text style={[styles.catPillText, form.category === cat && styles.catPillTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.formLabel}>Fournisseur</Text>
              {suppliers.map(s => (
                <TouchableOpacity key={s.id} style={[styles.radioRow, form.supplierId === s.id && styles.radioRowActive]} onPress={() => setForm(f => ({ ...f, supplierId: s.id }))}>
                  <View style={[styles.radio, form.supplierId === s.id && styles.radioActive]} />
                  <Text style={styles.radioLabel}>{s.name} · {s.city}</Text>
                </TouchableOpacity>
              ))}

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                {editingProduct && (
                  <Btn label="Supprimer" variant="danger" onPress={() => { confirmDelete(editingProduct); setShowModal(false); }} style={{ flex: 1 }} />
                )}
                <Btn label="Annuler" variant="outline" onPress={() => setShowModal(false)} style={{ flex: 1 }} />
                <Btn label="Enregistrer" onPress={saveProduct} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: 6, padding: 10, paddingBottom: 6, backgroundColor: COLORS.primary },
  pill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  pillActive: { backgroundColor: COLORS.white },
  pillText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  pillTextActive: { color: COLORS.primary },
  searchRow: { padding: 10, paddingBottom: 4 },
  searchInput: { backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 42, fontSize: 14, color: COLORS.textMain },
  catScroll: { paddingVertical: 6 },
  catPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.card, borderWidth: 0.5, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.primary },
  catPillText: { fontSize: 12, color: COLORS.textSub },
  catPillTextActive: { color: COLORS.white, fontWeight: '600' },
  pIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pEmoji: { fontSize: 22 },
  pName: { fontSize: 13, fontWeight: '600', color: COLORS.textMain, marginBottom: 1 },
  pMeta: { fontSize: 11, color: COLORS.textSub },
  pSupplier: { fontSize: 11, color: COLORS.primary, marginTop: 1 },
  pStock: { fontSize: 18, fontWeight: '700' },
  pStockLbl: { fontSize: 10, color: COLORS.textSub },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 16 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSub, marginBottom: 6 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 6, backgroundColor: COLORS.bg },
  radioRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border },
  radioActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  radioLabel: { fontSize: 13, color: COLORS.textMain, flex: 1 },
  emojiBtn: { padding: 6, borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  emojiBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
});
