import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// iOS Simulator dapat memakai localhost. Untuk HP fisik, ganti localhost
// dengan IP LAN Mac, misalnya: http://192.168.1.2:3000/api
const API_URL = "http://localhost:3000/api";

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF6FF",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
};

const PRODUCTS = [
  {
    id: "1",
    name: "Nike Air Max Sneakers",
    category: "Sepatu",
    price: 350000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "2",
    name: "Urban Travel Backpack",
    category: "Tas",
    price: 275000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "3",
    name: "Classic Smart Watch",
    category: "Aksesori",
    price: 425000,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "4",
    name: "Premium Sunglasses",
    category: "Aksesori",
    price: 185000,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "5",
    name: "Essential Cotton T-Shirt",
    category: "Fashion",
    price: 125000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "6",
    name: "Wireless Headphone Pro",
    category: "Elektronik",
    price: 395000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "7",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    price: 550000,
    rating: 4.8,
    image:
      "https://www.armitagephoto.com/wp-content/uploads/2021/06/furniture-photography-scaled.jpg",
  },
  {
    id: "8",
    name: "Set Ruang Tamu Modern",
    category: "Set Furniture",
    price: 4250000,
    oldPrice: 4850000,
    rating: 4.9,
    stock: 5,
    image:
      "https://images.squarespace-cdn.com/content/v1/60de40913d5a95021c9fb2ee/1629831197762-CV91FYQFO4GMUKMYM5D4/MDP_20210626_6728.jpg",
  },
  {
    id: "9",
    name: "Sofa Minimalis Modern",
    category: "Sofa",
    price: 2395000,
    oldPrice: 2750000,
    rating: 4.9,
    stock: 10,
    image:
      "https://cdn.shopify.com/s/files/1/0070/7032/files/4minimalist.jpg?v=1764272087",
  },
  {
    id: "10",
    name: "Meja dan Kursi Minimalis",
    category: "Set Furniture",
    price: 1850000,
    oldPrice: 2200000,
    rating: 4.7,
    stock: 7,
    image:
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/3207e855522009.598865796edd0.jpg",
  },
];

const PAYMENT_METHODS = [
  {
    id: "gopay",
    name: "GoPay",
    icon: "wallet-outline",
  },
  {
    id: "bca",
    name: "Virtual Account BCA",
    icon: "business-outline",
  },
  {
    id: "qris",
    name: "QRIS",
    icon: "qr-code-outline",
  },
  {
    id: "cod",
    name: "Bayar di Tempat (COD)",
    icon: "cash-outline",
  },
  {
    id: "SpayLater",
    name: "SpayLater",
    icon: "card-outline",
  },
];

const INITIAL_ORDERS = [
  {
    id: "TRX-240801",
    date: "1 Agustus 2026, 10.30",
    status: "Selesai",
    paymentStatus: "Lunas",
    paymentMethod: "GoPay",
    total: 365000,
    address: "Jl. Meruya Utara No. 10, Jakarta Barat",
    items: [
      {
        ...PRODUCTS[0],
        quantity: 1,
      },
    ],
  },
];

const formatRupiah = (value) => {
  return `Rp${Number(value).toLocaleString("id-ID")}`;
};

function AuthInput({ label, icon, multiline = false, right, ...props }) {
  return (
    <View style={styles.authInputGroup}>
      <Text style={styles.authInputLabel}>{label}</Text>
      <View
        style={[
          styles.authInputContainer,
          multiline && styles.authInputContainerMultiline,
        ]}
      >
        <Ionicons name={icon} size={20} color={COLORS.muted} />
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor="#94A3B8"
          style={[styles.authInput, multiline && styles.authInputMultiline]}
        />
        {right}
      </View>
    </View>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changeMode = () => {
    setMode((current) => (current === "login" ? "register" : "login"));
    setShowPassword(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    });
  };

  const validate = () => {
    if (!form.email.trim() || !form.password) {
      Alert.alert("Data belum lengkap", "Email dan password wajib diisi.");
      return false;
    }
    if (!form.email.includes("@")) {
      Alert.alert("Email tidak valid", "Masukkan alamat email yang benar.");
      return false;
    }
    if (form.password.length < 8) {
      Alert.alert("Password terlalu pendek", "Password minimal 8 karakter.");
      return false;
    }
    if (mode === "register") {
      if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
        Alert.alert(
          "Data belum lengkap",
          "Nama, telepon, dan alamat pengiriman wajib diisi.",
        );
        return false;
      }
      if (form.password !== form.confirmPassword) {
        Alert.alert("Password berbeda", "Konfirmasi password tidak sesuai.");
        return false;
      }
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const isLogin = mode === "login";
      const response = await fetch(
        `${API_URL}${isLogin ? "/auth/login" : "/auth/register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin
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
                },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Autentikasi gagal.");
      }
      if (data.user.role !== "customer") {
        throw new Error("Akun admin harus masuk melalui dashboard admin.");
      }
      await SecureStore.setItemAsync("tokoku_token", data.token);
      const profileResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const completeUser = profileResponse.ok
        ? await profileResponse.json()
        : data.user;
      await SecureStore.setItemAsync(
        "tokoku_user",
        JSON.stringify(completeUser),
      );
      onAuthenticated(completeUser);
    } catch (error) {
      Alert.alert("Tidak berhasil", error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordToggle = (
    <Pressable onPress={() => setShowPassword((value) => !value)}>
      <Ionicons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={21}
        color={COLORS.muted}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.authScreen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authLogo}>
            <Ionicons name="storefront" size={37} color={COLORS.white} />
          </View>
          <Text style={styles.authBrand}>TokoKu Furniture</Text>
          <Text style={styles.authTitle}>
            {mode === "login"
              ? "Selamat datang kembali"
              : "Buat akun pelanggan"}
          </Text>
          <Text style={styles.authDescription}>
            {mode === "login"
              ? "Masuk untuk berbelanja dan memantau pesanan Anda."
              : "Daftar untuk menyimpan keranjang dan riwayat transaksi."}
          </Text>

          <View style={styles.authCard}>
            {mode === "register" && (
              <>
                <AuthInput
                  label="Nama lengkap"
                  icon="person-outline"
                  value={form.name}
                  onChangeText={(value) => updateForm("name", value)}
                  placeholder="Masukkan nama lengkap"
                  autoCapitalize="words"
                />
                <AuthInput
                  label="Nomor telepon"
                  icon="call-outline"
                  value={form.phone}
                  onChangeText={(value) => updateForm("phone", value)}
                  placeholder="Contoh: 081234567890"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <AuthInput
              label="Alamat email"
              icon="mail-outline"
              value={form.email}
              onChangeText={(value) => updateForm("email", value)}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {mode === "register" && (
              <AuthInput
                label="Alamat pengiriman"
                icon="location-outline"
                value={form.address}
                onChangeText={(value) => updateForm("address", value)}
                placeholder="Masukkan alamat lengkap"
                multiline
              />
            )}

            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={(value) => updateForm("password", value)}
              placeholder="Minimal 8 karakter"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              right={passwordToggle}
            />

            {mode === "register" && (
              <AuthInput
                label="Konfirmasi password"
                icon="shield-checkmark-outline"
                value={form.confirmPassword}
                onChangeText={(value) => updateForm("confirmPassword", value)}
                placeholder="Ketik ulang password"
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            <Pressable
              onPress={submit}
              disabled={loading}
              style={({ pressed }) => [
                styles.authSubmitButton,
                pressed && styles.buttonPressed,
                loading && styles.authButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.authSubmitText}>
                    {mode === "login" ? "Masuk" : "Buat Akun"}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={COLORS.white}
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchLabel}>
              {mode === "login"
                ? "Belum memiliki akun?"
                : "Sudah memiliki akun?"}
            </Text>
            <Pressable onPress={changeMode}>
              <Text style={styles.authSwitchButton}>
                {mode === "login" ? " Buat akun" : " Masuk"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={23} color={COLORS.text} />
        </Pressable>
      ) : (
        <View style={styles.headerPlaceholder} />
      )}

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.headerPlaceholder} />
    </View>
  );
}

function BottomNavigation({ page, setPage, cartCount }) {
  const menus = [
    {
      id: "home",
      label: "Beranda",
      icon: "home",
    },
    {
      id: "history",
      label: "Riwayat",
      icon: "receipt",
    },
    {
      id: "cart",
      label: "Keranjang",
      icon: "cart",
    },
    {
      id: "profile",
      label: "Profil",
      icon: "person",
    },
  ];

  return (
    <View style={styles.bottomNavigation}>
      {menus.map((menu) => {
        const active = page === menu.id;

        return (
          <Pressable
            key={menu.id}
            onPress={() => setPage(menu.id)}
            style={styles.navigationItem}
          >
            <View>
              <Ionicons
                name={active ? menu.icon : `${menu.icon}-outline`}
                size={23}
                color={active ? COLORS.primary : COLORS.muted}
              />

              {menu.id === "cart" && cartCount > 0 ? (
                <View style={styles.navigationBadge}>
                  <Text style={styles.navigationBadgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.navigationLabel,
                active && styles.navigationLabelActive,
              ]}
            >
              {menu.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HomeScreen({ products, addToCart, cartCount, openCart }) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderProduct = ({ item }) => {
    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />

        <View style={styles.productContent}>
          <Text style={styles.productCategory}>{item.category}</Text>

          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />

            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>

          <Pressable
            onPress={() => addToCart(item)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="cart-outline" size={18} color={COLORS.white} />

            <Text style={styles.addButtonText}>Tambah</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const HomeHeader = () => {
    return (
      <>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.welcomeText}>Selamat datang kembali</Text>

            <Text style={styles.customerName}>Widya Utami</Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.primary}
              />

              <Text style={styles.locationText}>Jakarta, Indonesia</Text>
            </View>
          </View>

          <Pressable onPress={openCart} style={styles.cartHeaderButton}>
            <Ionicons name="cart-outline" size={25} color={COLORS.text} />

            {cartCount > 0 ? (
              <View style={styles.cartHeaderBadge}>
                <Text style={styles.cartHeaderBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color={COLORS.muted} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari produk..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoLabel}>PROMO SPESIAL</Text>

            <Text style={styles.promoTitle}>Diskon hingga 40%</Text>

            <Text style={styles.promoDescription}>
              Gratis ongkir untuk pembelian minimal Rp500.000.
            </Text>
          </View>

          <Ionicons name="bag-handle" size={68} color="rgba(255,255,255,0.9)" />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Produk populer</Text>

            <Text style={styles.sectionSubtitle}>
              Pilihan terbaik untuk Anda
            </Text>
          </View>

          <Text style={styles.productCount}>
            {filteredProducts.length} produk
          </Text>
        </View>
      </>
    );
  };

  return (
    <FlatList
      data={filteredProducts}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListHeaderComponent={HomeHeader}
      columnWrapperStyle={styles.productRow}
      contentContainerStyle={styles.homeList}
      showsVerticalScrollIndicator={false}
    />
  );
}

function CartScreen({
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  openCheckout,
  openHome,
}) {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.cartImage} />

        <View style={styles.cartInformation}>
          <Text style={styles.cartProductName} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.cartProductPrice}>
            {formatRupiah(item.price)}
          </Text>

          <View style={styles.quantityContainer}>
            <Pressable
              onPress={() => decreaseQuantity(item.id)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={18} color={COLORS.text} />
            </Pressable>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <Pressable
              onPress={() => increaseQuantity(item.id)}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={18} color={COLORS.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.cartRight}>
          <Pressable
            onPress={() => removeProduct(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={19} color={COLORS.danger} />
          </Pressable>

          <Text style={styles.cartItemTotal}>
            {formatRupiah(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.flex}>
        <Header title="Keranjang" subtitle="Belum ada produk" />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={65} color={COLORS.primary} />
          </View>

          <Text style={styles.emptyTitle}>Keranjang masih kosong</Text>

          <Text style={styles.emptyDescription}>
            Tambahkan produk sebelum melakukan checkout.
          </Text>

          <Pressable onPress={openHome} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Mulai belanja</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Keranjang" subtitle={`${cart.length} jenis produk`} />

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>Total belanja</Text>

          <Text style={styles.totalPrice}>{formatRupiah(subtotal)}</Text>
        </View>

        <Pressable onPress={openCheckout} style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>

          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

function CheckoutScreen({ cart, profile, onBack, completePayment }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [selectedPayment, setSelectedPayment] = useState("gopay");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const shippingCost = subtotal >= 500000 ? 0 : 15000;

  const total = subtotal + shippingCost;

  const pay = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Data belum lengkap", "Lengkapi seluruh data pengiriman.");

      return;
    }

    const payment = PAYMENT_METHODS.find((item) => item.id === selectedPayment);

    completePayment({
      name,
      phone,
      address,
      paymentMethod: payment.name,
      subtotal,
      shippingCost,
      total,
    });
  };

  return (
    <View style={styles.flex}>
      <Header
        title="Checkout"
        subtitle="Periksa pesanan Anda"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.checkoutContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.checkoutCard}>
          <Text style={styles.cardTitle}>Alamat pengiriman</Text>

          <Text style={styles.inputLabel}>Nama penerima</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nama penerima"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Nomor telepon</Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Nomor telepon"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Alamat lengkap</Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Alamat pengiriman"
            multiline
            style={[styles.input, styles.addressInput]}
          />
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.cardTitle}>Metode pembayaran</Text>

          {PAYMENT_METHODS.map((payment) => {
            const active = selectedPayment === payment.id;

            return (
              <Pressable
                key={payment.id}
                onPress={() => setSelectedPayment(payment.id)}
                style={[
                  styles.paymentMethod,
                  active && styles.paymentMethodActive,
                ]}
              >
                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={payment.icon}
                    size={23}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.paymentName}>{payment.name}</Text>

                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={active ? COLORS.primary : COLORS.muted}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.cardTitle}>Rincian pembayaran</Text>

          <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />

          <SummaryRow
            label="Biaya pengiriman"
            value={shippingCost === 0 ? "Gratis" : formatRupiah(shippingCost)}
          />

          <View style={styles.divider} />

          <SummaryRow
            label="Total pembayaran"
            value={formatRupiah(total)}
            total
          />
        </View>

        <View style={styles.paymentNotice}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={COLORS.primary}
          />

          <Text style={styles.paymentNoticeText}>
            Pembayaran ini masih berupa simulasi. Tidak ada uang yang ditarik.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>Total pembayaran</Text>

          <Text style={styles.totalPrice}>{formatRupiah(total)}</Text>
        </View>

        <Pressable onPress={pay} style={styles.checkoutButton}>
          <Ionicons name="lock-closed" size={17} color={COLORS.white} />

          <Text style={styles.payButtonText}>Bayar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, total }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, total && styles.summaryTotalLabel]}>
        {label}
      </Text>

      <Text style={[styles.summaryValue, total && styles.summaryTotalValue]}>
        {value}
      </Text>
    </View>
  );
}

function HistoryScreen({ orders }) {
  const [tab, setTab] = useState("shopping");

  return (
    <View style={styles.flex}>
      <Header title="Riwayat" subtitle="Aktivitas transaksi pelanggan" />

      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setTab("shopping")}
          style={[
            styles.tabButton,
            tab === "shopping" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[styles.tabText, tab === "shopping" && styles.tabTextActive]}
          >
            Riwayat Belanja
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTab("payment")}
          style={[
            styles.tabButton,
            tab === "payment" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[styles.tabText, tab === "payment" && styles.tabTextActive]}
          >
            Pembayaran
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          tab === "shopping" ? (
            <View style={styles.historyCard}>
              <View style={styles.historyTop}>
                <View>
                  <Text style={styles.transactionId}>{item.id}</Text>

                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {item.items.map((product) => (
                <View key={product.id} style={styles.historyProduct}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.historyImage}
                  />

                  <View style={styles.historyInformation}>
                    <Text style={styles.historyProductName}>
                      {product.name}
                    </Text>

                    <Text style={styles.historyQuantity}>
                      {product.quantity} produk
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.historyBottom}>
                <Text style={styles.totalLabel}>Total transaksi</Text>

                <Text style={styles.historyTotal}>
                  {formatRupiah(item.total)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.paymentHistoryCard}>
              <View style={styles.paymentHistoryIcon}>
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.paymentHistoryInfo}>
                <Text style={styles.paymentHistoryName}>
                  {item.paymentMethod}
                </Text>

                <Text style={styles.transactionDate}>{item.id}</Text>

                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>

              <View style={styles.paymentHistoryRight}>
                <Text style={styles.paymentAmount}>
                  {formatRupiah(item.total)}
                </Text>

                <Text style={styles.paymentStatus}>{item.paymentStatus}</Text>
              </View>
            </View>
          )
        }
      />
    </View>
  );
}

function ProfileScreen({ profile, orders, onLogout }) {
  const totalSpent = orders.reduce((total, order) => total + order.total, 0);

  const menus = [
    {
      name: "Pesanan Saya",
      description: "Lihat seluruh riwayat pesanan",
      icon: "bag-handle-outline",
    },
    {
      name: "Alamat Pengiriman",
      description: profile.address,
      icon: "location-outline",
    },
    {
      name: "Metode Pembayaran",
      description: "Kelola metode pembayaran",
      icon: "card-outline",
    },
    {
      name: "Keamanan Akun",
      description: "Kata sandi dan keamanan login",
      icon: "shield-checkmark-outline",
    },
    {
      name: "Pusat Bantuan",
      description: "Bantuan transaksi dan pengiriman",
      icon: "help-circle-outline",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.profileScreen}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.profilePageTitle}>Profil Pelanggan</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>WU</Text>
        </View>

        <Text style={styles.profileName}>{profile.name}</Text>

        <Text style={styles.profileEmail}>{profile.email}</Text>

        <Text style={styles.profilePhone}>{profile.phone}</Text>

        <Pressable
          onPress={() =>
            Alert.alert(
              "Edit Profil",
              "Fitur edit profil akan dibuat setelah database tersedia.",
            )
          }
          style={styles.editProfileButton}
        >
          <Ionicons name="create-outline" size={17} color={COLORS.primary} />

          <Text style={styles.editProfileText}>Edit Profil</Text>
        </Pressable>
      </View>

      <View style={styles.profileStatistics}>
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>{orders.length}</Text>

          <Text style={styles.statisticLabel}>Transaksi</Text>
        </View>

        <View style={styles.statisticDivider} />

        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>{formatRupiah(totalSpent)}</Text>

          <Text style={styles.statisticLabel}>Total Belanja</Text>
        </View>
      </View>

      <Text style={styles.profileSectionTitle}>Pengaturan Akun</Text>

      <View style={styles.profileMenu}>
        {menus.map((menu, index) => (
          <Pressable
            key={menu.name}
            onPress={() => Alert.alert(menu.name, menu.description)}
            style={[
              styles.profileMenuItem,
              index !== menus.length - 1 && styles.profileMenuBorder,
            ]}
          >
            <View style={styles.profileMenuIcon}>
              <Ionicons name={menu.icon} size={22} color={COLORS.primary} />
            </View>

            <View style={styles.profileMenuContent}>
              <Text style={styles.profileMenuName}>{menu.name}</Text>

              <Text style={styles.profileMenuDescription} numberOfLines={1}>
                {menu.description}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() =>
          Alert.alert("Keluar dari akun", "Apakah Anda yakin ingin keluar?", [
            { text: "Batal", style: "cancel" },
            { text: "Keluar", style: "destructive", onPress: onLogout },
          ])
        }
        style={styles.logoutButton}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />

        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </Pressable>
    </ScrollView>
  );
}

function SuccessScreen({ order, openHistory }) {
  return (
    <View style={styles.successScreen}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={58} color={COLORS.white} />
      </View>

      <Text style={styles.successTitle}>Pembayaran Berhasil</Text>

      <Text style={styles.successDescription}>
        Pesanan berhasil dibuat dan sudah masuk ke riwayat transaksi.
      </Text>

      <View style={styles.successCard}>
        <SummaryRow label="Nomor transaksi" value={order.id} />

        <SummaryRow label="Metode pembayaran" value={order.paymentMethod} />

        <View style={styles.divider} />

        <SummaryRow
          label="Total pembayaran"
          value={formatRupiah(order.total)}
          total
        />
      </View>

      <Pressable onPress={openHistory} style={styles.fullPrimaryButton}>
        <Text style={styles.primaryButtonText}>Lihat Riwayat Transaksi</Text>
      </Pressable>
    </View>
  );
}

function TokoKuApp({ currentUser, onLogout }) {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [latestOrder, setLatestOrder] = useState(null);

  const profile = {
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || "-",
    address: currentUser.address || "-",
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeProduct = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const completePayment = (paymentData) => {
    const isCod = paymentData.paymentMethod.includes("COD");

    const newOrder = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleString("id-ID"),
      status: isCod ? "Menunggu Pengiriman" : "Diproses",
      paymentStatus: isCod ? "Belum Dibayar" : "Lunas",
      paymentMethod: paymentData.paymentMethod,
      total: paymentData.total,
      address: paymentData.address,
      items: cart,
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);

    setLatestOrder(newOrder);
    setCart([]);
    setPage("success");
  };

  let screen;

  if (page === "home") {
    screen = (
      <HomeScreen
        products={PRODUCTS}
        addToCart={addToCart}
        cartCount={cartCount}
        openCart={() => setPage("cart")}
      />
    );
  } else if (page === "cart") {
    screen = (
      <CartScreen
        cart={cart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeProduct={removeProduct}
        openCheckout={() => setPage("checkout")}
        openHome={() => setPage("home")}
      />
    );
  } else if (page === "checkout") {
    screen = (
      <CheckoutScreen
        cart={cart}
        profile={profile}
        onBack={() => setPage("cart")}
        completePayment={completePayment}
      />
    );
  } else if (page === "history") {
    screen = <HistoryScreen orders={orders} />;
  } else if (page === "profile") {
    screen = (
      <ProfileScreen profile={profile} orders={orders} onLogout={onLogout} />
    );
  } else {
    screen = (
      <SuccessScreen
        order={latestOrder}
        openHistory={() => setPage("history")}
      />
    );
  }

  const showNavigation = ["home", "history", "cart", "profile"].includes(page);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.flex}>{screen}</View>

      {showNavigation ? (
        <BottomNavigation page={page} setPage={setPage} cartCount={cartCount} />
      ) : null}
    </SafeAreaView>
  );
}


export default function App() {
  const guestUser = {
    name: "Widya Utami",
    email: "guest@tokoku.local",
    phone: "",
    address: "",
    role: "customer",
  };

  return (
    <SafeAreaProvider>
      <TokoKuApp
        currentUser={guestUser}
        onLogout={() => {
          Alert.alert(
            "Mode Tamu",
            "Kamu sedang menggunakan aplikasi tanpa login."
          );
        }}
      />
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  sessionLoading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  sessionLoadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },

  authScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  authContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 28,
    paddingBottom: 36,
    alignItems: "center",
  },

  authLogo: {
    width: 74,
    height: 74,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  authBrand: {
    marginTop: 11,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  authTitle: {
    marginTop: 21,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text,
  },

  authDescription: {
    maxWidth: 335,
    marginTop: 8,
    marginBottom: 23,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
  },

  authCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.white,
  },

  authInputGroup: {
    marginBottom: 15,
  },

  authInputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  authInputContainer: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
  },

  authInputContainerMultiline: {
    minHeight: 90,
    paddingTop: 15,
    alignItems: "flex-start",
  },

  authInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  authInputMultiline: {
    minHeight: 63,
    textAlignVertical: "top",
  },

  authSubmitButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  authSubmitText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
  },

  authButtonDisabled: {
    opacity: 0.6,
  },

  authSwitchRow: {
    marginTop: 22,
    flexDirection: "row",
  },

  authSwitchLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },

  authSwitchButton: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },

  homeList: {
    paddingBottom: 115,
  },

  homeHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcomeText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  customerName: {
    marginTop: 2,
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
  },

  locationRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.muted,
  },

  cartHeaderButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cartHeaderBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  cartHeaderBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
  },

  searchBox: {
    height: 52,
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  promoBanner: {
    minHeight: 160,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
  },

  promoContent: {
    flex: 1,
  },

  promoLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#BFDBFE",
  },

  promoTitle: {
    marginTop: 7,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
  },

  promoDescription: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#DBEAFE",
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.muted,
  },

  productCount: {
    fontSize: 11,
    color: COLORS.muted,
  },

  productRow: {
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },

  productCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  productImage: {
    width: "100%",
    height: 145,
    backgroundColor: COLORS.primarySoft,
  },

  productContent: {
    padding: 12,
  },

  productCategory: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: COLORS.primary,
  },

  productName: {
    minHeight: 40,
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    color: COLORS.text,
  },

  ratingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
  },

  productPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  addButton: {
    minHeight: 40,
    marginTop: 11,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.55,
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  headerPlaceholder: {
    width: 44,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.muted,
  },

  bottomNavigation: {
    position: "absolute",
    right: 14,
    bottom: 8,
    left: 14,
    height: 72,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    flexDirection: "row",
  },

  navigationItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navigationLabel: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.muted,
  },

  navigationLabelActive: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  navigationBadge: {
    position: "absolute",
    top: -8,
    right: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  navigationBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.white,
  },

  cartList: {
    padding: 16,
    paddingBottom: 125,
  },

  cartItem: {
    marginBottom: 13,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    flexDirection: "row",
  },

  cartImage: {
    width: 82,
    height: 90,
    borderRadius: 13,
  },

  cartInformation: {
    flex: 1,
    marginLeft: 12,
  },

  cartProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  cartProductPrice: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },

  quantityContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    width: 35,
    textAlign: "center",
    fontWeight: "700",
    color: COLORS.text,
  },

  cartRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  cartItemTotal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },

  checkoutBar: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },

  totalPrice: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  checkoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
  },

  checkoutButtonText: {
    marginRight: 7,
    fontWeight: "800",
    color: COLORS.white,
  },

  payButtonText: {
    marginLeft: 7,
    fontWeight: "800",
    color: COLORS.white,
  },

  emptyContainer: {
    flex: 1,
    paddingHorizontal: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 24,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 8,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
  },

  primaryButton: {
    marginTop: 25,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  primaryButtonText: {
    fontWeight: "800",
    color: COLORS.white,
  },

  checkoutContent: {
    padding: 16,
    paddingBottom: 125,
  },

  checkoutCard: {
    marginBottom: 15,
    padding: 18,
    borderRadius: 19,
    backgroundColor: COLORS.white,
  },

  cardTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },

  input: {
    minHeight: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    fontSize: 14,
    color: COLORS.text,
  },

  addressInput: {
    minHeight: 90,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  paymentMethod: {
    minHeight: 70,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentMethodActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  paymentIcon: {
    width: 43,
    height: 43,
    marginRight: 11,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  summaryRow: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  summaryTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  divider: {
    height: 1,
    marginVertical: 6,
    marginBottom: 17,
    backgroundColor: COLORS.border,
  },

  paymentNotice: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentNoticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.primary,
  },

  tabContainer: {
    margin: 16,
    padding: 5,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    flexDirection: "row",
  },

  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },

  tabButtonActive: {
    backgroundColor: COLORS.primarySoft,
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  tabTextActive: {
    color: COLORS.primary,
  },

  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  historyCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },

  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  transactionId: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  transactionDate: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.muted,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#ECFDF5",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.success,
  },

  historyProduct: {
    marginTop: 14,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  historyImage: {
    width: 58,
    height: 58,
    borderRadius: 11,
  },

  historyInformation: {
    flex: 1,
    marginLeft: 11,
  },

  historyProductName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  historyQuantity: {
    marginTop: 5,
    fontSize: 11,
    color: COLORS.muted,
  },

  historyBottom: {
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  historyTotal: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },

  paymentHistoryCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentHistoryIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentHistoryInfo: {
    flex: 1,
  },

  paymentHistoryName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  paymentHistoryRight: {
    alignItems: "flex-end",
  },

  paymentAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  paymentStatus: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.success,
  },

  profileScreen: {
    padding: 16,
    paddingBottom: 115,
  },

  profilePageTitle: {
    marginVertical: 8,
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
  },

  profileCard: {
    padding: 22,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.primary,
  },

  profileName: {
    marginTop: 13,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.white,
  },

  profileEmail: {
    marginTop: 4,
    fontSize: 12,
    color: "#DBEAFE",
  },

  profilePhone: {
    marginTop: 3,
    fontSize: 12,
    color: "#DBEAFE",
  },

  editProfileButton: {
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  editProfileText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  profileStatistics: {
    marginTop: 14,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    flexDirection: "row",
  },

  statisticItem: {
    flex: 1,
    alignItems: "center",
  },

  statisticValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  statisticLabel: {
    marginTop: 5,
    fontSize: 10,
    color: COLORS.muted,
  },

  statisticDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.border,
  },

  profileSectionTitle: {
    marginTop: 23,
    marginBottom: 11,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  profileMenu: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  profileMenuItem: {
    minHeight: 72,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  profileMenuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  profileMenuIcon: {
    width: 43,
    height: 43,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  profileMenuContent: {
    flex: 1,
  },

  profileMenuName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  profileMenuDescription: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.muted,
  },

  logoutButton: {
    marginTop: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    marginLeft: 7,
    fontWeight: "700",
    color: COLORS.danger,
  },

  successScreen: {
    flex: 1,
    padding: 25,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  successIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },

  successTitle: {
    marginTop: 25,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },

  successDescription: {
    marginTop: 8,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
  },

  successCard: {
    width: "100%",
    marginTop: 28,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },

  fullPrimaryButton: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
});