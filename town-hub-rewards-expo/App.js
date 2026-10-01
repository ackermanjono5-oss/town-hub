import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// The Town Hub Rewards business web app (Next.js static export from the
// sibling town-hub-rewards project) is bundled directly into the APK under
// android/app/src/main/assets/webroot and loaded via file:///android_asset,
// so the app works fully offline with no dependency on any dev machine,
// tunnel, or server. The export was post-processed
// (scripts/relativize-export.mjs in the town-hub-rewards project) to use
// relative paths, since Next's default root-relative paths only resolve
// over HTTP.
const SITE_URL = 'file:///android_asset/webroot/index.html';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The SOS page's "Share Location" button calls navigator.geolocation
    // inside the WebView. That only succeeds if the OS-level runtime
    // permission is already granted before the WebView's location request
    // fires — without this, getCurrentPosition silently fails every time.
    // Same reasoning for CAMERA: the Scan Reward page's getUserMedia call
    // only succeeds if this runtime permission is already granted before
    // the WebView's camera request fires.
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WebView
        source={{ uri: SITE_URL }}
        startInLoadingState
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['*']}
        allowFileAccess
        allowingReadAccessToURL="file:///android_asset/"
        geolocationEnabled
        setSupportMultipleWindows
        onPermissionRequest={(event) => {
          // react-native-webview needs an explicit grant for in-page
          // getUserMedia() camera requests (the Scan Reward page) —
          // without this handler the request silently hangs even though
          // the OS-level CAMERA permission above was granted.
          event.grant(event.resources);
        }}
        onOpenWindow={(event) => {
          // window.open() (used to hand off to WhatsApp) needs an explicit
          // handler in react-native-webview, otherwise it's a silent no-op.
          Linking.openURL(event.nativeEvent.targetUrl);
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Keep navigation inside the bundled site; send everything else
          // (tel:, wa.me, maps, etc.) to the OS instead of trying to load
          // an external URL inside the offline WebView.
          if (request.url.startsWith('file://')) return true;
          Linking.openURL(request.url);
          return false;
        }}
        style={styles.webview}
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#0e7490" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e7490',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
