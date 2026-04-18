import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStockStore } from './src/store/stockStore';
import { COLORS } from './src/utils/theme';

import ScannerScreen from './src/screens/ScannerScreen';
import StockScreen from './src/screens/StockScreen';
import { OrdersScreen, ReturnsScreen, SuppliersScreen, DashboardScreen } from './src/screens/OtherScreens';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <View style={focused ? iconStyle.activeWrap : iconStyle.wrap}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
      </View>
      {badge && badge > 0 ? (
        <View style={iconStyle.badge}>
          <Text style={iconStyle.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const iconStyle = StyleSheet.create({
  wrap: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  activeWrap: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, borderRadius: 15 },
  badge: { position: 'absolute', top: -2, right: -6, backgroundColor: '#E24B4A', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '700' },
});

export default function App() {
  const { orders, getLowStockProducts, getOutOfStockProducts, returns } = useStockStore();
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const stockAlerts = getLowStockProducts().length + getOutOfStockProducts().length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.white,
                borderTopWidth: 0.5,
                borderTopColor: '#E5E7EB',
                paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                paddingTop: 8,
                height: Platform.OS === 'ios' ? 82 : 64,
              },
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: '#9CA3AF',
              tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
            }}>
            <Tab.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{
                tabBarLabel: 'Scanner',
                tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Stock"
              component={StockScreen}
              options={{
                tabBarLabel: 'Stock',
                tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} badge={stockAlerts} />,
              }}
            />
            <Tab.Screen
              name="Commandes"
              component={OrdersScreen}
              options={{
                tabBarLabel: 'Commandes',
                tabBarIcon: ({ focused }) => <TabIcon emoji="🛍" focused={focused} badge={pendingOrders} />,
              }}
            />
            <Tab.Screen
              name="Retours"
              component={ReturnsScreen}
              options={{
                tabBarLabel: 'Retours',
                tabBarIcon: ({ focused }) => <TabIcon emoji="↩️" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Fournisseurs"
              component={SuppliersScreen}
              options={{
                tabBarLabel: 'Fourniss.',
                tabBarIcon: ({ focused }) => <TabIcon emoji="🏭" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
