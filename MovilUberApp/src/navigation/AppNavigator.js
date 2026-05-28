import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LoginScreen from '../screens/LoginScreen';
import CreateUserScreen from '../screens/CreateUserScreen';
import HomeScreen from '../screens/HomeScreen';
import ServiceUberScreen from '../screens/ServiceUberScreen';
import ConfigUserScreen from '../screens/ConfigUserScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PaymentScreen from '../screens/PaymentScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#111',
        borderTopColor: '#1A1A1A',
        borderTopWidth: 1,
        height: 68,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#FFC61A',
      tabBarInactiveTintColor: '#444',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ color, size }) => <Icon name="home-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Service"
      component={ServiceUberScreen}
      options={{
        tabBarLabel: () => null,
        tabBarIcon: ({ focused }) => (
          <View style={{
            width: 52, height: 52, borderRadius: 18, marginBottom: 4,
            backgroundColor: focused ? '#FFC61A' : '#1A1A1A',
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#FFC61A', shadowOpacity: focused ? 0.4 : 0,
            shadowRadius: 8, elevation: focused ? 8 : 0,
          }}>
            <Icon name="car-outline" size={24} color={focused ? '#000' : '#444'} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Config"
      component={ConfigUserScreen}
      options={{
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ color, size }) => <Icon name="account-outline" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;