import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { apiUpdateUsername, apiUpdatePassword } from "@/services/authService";
import { Palette } from "@/constants/palette";

export default function ProfileScreen() {
  const { user, accessToken, logout, updateUser } = useAuth();

  const initials = (user?.username ?? "?").slice(0, 2).toUpperCase();

  // ─── Update Profile modal state ───────────────────────────────────────────
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username ?? "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  // ─── Change Password modal state ──────────────────────────────────────────
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleUpdateUsername = async () => {
    if (!accessToken) return;
    setUsernameError(null);
    setUsernameSuccess(false);
    setUsernameLoading(true);
    try {
      const updatedUser = await apiUpdateUsername(accessToken, newUsername);
      await updateUser(updatedUser);
      setUsernameSuccess(true);
    } catch (e: any) {
      setUsernameError(e.message);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!accessToken) return;
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await apiUpdatePassword(accessToken, currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/landing");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* ─── Menu rows ──────────────────────────────────────────────── */}
      <View style={styles.body}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            setUsernameError(null);
            setUsernameSuccess(false);
            setNewUsername(user?.username ?? "");
            setShowUpdateProfile(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>Update Profile</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            setPasswordError(null);
            setPasswordSuccess(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowChangePassword(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.rowText}>Change password</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Logout ─────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Update Profile Modal ───────────────────────────────────── */}
      <Modal
        visible={showUpdateProfile}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUpdateProfile(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Update Profile</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={(t) => {
                setNewUsername(t);
                setUsernameError(null);
                setUsernameSuccess(false);
              }}
              autoCapitalize="none"
              placeholder="New username"
              placeholderTextColor={Palette.placeholder}
            />

            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
            {usernameSuccess ? (
              <Text style={styles.successText}>Username updated!</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.saveBtn, usernameLoading && styles.btnDisabled]}
              onPress={handleUpdateUsername}
              disabled={usernameLoading}
            >
              {usernameLoading ? (
                <ActivityIndicator color={Palette.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowUpdateProfile(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Change Password Modal ──────────────────────────────────── */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChangePassword(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.label}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={(t) => {
                setCurrentPassword(t);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={Palette.placeholder}
            />

            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={Palette.placeholder}
            />

            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={Palette.placeholder}
            />

            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            {passwordSuccess ? (
              <Text style={styles.successText}>Password updated!</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.saveBtn, passwordLoading && styles.btnDisabled]}
              onPress={handleUpdatePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color={Palette.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowChangePassword(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const HEADER_HEIGHT = 180;
const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: AVATAR_SIZE / 2,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    // Overlap the header bottom edge
    position: "absolute",
    bottom: -(AVATAR_SIZE / 2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: Palette.primary,
    fontSize: 32,
    fontWeight: "800",
  },

  // ─── Body ─────────────────────────────────────────────────────────────────
  body: {
    marginTop: AVATAR_SIZE / 2 + 24,
    backgroundColor: Palette.white,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  rowText: {
    fontSize: 16,
    color: Palette.textPrimary,
    fontWeight: "500",
  },
  chevron: {
    fontSize: 22,
    color: Palette.placeholder,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.divider,
    marginHorizontal: 20,
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  logoutBtn: {
    borderWidth: 2,
    borderColor: Palette.primary,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  // ─── Modals ───────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textSecondary,
    marginBottom: -4,
  },
  input: {
    backgroundColor: Palette.input,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Palette.textPrimary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  saveBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnText: {
    color: Palette.white,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    padding: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: Palette.textSecondary,
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
  },
  successText: {
    color: Palette.success,
    fontSize: 13,
    fontWeight: "600",
  },
});
