import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useStore } from '../store';

const C = { primary:'#085041', light:'#E1F5EE', white:'#fff', bg:'#F4F6F5', card:'#fff', border:'#E5E7EB', text:'#111827', sub:'#6B7280', danger:'#A32D2D', dangerBg:'#FCEBEB', warn:'#854F0B', warnBg:'#FAEEDA', success:'#3B6D11', successBg:'#EAF3DE', info:'#185FA5', infoBg:'#E6F1FB' };

const Header = ({ title, sub, right }) => (
  <View style={{ backgroundColor:C.primary, paddingHorizontal:16, paddingTop:52, paddingBottom:14, flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end' }}>
    <View><Text style={{ fontSize:20, fontWeight:'700', color:C.white }}>{title}</Text>{sub&&<Text style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginTop:2 }}>{sub}</Text>}</View>
    {right}
  </View>
);

const Badge = ({ label, bg, color }) => <View style={{ backgroundColor:bg, borderRadius:20, paddingHorizontal:8, paddingVertical:3 }}><Text style={{ fontSize:10, fontWeight:'600', color }}>{label}</Text></View>;

const StockBadge = ({ stock, min }) => {
  if (stock===0) return <Badge label="Rupture" bg={C.dangerBg} color={C.danger}/>;
  if (stock<=min) return <Badge label="Stock bas" bg={C.warnBg} color={C.warn}/>;
  return <Badge label="Dispo" bg={C.successBg} color={C.success}/>;
};

// ─── STOCK ────────────────────────────────────────────────────────────────────
export function StockScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', sku:'', ean:'', price:'', stock:'', minStock:'5', emoji:'📦', supplier:'', category:'Vêtements' });

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search);
    const mf = filter==='all' || (filter==='out'&&p.stock===0) || (filter==='low'&&p.stock>0&&p.stock<=p.minStock);
    return ms && mf;
  });

  const out = products.filter(p=>p.stock===0).length;
  const low = products.filter(p=>p.stock>0&&p.stock<=p.minStock).length;

  const openAdd = () => { setEditing(null); setForm({ name:'', sku:'', ean:'', price:'', stock:'', minStock:'5', emoji:'📦', supplier:'', category:'Vêtements' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name:p.name, sku:p.sku, ean:p.ean, price:String(p.price), stock:String(p.stock), minStock:String(p.minStock), emoji:p.emoji, supplier:p.supplier, category:p.category }); setModal(true); };

  const save = () => {
    if (!form.name||!form.sku) { Alert.alert('Erreur','Nom et SKU obligatoires'); return; }
    const data = { name:form.name, sku:form.sku, ean:form.ean, price:parseInt(form.price)||0, stock:parseInt(form.stock)||0, minStock:parseInt(form.minStock)||5, emoji:form.emoji, supplier:form.supplier, category:form.category };
    editing ? updateProduct(editing.id, data) : addProduct(data);
    setModal(false);
  };

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header title="📦 Stock" sub={`${products.length} produits · ${out} ruptures`} right={<TouchableOpacity style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:20, paddingHorizontal:14, paddingVertical:7 }} onPress={openAdd}><Text style={{ color:'#fff', fontWeight:'600', fontSize:13 }}>+ Ajouter</Text></TouchableOpacity>}/>
      <View style={{ flexDirection:'row', gap:6, padding:10, backgroundColor:C.primary }}>
        {[['all','Tous'],['out',`Ruptures (${out})`],['low',`Alertes (${low})`]].map(([v,l])=>(
          <TouchableOpacity key={v} style={{ borderRadius:20, paddingHorizontal:12, paddingVertical:5, backgroundColor:filter===v?C.white:'rgba(255,255,255,0.15)' }} onPress={()=>setFilter(v)}>
            <Text style={{ fontSize:12, color:filter===v?C.primary:'rgba(255,255,255,0.8)', fontWeight:'500' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ padding:10, paddingBottom:4 }}>
        <TextInput style={{ backgroundColor:C.white, borderRadius:10, borderWidth:0.5, borderColor:C.border, paddingHorizontal:14, height:42, fontSize:14, color:C.text }} value={search} onChangeText={setSearch} placeholder="Rechercher..." placeholderTextColor={C.sub}/>
      </View>
      <FlatList data={filtered} keyExtractor={p=>p.id} contentContainerStyle={{ padding:12, paddingBottom:100 }}
        ListEmptyComponent={<View style={{ alignItems:'center', paddingVertical:48 }}><Text style={{ fontSize:40 }}>📭</Text><Text style={{ fontSize:15, fontWeight:'600', color:C.text, marginTop:10 }}>Aucun produit</Text></View>}
        renderItem={({ item:p }) => {
          const sc = p.stock===0?C.danger:p.stock<=p.minStock?C.warn:C.success;
          return (
            <TouchableOpacity style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:10 }} onPress={()=>openEdit(p)}>
              <View style={{ width:44, height:44, borderRadius:11, backgroundColor:p.stock===0?C.dangerBg:p.stock<=p.minStock?C.warnBg:C.light, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:22 }}>{p.emoji}</Text></View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:13, fontWeight:'600', color:C.text }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ fontSize:11, color:C.sub }}>{p.sku} · {p.category}</Text>
                <Text style={{ fontSize:11, color:C.primary }}>{p.supplier}</Text>
              </View>
              <View style={{ alignItems:'flex-end', gap:3 }}>
                <Text style={{ fontSize:18, fontWeight:'700', color:sc }}>{p.stock}</Text>
                <Text style={{ fontSize:10, color:C.sub }}>unités</Text>
                <StockBadge stock={p.stock} min={p.minStock}/>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Modal visible={modal} animationType="slide" transparent>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:C.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, paddingBottom:40, maxHeight:'90%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize:18, fontWeight:'700', color:C.text, marginBottom:16 }}>{editing?'Modifier':'Nouveau produit'}</Text>
              {[['Nom *','name','text'],['SKU *','sku','text'],['Code EAN','ean','numeric'],['Prix (DA)','price','numeric'],['Stock','stock','numeric'],['Seuil alerte','minStock','numeric'],['Fournisseur','supplier','text'],['Emoji','emoji','text']].map(([lbl,key,kt])=>(
                <View key={key} style={{ marginBottom:10 }}>
                  <Text style={{ fontSize:12, fontWeight:'600', color:C.sub, marginBottom:4 }}>{lbl}</Text>
                  <TextInput style={{ backgroundColor:C.bg, borderRadius:8, borderWidth:0.5, borderColor:C.border, paddingHorizontal:12, height:44, fontSize:14, color:C.text }} value={form[key]} onChangeText={v=>setForm(f=>({...f,[key]:v}))} keyboardType={kt}/>
                </View>
              ))}
              <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                {editing&&<TouchableOpacity style={{ flex:1, borderRadius:12, paddingVertical:12, alignItems:'center', backgroundColor:C.dangerBg }} onPress={()=>{ deleteProduct(editing.id); setModal(false); }}><Text style={{ color:C.danger, fontWeight:'600' }}>Supprimer</Text></TouchableOpacity>}
                <TouchableOpacity style={{ flex:1, borderRadius:12, paddingVertical:12, alignItems:'center', borderWidth:1, borderColor:C.primary }} onPress={()=>setModal(false)}><Text style={{ color:C.primary, fontWeight:'600' }}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex:1, borderRadius:12, paddingVertical:12, alignItems:'center', backgroundColor:C.primary }} onPress={save}><Text style={{ color:'#fff', fontWeight:'600' }}>Sauvegarder</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
const STATUS = { pending:['En attente',C.warnBg,C.warn], processing:['En prép.',C.infoBg,C.info], shipped:['Expédié',C.infoBg,C.info], delivered:['Livré',C.successBg,C.success], cancelled:['Annulé',C.dangerBg,C.danger] };

export function OrdersScreen() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState('all');
  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header title="🛍 Commandes" sub={`${orders.length} commandes`}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor:C.primary }} contentContainerStyle={{ paddingHorizontal:10, paddingBottom:10, gap:6 }}>
        {[['all','Toutes'],['pending','En attente'],['shipped','Expédiées'],['delivered','Livrées'],['cancelled','Annulées']].map(([v,l])=>(
          <TouchableOpacity key={v} style={{ borderRadius:20, paddingHorizontal:12, paddingVertical:5, backgroundColor:filter===v?C.white:'rgba(255,255,255,0.15)' }} onPress={()=>setFilter(v)}>
            <Text style={{ fontSize:12, color:filter===v?C.primary:'rgba(255,255,255,0.8)', fontWeight:'500' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList data={filtered} keyExtractor={o=>o.id} contentContainerStyle={{ padding:12, paddingBottom:100 }}
        renderItem={({ item:o }) => {
          const [lbl,bg,color] = STATUS[o.status]||['?',C.bg,C.sub];
          return (
            <View style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12, marginBottom:8 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 }}>
                <View><Text style={{ fontSize:13, fontWeight:'600', color:C.text }}>{o.id}</Text><Text style={{ fontSize:11, color:C.sub }}>{o.customer} · {o.date}</Text></View>
                <Badge label={lbl} bg={bg} color={color}/>
              </View>
              <Text style={{ fontSize:12, color:C.sub, marginBottom:8 }}>{o.items}</Text>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={{ fontSize:15, fontWeight:'700', color:C.text }}>{o.total.toLocaleString()} DA</Text>
                <View style={{ flexDirection:'row', gap:6 }}>
                  {o.status==='pending'&&<TouchableOpacity style={{ backgroundColor:C.light, borderRadius:8, paddingHorizontal:10, paddingVertical:5 }} onPress={()=>updateOrderStatus(o.id,'processing')}><Text style={{ fontSize:12, fontWeight:'600', color:C.primary }}>Préparer</Text></TouchableOpacity>}
                  {o.status==='processing'&&<TouchableOpacity style={{ backgroundColor:C.infoBg, borderRadius:8, paddingHorizontal:10, paddingVertical:5 }} onPress={()=>updateOrderStatus(o.id,'shipped')}><Text style={{ fontSize:12, fontWeight:'600', color:C.info }}>Expédier</Text></TouchableOpacity>}
                  {o.status==='shipped'&&<TouchableOpacity style={{ backgroundColor:C.successBg, borderRadius:8, paddingHorizontal:10, paddingVertical:5 }} onPress={()=>updateOrderStatus(o.id,'delivered')}><Text style={{ fontSize:12, fontWeight:'600', color:C.success }}>Livré ✓</Text></TouchableOpacity>}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

// ─── RETURNS ──────────────────────────────────────────────────────────────────
export function ReturnsScreen({ navigation }) {
  const { returns } = useStore();
  const restocked = returns.filter(r=>r.action==='restock').length;
  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header title="↩️ Retours" sub={`${returns.length} retours · ${restocked} remis en stock`}/>
      <View style={{ flexDirection:'row', gap:8, padding:10 }}>
        {[[returns.length,'Total',C.text],[restocked,'Remis',C.success],[returns.length-restocked,'Écartés',C.danger]].map(([v,l,c])=>(
          <View key={l} style={{ flex:1, backgroundColor:C.white, borderRadius:10, borderWidth:0.5, borderColor:C.border, padding:10, alignItems:'center' }}>
            <Text style={{ fontSize:22, fontWeight:'700', color:c }}>{v}</Text>
            <Text style={{ fontSize:10, color:C.sub, marginTop:1 }}>{l}</Text>
          </View>
        ))}
      </View>
      <FlatList data={returns} keyExtractor={r=>r.id} contentContainerStyle={{ padding:12, paddingBottom:100 }}
        ListEmptyComponent={
          <View style={{ alignItems:'center', paddingVertical:48 }}>
            <Text style={{ fontSize:40, marginBottom:12 }}>↩️</Text>
            <Text style={{ fontSize:16, fontWeight:'600', color:C.text }}>Aucun retour enregistré</Text>
            <Text style={{ fontSize:13, color:C.sub, textAlign:'center', marginTop:6 }}>Scannez un produit retourné depuis l'onglet Scanner.</Text>
          </View>
        }
        renderItem={({ item:r }) => (
          <View style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12, marginBottom:8 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 }}>
              <Text style={{ fontSize:13, fontWeight:'600', color:C.text }}>{r.id}</Text>
              <Text style={{ fontSize:11, color:C.sub }}>{r.date}</Text>
            </View>
            <Text style={{ fontSize:12, color:C.sub, marginBottom:8 }}>{r.productName} · ×{r.qty}</Text>
            <View style={{ flexDirection:'row', gap:6 }}>
              <Badge label={r.reason} bg={C.warnBg} color={C.warn}/>
              <Badge label={r.action==='restock'?'✅ Remis':'🗑 Écarté'} bg={r.action==='restock'?C.successBg:C.dangerBg} color={r.action==='restock'?C.success:C.danger}/>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const { products, orders } = useStore();
  const out = products.filter(p=>p.stock===0);
  const low = products.filter(p=>p.stock>0&&p.stock<=p.minStock);
  const delivered = orders.filter(o=>o.status==='delivered');
  const revenue = delivered.reduce((a,o)=>a+o.total,0);
  const week = [42,58,37,51,63,48,30];
  const maxW = Math.max(...week);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header title="📊 Dashboard" sub="Résumé du mois"/>
      <ScrollView contentContainerStyle={{ padding:12, paddingBottom:100 }}>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:4 }}>
          {[[orders.length,'Commandes','ce mois'],[delivered.length,'Livrées','commandes'],[(revenue/1000).toFixed(0)+'K','CA (DA)','mensuel']].map(([v,l,s])=>(
            <View key={l} style={{ width:'48%', backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12 }}>
              <Text style={{ fontSize:11, color:C.sub, marginBottom:4 }}>{l}</Text>
              <Text style={{ fontSize:22, fontWeight:'700', color:C.text }}>{v}</Text>
              <Text style={{ fontSize:11, color:C.primary, marginTop:3 }}>{s}</Text>
            </View>
          ))}
        </View>

        {(out.length>0||low.length>0)&&(
          <>
            <Text style={{ fontSize:11, fontWeight:'600', color:C.sub, textTransform:'uppercase', letterSpacing:0.8, marginTop:12, marginBottom:6 }}>Alertes stock ({out.length+low.length})</Text>
            {out.slice(0,3).map(p=>(
              <View key={p.id} style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12, marginBottom:6, flexDirection:'row', alignItems:'center', gap:10, borderLeftWidth:3, borderLeftColor:C.danger }}>
                <Text style={{ fontSize:20 }}>{p.emoji}</Text>
                <View style={{ flex:1 }}><Text style={{ fontSize:13, fontWeight:'600', color:C.text }}>{p.name}</Text><Text style={{ fontSize:11, color:C.danger }}>Rupture · {p.supplier}</Text></View>
                <Badge label="Rupture" bg={C.dangerBg} color={C.danger}/>
              </View>
            ))}
            {low.slice(0,2).map(p=>(
              <View key={p.id} style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12, marginBottom:6, flexDirection:'row', alignItems:'center', gap:10, borderLeftWidth:3, borderLeftColor:C.warn }}>
                <Text style={{ fontSize:20 }}>{p.emoji}</Text>
                <View style={{ flex:1 }}><Text style={{ fontSize:13, fontWeight:'600', color:C.text }}>{p.name}</Text><Text style={{ fontSize:11, color:C.warn }}>{p.stock} unité(s) restante(s)</Text></View>
                <Badge label="Bas" bg={C.warnBg} color={C.warn}/>
              </View>
            ))}
          </>
        )}

        <Text style={{ fontSize:11, fontWeight:'600', color:C.sub, textTransform:'uppercase', letterSpacing:0.8, marginTop:12, marginBottom:6 }}>Ventes 7 derniers jours</Text>
        <View style={{ backgroundColor:C.white, borderRadius:12, borderWidth:0.5, borderColor:C.border, padding:12 }}>
          <View style={{ flexDirection:'row', alignItems:'flex-end', gap:8, height:80 }}>
            {week.map((v,i)=>(
              <View key={i} style={{ flex:1, alignItems:'center', gap:4 }}>
                <Text style={{ fontSize:10, color:C.sub, fontWeight:'600' }}>{v}</Text>
                <View style={{ width:'100%', height:Math.round((v/maxW)*64), backgroundColor:i===4?'#1D9E75':i===5?'#0F6E56':C.light, borderRadius:4 }}/>
                <Text style={{ fontSize:10, color:C.sub }}>{['L','M','M','J','V','S','D'][i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
