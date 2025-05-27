import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useBLE from "./useBLE";
import DeviceModal from "./DeviceModal";
import { enviarLog } from "./service"; 

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
      setIsModalVisible(true);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusWrapper}>
        <Text style={[styles.statusText, {paddingTop: 20}]}>
          {connectedDevice
            ? `Conectado a: ${connectedDevice.name}`
            : "No conectado"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : scanForDevices}
        style={[styles.ctaButton, !connectedDevice && styles.fullscreenButton]}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Desconectar" : "Conectar"}
        </Text>
      </TouchableOpacity>

      <DeviceModal
        closeModal={() => setIsModalVisible(false)}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  statusWrapper: {
    padding: 20,
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  ctaButton: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  fullscreenButton: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default App;