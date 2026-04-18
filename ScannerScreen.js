import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Vibration, Modal } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useStore } from '../store';

const C = { primary:'#085041', primary2:'#1D9E75', light:'#E1F5EE', white:'#fff', bg:'#F4F6F5', card:'#fff', border:'#E5E7EB', text:'#111827', sub:'#6B7280', danger:'#A32D2D', dangerBg:'#FCEBEB', warn:'#854F0B', warnBg:'#FAEEDA', success:'#3B6D11', successBg:'#EAF3DE', info:'#185FA5', infoBg:'#E6F1FB' };

export default function ScannerScreen() {
  const [hasPerm, setHasPerm] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(null);
  const [manual, setManual] = useState('');
  const [qty, setQty] = useState(1);
  const [action, setAction] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [reason, setReason] = useState('wrong_size');
  const [retAction, setRetAction] = useState('restock');
  const { getByEAN, getBySKU, adjustStock, addReturn } = useStore();

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => setHasPerm(status==='granted'));
  }, []);

  const lookup = (code) => {
    const p = getByEAN(code) || getBySKU(code);
    if (p) { setFound(p); setQty(1); setAction(null); setConfirmed(false); }
    else Alert.alert('Introuvable', `Code "${code}" non trouvé dans le catalogue.`);
    setScanning(false);
  };

  const handleScan = ({ data }) => { Vibration.vibrate(60); lookup(data); };

  const confirm = () => {
    if (!found||!action) return;
    if (action==='return') { setShowReturn(true); return; }
    adjustStock(found.id, qty, action, 'scan');
    setConfirmed(true);
  };

  const confirmReturn = () => {
    addReturn(found.id, found.name, qty, reason, retAction);
    setShowReturn(false); setConfirmed(true);
  };

  const reset = () => { setFound(null); setManual(''); setQty(1); setAction(null); setConfirmed(false); };

  const stockColor = found ? (found.stock===0?C.danger:found.stock<=found.minStock?C.warn:C.success) : C.text;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.htitle}>📷 Scanner</Text>
        <Text style={s.hsub}>Code-barres · QR Code · SKU</Text>
      </View>
      <ScrollView style={{ flex:1, padding:12 }} contentContainerStyle={{ paddingBottom:40 }}>

        {/* Viewport */}
        <View style={s.viewport}>
          {scanning && hasPerm ? (
            <BarCodeScanner onBarCodeScanned={handleScan} style={StyleSheet.absoluteFillObject}>
              <View style={s.overlay}>
                <View style={s.frame}>
                  <View style={[s.corner,s.cTL]}/><View style={[s.corner,s.cTR]}/><View style={[s.corner,s.cBL]}/><View style={[s.corner,s.cBR]}/>
                </View>
                <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:13, marginTop:16 }}>Pointez sur le code</Text>
                <TouchableOpacity style={s.cancelBtn} onPress={()=>setScanning(false)}>
                  <Text style={{ color:'#fff', fontSize:13 }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </BarCodeScanner>
          ) : (
            <View style={s.placeholder}>
              <View style={s.frameStatic}>
                <View style={[s.corner,s.cTL]}/><View style={[s.corner,s.cTR]}/><View style={[s.corner,s.cBL]}/><View style={[s.corner,s.cBR]}/>
              </View>
              <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:'600', marginTop:12 }}>Appuyez sur Scanner</Text>
              <Text style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginTop:4 }}>EAN-13 · QR Code · Code128</Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
          <TouchableOpacity style={[s.btn,{ backgroundColor:C.primary, flex:1 }]} onPress={()=>setScanning(true)}>
            <Text style={{ color:'#fff', fontWeight:'600', fontSize:13 }}>📷 Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn,{ backgroundColor:C.card, flex:1, borderWidth:0.5, borderColor:C.border }]} onPress={()=>lookup('3614524061049')}>
            <Text style={{ color:C.text, fontWeight:'600', fontSize:13 }}>🔍 Démo</Text>
          </TouchableOpacity>
        </View>

        {/* Manual */}
        <View style={{ flexDirection:'row', gap:8, marginBottom:14 }}>
          <TextInput style={s.input} value={manual} onChangeText={setManual} placeholder="SKU ou EAN manuellement..." placeholderTextColor={C.sub} returnKeyType="search" onSubmitEditing={()=>{ lookup(manual); setManual(''); }}/>
          <TouchableOpacity style={[s.btn,{ backgroundColor:C.primary, paddingHorizontal:16 }]} onPress={()=>{ lookup(manual); setManual(''); }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>OK</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmed */}
        {confirmed && (
          <View style={[s.card, { alignItems:'center', padding:20 }]}>
            <Text style={{ fontSize:36, marginBottom:8 }}>{action==='return'?'↩️':action==='out'?'📤':'✅'}</Text>
            <Text style={{ fontSize:16, fontWeight:'700', color:C.text, marginBottom:4 }}>{action==='return'?'Retour enregistré':action==='out'?'Sortie confirmée':'Stock mis à jour'}</Text>
            <Text style={{ fontSize:13, color:C.sub }}>{action==='out'?`−${qty}`:`+${qty}`} unité(s) · {found?.name}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:14 }}>
              <TouchableOpacity style={[s.btn,{ flex:1, borderWidth:1, borderColor:C.primary }]} onPress={reset}><Text style={{ color:C.primary, fontWeight:'600' }}>Nouveau scan</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* Product found */}
        {found && !confirmed && (
          <View style={s.card}>
            <View style={{ flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:12 }}>
              <View style={{ width:48, height:48, borderRadius:12, backgroundColor:C.light, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ fontSize:24 }}>{found.emoji}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:15, fontWeight:'700', color:C.text }}>{found.name}</Text>
                <Text style={{ fontSize:11, color:C.sub }}>{found.sku} · EAN: {found.ean}</Text>
                <Text style={{ fontSize:11, color:C.primary }}>{found.supplier}</Text>
              </View>
            </View>
            <View style={{ flexDirection:'row', gap:16, marginBottom:12 }}>
              <View style={{ alignItems:'center' }}><Text style={{ fontSize:20, fontWeight:'700', color:stockColor }}>{found.stock}</Text><Text style={{ fontSize:10, color:C.sub }}>stock actuel</Text></View>
              <View style={{ alignItems:'center' }}><Text style={{ fontSize:20, fontWeight:'700', color:C.text }}>{found.price.toLocaleString()}</Text><Text style={{ fontSize:10, color:C.sub }}>prix DA</Text></View>
            </View>
            <View style={{ borderTopWidth:0.5, borderTopColor:C.border, paddingTop:12, marginBottom:8 }}>
              <Text style={{ fontSize:12, fontWeight:'600', color:C.sub, marginBottom:8 }}>Quantité</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:16 }}>
                <TouchableOpacity style={s.qBtn} onPress={()=>setQty(q=>Math.max(1,q-1))}><Text style={{ fontSize:22, color:C.text }}>−</Text></TouchableOpacity>
                <Text style={{ fontSize:26, fontWeight:'700', color:C.text, minWidth:40, textAlign:'center' }}>{qty}</Text>
                <TouchableOpacity style={s.qBtn} onPress={()=>setQty(q=>q+1)}><Text style={{ fontSize:22, color:C.text }}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
              {[['in','📥 Entrée',C.primary,C.white],['return','↩️ Retour',C.info,C.white],['out','📤 Sortie',C.warnBg,C.warn]].map(([val,lbl,bg,fg])=>(
                <TouchableOpacity key={val} style={[s.aBtn,{ backgroundColor:action===val?bg:C.bg, flex:1 }]} onPress={()=>setAction(val)}>
                  <Text style={{ fontSize:11, fontWeight:'600', color:action===val?fg:C.sub, textAlign:'center' }}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {action && <TouchableOpacity style={[s.btn,{ backgroundColor:C.primary }]} onPress={confirm}><Text style={{ color:'#fff', fontWeight:'700', fontSize:14 }}>Confirmer — {action==='out'?`−${qty}`:` +${qty}`} unité(s)</Text></TouchableOpacity>}
          </View>
        )}
      </ScrollView>

      {/* Return Modal */}
      <Modal visible={showReturn} transparent animationType="slide">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:C.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, paddingBottom:40 }}>
            <Text style={{ fontSize:18, fontWeight:'700', color:C.text, marginBottom:4 }}>↩️ Détails retour</Text>
            <Text style={{ fontSize:13, color:C.sub, marginBottom:16 }}>{found?.name}</Text>
            <Text style={{ fontSize:12, fontWeight:'600', color:C.sub, marginBottom:8 }}>Motif</Text>
            {[['wrong_size','Mauvaise taille'],['defect','Défaut produit'],['changed_mind',"Changement d'avis"],['damaged','Endommagé']].map(([v,l])=>(
              <TouchableOpacity key={v} style={{ flexDirection:'row', alignItems:'center', gap:10, padding:10, borderRadius:8, borderWidth:0.5, borderColor:reason===v?C.primary:C.border, backgroundColor:reason===v?C.light:C.bg, marginBottom:6 }} onPress={()=>setReason(v)}>
                <View style={{ width:16, height:16, borderRadius:8, borderWidth:2, borderColor:reason===v?C.primary:C.border, backgroundColor:reason===v?C.primary:'transparent' }}/>
                <Text style={{ fontSize:13, color:C.text }}>{l}</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ fontSize:12, fontWeight:'600', color:C.sub, marginTop:12, marginBottom:8 }}>Action</Text>
            <View style={{ flexDirection:'row', gap:8, marginBottom:16 }}>
              {[['restock','✅ Remettre en stock'],['discard','🗑 Écarter']].map(([v,l])=>(
                <TouchableOpacity key={v} style={{ flex:1, padding:10, borderRadius:10, borderWidth:1, borderColor:retAction===v?C.primary:C.border, backgroundColor:retAction===v?C.light:C.bg, alignItems:'center' }} onPress={()=>setRetAction(v)}>
                  <Text style={{ fontSize:12, fontWeight:'600', color:retAction===v?C.primary:C.sub }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity style={[s.btn,{ flex:1, borderWidth:1, borderColor:C.primary }]} onPress={()=>setShowReturn(false)}><Text style={{ color:C.primary, fontWeight:'600' }}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn,{ flex:1, backgroundColor:C.primary }]} onPress={confirmReturn}><Text style={{ color:'#fff', fontWeight:'600' }}>Confirmer</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F4F6F5' },
  header:{ backgroundColor:'#085041', paddingHorizontal:16, paddingTop:52, paddingBottom:16 },
  htitle:{ fontSize:20, fontWeight:'700', color:'#fff' },
  hsub:{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 },
  viewport:{ height:220, borderRadius:16, overflow:'hidden', backgroundColor:'#0a1628', marginBottom:10 },
  overlay:{ flex:1, alignItems:'center', justifyContent:'center' },
  placeholder:{ flex:1, alignItems:'center', justifyContent:'center' },
  frame:{ width:180, height:130, position:'relative' },
  frameStatic:{ width:180, height:130, position:'relative' },
  corner:{ width:24, height:24, borderColor:'#1D9E75', borderStyle:'solid', position:'absolute' },
  cTL:{ top:0, left:0, borderTopWidth:3, borderLeftWidth:3, borderTopLeftRadius:3 },
  cTR:{ top:0, right:0, borderTopWidth:3, borderRightWidth:3, borderTopRightRadius:3 },
  cBL:{ bottom:0, left:0, borderBottomWidth:3, borderLeftWidth:3, borderBottomLeftRadius:3 },
  cBR:{ bottom:0, right:0, borderBottomWidth:3, borderRightWidth:3, borderBottomRightRadius:3 },
  cancelBtn:{ marginTop:16, backgroundColor:'rgba(0,0,0,0.5)', borderRadius:20, paddingHorizontal:20, paddingVertical:8 },
  btn:{ borderRadius:12, paddingVertical:12, paddingHorizontal:18, alignItems:'center', justifyContent:'center' },
  input:{ flex:1, backgroundColor:'#fff', borderRadius:10, borderWidth:0.5, borderColor:'#E5E7EB', paddingHorizontal:12, fontSize:13, color:'#111827', height:44 },
  card:{ backgroundColor:'#fff', borderRadius:12, borderWidth:0.5, borderColor:'#E5E7EB', padding:12, marginBottom:10 },
  qBtn:{ width:36, height:36, borderRadius:18, borderWidth:0.5, borderColor:'#E5E7EB', backgroundColor:'#F4F6F5', alignItems:'center', justifyContent:'center' },
  aBtn:{ borderRadius:10, padding:10, alignItems:'center', justifyContent:'center' },
});
