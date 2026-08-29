import { useMemo, useState, useEffect } from "react";
import "./index.css";

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || "/api";

const testBackend = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    console.log("Backend connected:", data);
    return true;
  } catch (error) {
    console.warn("Backend connection offline (using local fallback):", error.message);
    return false;
  }
};

/* =========================
   DATE HELPERS
========================= */

const getDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const today = getDate(0);
const tomorrow = getDate(1);

/* =========================
   CROP DATA
   Demo prototype market data
========================= */

const cropData = {
  Tomato: {
    icon: "🍅",
    basePrice: 32,
    futureGrowth: 1.08,
    baseSpoilage: 5,
    fertilizer: 55,
    care: "Monitor moisture, support plants and harvest ripe produce on time.",
  },
  Onion: {
    icon: "🧅",
    basePrice: 30,
    futureGrowth: 1.06,
    baseSpoilage: 4,
    fertilizer: 45,
    care: "Avoid excess irrigation near maturity and keep harvested bulbs dry.",
  },
  Potato: {
    icon: "🥔",
    basePrice: 28,
    futureGrowth: 1.04,
    baseSpoilage: 4,
    fertilizer: 50,
    care: "Maintain soil moisture and monitor for pest or disease symptoms.",
  },
  Carrot: {
    icon: "🥕",
    basePrice: 35,
    futureGrowth: 1.03,
    baseSpoilage: 5,
    fertilizer: 40,
    care: "Maintain consistent moisture and harvest when roots reach market size.",
  },
  Brinjal: {
    icon: "🍆",
    basePrice: 34,
    futureGrowth: 1.07,
    baseSpoilage: 6,
    fertilizer: 50,
    care: "Check regularly for fruit damage and harvest market-ready fruits.",
  },
  Cabbage: {
    icon: "🥬",
    basePrice: 25,
    futureGrowth: 1.04,
    baseSpoilage: 5,
    fertilizer: 45,
    care: "Monitor for caterpillars and avoid excess moisture during storage.",
  },
};

/* =========================
   DEFAULT MARKETS
========================= */

const defaultMarkets = [
  {
    id: "tiruppur",
    name: "Tiruppur Local Market",
    currentMultiplier: 1,
    distance: 12,
    available: true,
  },
  {
    id: "coimbatore",
    name: "Coimbatore Market",
    currentMultiplier: 1.06,
    distance: 55,
    available: true,
  },
  {
    id: "kangeyam",
    name: "Kangeyam Market",
    currentMultiplier: 1.03,
    distance: 35,
    available: true,
  },
  {
    id: "koyambedu",
    name: "Chennai Koyambedu",
    currentMultiplier: 1.12,
    distance: 470,
    available: true,
  },
];

/* =========================
   SAMPLE HARVEST LISTINGS
========================= */

const initialListings = [
  {
    id: 1,
    crop: "Tomato",
    quantity: 1000,
    available: 1000,
    date: today,
    area: "Tiruppur",
    market: "Tiruppur Local Market",
    price: 32,
    farmer: "Demo Farmer",
  },
  {
    id: 2,
    crop: "Brinjal",
    quantity: 500,
    available: 500,
    date: tomorrow,
    area: "Tiruppur",
    market: "Tiruppur Local Market",
    price: 34,
    farmer: "Demo Farmer",
  },
];

/* =========================
   TRANSLATIONS
========================= */

const translations = {
  English: {
    dashboard: "Dashboard",
    harvest: "Harvest Decision",
    availability: "Harvest Availability",
    markets: "Market Comparison",
    weather: "Weather & Crop Care",
    waste: "Extra Produce Recovery",
    help: "Help Desk",
    marketplace: "Marketplace",
    orders: "My Orders",
  },

  Tamil: {
    dashboard: "முகப்பு",
    harvest: "அறுவடை முடிவு",
    availability: "அறுவடை கிடைப்புத் தகவல்",
    markets: "சந்தை ஒப்பீடு",
    weather: "வானிலை & பயிர் பராமரிப்பு",
    waste: "கூடுதல் விளைபொருள் விற்பனை",
    help: "உதவி மையம்",
    marketplace: "சந்தை",
    orders: "என் ஆர்டர்கள்",
  },

  Hindi: {
    dashboard: "डैशबोर्ड",
    harvest: "फसल कटाई निर्णय",
    availability: "उपलब्ध फसल",
    markets: "बाज़ार तुलना",
    weather: "मौसम और फसल देखभाल",
    waste: "अतिरिक्त उपज",
    help: "सहायता केंद्र",
    marketplace: "बाज़ार",
    orders: "मेरे ऑर्डर",
  },

  Telugu: {
    dashboard: "డాష్‌బోర్డ్",
    harvest: "పంట కోత నిర్ణయం",
    availability: "పంట లభ్యత",
    markets: "మార్కెట్ పోలిక",
    weather: "వాతావరణం & పంట సంరక్షణ",
    waste: "అదనపు ఉత్పత్తి",
    help: "సహాయ కేంద్రం",
    marketplace: "మార్కెట్",
    orders: "నా ఆర్డర్లు",
  },

  Kannada: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    harvest: "ಕೊಯ್ಲು ನಿರ್ಧಾರ",
    availability: "ಬೆಳೆ ಲಭ್ಯತೆ",
    markets: "ಮಾರುಕಟ್ಟೆ ಹೋಲಿಕೆ",
    weather: "ಹವಾಮಾನ & ಬೆಳೆ ಆರೈಕೆ",
    waste: "ಹೆಚ್ಚುವರಿ ಉತ್ಪನ್ನ",
    help: "ಸಹಾಯ ಕೇಂದ್ರ",
    marketplace: "ಮಾರುಕಟ್ಟೆ",
    orders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
  },

  Malayalam: {
    dashboard: "ഡാഷ്ബോർഡ്",
    harvest: "വിളവെടുപ്പ് തീരുമാനം",
    availability: "വിള ലഭ്യത",
    markets: "വിപണി താരതമ്യം",
    weather: "കാലാവസ്ഥ & വിള പരിപാലനം",
    waste: "അധിക ഉൽപ്പന്നം",
    help: "സഹായ കേന്ദ്രം",
    marketplace: "മാർക്കറ്റ്",
    orders: "എന്റെ ഓർഡറുകൾ",
  },
};

function App() {
  useEffect(() => {
    const initData = async () => {
      const isOnline = await testBackend();
      if (!isOnline) return;

      // Sync listings from backend
      try {
        const res = await fetch(`${API_BASE}/listings`);
        if (res.ok) {
          const serverListings = await res.json();
          if (Array.isArray(serverListings) && serverListings.length > 0) {
            setListings(serverListings);
            localStorage.setItem("smartFarmListings", JSON.stringify(serverListings));
          }
        }
      } catch (e) {
        console.warn("Could not sync listings:", e);
      }

      // Sync orders from backend
      try {
        const res = await fetch(`${API_BASE}/orders`);
        if (res.ok) {
          const serverOrders = await res.json();
          if (Array.isArray(serverOrders)) {
            setOrders(serverOrders);
            localStorage.setItem("smartFarmOrders", JSON.stringify(serverOrders));
          }
        }
      } catch (e) {
        console.warn("Could not sync orders:", e);
      }

      // Sync waste products from backend
      try {
        const res = await fetch(`${API_BASE}/waste`);
        if (res.ok) {
          const serverWaste = await res.json();
          if (Array.isArray(serverWaste) && serverWaste.length > 0) {
            setWasteProducts(serverWaste);
            localStorage.setItem("smartFarmExtraProduce", JSON.stringify(serverWaste));
          }
        }
      } catch (e) {
        console.warn("Could not sync waste produce:", e);
      }

      // Sync farmer profile if backend has one and local is blank
      try {
        const res = await fetch(`${API_BASE}/farmers`);
        if (res.ok) {
          const farmers = await res.json();
          if (Array.isArray(farmers) && farmers.length > 0) {
            const primary = farmers[0];
            setFarmerProfile((prev) => {
              if (!prev.name && primary.name) {
                const updated = { name: primary.name, location: primary.location };
                localStorage.setItem("smartFarmProfile", JSON.stringify(updated));
                return updated;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        console.warn("Could not sync farmer profile:", e);
      }
    };

    initData();
  }, []);

  const [role, setRole] = useState("farmer");
  const [page, setPage] = useState("dashboard");
  const [language, setLanguage] = useState("English");

  /* =========================
     USER AUTH & TOAST STATE
  ========================= */
  const [toastMsg, setToastMsg] = useState("");
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const [currentUser, setCurrentUser] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authIsRegister, setAuthIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authInput, setAuthInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    location: "Tiruppur"
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const endpoint = authIsRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = authIsRegister
      ? authInput
      : { email: authInput.email, password: authInput.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Authentication failed");
        return;
      }
      const user = data.user;
      setCurrentUser(user);
      const userRole = user.role === "consumer" ? "consumer" : "farmer";
      setRole(userRole);
      setPage(userRole === "consumer" ? "marketplace" : "dashboard");
      localStorage.setItem("smartFarmUser", JSON.stringify(user));
      setShowAuthModal(false);
      triggerToast(`Welcome ${authIsRegister ? "" : "back"}, ${user.name}!`);
    } catch (err) {
      setAuthError("Could not connect to backend server");
    } finally {
      setAuthLoading(false);
    }
  };

  const quickDemoLogin = async (email, password, demoRole) => {
    setAuthInput({ email, password, name: "", role: demoRole, location: "Tiruppur" });
    setAuthIsRegister(false);
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.user;
        setCurrentUser(user);
        const userRole = user.role === "consumer" ? "consumer" : "farmer";
        setRole(userRole);
        setPage(userRole === "consumer" ? "marketplace" : "dashboard");
        localStorage.setItem("smartFarmUser", JSON.stringify(user));
        triggerToast(`Welcome back, ${user.name}!`);
      } else {
        setAuthError((data && data.error) || "Invalid email or password");
      }
    } catch (err) {
      setAuthError("Could not connect to backend server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("smartFarmUser");
    triggerToast("Logged out successfully");
  };

  const t = (key) =>
    translations[language]?.[key] ||
    translations.English[key] ||
    key;

  /* =========================
     FARMER PROFILE
  ========================= */

  const [farmerProfile, setFarmerProfile] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("smartFarmProfile")
      ) || {
        name: "",
        location: "",
      };
    } catch {
      return {
        name: "",
        location: "",
      };
    }
  });

  const saveProfile = async () => {
    if (!farmerProfile.name.trim()) {
      alert("Please enter farmer name.");
      return;
    }

    if (!farmerProfile.location.trim()) {
      alert("Please enter farm location.");
      return;
    }

    localStorage.setItem(
      "smartFarmProfile",
      JSON.stringify(farmerProfile)
    );

    try {
      await fetch(`${API_BASE}/farmers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: farmerProfile.name,
          location: farmerProfile.location,
          area: 5,
        }),
      });
    } catch (e) {
      console.warn("Profile saved locally, backend offline:", e);
    }

    alert("Farm profile saved successfully.");
  };

  /* =========================
     HARVEST INPUT
     Farmer enters ONLY crop + quantity
  ========================= */

  const [harvestInput, setHarvestInput] = useState({
    crop: "Tomato",
    quantity: 1000,
  });

  /* =========================
     COST SETTINGS
  ========================= */

  const [costSettings, setCostSettings] = useState({
    transportPerKm: 5,
    storagePerKgDay: 1,
    handling: 300,
    waitingDays: 3,
    storageCapacity: 5000,
  });

  /* =========================
     MARKETS
  ========================= */

  const [markets, setMarkets] = useState(() => {
    try {
      const saved = localStorage.getItem("smartFarmMarkets");
      return saved
        ? JSON.parse(saved)
        : defaultMarkets;
    } catch {
      return defaultMarkets;
    }
  });

  const [customMarket, setCustomMarket] = useState({
    name: "",
    distance: "",
    multiplier: 1,
  });

  const addCustomMarket = () => {
    if (!customMarket.name.trim()) {
      alert("Enter market name.");
      return;
    }

    if (
      !customMarket.distance ||
      Number(customMarket.distance) < 0
    ) {
      alert("Enter a valid distance.");
      return;
    }

    const newMarket = {
      id: Date.now(),
      name: customMarket.name,
      distance: Number(customMarket.distance),
      currentMultiplier:
        Number(customMarket.multiplier) || 1,
      available: true,
      custom: true,
    };

    const updated = [...markets, newMarket];

    setMarkets(updated);

    localStorage.setItem(
      "smartFarmMarkets",
      JSON.stringify(updated)
    );

    setCustomMarket({
      name: "",
      distance: "",
      multiplier: 1,
    });

    alert("Market added.");
  };

  const updateMarketDistance = (id, value) => {
    const updated = markets.map((market) =>
      market.id === id
        ? {
            ...market,
            distance: Number(value) || 0,
          }
        : market
    );

    setMarkets(updated);

    localStorage.setItem(
      "smartFarmMarkets",
      JSON.stringify(updated)
    );
  };

  /* =========================
     HARVEST LISTINGS
  ========================= */

  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "smartFarmListings"
      );

      return saved
        ? JSON.parse(saved)
        : initialListings;
    } catch {
      return initialListings;
    }
  });

  const saveListings = (data) => {
    setListings(data);

    localStorage.setItem(
      "smartFarmListings",
      JSON.stringify(data)
    );
  };

  const [availabilityForm, setAvailabilityForm] = useState({
    crop: "Tomato",
    quantity: "",
    date: today,
    area: "",
    market: "Tiruppur Local Market",
    quality: "Grade A",
    farmingType: "Organic",
    notes: ""
  });

  const addAvailability = async () => {
    if (!availabilityForm.quantity) {
      alert("Enter quantity.");
      return;
    }

    if (!farmerProfile.location && !availabilityForm.area) {
      alert("Please enter farm area / location.");
      return;
    }

    const quantity = Number(availabilityForm.quantity);

    if (quantity <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    const newListing = {
      id: Date.now(),
      crop: availabilityForm.crop,
      quantity,
      available: quantity,
      date: availabilityForm.date,
      area: availabilityForm.area || farmerProfile.location || "Tiruppur",
      market: availabilityForm.market,
      price: cropData[availabilityForm.crop].basePrice,
      quality: availabilityForm.quality || "Grade A",
      farmingType: availabilityForm.farmingType || "Organic",
      notes: availabilityForm.notes || "",
      farmer: farmerProfile.name || currentUser?.name || "Demo Farmer"
    };

    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: currentUser?.id || 1,
          crop: newListing.crop,
          quantity: newListing.quantity,
          harvestDate: newListing.date,
          area: newListing.area,
          market: newListing.market,
          price: newListing.price,
          quality: newListing.quality,
          farmingType: newListing.farmingType,
          notes: newListing.notes
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.listing) {
          newListing.id = data.listing.id;
        }
      }
    } catch (e) {
      console.warn("Saved listing locally, backend offline:", e);
    }

    saveListings([newListing, ...listings]);

    setAvailabilityForm({
      ...availabilityForm,
      quantity: "",
      notes: ""
    });

    triggerToast("Harvest availability listed successfully!");
  };

  const deleteAvailability = async (id) => {
    if (!window.confirm("Delete this harvest availability?")) {
      return;
    }

    try {
      await fetch(`${API_BASE}/listings/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Deleted listing locally, backend offline:", e);
    }

    saveListings(listings.filter((item) => item.id !== id));
    triggerToast("Listing deleted");
  };

  /* =========================
     CUSTOMER & CONSUMER MARKETPLACE
  ========================= */

  const [customerArea, setCustomerArea] = useState("");
  const [customerDate, setCustomerDate] = useState(today);
  const [customerCropQuery, setCustomerCropQuery] = useState("");
  const [customerQualityFilter, setCustomerQualityFilter] = useState("");

  const [orderQty, setOrderQty] = useState({});

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartFarmOrders")) || [];
    } catch {
      return [];
    }
  });

  const [deliveryChoice, setDeliveryChoice] = useState({});

  const saveOrders = (data) => {
    setOrders(data);
    localStorage.setItem("smartFarmOrders", JSON.stringify(data));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        triggerToast(`Booking #${orderId} marked as ${newStatus}`);
      }
    } catch (e) {
      console.warn("Order status update offline:", e);
    }
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveOrders(updated);
  };

  const filteredListings = listings.filter(
    (item) =>
      item.available > 0 &&
      (!customerArea || item.area === customerArea) &&
      (!customerDate || item.date === customerDate) &&
      (!customerCropQuery || item.crop.toLowerCase().includes(customerCropQuery.toLowerCase())) &&
      (!customerQualityFilter || (item.quality || "Grade A") === customerQualityFilter)
  );

  const placeOrder = async (item) => {
    const qty = Number(
      orderQty[item.id] || 0
    );

    if (!qty || qty <= 0) {
      alert("Enter quantity.");
      return;
    }

    if (qty > item.available) {
      alert(
        `Only ${item.available} kg is available.`
      );
      return;
    }

    const delivery =
      deliveryChoice[item.id] || "pickup";

    const deliveryCharge =
      delivery === "delivery" ? 80 : 0;

    const productTotal =
      qty * item.price;

    const total =
      productTotal + deliveryCharge;

    const custName = currentUser ? currentUser.name : "Customer";
    const newOrder = {
      id: Date.now(),
      listingId: item.id,
      customerName: custName,
      customerPhone: currentUser?.phone || "+91 98765 43210",
      deliveryAddress: currentUser?.location || item.area || "Local Area",
      deliveryDate: item.date,
      crop: item.crop,
      quantity: qty,
      farmer: item.farmer,
      area: item.area,
      date: item.date,
      market: item.market,
      productTotal,
      deliveryMethod: delivery,
      deliveryCharge,
      total,
      status: "Pending",
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: item.id,
          customerName: custName,
          customerPhone: newOrder.customerPhone,
          deliveryAddress: newOrder.deliveryAddress,
          deliveryDate: item.date,
          quantity: qty,
          deliveryMethod: delivery,
          deliveryCharge,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          newOrder.id = data.order.id;
          newOrder.status = data.order.status || "Pending";
        }
      }
    } catch (e) {
      console.warn("Order saved locally, backend offline:", e);
    }

    const updatedListings = listings
      .map((x) =>
        x.id === item.id
          ? {
              ...x,
              available:
                x.available - qty,
            }
          : x
      )
      .filter((x) => x.available > 0);

    saveListings(updatedListings);

    saveOrders([
      newOrder,
      ...orders,
    ]);

    setOrderQty({
      ...orderQty,
      [item.id]: "",
    });

    alert(
      `Pre-book confirmed!\n\n${qty} kg ${item.crop}\nTotal: ₹${total}`
    );
  };

  /* =========================
     HARVEST DECISION ENGINE
  ========================= */

  const decision = useMemo(() => {
    const crop =
      cropData[harvestInput.crop];

    const quantity =
      Math.max(
        0,
        Number(harvestInput.quantity) || 0
      );

    const waitingDays =
      Math.max(
        1,
        Number(
          costSettings.waitingDays
        ) || 1
      );

    const storagePerKgDay =
      Math.max(
        0,
        Number(
          costSettings.storagePerKgDay
        ) || 0
      );

    const handling =
      Math.max(
        0,
        Number(costSettings.handling) || 0
      );

    const validMarkets =
      markets.filter(
        (market) => market.available
      );

    const marketResults =
      validMarkets.map((market) => {
        const currentPrice =
          crop.basePrice *
          market.currentMultiplier;

        const futurePrice =
          currentPrice *
          crop.futureGrowth;

        const currentSpoilage =
          crop.baseSpoilage;

        /*
          Waiting adds spoilage risk.
          More waiting = more expected loss.
        */
        const waitingSpoilage = Math.min(
          90,
          currentSpoilage +
            waitingDays * 2
        );

        const currentSaleable =
          quantity *
          (1 - currentSpoilage / 100);

        const waitingSaleable =
          quantity *
          (1 - waitingSpoilage / 100);

        const transport =
          Number(market.distance || 0) *
          Number(
            costSettings.transportPerKm
          );

        const currentRevenue =
          currentSaleable *
          currentPrice;

        const waitingRevenue =
          waitingSaleable *
          futurePrice;

        const currentProfit =
          currentRevenue -
          transport -
          handling;

        const storageCost =
          waitingSaleable *
          storagePerKgDay *
          waitingDays;

        const waitingProfit =
          waitingRevenue -
          transport -
          handling -
          storageCost;

        return {
          ...market,
          currentPrice,
          futurePrice,
          currentSpoilage,
          waitingSpoilage,
          currentSaleable,
          waitingSaleable,
          transport,
          currentRevenue,
          waitingRevenue,
          storageCost,
          currentProfit,
          waitingProfit,
          difference:
            waitingProfit -
            currentProfit,
        };
      });

    const bestCurrent =
      [...marketResults].sort(
        (a, b) =>
          b.currentProfit -
          a.currentProfit
      )[0];

    const bestWaiting =
      [...marketResults].sort(
        (a, b) =>
          b.waitingProfit -
          a.waitingProfit
      )[0];

    const isStorageExceeded = costSettings.storageCapacity && quantity > Number(costSettings.storageCapacity);

    const recommendation =
      !isStorageExceeded &&
      bestWaiting &&
      bestWaiting.waitingProfit > bestCurrent.currentProfit
        ? "WAIT"
        : "HARVEST NOW";

    return {
      marketResults,
      bestCurrent,
      bestWaiting,
      recommendation,
      storageCapacityExceeded: isStorageExceeded,
    };
  }, [
    harvestInput,
    costSettings,
    markets,
  ]);

  /* =========================
     AI HARVEST ADVISOR STATE
  ========================= */

  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);

  const runAiAdvisorApi = async () => {
    setLoadingAiAdvice(true);
    try {
      const res = await fetch(`${API_BASE}/ai/harvest-advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: harvestInput.crop,
          quantity: Number(harvestInput.quantity) || 1000,
          waitingDays: Number(costSettings.waitingDays) || 3,
          language: language,
          costSettings: costSettings,
          markets: markets,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiAdvice(data);
        }
      }
    } catch (err) {
      console.warn("AI Advisor request offline:", err);
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  useEffect(() => {
    runAiAdvisorApi();
  }, [harvestInput, costSettings, markets, language]);

  /* =========================
     WASTE / EXTRA PRODUCE
  ========================= */

  const [wasteProducts, setWasteProducts] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "smartFarmExtraProduce"
            )
          ) || [
            {
              id: 1,
              crop: "Brinjal",
              quantity: 30,
              price: 8,
              area: "Tiruppur",
              use: "Food processing / pickle",
            },
          ]
        );
      } catch {
        return [];
      }
    });

  const [wasteForm, setWasteForm] =
    useState({
      crop: "Brinjal",
      quantity: "",
      price: 8,
      area: "",
      use: "Food processing / pickle",
    });

  const addExtraProduce = async () => {
    const quantity =
      Number(wasteForm.quantity);

    const price =
      Number(wasteForm.price);

    if (
      !quantity ||
      quantity <= 0 ||
      !price ||
      price <= 0
    ) {
      alert(
        "Enter valid quantity and recovery price."
      );
      return;
    }

    const item = {
      id: Date.now(),
      crop: wasteForm.crop,
      quantity,
      price,
      area:
        wasteForm.area ||
        farmerProfile.location ||
        "Local Area",
      use: wasteForm.use,
    };

    try {
      const res = await fetch(`${API_BASE}/waste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: 1,
          crop: item.crop,
          quantity: item.quantity,
          price: item.price,
          area: item.area,
          use: item.use,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          item.id = data.item.id;
        }
      }
    } catch (e) {
      console.warn("Extra produce saved locally, backend offline:", e);
    }

    const updated = [
      item,
      ...wasteProducts,
    ];

    setWasteProducts(updated);

    localStorage.setItem(
      "smartFarmExtraProduce",
      JSON.stringify(updated)
    );

    setWasteForm({
      ...wasteForm,
      quantity: "",
    });

    alert(
      `Extra produce listed.\nPotential recovery revenue: ₹${(
        quantity * price
      ).toFixed(0)}`
    );
  };

  const deleteExtraProduce = async (id) => {
    try {
      await fetch(`${API_BASE}/waste/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Deleted waste listing locally, backend offline:", e);
    }

    const updated =
      wasteProducts.filter(
        (x) => x.id !== id
      );

    setWasteProducts(updated);

    localStorage.setItem(
      "smartFarmExtraProduce",
      JSON.stringify(updated)
    );
  };

  /* =========================
     MENU
  ========================= */

  const farmerMenu = [
    ["dashboard", t("dashboard")],
    ["harvest", `🌱 ${t("harvest")}`],
    [
      "availability",
      `📅 ${t("availability")}`,
    ],
    ["farmer-bookings", "📦 Customer Bookings"],
    ["markets", `🏪 ${t("markets")}`],
    ["weather", `🌦️ ${t("weather")}`],
    ["waste", `♻️ ${t("waste")}`],
    ["help", `🆘 ${t("help")}`],
    ["profile", "👨‍🌾 Farm Profile"],
  ];

  const consumerMenu = [
    ["dashboard", t("dashboard")],
    ["marketplace", "🥗 Fresh Produce"],
    ["orders", `📦 ${t("orders")}`],
    ["help", `🆘 ${t("help")}`],
  ];

  const menu = role === "consumer" ? consumerMenu : farmerMenu;

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: "460px", width: "100%", backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0" }}>
          
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🌱</div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>SmartFarm Harvest System</h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>Smart Harvest • Better Net Profit • Zero Food Waste</p>
          </div>

          <div style={{ display: "flex", borderRadius: "8px", backgroundColor: "#f1f5f9", padding: "4px", marginBottom: "20px" }}>
            <button
              type="button"
              style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", backgroundColor: !authIsRegister ? "#ffffff" : "transparent", color: !authIsRegister ? "#0f172a" : "#64748b", fontWeight: "700", cursor: "pointer", boxShadow: !authIsRegister ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
              onClick={() => { setAuthIsRegister(false); setAuthError(""); }}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", backgroundColor: authIsRegister ? "#ffffff" : "transparent", color: authIsRegister ? "#0f172a" : "#64748b", fontWeight: "700", cursor: "pointer", boxShadow: authIsRegister ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
              onClick={() => { setAuthIsRegister(true); setAuthError(""); }}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {authIsRegister && (
              <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                Full Name
                <input
                  type="text"
                  required
                  value={authInput.name}
                  onChange={(e) => setAuthInput({ ...authInput, name: e.target.value })}
                  placeholder="e.g. Kumar"
                  style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                />
              </label>
            )}

            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Email Address
              <input
                type="email"
                required
                value={authInput.email}
                onChange={(e) => setAuthInput({ ...authInput, email: e.target.value })}
                placeholder="e.g. farmer@smartfarm.com"
                style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Password</span>
                {!authIsRegister && (
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#16a34a", fontSize: "12px", cursor: "pointer", padding: 0 }}
                    onClick={() => alert("Password reset instructions sent to your registered email.")}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: "relative", marginTop: "4px" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={authInput.password}
                  onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "10px 38px 10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#64748b" }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Account Role
              <select
                value={authInput.role}
                onChange={(e) => setAuthInput({ ...authInput, role: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
              >
                <option value="farmer">👨‍🌾 Farmer</option>
                <option value="consumer">🥗 Customer / Buyer</option>
              </select>
            </label>

            <button
              className="primary"
              type="submit"
              disabled={authLoading}
              style={{ padding: "12px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", marginTop: "8px", cursor: "pointer", backgroundColor: "#16a34a", color: "#fff", border: "none" }}
            >
              {authLoading ? "Authenticating..." : authIsRegister ? "Create Account & Sign In" : "Sign In to Dashboard"}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", textAlign: "center" }}>⚡ Quick Demo One-Click Sign In</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => quickDemoLogin("farmer@smartfarm.com", "farmer123", "farmer")}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", textAlign: "left" }}
              >
                <div>
                  <span style={{ fontWeight: "700", display: "block", color: "#0f172a", fontSize: "14px" }}>👨‍🌾 Demo Farmer</span>
                  <small style={{ color: "#64748b" }}>farmer@smartfarm.com</small>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>Sign In →</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin("consumer@smartfarm.com", "consumer123", "consumer")}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", textAlign: "left" }}
              >
                <div>
                  <span style={{ fontWeight: "700", display: "block", color: "#0f172a", fontSize: "14px" }}>🥗 Demo Customer</span>
                  <small style={{ color: "#64748b" }}>consumer@smartfarm.com</small>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>Sign In →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="topbar">

        <div className="brand">
          <div className="brandIcon">
            🌱
          </div>

          <div>
            <h1>SmartFarm</h1>
            <p>
              Smart Harvest • Better Market • Less Waste
            </p>
          </div>
        </div>

        <div className="top-actions">

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
          >
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
            <option>Telugu</option>
            <option>Kannada</option>
            <option>Malayalam</option>
          </select>

          <button
            className={role === "farmer" ? "activeBtn" : ""}
            onClick={() => {
              setRole("farmer");
              setPage("dashboard");
            }}
          >
            👨‍🌾 Farmer
          </button>

          <button
            className={role === "consumer" ? "activeBtn" : ""}
            onClick={() => {
              setRole("consumer");
              setPage("marketplace");
            }}
          >
            🥗 Consumer
          </button>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="userBadge">
                👤 {currentUser.name} ({currentUser.role})
              </div>
              <button
                className="secondary"
                onClick={handleLogout}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="primary"
              onClick={() => setShowAuthModal(true)}
              style={{ padding: "8px 14px" }}
            >
              🔐 Login
            </button>
          )}

        </div>
      </header>

      <div className="layout">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <div className="roleBox">
            <strong>
              {role === "farmer"
                ? "👨‍🌾 Farmer Mode"
                : "🥗 Consumer Mode"}
            </strong>

            <small>
              {role === "farmer"
                ? farmerProfile.name || "Farm Management"
                : "Direct Farm-Fresh Produce"}
            </small>
          </div>

          {menu.map(
            ([key, label]) => (
              <button
                key={key}
                className={
                  page === key
                    ? "sideActive"
                    : ""
                }
                onClick={() =>
                  setPage(key)
                }
              >
                {label}
              </button>
            )
          )}

        </aside>

        {/* ================= MAIN ================= */}

        <main className="content">

          {/* ================= DASHBOARD ================= */}

          {page === "dashboard" && (
            <>

              <section className="hero">

                <div className="heroText">

                  <span className="badge">
                    SMART AGRICULTURE
                  </span>

                  <h2>
                    Should I harvest now
                    or wait?
                  </h2>

                  <p>
                    SmartFarm analyses
                    expected yield, market
                    opportunity, transport,
                    storage and spoilage to
                    recommend the better
                    selling decision.
                  </p>

                  <button
                    className="primary bigButton"
                    onClick={() =>
                      setPage("harvest")
                    }
                  >
                    🌱 Analyze My Harvest →
                  </button>

                </div>

                <div className="heroVisual">
                  <div className="sun">
                    ☀️
                  </div>
                  <div className="farmEmoji">
                    🌾🌱🌾
                  </div>
                  <div className="heroCrop">
                    🍅
                  </div>
                </div>

              </section>

              <div className="stats">

                <div className="statCard">
                  <span>
                    Today's Produce
                  </span>
                  <strong>
                    {listings.filter(
                      (x) =>
                        x.date === today &&
                        x.available > 0
                    ).length}
                  </strong>
                  <small>
                    Active listings
                  </small>
                </div>

                <div className="statCard">
                  <span>
                    Available Quantity
                  </span>
                  <strong>
                    {listings.reduce(
                      (sum, item) =>
                        sum +
                        item.available,
                      0
                    )}{" "}
                    kg
                  </strong>
                  <small>
                    Ready for booking
                  </small>
                </div>

                <div className="statCard">
                  <span>
                    Main Decision
                  </span>
                  <strong>
                    {decision.recommendation ===
                    "WAIT"
                      ? "WAIT"
                      : "HARVEST"}
                  </strong>
                  <small>
                    Profit-based analysis
                  </small>
                </div>

                <div className="statCard">
                  <span>
                    Extra Produce
                  </span>
                  <strong>
                    {wasteProducts.length}
                  </strong>
                  <small>
                    Recovery listings
                  </small>
                </div>

              </div>

              <section className="panel featurePanel">

                <div className="sectionHeading">
                  <div>
                    <span className="miniLabel">
                      HACKATHON CORE
                    </span>

                    <h3>
                      One decision. Two
                      possibilities.
                    </h3>
                  </div>

                  <div className="decisionIcon">
                    ⚖️
                  </div>
                </div>

                <div className="decisionPreview">

                  <div>
                    <span>
                      🚜 OPTION 1
                    </span>
                    <h3>
                      Harvest Now
                    </h3>
                    <p>
                      Sellable quantity ×
                      current market price
                      − operating costs
                    </p>
                  </div>

                  <div className="versus">
                    VS
                  </div>

                  <div>
                    <span>
                      ⏳ OPTION 2
                    </span>
                    <h3>
                      Wait
                    </h3>
                    <p>
                      Future price −
                      additional spoilage −
                      storage costs
                    </p>
                  </div>

                </div>

              </section>

            </>
          )}

          {/* ================= PROFILE ================= */}

          {page === "profile" && (
            <section className="panel">

              <div className="pageTitle">
                <span className="badge">
                  FARMER SETUP
                </span>

                <h2>
                  👨‍🌾 Farm Profile
                </h2>

                <p>
                  Enter your name and actual
                  farm location once. The
                  application can use this
                  information for market and
                  delivery planning.
                </p>
              </div>

              <div className="formGrid">

                <label>
                  Farmer Name

                  <input
                    value={
                      farmerProfile.name
                    }
                    onChange={(e) =>
                      setFarmerProfile({
                        ...farmerProfile,
                        name: e.target.value,
                      })
                    }
                    placeholder="Example: Kumar"
                  />
                </label>

                <label>
                  Farm Location

                  <input
                    value={
                      farmerProfile.location
                    }
                    onChange={(e) =>
                      setFarmerProfile({
                        ...farmerProfile,
                        location:
                          e.target.value,
                      })
                    }
                    placeholder="Example: Tiruppur"
                  />
                </label>

              </div>

              <button
                className="primary"
                onClick={saveProfile}
              >
                Save Farm Profile
              </button>

              <div className="infoBox">
                <b>
                  📍 Why location matters
                </b>

                <p>
                  Distance affects transportation
                  cost. Transportation cost affects
                  net profit. Therefore SmartFarm
                  uses location/distance as part of
                  the market comparison.
                </p>
              </div>

            </section>
          )}

          {/* ================= HARVEST DECISION ================= */}

          {page === "harvest" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  CORE HACKATHON ENGINE
                </span>

                <h2>
                  🌱 Should I Harvest Now
                  or Wait?
                </h2>

                <p>
                  Farmer enters only the crop
                  and expected quantity. Market
                  and cost assumptions are used
                  by the decision engine.
                </p>

              </div>

              <div className="formGrid">

                <label>
                  Crop

                  <select
                    value={
                      harvestInput.crop
                    }
                    onChange={(e) =>
                      setHarvestInput({
                        ...harvestInput,
                        crop:
                          e.target.value,
                      })
                    }
                  >
                    {Object.keys(
                      cropData
                    ).map((crop) => (
                      <option
                        key={crop}
                      >
                        {crop}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Expected Quantity (kg)

                  <input
                    type="number"
                    min="1"
                    value={
                      harvestInput.quantity
                    }
                    onChange={(e) =>
                      setHarvestInput({
                        ...harvestInput,
                        quantity:
                          e.target.value,
                      })
                    }
                  />
                </label>

              </div>

              <div className="costSettings">

                <h3>
                  ⚙️ Cost Assumptions
                </h3>

                <p>
                  These are used to calculate
                  expected net profit.
                </p>

                <div className="formGrid">

                  <label>
                    Transport Cost ₹/km

                    <input
                      type="number"
                      min="0"
                      value={
                        costSettings.transportPerKm
                      }
                      onChange={(e) =>
                        setCostSettings({
                          ...costSettings,
                          transportPerKm:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Storage Cost ₹/kg/day

                    <input
                      type="number"
                      min="0"
                      value={
                        costSettings.storagePerKgDay
                      }
                      onChange={(e) =>
                        setCostSettings({
                          ...costSettings,
                          storagePerKgDay:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Handling Cost ₹

                    <input
                      type="number"
                      min="0"
                      value={
                        costSettings.handling
                      }
                      onChange={(e) =>
                        setCostSettings({
                          ...costSettings,
                          handling:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Waiting Period (days)

                    <input
                      type="number"
                      min="1"
                      value={costSettings.waitingDays}
                      onChange={(e) =>
                        setCostSettings({
                          ...costSettings,
                          waitingDays: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Max Storage Capacity (kg)

                    <input
                      type="number"
                      min="1"
                      value={costSettings.storageCapacity || ""}
                      onChange={(e) =>
                        setCostSettings({
                          ...costSettings,
                          storageCapacity: e.target.value,
                        })
                      }
                    />
                  </label>

                </div>

              </div>

              {decision.bestCurrent && (
                <>

                  <div className="winnerBanner">

                    <span>
                      SMART RECOMMENDATION
                    </span>

                    <h1>
                      {decision.recommendation ===
                      "WAIT"
                        ? "⏳ WAIT"
                        : "🚜 HARVEST NOW"}
                    </h1>

                    <p>
                      {decision.recommendation ===
                      "WAIT"
                        ? `Waiting currently has the better expected net return.`
                        : `Selling now currently has the better expected net return.`}
                    </p>

                  </div>

                  <div className="compareCards">

                    <div className="decisionCard nowCard">

                      <span className="optionTag">
                        OPTION 1
                      </span>

                      <h3>
                        🚜 Harvest Now
                      </h3>

                      <p>
                        Best current market
                      </p>

                      <strong>
                        {
                          decision.bestCurrent.name
                        }
                      </strong>

                      <div className="metric">
                        <span>
                          Current Price
                        </span>
                        <b>
                          ₹
                          {decision.bestCurrent.currentPrice.toFixed(
                            2
                          )}
                          /kg
                        </b>
                      </div>

                      <div className="metric">
                        <span>
                          Saleable Quantity
                        </span>
                        <b>
                          {decision.bestCurrent.currentSaleable.toFixed(
                            0
                          )}{" "}
                          kg
                        </b>
                      </div>

                      <div className="metric">
                        <span>
                          Transport
                        </span>
                        <b>
                          ₹
                          {decision.bestCurrent.transport.toFixed(
                            0
                          )}
                        </b>
                      </div>

                      <div className="metric">
                        <span>
                          Net Profit
                        </span>
                        <b className="money">
                          ₹
                          {decision.bestCurrent.currentProfit.toFixed(
                            0
                          )}
                        </b>
                      </div>

                    </div>

                    <div className="vsBig">
                      VS
                    </div>

                    <div className="decisionCard waitCard">

                      <span className="optionTag">
                        OPTION 2
                      </span>

                      <h3>
                        ⏳ Wait
                      </h3>

                      <p>
                        Best future opportunity
                      </p>

                      <strong>
                        {
                          decision.bestWaiting.name
                        }
                      </strong>

                      <div className="metric">
                        <span>
                          Future Price
                        </span>
                        <b>
                          ₹
                          {decision.bestWaiting.futurePrice.toFixed(
                            2
                          )}
                          /kg
                        </b>
                      </div>

                      <div className="metric">
                        <span>
                          Storage
                        </span>
                        <b>
                          ₹
                          {decision.bestWaiting.storageCost.toFixed(
                            0
                          )}
                        </b>
                      </div>

                      <div className="metric">
                        <span>
                          Expected Profit
                        </span>
                        <b className="money">
                          ₹
                          {decision.bestWaiting.waitingProfit.toFixed(
                            0
                          )}
                        </b>
                      </div>

                    </div>

                  </div>

                  <div className="infoNotice">

                    <div>
                      💡
                      <b>Strategy</b>
                      <small>
                        Based on profit net of transport, handling and storage.
                      </small>
                    </div>

                    <div>
                      ⚠️
                      <b>Spoilage</b>
                      <small>
                        Waiting increases
                        expected spoilage.
                      </small>
                    </div>

                    <div>
                      🏪
                      <b>Market</b>
                      <small>
                        Highest price is not
                        always highest profit.
                      </small>
                    </div>

                  </div>

                  {/* ================= AI HARVEST ADVISOR ================= */}
                  <div className="aiAdvisorSection">
                    <div className="aiAdvisorHeader">
                      <div className="aiTitleRow">
                        <span className="aiSparkle">✨</span>
                        <h3>🤖 AI Harvest Advisor</h3>
                        <span className="aiTag">INTELLIGENT DECISION ENGINE</span>
                      </div>
                      {aiAdvice && (
                        <div className="aiBadges">
                          <span className="aiConfidenceBadge">
                            🎯 {aiAdvice.confidenceScore}% Confidence
                          </span>
                          <span className={`aiRiskBadge risk-${(aiAdvice.riskLevel || "LOW").toLowerCase()}`}>
                            ⚠️ Risk: {aiAdvice.riskLevel}
                          </span>
                        </div>
                      )}
                    </div>

                    {loadingAiAdvice && !aiAdvice ? (
                      <div className="aiLoading">
                        Analyzing market trends, weather risk and expected spoilage...
                      </div>
                    ) : aiAdvice ? (
                      <div className="aiAdvisorCard">
                        <div className="aiTopGrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                          <div className="aiMetricBox">
                            <small>RECOMMENDED ACTION</small>
                            <strong className={aiAdvice.recommendation === "WAIT" ? "waitText" : "harvestText"}>
                              {aiAdvice.recommendation === "WAIT" ? "⏳ WAIT" : "🚜 HARVEST NOW"}
                            </strong>
                            <span>Timing: {aiAdvice.recommendedHarvestDate}</span>
                          </div>

                          <div className="aiMetricBox">
                            <small>BEST MARKET</small>
                            <strong>{aiAdvice.bestMarket}</strong>
                            <span>Highest Net Return</span>
                          </div>

                          <div className="aiMetricBox">
                            <small>CURRENT NET PROFIT</small>
                            <strong style={{ color: "#2563eb" }}>
                              ₹{(aiAdvice.metrics?.currentBestProfit || decision.bestCurrent?.currentProfit || 0).toLocaleString("en-IN")}
                            </strong>
                            <span>Harvest Today</span>
                          </div>

                          <div className="aiMetricBox">
                            <small>WAITING NET PROFIT</small>
                            <strong style={{ color: "#059669" }}>
                              ₹{(aiAdvice.metrics?.waitingBestProfit || decision.bestWaiting?.waitingProfit || 0).toLocaleString("en-IN")}
                            </strong>
                            <span>In {costSettings.waitingDays || 3} Days</span>
                          </div>

                          <div className="aiMetricBox">
                            <small>PROFIT DIFFERENCE</small>
                            <strong className="profitHighlight">
                              ₹{Math.abs((aiAdvice.metrics?.waitingBestProfit || 0) - (aiAdvice.metrics?.currentBestProfit || 0)).toLocaleString("en-IN")}
                            </strong>
                            <span>{aiAdvice.recommendation === "WAIT" ? "Gain by Waiting" : "Loss if Waiting"}</span>
                          </div>
                        </div>

                        {aiAdvice.storageCapacityExceeded && (
                          <div className="aiWeatherAlert" style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#991b1b", marginBottom: "12px" }}>
                            <span className="weatherIcon">⚠️</span>
                            <div>
                              <b>STORAGE CAPACITY WARNING:</b>
                              <p>Total harvest quantity exceeds available warehouse storage limit. Harvest Now is recommended.</p>
                            </div>
                          </div>
                        )}

                        {aiAdvice.weatherRiskAlert && (
                          <div className="aiWeatherAlert">
                            <span className="weatherIcon">🌦️</span>
                            <div>
                              <b>Weather Risk Analysis:</b>
                              <p>{aiAdvice.weatherRiskAlert}</p>
                            </div>
                          </div>
                        )}

                        <div className="aiWhySection">
                          <h4>💡 Why this decision?</h4>
                          <ul className="aiWhyList">
                            {aiAdvice.why &&
                              aiAdvice.why.map((reason, idx) => (
                                <li key={idx}>
                                  <span className="checkIcon">✓</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>

                </>
              )}

            </section>
          )}

          {/* ================= MARKET COMPARISON ================= */}

          {page === "markets" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  PROFIT OPTIMIZATION
                </span>

                <h2>
                  🏪 Which Market Gives the
                  Best Expected Return?
                </h2>

                <p>
                  Market price alone is not enough.
                  SmartFarm subtracts transportation,
                  handling, storage and spoilage
                  effects.
                </p>

              </div>

              <div className="customMarketBox">

                <h3>
                  + Add Another Market
                </h3>

                <div className="formGrid">

                  <label>
                    Market Name

                    <input
                      value={
                        customMarket.name
                      }
                      onChange={(e) =>
                        setCustomMarket({
                          ...customMarket,
                          name: e.target.value,
                        })
                      }
                      placeholder="Example: Dharapuram Market"
                    />
                  </label>

                  <label>
                    Distance (km)

                    <input
                      type="number"
                      min="0"
                      value={
                        customMarket.distance
                      }
                      onChange={(e) =>
                        setCustomMarket({
                          ...customMarket,
                          distance:
                            e.target.value,
                        })
                      }
                    />
                  </label>

                </div>

                <button
                  className="secondary"
                  onClick={
                    addCustomMarket
                  }
                >
                  + Add Market
                </button>

              </div>

              <div className="marketGrid">

                {decision.marketResults.map(
                  (market) => {

                    const isBest =
                      decision.bestCurrent?.id ===
                      market.id;

                    return (
                      <div
                        className={
                          isBest
                            ? "marketCard bestMarket"
                            : "marketCard"
                        }
                        key={market.id}
                      >

                        {isBest && (
                          <span className="bestBadge">
                            ⭐ BEST CURRENT RETURN
                          </span>
                        )}

                        <h3>
                          {market.name}
                        </h3>

                        <label>
                          Distance

                          <input
                            type="number"
                            min="0"
                            value={
                              market.distance
                            }
                            onChange={(e) =>
                              updateMarketDistance(
                                market.id,
                                e.target.value
                              )
                            }
                          />
                        </label>

                        <p>
                          Current Price
                        </p>

                        <strong>
                          ₹
                          {market.currentPrice.toFixed(
                            2
                          )}
                          /kg
                        </strong>

                        <p>
                          Transport Cost
                        </p>

                        <strong>
                          ₹
                          {market.transport.toFixed(
                            0
                          )}
                        </strong>

                        <p>
                          Saleable Quantity
                        </p>

                        <strong>
                          {market.currentSaleable.toFixed(
                            0
                          )}{" "}
                          kg
                        </strong>

                        <hr />

                        <p>
                          Expected Net Profit
                        </p>

                        <strong className="profitValue">
                          ₹
                          {market.currentProfit.toFixed(
                            0
                          )}
                        </strong>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

          {/* ================= AVAILABILITY ================= */}

          {page === "availability" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  FARMER
                </span>

                <h2>
                  📅 Harvest Availability
                </h2>

                <p>
                  Tell customers what you will
                  harvest, when it will be ready
                  and where it is available.
                </p>

              </div>

              <div className="formGrid">

                <label>
                  Crop

                  <select
                    value={
                      availabilityForm.crop
                    }
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        crop:
                          e.target.value,
                      })
                    }
                  >
                    {Object.keys(
                      cropData
                    ).map((crop) => (
                      <option
                        key={crop}
                      >
                        {crop}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantity (kg)

                  <input
                    type="number"
                    min="1"
                    value={
                      availabilityForm.quantity
                    }
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        quantity:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Harvest Date

                  <input
                    type="date"
                    min={today}
                    value={
                      availabilityForm.date
                    }
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        date:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Area

                  <input
                    value={
                      availabilityForm.area
                    }
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        area:
                          e.target.value,
                      })
                    }
                    placeholder={
                      farmerProfile.location ||
                      "Example: Tiruppur"
                    }
                  />
                </label>

                <label>
                  Preferred Market

                  <select
                    value={availabilityForm.market}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        market: e.target.value,
                      })
                    }
                  >
                    {markets.map((market) => (
                      <option key={market.id}>
                        {market.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quality Grade

                  <select
                    value={availabilityForm.quality}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        quality: e.target.value,
                      })
                    }
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Processing)</option>
                  </select>
                </label>

                <label>
                  Farming Type

                  <select
                    value={availabilityForm.farmingType}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        farmingType: e.target.value,
                      })
                    }
                  >
                    <option value="Organic">Organic Farming</option>
                    <option value="Conventional">Conventional</option>
                  </select>
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Crop Notes & Quality Info

                  <input
                    value={availabilityForm.notes}
                    onChange={(e) =>
                      setAvailabilityForm({
                        ...availabilityForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="e.g. Freshly picked, pest-free, optimal ripeness"
                  />
                </label>

              </div>

              <button
                className="primary"
                onClick={addAvailability}
              >
                + Add Harvest Availability
              </button>

              <h3 className="sectionTitle">
                Your Harvest Schedule
              </h3>

              <div className="tableWrap">

                <table>

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Crop</th>
                      <th>Quality</th>
                      <th>Total</th>
                      <th>Available</th>
                      <th>Area</th>
                      <th>Market</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {listings.map(
                      (item) => (
                        <tr
                          key={item.id}
                        >
                          <td>
                            {item.date}
                          </td>

                          <td>
                            {cropData[item.crop]?.icon} {item.crop}
                          </td>

                          <td>
                            <span className={`qualityBadge ${item.quality === 'Grade B' ? 'qualityGradeB' : item.quality === 'Grade C' ? 'qualityGradeC' : 'qualityGradeA'}`}>
                              {item.quality || 'Grade A'}
                            </span>
                            {item.farmingType && (
                              <span className="farmingTag">
                                {item.farmingType}
                              </span>
                            )}
                          </td>

                          <td>
                            {item.quantity} kg
                          </td>

                          <td>
                            <b>
                              {
                                item.available
                              }{" "}
                              kg
                            </b>
                          </td>

                          <td>
                            {item.area}
                          </td>

                          <td>
                            {item.market}
                          </td>

                          <td>
                            <button
                              className="danger"
                              onClick={() =>
                                deleteAvailability(
                                  item.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>
          )}

          {/* ================= WEATHER ================= */}

          {page === "weather" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  FARM PLANNING
                </span>

                <h2>
                  🌦️ Weather & Crop Care
                </h2>

                <p>
                  A common farm planning view.
                  Weather is shown as demo data
                  for the hackathon prototype.
                </p>

              </div>

              <div className="weatherGrid">

                {[
                  [
                    "Today",
                    "☀️",
                    "32°C",
                    "Low rain",
                  ],
                  [
                    "Tomorrow",
                    "🌤️",
                    "31°C",
                    "Low rain",
                  ],
                  [
                    "Day 3",
                    "🌧️",
                    "29°C",
                    "Rain possible",
                  ],
                  [
                    "Day 4",
                    "🌦️",
                    "30°C",
                    "Moderate rain",
                  ],
                  [
                    "Day 5",
                    "☀️",
                    "33°C",
                    "Dry",
                  ],
                  [
                    "Day 6",
                    "🌤️",
                    "32°C",
                    "Low rain",
                  ],
                  [
                    "Day 7",
                    "🌧️",
                    "29°C",
                    "Rain possible",
                  ],
                ].map(
                  ([
                    day,
                    icon,
                    temp,
                    rain,
                  ]) => (
                    <div
                      className="weatherCard"
                      key={day}
                    >
                      <b>
                        {day}
                      </b>
                      <span>
                        {icon}
                      </span>
                      <strong>
                        {temp}
                      </strong>
                      <small>
                        {rain}
                      </small>
                    </div>
                  )
                )}

              </div>

              <div className="cropCare">

                <h3>
                  🌱 Crop Care
                </h3>

                <div className="careCard">

                  <div className="careIcon">
                    {
                      cropData[
                        harvestInput.crop
                      ].icon
                    }
                  </div>

                  <div>
                    <h3>
                      {
                        harvestInput.crop
                      }
                    </h3>

                    <p>
                      {
                        cropData[
                          harvestInput.crop
                        ].care
                      }
                    </p>
                  </div>

                </div>

              </div>

              <div className="infoBox">
                <b>
                  📌 Demo note
                </b>

                <p>
                  For the final production version,
                  a live weather API can replace
                  this prototype forecast.
                </p>
              </div>

            </section>
          )}

          {/* ================= WASTE ================= */}

          {page === "waste" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  FARMER RECOVERY
                </span>

                <h2>
                  ♻️ Extra Produce Recovery
                </h2>

                <p>
                  Don't treat every excess or
                  lower-grade produce as zero value.
                  List suitable extra produce for
                  processing or other recovery uses.
                </p>

              </div>

              <div className="recoveryHighlight">

                <div>
                  <span>
                    Example
                  </span>

                  <h2>
                    30 kg Brinjal
                  </h2>

                  <p>
                    Recovery value ₹8/kg
                  </p>
                </div>

                <strong>
                  ₹240
                </strong>

              </div>

              <div className="formGrid">

                <label>
                  Crop / Extra Produce

                  <select
                    value={
                      wasteForm.crop
                    }
                    onChange={(e) =>
                      setWasteForm({
                        ...wasteForm,
                        crop:
                          e.target.value,
                      })
                    }
                  >
                    {Object.keys(
                      cropData
                    ).map((crop) => (
                      <option
                        key={crop}
                      >
                        {crop}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Extra Quantity (kg)

                  <input
                    type="number"
                    min="1"
                    value={
                      wasteForm.quantity
                    }
                    onChange={(e) =>
                      setWasteForm({
                        ...wasteForm,
                        quantity:
                          e.target.value,
                      })
                    }
                    placeholder="Example: 30"
                  />
                </label>

                <label>
                  Expected Recovery Value ₹/kg

                  <input
                    type="number"
                    min="1"
                    value={
                      wasteForm.price
                    }
                    onChange={(e) =>
                      setWasteForm({
                        ...wasteForm,
                        price:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Area

                  <input
                    value={
                      wasteForm.area
                    }
                    onChange={(e) =>
                      setWasteForm({
                        ...wasteForm,
                        area:
                          e.target.value,
                      })
                    }
                    placeholder={
                      farmerProfile.location ||
                      "Local Area"
                    }
                  />
                </label>

              </div>

              <button
                className="primary"
                onClick={
                  addExtraProduce
                }
              >
                + List Extra Produce
              </button>

              <div className="productGrid">

                {wasteProducts.map(
                  (item) => {

                    const revenue =
                      item.quantity *
                      item.price;

                    return (
                      <div
                        className="productCard recoveryCard"
                        key={item.id}
                      >

                        <div className="cropEmoji">
                          ♻️
                        </div>

                        <h3>
                          {
                            item.crop
                          }
                        </h3>

                        <p>
                          Extra quantity:{" "}
                          <b>
                            {
                              item.quantity
                            }{" "}
                            kg
                          </b>
                        </p>

                        <p>
                          Area:{" "}
                          <b>
                            {item.area}
                          </b>
                        </p>

                        <p>
                          Suitable for:{" "}
                          {item.use}
                        </p>

                        <strong className="price">
                          ₹
                          {
                            item.price
                          }
                          /kg
                        </strong>

                        <div className="revenueBox">
                          Potential Recovery
                          Revenue
                          <strong>
                            ₹
                            {revenue.toFixed(
                              0
                            )}
                          </strong>
                        </div>

                        <button
                          className="danger full"
                          onClick={() =>
                            deleteExtraProduce(
                              item.id
                            )
                          }
                        >
                          Delete Listing
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

              <div className="infoBox">
                <b>
                  Important:
                </b>

                <p>
                  Only suitable excess/lower-grade
                  produce should be redirected for
                  recovery. Completely spoiled or
                  unsafe material should not be
                  represented as fresh food.
                </p>
              </div>

            </section>
          )}

          {/* ================= CUSTOMER MARKETPLACE ================= */}

          {page === "marketplace" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  CUSTOMER
                </span>

                <h2>
                  🛒 Farmer-to-Customer
                  Marketplace
                </h2>

                <p>
                  Pre-book available produce by
                  date and area.
                </p>

              </div>

              <div className="filterBar">

                <label>
                  Search Crop
                  <input
                    type="text"
                    placeholder="Search by crop name..."
                    value={customerCropQuery}
                    onChange={(e) => setCustomerCropQuery(e.target.value)}
                  />
                </label>

                <label>
                  Quality Grade
                  <select
                    value={customerQualityFilter}
                    onChange={(e) => setCustomerQualityFilter(e.target.value)}
                  >
                    <option value="">All Quality Grades</option>
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Processing)</option>
                  </select>
                </label>

                <label>
                  Area

                  <select
                    value={customerArea}
                    onChange={(e) => setCustomerArea(e.target.value)}
                  >
                    <option value="">All Areas</option>

                    {[...new Set(listings.map((x) => x.area))].map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Harvest Date

                  <input
                    type="date"
                    min={today}
                    value={customerDate}
                    onChange={(e) => setCustomerDate(e.target.value)}
                  />
                </label>

              </div>

              {filteredListings.length ===
              0 ? (
                <div className="empty">
                  <div>
                    🌱
                  </div>

                  <h3>
                    No produce available
                  </h3>

                  <p>
                    Try another date or
                    area.
                  </p>
                </div>
              ) : (
                <div className="productGrid">

                  {filteredListings.map(
                    (item) => (
                      <div
                        className="productCard"
                        key={item.id}
                      >

                        <div className="cropEmoji">
                          {cropData[item.crop]?.icon}
                        </div>

                        <div style={{ display: "flex", gap: "6px", margin: "6px 0" }}>
                          <span className={`qualityBadge ${item.quality === 'Grade B' ? 'qualityGradeB' : item.quality === 'Grade C' ? 'qualityGradeC' : 'qualityGradeA'}`}>
                            {item.quality || 'Grade A'}
                          </span>
                          {item.farmingType && (
                            <span className="farmingTag">
                              {item.farmingType}
                            </span>
                          )}
                        </div>

                        <h3>{item.crop}</h3>

                        <p>👨‍🌾 {item.farmer}</p>
                        <p>📅 {item.date}</p>
                        <p>📍 {item.area}</p>
                        <p>🏪 {item.market}</p>
                        {item.notes && <p style={{ fontSize: "12px", color: "#4f6855", fontStyle: "italic" }}>"{item.notes}"</p>}

                        <strong className="price">
                          ₹
                          {item.price}
                          /kg
                        </strong>

                        <div className="stock">
                          <span>
                            Available
                          </span>

                          <b>
                            {
                              item.available
                            }{" "}
                            kg
                          </b>
                        </div>

                        <input
                          type="number"
                          min="1"
                          max={
                            item.available
                          }
                          placeholder="Quantity (kg)"
                          value={
                            orderQty[
                              item.id
                            ] || ""
                          }
                          onChange={(e) =>
                            setOrderQty({
                              ...orderQty,
                              [item.id]:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <div className="deliveryOptions">

                          <label>
                            <input
                              type="radio"
                              name={`delivery-${item.id}`}
                              checked={
                                (deliveryChoice[
                                  item.id
                                ] ||
                                  "pickup") ===
                                "pickup"
                              }
                              onChange={() =>
                                setDeliveryChoice({
                                  ...deliveryChoice,
                                  [item.id]:
                                    "pickup",
                                })
                              }
                            />

                            Pickup
                          </label>

                          <label>
                            <input
                              type="radio"
                              name={`delivery-${item.id}`}
                              checked={
                                deliveryChoice[
                                  item.id
                                ] ===
                                "delivery"
                              }
                              onChange={() =>
                                setDeliveryChoice({
                                  ...deliveryChoice,
                                  [item.id]:
                                    "delivery",
                                })
                              }
                            />

                            Local Delivery +₹80
                          </label>

                        </div>

                        <button
                          className="primary full"
                          onClick={() =>
                            placeOrder(
                              item
                            )
                          }
                        >
                          Pre-book Now
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              <div className="deliveryNotice">
                <b>
                  🚚 Smart Delivery
                </b>

                <p>
                  Same/nearby area → local
                  delivery partner or pickup.
                </p>

                <p>
                  Long-distance delivery →
                  pickup is recommended.
                </p>

                <p>
                  Delivery charge is added only
                  when local delivery is selected.
                </p>

              </div>

            </section>
          )}

          {/* ================= CUSTOMER ORDERS ================= */}

          {page === "orders" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  CUSTOMER
                </span>

                <h2>
                  📦 My Orders
                </h2>

                <p>
                  Your pre-booked produce.
                </p>

              </div>

              {orders.length ===
              0 ? (
                <div className="empty">
                  <div>
                    📦
                  </div>

                  <h3>
                    No orders yet
                  </h3>

                  <button
                    className="primary"
                    onClick={() =>
                      setPage(
                        "marketplace"
                      )
                    }
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="orderList">

                  {orders.map(
                    (order) => (
                      <div
                        className="orderCard"
                        key={order.id}
                      >

                        <div>
                          <span>
                            {
                              order.status
                            }
                          </span>

                          <h3>
                            {
                              cropData[
                                order.crop
                              ]?.icon
                            }{" "}
                            {order.crop}
                          </h3>

                          <p>
                            {order.quantity} kg
                            • {order.date}
                          </p>

                          <p>
                            📍 {order.area}
                          </p>
                        </div>

                        <div>
                          <p>
                            Product: ₹
                            {
                              order.productTotal
                            }
                          </p>

                          <p>
                            Delivery: ₹
                            {
                              order.deliveryCharge
                            }
                          </p>

                          <strong>
                            Total: ₹
                            {order.total}
                          </strong>
                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          )}

          {/* ================= FARMER CUSTOMER BOOKINGS ================= */}

          {page === "farmer-bookings" && (
            <section className="panel">
              <div className="pageTitle">
                <span className="badge">FARMER MANAGEMENT</span>
                <h2>📦 Customer Pre-Bookings & Orders</h2>
                <p>Review customer pre-bookings and manage order statuses.</p>
              </div>

              {orders.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: "30px" }}>
                  <div style={{ fontSize: "40px" }}>📦</div>
                  <h3>No customer orders received yet</h3>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>When customers pre-book produce, orders will appear here automatically.</p>
                </div>
              ) : (
                <div className="tableWrapper" style={{ overflowX: "auto" }}>
                  <table className="dataTable" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>Booking ID</th>
                        <th style={{ padding: "10px" }}>Customer Name</th>
                        <th style={{ padding: "10px" }}>Product / Crop</th>
                        <th style={{ padding: "10px" }}>Quantity</th>
                        <th style={{ padding: "10px" }}>Total Amount</th>
                        <th style={{ padding: "10px" }}>Booking Date</th>
                        <th style={{ padding: "10px" }}>Delivery/Pickup Date</th>
                        <th style={{ padding: "10px" }}>Delivery Address</th>
                        <th style={{ padding: "10px" }}>Status</th>
                        <th style={{ padding: "10px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px" }}><strong>#{o.id}</strong></td>
                          <td style={{ padding: "10px" }}>
                            <strong>{o.customerName || "Customer"}</strong>
                            {o.customerPhone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {o.customerPhone}</div>}
                          </td>
                          <td style={{ padding: "10px" }}>{cropData[o.crop]?.icon || "🌾"} {o.crop}</td>
                          <td style={{ padding: "10px" }}>{o.quantity} kg</td>
                          <td style={{ padding: "10px" }}><strong>₹{o.total ? o.total.toLocaleString("en-IN") : 0}</strong></td>
                          <td style={{ padding: "10px" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : today}</td>
                          <td style={{ padding: "10px" }}>{o.deliveryDate || o.date || "Scheduled"}</td>
                          <td style={{ padding: "10px" }}>{o.deliveryAddress || o.area || "Local Area"}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: o.status === "Accepted" ? "#ecfdf5" : o.status === "Completed" ? "#eff6ff" : o.status === "Rejected" ? "#fef2f2" : "#fefce8",
                              color: o.status === "Accepted" ? "#047857" : o.status === "Completed" ? "#1d4ed8" : o.status === "Rejected" ? "#b91c1c" : "#a16207"
                            }}>
                              {o.status || "Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="primary"
                                style={{ padding: "6px 10px", fontSize: "12px", backgroundColor: "#059669", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
                                onClick={() => updateOrderStatus(o.id, "Accepted")}
                                disabled={o.status === "Accepted"}
                              >
                                Accept
                              </button>
                              <button
                                className="secondary"
                                style={{ padding: "6px 10px", fontSize: "12px", backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
                                onClick={() => updateOrderStatus(o.id, "Rejected")}
                                disabled={o.status === "Rejected"}
                              >
                                Reject
                              </button>
                              <button
                                className="primary"
                                style={{ padding: "6px 10px", fontSize: "12px", backgroundColor: "#2563eb", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
                                onClick={() => updateOrderStatus(o.id, "Completed")}
                                disabled={o.status === "Completed"}
                              >
                                Complete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ================= HELP ================= */}

          {page === "help" && (
            <section className="panel">

              <div className="pageTitle">

                <span className="badge">
                  SUPPORT
                </span>

                <h2>
                  🆘 SmartFarm Help Desk
                </h2>

                <p>
                  Need help with the application?
                  Choose the issue below.
                </p>

              </div>

              <div className="helpGrid">

                {[
                  [
                    "🌱",
                    "Harvest Decision",
                  ],
                  [
                    "🛒",
                    "Marketplace / Order",
                  ],
                  [
                    "🚚",
                    "Delivery",
                  ],
                  [
                    "💳",
                    "Payment",
                  ],
                  [
                    "📱",
                    "Technical Problem",
                  ],
                  [
                    "📍",
                    "Location / Profile",
                  ],
                ].map(
                  ([icon, title]) => (
                    <button
                      className="helpCard"
                      key={title}
                      onClick={() =>
                        alert(
                          `Support request created for: ${title}`
                        )
                      }
                    >
                      <span>
                        {icon}
                      </span>

                      <strong>
                        {title}
                      </strong>

                      <small>
                        Get assistance →
                      </small>
                    </button>
                  )
                )}

              </div>

              <div className="supportContact">

                <h3>
                  📞 Support
                </h3>

                <p>
                  For the hackathon prototype,
                  support requests are simulated
                  locally. A real support backend
                  can be connected later.
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    alert(
                      "Support request submitted successfully."
                    )
                  }
                >
                  Contact SmartFarm Support
                </button>

              </div>

            </section>
          )}

        </main>
      </div>

      {/* ================= AUTH MODAL ================= */}
      {showAuthModal && (
        <div className="modalBackdrop" onClick={() => setShowAuthModal(false)}>
          <div className="authModalCard" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={() => setShowAuthModal(false)}>✕</button>
            <div className="authTabs">
              <button
                className={`authTab ${!authIsRegister ? "active" : ""}`}
                onClick={() => { setAuthIsRegister(false); setAuthError(""); }}
              >
                Sign In
              </button>
              <button
                className={`authTab ${authIsRegister ? "active" : ""}`}
                onClick={() => { setAuthIsRegister(true); setAuthError(""); }}
              >
                Register
              </button>
            </div>

            {authError && (
              <div style={{ color: "#d32f2f", fontSize: "13px", marginBottom: "12px", background: "#ffebee", padding: "8px 12px", borderRadius: "8px" }}>
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {authIsRegister && (
                <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600" }}>
                  Full Name
                  <input
                    type="text"
                    required
                    value={authInput.name}
                    onChange={(e) => setAuthInput({ ...authInput, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "4px" }}
                  />
                </label>
              )}

              <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600" }}>
                Email Address
                <input
                  type="email"
                  required
                  value={authInput.email}
                  onChange={(e) => setAuthInput({ ...authInput, email: e.target.value })}
                  placeholder="farmer@smartfarm.com"
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "4px" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600" }}>
                Password
                <input
                  type="password"
                  required
                  value={authInput.password}
                  onChange={(e) => setAuthInput({ ...authInput, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "4px" }}
                />
              </label>

              {authIsRegister && (
                <>
                  <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600" }}>
                    Account Role
                    <select
                      value={authInput.role}
                      onChange={(e) => setAuthInput({ ...authInput, role: e.target.value })}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "4px" }}
                    >
                      <option value="farmer">👨‍🌾 Farmer</option>
                      <option value="consumer">🥗 Consumer</option>
                    </select>
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", fontSize: "13px", fontWeight: "600" }}>
                    Location / City
                    <input
                      type="text"
                      value={authInput.location}
                      onChange={(e) => setAuthInput({ ...authInput, location: e.target.value })}
                      placeholder="e.g. Tiruppur"
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "4px" }}
                    />
                  </label>
                </>
              )}

              <button className="primary" type="submit" disabled={authLoading} style={{ marginTop: "8px", padding: "12px" }}>
                {authLoading ? "Processing..." : authIsRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="authQuickDemo">
              <p>⚡ Quick Demo One-Click Sign In:</p>
              <div className="demoUserBtns">
                <button className="demoBtn" onClick={() => quickDemoLogin("farmer@smartfarm.com", "farmer123", "farmer")}>
                  <span>👨‍🌾 Demo Farmer</span>
                  <small>farmer@smartfarm.com</small>
                </button>
                <button className="demoBtn" onClick={() => quickDemoLogin("consumer@smartfarm.com", "consumer123", "consumer")}>
                  <span>🥗 Demo Consumer</span>
                  <small>consumer@smartfarm.com</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST OVERLAY ================= */}
      {toastMsg && (
        <div className="toastOverlay">
          <span>✨</span> {toastMsg}
        </div>
      )}

      <footer>
        SmartFarm • Harvest Smart • Sell Smart • Reduce Waste
      </footer>

    </div>
  );
}

export default App;