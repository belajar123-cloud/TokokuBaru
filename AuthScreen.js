import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

// iOS Simulator:
const API_URL = "http://localhost:3000/api";

// Untuk HP fisik, ganti localhost dengan IP Mac:
// const API_URL = "http://192.168.1.2:3000/api";

export default function AuthScreen({
  onAuthenticated,
}) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.email.trim() || !form.password) {
      Alert.alert(
        "Data belum lengkap",
        "Email dan password wajib diisi."
      );

      return false;
    }

    if (!form.email.includes("@")) {
      Alert.alert(
        "Email tidak valid",
        "Masukkan alamat email yang benar."
      );

      return false;
    }

    if (form.password.length < 8) {
      Alert.alert(
        "Password terlalu pendek",
        "Password minimal terdiri dari 8 karakter."
      );

      return false;
    }

    if (mode === "register") {
      if (
        !form.name.trim() ||
        !form.phone.trim() ||
        !form.address.trim()
      ) {
        Alert.alert(
          "Data belum lengkap",
          "Nama, nomor telepon, dan alamat wajib diisi."
        );

        return false;
      }

      if (form.password !== form.confirmPassword) {
        Alert.alert(
          "Password berbeda",
          "Konfirmasi password tidak sesuai."
        );

        return false;
      }
    }

    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/register";

      const body =
        mode === "login"
          ? {
              email: form.email.trim().toLowerCase(),
              password: form.password,
            }
          : {
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              phone: form.phone.trim(),
              address: form.address.trim(),
              password: form.password,
            };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Proses autentikasi gagal."
        );
      }

      if (data.user.role !== "customer") {
        throw new Error(
          "Akun admin tidak dapat masuk melalui aplikasi pelanggan."
        );
      }

      await SecureStore.setItemAsync(
        "tokoku_token",
        data.token
      );

      await SecureStore.setItemAsync(
        "tokoku_user",
        JSON.stringify(data.user)
      );

      Alert.alert(
        "Berhasil",
        mode === "login"
          ? "Login berhasil."
          : "Akun berhasil dibuat."
      );

      onAuthenticated(data.user);
    } catch (error) {
      Alert.alert(
        "Tidak berhasil",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = () => {
    setMode((currentMode) =>
      currentMode === "login"
        ? "register"
        : "login"
    );

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logo}>
            <Ionicons
              name="storefront"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.brand}>TokoKu</Text>

          <Text style={styles.title}>
            {mode === "login"
              ? "Selamat datang kembali"
              : "Buat akun pelanggan"}
          </Text>

          <Text style={styles.description}>
            {mode === "login"
              ? "Masuk untuk melanjutkan aktivitas belanja Anda."
              : "Daftar untuk mulai berbelanja dan memantau pesanan."}
          </Text>

          <View style={styles.formCard}>
            {mode === "register" && (
              <>
                <InputField
                  label="Nama lengkap"
                  icon="person-outline"
                  value={form.name}
                  onChangeText={(value) =>
                    updateForm("name", value)
                  }
                  placeholder="Masukkan nama lengkap"
                  autoCapitalize="words"
                />

                <InputField
                  label="Nomor telepon"
                  icon="call-outline"
                  value={form.phone}
                  onChangeText={(value) =>
                    updateForm("phone", value)
                  }
                  placeholder="Contoh: 081234567890"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <InputField
              label="Alamat email"
              icon="mail-outline"
              value={form.email}
              onChangeText={(value) =>
                updateForm("email", value)
              }
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {mode === "register" && (
              <InputField
                label="Alamat pengiriman"
                icon="location-outline"
                value={form.address}
                onChangeText={(value) =>
                  updateForm("address", value)
                }
                placeholder="Masukkan alamat lengkap"
                multiline
              />
            )}

            <Text style={styles.inputLabel}>
              Password
            </Text>

            <View style={styles.passwordContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                value={form.password}
                onChangeText={(value) =>
                  updateForm("password", value)
                }
                placeholder="Minimal 8 karakter"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(
                    (currentValue) => !currentValue
                  )
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color="#64748B"
                />
              </Pressable>
            </View>

            {mode === "register" && (
              <InputField
                label="Konfirmasi password"
                icon="shield-checkmark-outline"
                value={form.confirmPassword}
                onChangeText={(value) =>
                  updateForm(
                    "confirmPassword",
                    value
                  )
                }
                placeholder="Ketik ulang password"
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            {mode === "login" && (
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Lupa Password",
                    "Fitur reset password akan dibuat pada tahap berikutnya."
                  )
                }
              >
                <Text style={styles.forgotPassword}>
                  Lupa password?
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={submit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {mode === "login"
                      ? "Masuk"
                      : "Buat Akun"}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.changeModeContainer}>
            <Text style={styles.changeModeLabel}>
              {mode === "login"
                ? "Belum memiliki akun?"
                : "Sudah memiliki akun?"}
            </Text>

            <Pressable onPress={changeMode}>
              <Text style={styles.changeModeButton}>
                {mode === "login"
                  ? " Buat akun"
                  : " Masuk"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.securityInformation}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#10B981"
            />

            <Text style={styles.securityText}>
              Informasi akun disimpan secara aman.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  icon,
  multiline,
  ...properties
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#64748B"
        />

        <TextInput
          {...properties}
          multiline={multiline}
          placeholderTextColor="#94A3B8"
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 35,
    alignItems: "center",
  },

  logo: {
    width: 74,
    height: 74,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  title: {
    marginTop: 22,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
  },

  description: {
    maxWidth: 330,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#64748B",
  },

  formCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  inputContainer: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  multilineContainer: {
    minHeight: 90,
    alignItems: "flex-start",
    paddingTop: 15,
  },

  multilineInput: {
    minHeight: 65,
    textAlignVertical: "top",
  },

  passwordContainer: {
    minHeight: 52,
    marginBottom: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  forgotPassword: {
    marginBottom: 18,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.65,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  changeModeContainer: {
    marginTop: 22,
    flexDirection: "row",
  },

  changeModeLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  changeModeButton: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },

  securityInformation: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  securityText: {
    marginLeft: 7,
    fontSize: 11,
    color: "#64748B",
  },
});