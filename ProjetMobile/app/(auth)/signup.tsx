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
import { apiSignup } from "../../services/authService";

// Map server messages to user-friendly text
const mapServerError = (msg: string): string => {
  if (msg.includes("username is already taken"))
    return "This username is taken. Pick another one.";
  if (msg.includes("email is already taken"))
    return "An account with this email already exists.";
  if (msg.includes("required")) return "Please fill in all fields.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Can't reach the server. Check your connection.";
  return msg;
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!username.trim()) {
      errors.username = "Username is required.";
    } else if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (username.trim().length > 30) {
      errors.username = "Username can't exceed 30 characters.";
    }
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await apiSignup(username.trim(), email.trim(), password);
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
          <Text style={styles.emoji}>🍭</Text>
          <Text style={shared.heading1}>Join the Fun!</Text>
          <Text style={[shared.bodyText, styles.centered]}>
            Join now and start your gaming journey!
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

          {/* Username */}
          <Text style={shared.label}>Username</Text>
          <View
            style={[
              shared.inputWrapper,
              fieldErrors.username ? styles.inputError : null,
            ]}
          >
            <Text style={shared.inputIcon}>🎮</Text>
            <TextInput
              style={shared.input}
              placeholder="Choose a cool nickname"
              placeholderTextColor={Palette.placeholder}
              autoCapitalize="none"
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                clearFieldError("username");
              }}
            />
          </View>
          {fieldErrors.username ? (
            <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
          ) : null}

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
              placeholder="At least 6 characters"
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

          {/* Confirm password */}
          <Text style={shared.label}>Confirm Password</Text>
          <View
            style={[
              shared.inputWrapper,
              fieldErrors.confirmPassword ? styles.inputError : null,
            ]}
          >
            <Text style={shared.inputIcon}>🔑</Text>
            <TextInput
              style={shared.input}
              placeholder="Repeat your password"
              placeholderTextColor={Palette.placeholder}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                clearFieldError("confirmPassword");
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
              <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "🐵"}</Text>
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={styles.fieldErrorText}>
              {fieldErrors.confirmPassword}
            </Text>
          ) : null}

          {/* Password strength hint */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        password.length >= level * 3
                          ? level <= 1
                            ? Palette.error
                            : level === 2
                              ? "#FFA500"
                              : level === 3
                                ? Palette.accent
                                : Palette.success
                          : Palette.divider,
                    },
                  ]}
                />
              ))}
              <Text style={styles.strengthLabel}>
                {password.length < 4
                  ? "Weak"
                  : password.length < 7
                    ? "Fair"
                    : password.length < 10
                      ? "Good"
                      : "Strong 💪"}
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[
              shared.primaryButton,
              styles.buttonTopMargin,
              loading && shared.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Palette.white} />
            ) : (
              <Text style={shared.primaryButtonText}>CREATE ACCOUNT 🎉</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={shared.dividerRow}>
            <View style={shared.dividerLine} />
            <Text style={shared.dividerText}>OR</Text>
            <View style={shared.dividerLine} />
          </View>

          {/* Login link */}
          <View style={shared.footerRow}>
            <Text style={shared.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={shared.footerLink}>Log In</Text>
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
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: "600",
    marginLeft: 4,
  },
});
