import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { viewDocument } from '@react-native-documents/viewer';

const App = () => {
  const [fileURI, setFileURI] = useState<string | null>(null);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    requestStoragePermission();
  }, []);

  const pickFile = async () => {
    try {
      const [pickerResponse] = await pick({
        type: [types.allFiles], 
        allowMultiSelection: false,
      });

      if (!pickerResponse?.uri) {
        console.error('No file selected.');
        return;
      }

      // Store the file locally
      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: pickerResponse.uri,
            fileName: pickerResponse.name ?? 'document.xlsx',
          },
        ],
        destination: 'documentDirectory',
      });

      console.log('Picked file:', pickerResponse);
      console.log('Local copy URI:', localCopy.sourceUri);
      setFileURI(localCopy.sourceUri);
    } catch (err) {
      console.log('Error picking file:', err);
    }
  };

  const openFile = async () => {
    if (!fileURI) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    console.log('Opening file:', fileURI);

    try {
      await viewDocument({
        uri: fileURI,
        grantPermissions: 'read',
        headerTitle: 'Document Viewer',
        presentationStyle: 'fullScreen',
      });
      console.log('File opened successfully');
    } catch (error) {
      console.log('Error opening file:', error);
      Alert.alert('Error', 'Failed to open the file');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>React Native Document Viewer Test</Text>
      <Button title="Pick a File" onPress={pickFile} />
      <Button title="Open File" onPress={openFile} disabled={!fileURI} />
    </View>
  );
};


export default App;