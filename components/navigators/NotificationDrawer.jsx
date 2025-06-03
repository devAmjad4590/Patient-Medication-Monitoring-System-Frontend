import React, { useEffect, useState, useCallback } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import PrimaryDrawer from '../navigators/PrimaryDrawer';
import { View, Text, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import NotificationCard from './NotificationCard';
import { Button } from 'react-native-ui-lib';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../NotificationContext'; // Import the context

const RightDrawer = createDrawerNavigator();

function NotificationDrawer() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  
  // Use the context instead of local state
  const { 
    notifications, 
    isLoading, 
    loadNotifications, 
    clearAllNotifications 
  } = useNotifications();

  useEffect(() => {
    const unsubscribe = navigation.addListener('drawerOpen', () => {
      loadNotifications();
    });
    return unsubscribe;
  }, [navigation, loadNotifications]);

  function handleClearAll() {
    console.log("Clear all notifications");
    clearAllNotifications();
  }

  // Load notifications on initial mount
  useEffect(() => {
    console.log("NotificationDrawer mounted, loading notifications");
    loadNotifications();
  }, [loadNotifications]);

  // Manual refresh for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // Helper function to extract notification data from the stored format
  const getNotificationData = (notification) => {
    // Handle different notification formats
    if (notification.request && notification.request.content) {
      // Expo notification format
      return {
        id: notification.request.identifier || notification.identifier || Math.random().toString(),
        title: notification.request.content.title || 'Notification',
        body: notification.request.content.body || '',
        date: notification.date || notification.timestamp
      };
    } else if (notification.notification) {
      // Another possible format
      return {
        id: notification.identifier || Math.random().toString(),
        title: notification.notification.title || 'Notification',
        body: notification.notification.body || '',
        date: notification.date || notification.timestamp
      };
    } else {
      // Direct format or fallback
      return {
        id: notification.id || notification.identifier || Math.random().toString(),
        title: notification.title || 'Notification',
        body: notification.body || notification.message || '',
        date: notification.date || notification.timestamp
      };
    }
  };

  // Custom drawer content component
  const DrawerContent = (props) => {
    if (isLoading) {
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading notifications...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: 30 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 22,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 20
            }}>
              Notifications
            </Text>

            {(!notifications || notifications.length === 0) && !isLoading && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{
                  fontSize: 16,
                  textAlign: 'center',
                  color: '#888'
                }}>
                  No notifications available
                </Text>
              </View>
            )}

            <ScrollView
              style={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2F7EF5']}
                  tintColor="#2F7EF5"
                />
              }
            >
              {notifications && notifications.map((notification) => {
                const notificationData = getNotificationData(notification);
                return (
                  <NotificationCard
                    key={notificationData.id}
                    title={notificationData.title}
                    message={notificationData.body}
                  />
                );
              })}
            </ScrollView>
          </View>

          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: 20
          }}>
            <View style={{ width: 200, borderRadius: 30 }}>
              <Button
                onPress={() => {
                  handleClearAll();
                  props.navigation.closeDrawer();
                }}
                label="Clear All"
                style={{ marginBottom: 10 }}
                backgroundColor="#FDFDFD"
                labelStyle={{
                  color: "black",
                  fontSize: 16,
                  fontWeight: '600'
                }}
                outlineColor="black"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: '#fff',
        },
      }}
      drawerContent={DrawerContent}
    >
      <RightDrawer.Screen name="MainApp" component={PrimaryDrawer} />
    </RightDrawer.Navigator>
  );
}

export default NotificationDrawer;