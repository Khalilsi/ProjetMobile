/**
 * Shared UI style blocks based on the Candy Pop palette.
 * Import these in any screen instead of redefining the same patterns.
 *
 * Usage:
 *   import { shared } from '@/constants/sharedStyles';
 *   <View style={shared.card}>  /  <TouchableOpacity style={shared.primaryButton}>
 */

import { StyleSheet } from "react-native";
import { Palette } from "./palette";

export const shared = StyleSheet.create({
  // ─── Screens ───────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // ─── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Palette.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  cardBottomSheet: {
    backgroundColor: Palette.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  heading1: {
    fontSize: 32,
    fontWeight: "800",
    color: Palette.textPrimary,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  bodyText: {
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    color: Palette.placeholder,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },

  // ─── Inputs ────────────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.input,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Palette.textPrimary,
    paddingVertical: 12,
  },

  // ─── Buttons ───────────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  outlineButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // ─── Feedback banners ──────────────────────────────────────────────────────
  errorBanner: {
    backgroundColor: Palette.errorLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Palette.error,
  },
  errorBannerText: {
    color: Palette.error,
    fontSize: 14,
    fontWeight: "600",
  },

  // ─── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.divider,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: Palette.textSecondary,
    fontWeight: "600",
  },

  // ─── Footer link row ───────────────────────────────────────────────────────
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.primary,
  },
});
