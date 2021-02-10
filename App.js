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
  const isOffice = closest?.name?.toLowerCase().includes('office');
  return (
    <View style={styles.container}>
      <View>
      {!!closest &&<Text style={{fontSize: 40, fontWeight: '400', textAlign: 'center'}}>Detected Room</Text> }
      {!!closest &&<Text style={{fontSize: 40, fontWeight: '200', textAlign: 'center'}}>{closest.name || closest.id}</Text> }
      </View>
      <View>
      <View style={{backgroundColor: isOffice ? 'lightpink' : 'white', height: 300, width: 200,  borderStyle: 'solid', borderColor: 'black', borderWidth: 2}}>
        <Text style={{color: 'black', textAlign: 'center', marginVertical: 75, fontSize: 50, fontWeight: '200'}}>
          Office
        </Text>
        <View style={{backgroundColor: 'red', height: 2, width: 30, marginLeft: 150, position: 'absolute', bottom: 0}}></View>
      </View>
      <View style={{backgroundColor: !isOffice ? 'lightpink' :'white', height: 150, width: 200, borderStyle: 'solid', borderColor: 'black', borderWidth: 2}}>
        <View style={{backgroundColor: 'red', height: 2, width: 30, marginLeft: 150}}></View>
        <Text style={{color: 'black', textAlign: 'center', marginVertical: 30, fontSize: 50, fontWeight: '200'}}>
          Meeting
        </Text>
      </View>
      </View>
      <View>
      <Text style={{fontWeight: '500', fontSize: 20, textAlign: 'center', marginBottom: 10}}>Nearby rooms</Text>
      {devices.slice(1).map(device => <Text key={device.id} style={{fontWeight: '200', textAlign: 'justify', fontSize: 18}}>
        {device.name || device.id} 
      </Text>)}
      </View>
      <StatusBar style="auto" />
    </View>
  );


function rssiToSignalStrength (rssi) {
  if (!rssi) return 'n/a';
  if (rssi > -50) return 'strong';
  if (rssi > -70) return 'medium';
  if (rssi > -90) return 'weak';
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
    justifyContent: 'space-between',
    marginVertical: 100
  },
});
