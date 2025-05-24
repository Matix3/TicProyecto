import { useMemo, useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleManager,
  Device,
  Characteristic,
  BleError,
} from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import base64 from "react-native-base64";

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

function useBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [lastConnectedDeviceId, setLastConnectedDeviceId] = useState<string | null>(null);

  const requestAndroidPermissions = async () => {
    const permissions = await Promise.all([
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT),
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
    ]);

    return permissions.every(p => p === "granted");
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      return (ExpoDevice.platformApiLevel ?? 0) < 31
        ? PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            .then(result => result === PermissionsAndroid.RESULTS.GRANTED)
        : await requestAndroidPermissions();
    }
    return true;
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        return;
      }

      if (device?.name) {
        setAllDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          return exists ? prev : [...prev, device];
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connected = await bleManager.connectToDevice(device.id);
      setConnectedDevice(connected);
      setLastConnectedDeviceId(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startDataStreaming(connected);
    } catch (error) {
      console.log("Connection failed:", error);
    }
  };

  const startDataStreaming = (device: Device) => {
    device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
          console.log("Monitor error:", error);
          return;
        }
        if (characteristic?.value) {
          const decoded = base64.decode(characteristic.value);
          setMessageLog(prev => [...prev, decoded]);
        }
      }
    );
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
      } catch (error) {
        console.log("Disconnection error:", error);
      }
    }
  };

  // Reintento de reconexión automático
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (!connectedDevice && lastConnectedDeviceId) {
        bleManager.devices([lastConnectedDeviceId]).then(devices => {
          if (devices.length > 0) {
            connectToDevice(devices[0]);
          }
        });
      }
    }, 5000);

    return () => clearInterval(reconnectInterval);
  }, [connectedDevice]);

  return {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    disconnectFromDevice,
    connectedDevice,
    allDevices,
    messageLog,
  };
}
export default useBLE;
