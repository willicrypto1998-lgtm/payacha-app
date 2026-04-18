import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, Modal, Animated, Vibration,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useStockStore, Product } from '../store/stockStore';
import { COLORS, SIZES } from '../utils/theme';
import { Badge, StockBadge, Btn, Card, Divider } from '../components/UI';

type ScanAction = 'in' | 'out' | 'return' | null;

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [action, setAction] = useState<ScanAction>(null);
  const [returnReason, setReturnReason] = useState('wrong_size');
  const [returnAction, setReturnAction] = useState<'restock' | 'discard'>('restock');
  const [confirmed, setConfirmed] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const { getProductByEAN, getProductBySKU, adjustStock, addReturn } = useStockStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [scanning]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanning(false);
    Vibration.vibrate(80);
    lookupCode(data, 'barcode');
  };

  const lookupCode = (code: string, method: 'barcode' | 'qr' | 'manual') => {
    const p = getProductByEAN(code) || getProductBySKU(code);
    if (p) {
      setFoundProduct(p);
      setScannedCode(code);
      setQty(1);
      setAction(null);
      setConfirmed(false);
    } else {
      Alert.alert(
        'Produit non trouvé',
        `Code "${code}" introuvable dans votre catalogue.\n\nVoulez-vous l'ajouter ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ajouter produit', onPress: () => {} },
        ]
      );
    }
  };

  const handleManual = () => {
    if (!manualCode.trim()) return;
    lookupCode(manualCode.trim(), 'manual');
    setManualCode('');
  };

  const confirmAction = () => {
    if (!foundProduct || !action) return;
    if (action === 'return') {
      setShowReturnModal(true);
      return;
    }
    adjustStock(foundProduct.id, qty, action, undefined,
      scannedCode ? (scannedCode.length > 8 ? 'barcode' : 'manual') : 'manual');
    setConfirmed(true);
    Vibration.vibrate([0, 50, 50, 50]);
  };

  const confirmReturn = () => {
    if (!foundProduct) return;
    addReturn({
      productId: foundProduct.id,
      productName: foundProduct.name,
      quantity: qty,
      reason: returnReason as any,
      action: returnAction,
      scanMethod: scannedCode ? 'barcode' : 'manual',
    });
    setShowReturnModal(false);
    setConfirmed(true);
    Vibration.vibrate([0, 50, 50, 50]);
  };

  const reset = () => {
    setFoundProduct(null);
    setScannedCode('');
    setQty(1);
    setAction(null);
    setConfirmed(false);
    setManualCode('');
  };

  const scanLineY = scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [-44, 44] });

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scanner</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.permText}>Chargement caméra...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scanner</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.permText}>⚠️ Accès caméra refusé</Text>
          <Text style={styles.permSub}>Activez la caméra dans les paramètres de l'application.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📷 Scanner</Text>
        <Text style={styles.headerSub}>Code-barres · QR Code · SKU</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ─── Camera viewport ─── */}
        <View style={styles.viewportCard}>
          {scanning ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'qr', 'upc_a'] }}
              onBarcodeScanned={handleBarCodeScanned}>
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
                </View>
                <Text style={styles.scanHint}>Pointez sur le code produit</Text>
                <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setScanning(false)}>
                  <Text style={styles.cancelScanText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.viewportPlaceholder}>
              <View style={styles.scanFrameStatic}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.placeholderText}>Appuyez sur scanner</Text>
              <Text style={styles.placeholderSub}>EAN-8 · EAN-13 · QR Code · Code128</Text>
            </View>
          )}
        </View>

        {/* ─── Scan buttons ─── */}
        <View style={styles.scanBtns}>
          <TouchableOpacity
            style={[styles.scanBtn, styles.scanBtnPrimary]}
            onPress={() => setScanning(true)}>
            <Text style={styles.scanBtnIcon}>📷</Text>
            <Text style={styles.scanBtnText}>Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scanBtn, styles.scanBtnSecondary]}
            onPress={() => lookupCode('3614524061049', 'barcode')}>
            <Text style={styles.scanBtnIcon}>🔍</Text>
            <Text style={[styles.scanBtnText, { color: COLORS.textMain }]}>Démo scan</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Manual input ─── */}
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            value={manualCode}
            onChangeText={setManualCode}
            placeholder="Saisir code EAN ou SKU manuellement..."
            placeholderTextColor={COLORS.textHint}
            returnKeyType="search"
            onSubmitEditing={handleManual}
          />
          <TouchableOpacity style={styles.manualBtn} onPress={handleManual}>
            <Text style={styles.manualBtnText}>OK</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Confirmed ─── */}
        {confirmed && (
          <Card style={styles.confirmCard}>
            <Text style={styles.confirmIcon}>{action === 'return' ? '↩️' : action === 'out' ? '📤' : '✅'}</Text>
            <Text style={styles.confirmTitle}>
              {action === 'return' ? 'Retour enregistré' : action === 'out' ? 'Sortie confirmée' : 'Stock mis à jour'}
            </Text>
            <Text style={styles.confirmDesc}>
              {action === 'return' ? `${qty} unité(s) retournée(s)` : action === 'out' ? `−${qty} unité(s)` : `+${qty} unité(s)`} · {foundProduct?.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Btn label="Nouveau scan" variant="outline" onPress={reset} style={{ flex: 1 }} />
              <Btn label="Voir stock" variant="primary" onPress={reset} style={{ flex: 1 }} />
            </View>
          </Card>
        )}

        {/* ─── Product found ─── */}
        {foundProduct && !confirmed && (
          <Card style={{ marginTop: 4 }}>
            <View style={styles.productRow}>
              <View style={[styles.productIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.productEmoji}>{foundProduct.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{foundProduct.name}</Text>
                <Text style={styles.productSku}>{foundProduct.sku} · EAN: {foundProduct.ean}</Text>
                <Text style={styles.productSup}>📦 {foundProduct.supplierName}</Text>
              </View>
            </View>

            <View style={styles.productStats}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{foundProduct.stock}</Text>
                <Text style={styles.statLbl}>Stock actuel</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{foundProduct.price.toLocaleString()}</Text>
                <Text style={styles.statLbl}>Prix (DA)</Text>
              </View>
              <View style={styles.statItem}>
                <StockBadge stock={foundProduct.stock} min={foundProduct.minStock} />
              </View>
            </View>

            <Divider />

            {/* Quantity control */}
            <Text style={styles.qtyLabel}>Quantité</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyVal}>{qty}</Text>
                <Text style={styles.qtyUnit}>unités</Text>
              </View>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: action === 'in' ? COLORS.primary : COLORS.primaryLight }]}
                onPress={() => setAction('in')}>
                <Text style={{ fontSize: 18 }}>📥</Text>
                <Text style={[styles.actionBtnText, { color: action === 'in' ? COLORS.white : COLORS.primary }]}>Entrée</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: action === 'return' ? COLORS.info : COLORS.infoBg }]}
                onPress={() => setAction('return')}>
                <Text style={{ fontSize: 18 }}>↩️</Text>
                <Text style={[styles.actionBtnText, { color: action === 'return' ? COLORS.white : COLORS.info }]}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: action === 'out' ? COLORS.warning : COLORS.warningBg }]}
                onPress={() => setAction('out')}>
                <Text style={{ fontSize: 18 }}>📤</Text>
                <Text style={[styles.actionBtnText, { color: action === 'out' ? COLORS.white : COLORS.warning }]}>Sortie</Text>
              </TouchableOpacity>
            </View>

            {action && (
              <Btn
                label={`Confirmer — ${action === 'in' ? '+' : action === 'out' ? '−' : ''}${qty} unité(s)`}
                onPress={confirmAction}
                style={{ marginTop: 10 }}
              />
            )}
          </Card>
        )}
      </ScrollView>

      {/* ─── Return modal ─── */}
      <Modal visible={showReturnModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>↩️ Détails du retour</Text>
            <Text style={styles.modalSub}>{foundProduct?.name}</Text>

            <Text style={styles.modalLabel}>Motif du retour</Text>
            {[
              ['wrong_size', 'Mauvaise taille'],
              ['defect', 'Défaut produit'],
              ['changed_mind', "Changement d'avis"],
              ['damaged', 'Endommagé'],
              ['other', 'Autre'],
            ].map(([val, lbl]) => (
              <TouchableOpacity key={val} style={[styles.radioRow, returnReason === val && styles.radioRowActive]}
                onPress={() => setReturnReason(val)}>
                <View style={[styles.radio, returnReason === val && styles.radioActive]} />
                <Text style={styles.radioLabel}>{lbl}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Action</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.actionChoiceBtn, returnAction === 'restock' && styles.actionChoiceActive]}
                onPress={() => setReturnAction('restock')}>
                <Text style={styles.actionChoiceText}>✅ Remettre en stock</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionChoiceBtn, returnAction === 'discard' && { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger }]}
                onPress={() => setReturnAction('discard')}>
                <Text style={[styles.actionChoiceText, returnAction === 'discard' && { color: COLORS.danger }]}>🗑 Écarter</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn label="Annuler" variant="outline" onPress={() => setShowReturnModal(false)} style={{ flex: 1 }} />
              <Btn label="Confirmer" onPress={confirmReturn} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permText: { fontSize: 16, fontWeight: '600', color: COLORS.textMain, textAlign: 'center', marginBottom: 8 },
  permSub: { fontSize: 14, color: COLORS.textSub, textAlign: 'center' },

  viewportCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 10, backgroundColor: COLORS.scanBg, height: 220 },
  camera: { flex: 1 },
  scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  viewportPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, height: 220 },
  placeholderText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  placeholderSub: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },

  scanFrame: { width: 180, height: 130, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  scanFrameStatic: { width: 180, height: 130, position: 'relative' },
  corner: { width: 24, height: 24, borderColor: COLORS.scanGreen, borderStyle: 'solid', position: 'absolute' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 3 },
  scanLine: { position: 'absolute', width: 150, height: 2, backgroundColor: COLORS.scanGreen, borderRadius: 1 },
  scanHint: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  cancelScanBtn: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  cancelScanText: { color: COLORS.white, fontSize: 13 },

  scanBtns: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  scanBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  scanBtnPrimary: { backgroundColor: COLORS.primary },
  scanBtnSecondary: { backgroundColor: COLORS.card, borderWidth: 0.5, borderColor: COLORS.border },
  scanBtnIcon: { fontSize: 22 },
  scanBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },

  manualRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  manualInput: { flex: 1, backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 12, fontSize: 13, color: COLORS.textMain, height: 44 },
  manualBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', height: 44 },
  manualBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  confirmCard: { alignItems: 'center', padding: 20, marginTop: 4 },
  confirmIcon: { fontSize: 40, marginBottom: 10 },
  confirmTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  confirmDesc: { fontSize: 13, color: COLORS.textSub, textAlign: 'center' },

  productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  productIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 24 },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.textMain, marginBottom: 2 },
  productSku: { fontSize: 11, color: COLORS.textSub, marginBottom: 2 },
  productSup: { fontSize: 11, color: COLORS.primary },
  productStats: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  statLbl: { fontSize: 10, color: COLORS.textSub, marginTop: 1 },

  qtyLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSub, marginBottom: 6, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 22, color: COLORS.textMain, fontWeight: '300', marginTop: -2 },
  qtyDisplay: { alignItems: 'center' },
  qtyVal: { fontSize: 26, fontWeight: '700', color: COLORS.textMain },
  qtyUnit: { fontSize: 11, color: COLORS.textSub },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.textSub, marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSub, marginBottom: 8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 6, backgroundColor: COLORS.bg },
  radioRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border },
  radioActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  radioLabel: { fontSize: 13, color: COLORS.textMain },
  actionChoiceBtn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  actionChoiceActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  actionChoiceText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
});
