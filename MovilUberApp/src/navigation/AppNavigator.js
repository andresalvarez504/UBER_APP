import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import CreateUserScreen from '../screens/CreateUserScreen';
import HomeScreen from '../screens/HomeScreen';
import ServiceUberScreen from '../screens/ServiceUberScreen';
import ConfigUserScreen from '../screens/ConfigUserScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, label, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#111',
        borderTopColor: '#1A1A1A',
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#FFC61A',
      tabBarInactiveTintColor: '#555',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Service"
      component={ServiceUberScreen}
      options={{
        tabBarLabel: 'Viaje',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Config"
      component={ConfigUserScreen}
      options={{
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateUser" component={CreateUserScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;