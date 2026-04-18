import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ScannerScreen from './screens/ScannerScreen';
import StockScreen from './screens/StockScreen';
import OrdersScreen from './screens/OrdersScreen';
import ReturnsScreen from './screens/ReturnsScreen';
import DashboardScreen from './screens/DashboardScreen';
import { useStore } from './store';

const Tab = createBottomTabNavigator();
const C = { primary:'#085041', light:'#E1F5EE', white:'#fff', gray:'#9CA3AF' };

function Icon({ label, focused }) {
  const icons = { Scanner:'📷', Stock:'📦', Commandes:'🛍', Retours:'↩️', Stats:'📊' };
  return (
    <View style={{ alignItems:'center' }}>
      <View style={focused ? { backgroundColor:C.light, borderRadius:14, width:28, height:28, alignItems:'center', justifyContent:'center' } : {}}>
        <Text style={{ fontSize:18 }}>{icons[label]}</Text>
      </View>
    </View>
  );
}

export default function App() {
  const getOut = useStore(s => s.getOut);
  const orders = useStore(s => s.orders);
  const pending = orders.filter(o => o.status==='pending').length;
  const alerts = getOut().length;

  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator screenOptions={{ headerShown:false, tabBarActiveTintColor:C.primary, tabBarInactiveTintColor:C.gray, tabBarStyle:{ paddingBottom: Platform.OS==='ios'?20:8, paddingTop:6, height: Platform.OS==='ios'?82:62, borderTopWidth:0.5, borderTopColor:'#E5E7EB' }, tabBarLabelStyle:{ fontSize:10, fontWeight:'600' } }}>
            <Tab.Screen name="Scanner" component={ScannerScreen} options={{ tabBarIcon:({focused})=><Icon label="Scanner" focused={focused}/> }}/>
            <Tab.Screen name="Stock" component={StockScreen} options={{ tabBarIcon:({focused})=><Icon label="Stock" focused={focused}/>, tabBarBadge: alerts>0?alerts:undefined }}/>
            <Tab.Screen name="Commandes" component={OrdersScreen} options={{ tabBarIcon:({focused})=><Icon label="Commandes" focused={focused}/>, tabBarBadge: pending>0?pending:undefined }}/>
            <Tab.Screen name="Retours" component={ReturnsScreen} options={{ tabBarIcon:({focused})=><Icon label="Retours" focused={focused}/> }}/>
            <Tab.Screen name="Stats" component={DashboardScreen} options={{ tabBarIcon:({focused})=><Icon label="Stats" focused={focused}/> }}/>
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
