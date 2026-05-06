import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Palette } from "../../constants/palette";
import { shared } from "../../constants/sharedStyles";
import { useAuth } from "../../context/AuthContext";
import { apiLogin } from "../../services/authService";

// Map server messages to user-friendly text
const mapServerError = (msg: string): string => {
  if (msg.includes("Invalid email or password"))
    return "Wrong email or password. Try again.";
  if (msg.includes("required")) return "Please fill in all fields.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Can't reach the server. Check your connection.";
  return msg;
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: "email" | "password") =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await apiLogin(email.trim(), password);
      await login(data.user, data.accessToken, data.refreshToken);
      router.replace("/(tabs)");
    } catch (err: any) {
      setServerError(mapServerError(err.message || "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={shared.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={shared.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={shared.heading1}>Welcome Back!</Text>
          <Text style={[shared.bodyText, styles.centered]}>
            Log in and start breaking some records!
          </Text>
        </View>

        {/* Card */}
        <View style={shared.card}>
          {/* Server error banner */}
          {serverError !== "" && (
            <View style={shared.errorBanner}>
              <Text style={shared.errorBannerText}>⚠️ {serverError}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={shared.label}>Email</Text>
          <View
            style={[
              shared.inputWrapper,
              fieldErrors.email ? styles.inputError : null,
            ]}
          >
            <Text style={shared.inputIcon}>✉️</Text>
            <TextInput
              style={shared.input}
              placeholder="your@email.com"
              placeholderTextColor={Palette.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearFieldError("email");
              }}
            />
          </View>
          {fieldErrors.email ? (
            <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
          ) : null}

          {/* Password */}
          <Text style={shared.label}>Password</Text>
          <View
            style={[
              shared.inputWrapper,
              fieldErrors.password ? styles.inputError : null,
            ]}
          >
            <Text style={shared.inputIcon}>🔒</Text>
            <TextInput
              style={shared.input}
              placeholder="Enter your password"
              placeholderTextColor={Palette.placeholder}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                clearFieldError("password");
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "🐵"}</Text>
            </TouchableOpacity>
          </View>
          {fieldErrors.password ? (
            <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[
              shared.primaryButton,
              styles.buttonTopMargin,
              loading && shared.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Palette.white} />
            ) : (
              <Text style={shared.primaryButtonText}>LOG IN 🚀</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={shared.dividerRow}>
            <View style={shared.dividerLine} />
            <Text style={shared.dividerText}>OR</Text>
            <View style={shared.dividerLine} />
          </View>

          {/* Sign up link */}
          <View style={shared.footerRow}>
            <Text style={shared.footerText}>No account ,No games so: </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={shared.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Only screen-specific layout styles — all shared styles come from sharedStyles.ts
const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  centered: {
    textAlign: "center",
    marginTop: 6,
  },
  eyeIcon: {
    fontSize: 18,
    paddingLeft: 8,
  },
  buttonTopMargin: {
    marginTop: 28,
  },
  inputError: {
    borderColor: Palette.error,
    borderWidth: 1.5,
  },
  fieldErrorText: {
    color: Palette.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "600",
  },
});
