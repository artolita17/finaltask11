import React, { useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

// Background fetch task 
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background fetch task executed');
    return BackgroundFetch.Result.NewData;   
  } catch (error) { 
    console.log('Background fetch failed:', error);
    return BackgroundFetch.Result.Failed;
  }
});

const registerBackgroundTask = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60, // every 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
};

const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission not granted for notifications');
    return;
  }
  console.log('Notification permissions granted!');
};

const scheduleNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got a new message!",
      body: 'Check your inbox.',
      data: { screen: 'Messages' },
    },
    trigger: { seconds: 2 },
  });
};

export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
    registerBackgroundTask();

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Add notification response listener
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen } = response.notification.request.content.data;
      console.log(`User tapped on notification, navigating to ${screen}`);
      // Example navigation: navigation.navigate(screen);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Schedule Notification" onPress={scheduleNotification} />
      <Text>Background Task Registered</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 100, // Add margin here
  },
});
