import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// The Sea Express web app (Next.js static export) is bundled directly into
// the APK under android/app/src/main/assets/webroot and loaded via
// file:///android_asset, so the app works fully offline with no dependency
// on any dev machine, tunnel, or server. The export was post-processed
// (scripts/relativize-export.mjs in the sea-express project) to use relative
// paths, since Next's default root-relative paths only resolve over HTTP.
const SITE_URL = 'file:///android_asset/webroot/index.html';

// Surfaces a failure as readable text instead of the blank white screen a
// WebView shows when the page never loads — without this there is nothing
// on screen (and nothing in RN's logs) to diagnose from.
const ERROR_REPORTER = `
  (function () {
    function report(kind, message) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ kind: kind, message: String(message) }));
      } catch (e) {}
    }
    window.onerror = function (msg, src, line, col) {
      report('js-error', msg + ' @ ' + src + ':' + line + ':' + col);
    };
    // A rejection reason is often an Event (a failed image, script or
    // socket), and String(Event) is the useless "[object Event]". Pull out
    // whatever actually identifies it before reporting.
    function describe(reason) {
      if (!reason) return 'unknown';
      if (typeof reason === 'string') return reason;
      if (reason.message) return reason.name ? reason.name + ': ' + reason.message : reason.message;
      if (reason.type) {
        var t = reason.target || {};
        return 'event ' + reason.type + (t.src || t.href ? ' for ' + (t.src || t.href) : '');
      }
      try { return JSON.stringify(reason); } catch (e) { return String(reason); }
    }
    window.addEventListener('unhandledrejection', function (e) {
      report('promise-rejection', describe(e && e.reason));
    });
    document.addEventListener('DOMContentLoaded', function () {
      report('dom-ready', document.title + ' | body chars: ' + (document.body ? document.body.innerText.length : -1));
    });
  })();
  true;
`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  // Ref, not state: the onMessage handler must read the current value
  // without the WebView re-rendering on every reported message.
  const domReady = useRef(false);
  const webviewRef = useRef(null);
  // A sign-in link that arrived before the page finished loading.
  const pendingAuth = useRef(null);

  // Google sign-in and emailed sign-in links finish in the phone's browser
  // and come back as townhub://auth/callback#access_token=… (registered in
  // AndroidManifest.xml). The page's AuthCallbackBridge turns that into a
  // session; it's also left in a global in case the page hasn't mounted yet.
  const deliverAuth = (url) => {
    const js = `window.__townhubPendingAuth = ${JSON.stringify(url)};
      window.__townhubAuthCallback && window.__townhubAuthCallback(${JSON.stringify(url)});
      true;`;
    webviewRef.current?.injectJavaScript(js);
  };

  useEffect(() => {
    const receive = (url) => {
      if (!url || !url.startsWith('townhub://auth')) return;
      if (domReady.current) deliverAuth(url);
      else pendingAuth.current = url;
    };
    // A link that started the app from closed is delivered on dom-ready.
    Linking.getInitialURL().then(receive);
    const sub = Linking.addEventListener('url', ({ url }) => receive(url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Both of these must be granted before the WebView asks for them, not
    // after, because the WebView gives up silently rather than prompting.
    //
    //  ACCESS_FINE_LOCATION — the SOS page's "Share Location" button calls
    //  navigator.geolocation; without the OS permission already in place,
    //  getCurrentPosition fails every time with no error the page can show.
    //
    //  CAMERA — the profile page's "Take photo" button is an
    //  <input type="file" capture>. react-native-webview only offers the
    //  camera in its file chooser when CAMERA is BOTH declared in the
    //  manifest AND granted. Declaring it without requesting it is worse
    //  than not declaring it at all: an undeclared permission lets the
    //  camera app handle capture under its own permission, while a declared
    //  but ungranted one makes the chooser drop the camera option entirely.
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WebView
        ref={webviewRef}
        source={{ uri: SITE_URL }}
        startInLoadingState
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['*']}
        allowFileAccess
        // allowingReadAccessToURL is iOS-only. On Android the bundled page
        // is a file:// origin, and Next's client-side navigation fetches
        // its RSC payloads (the .txt files next to each .html) with fetch()
        // — which Android blocks from a file:// page unless these two are on.
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowingReadAccessToURL="file:///android_asset/"
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        injectedJavaScriptBeforeContentLoaded={ERROR_REPORTER}
        onMessage={(event) => {
          const raw = event.nativeEvent.data;
          try {
            const payload = JSON.parse(raw);
            if (payload.kind === 'dom-ready') {
              domReady.current = true;
              if (pendingAuth.current) {
                deliverAuth(pendingAuth.current);
                pendingAuth.current = null;
              }
              return;
            }
            // Once the page is up, a stray script error or rejected promise
            // (a failed image, an offline Supabase call) is not worth
            // replacing a working app with a full-screen failure. Only
            // failures before DOMContentLoaded mean the page never came up,
            // which is the case this panel exists for.
            if (domReady.current) {
              console.warn(`[webview] ${payload.kind}: ${payload.message}`);
              return;
            }
            setProblem(`${payload.kind}: ${payload.message}`);
          } catch {
            // Non-JSON messages come from page code, not the reporter.
          }
        }}
        onError={(event) => setProblem(`load error: ${event.nativeEvent.description}`)}
        onHttpError={(event) =>
          setProblem(`http ${event.nativeEvent.statusCode} for ${event.nativeEvent.url}`)
        }
        onRenderProcessGone={() => setProblem('the WebView render process was killed')}
        geolocationEnabled
        setSupportMultipleWindows
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
          // about:blank and data: are loaded by the WebView itself (Android
          // does it during start-up and for window.open shims). Handing
          // those to the OS blocks the load and leaves a blank screen.
          if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
          Linking.openURL(request.url);
          return false;
        }}
        style={styles.webview}
      />
      {loading && !problem && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#0e7490" />
        </View>
      )}
      {problem && (
        <View style={styles.problem}>
          <Text style={styles.problemTitle}>Couldn&apos;t load the app</Text>
          <Text style={styles.problemText}>{problem}</Text>
          <Text style={styles.problemHint}>
            Screenshot this and send it back — it says exactly what failed.
          </Text>
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
  problem: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0e7490',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  problemTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  problemText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  problemHint: {
    color: '#bae6fd',
    fontSize: 12,
    textAlign: 'center',
  },
});
