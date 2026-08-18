# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor Plugin & Bridge preservation
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.Bridge { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.** { *; }
-keep class app.lichviet.calendar.** { *; }

# WebView JavaScript Interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep line numbers for stack traces
-keepattributes SourceFile,LineNumberTable

