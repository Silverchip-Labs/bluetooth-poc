import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default function App() {
  const [btState, setBTstate] = useState({});
  useEffect(() => {
    const scannerInterval = setInterval(handleScan, 3000);
    
    return () => {
      clearInterval(scannerInterval);
    };
  }, []);

  const devices = Object.values(btState)
    .filter(x => x.name?.toLowerCase().includes('beacon'))
    .sort((a, b) => b.rssi - a.rssi);
  const closest = devices[0];
  return (
    <View style={styles.container}>
      {!!closest &&<Text>Closest device: {closest.name || closest.id}</Text> }
      {devices.map(device => <Text key={device.id}>
        {device.name || device.id} : {rssiToSignalStrength(device.rssi)} ({device.rssi})
      </Text>)}
      <StatusBar style="auto" />
    </View>
  );


function rssiToSignalStrength (rssi) {
  if (!rssi) return 'n/a';
  if (rssi > -50) return 'strong!';
  if (rssi > -70) return 'medium!';
  if (rssi > -90) return 'weak!';
  return 'very weak!';
}

async function handleScan() {
    console.log('interval poppin');
    const manager = new BleManager({
      restoreStateFunction: (state) => ({}),
      restoreStateIdentifier: 'test'
    });
    const sub = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        // todo need uuid array for ios, mac address array for android
        const uuidArray = [];
        manager.startDeviceScan([], {
          allowDuplicates: false
        }, logDeviceScanned);
        sub.remove();
      }
    }, true)
    
    setTimeout(() => {
      manager.stopDeviceScan();
      manager.destroy();
    }, 2000)
  };

function logDeviceScanned(err, device) {
  if (err) {
    console.log('error encountered!', err);
  }
  console.log({device});
  setBTstate(state => ({...state, [device.id]: device}));
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
