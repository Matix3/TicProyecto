import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";

interface Props {
  visible: boolean;
  closeModal: () => void;
  devices: Device[];
  connectToPeripheral: (device: Device) => void;
}

const DeviceModal = ({
  visible,
  closeModal,
  devices,
  connectToPeripheral,
}: Props) => {
  const handleDevicePress = (device: Device) => {
    connectToPeripheral(device);
    closeModal();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Available Devices</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => handleDevicePress(item)}
              >
                <Text style={styles.deviceText}>{item.name || "Unnamed Device"}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  deviceButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  deviceText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DeviceModal;