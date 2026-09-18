import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import ReactDOM from 'react-dom/client';

import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  Gauge,
  LogOut,
  Menu as MenuIcon,
  Receipt,
  Settings,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Target,
  Store,
  Percent,
  PackageSearch,
  ShoppingBag,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';

import './styles.css';


/* =========================================================
   API
   ========================================================= */

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:4100/api';


/* =========================================================
   FORMAT
   ========================================================= */

const money = (n) =>
  new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(n || 0)
  );


const shortMoney = (n) => {
  const v =
    Number(n || 0);

  if (
    Math.abs(v) >=
    1_000_000
  ) {
    return `Rp ${(v / 1_000_000).toFixed(1)} jt`;
  }

  if (
    Math.abs(v) >=
    1_000
  ) {
    return `Rp ${(v / 1_000).toFixed(0)} rb`;
  }

  return money(v);
};


const dateLabel = (iso) =>
  new Date(iso)
    .toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short'
      }
    );


/* =========================================================
   AXIOS
   ========================================================= */

const api =
  axios.create({
    baseURL: API
  });


api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        'p2_token'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);


/* =========================================================
   APP
   ========================================================= */

function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={<ProtectedLayout />}
        />

      </Routes>
    </BrowserRouter>
  );
}

// ========================================================
// Settings Page
// ======================================================== */

function SettingsPage() {

  const [
    activeSection,
    setActiveSection
  ] = useState(null);


  const [
    settings,
    setSettings
  ] = useState({

    businessName:
      'Dapoersari',

    businessDescription:
      '',

    phone:
      '',

    address:
      '',

    openingHours:
      '',

    shopeefoodPlatformRate:
      25,

    targetDailySales:
      0,

    targetMonthlySales:
      0,

    targetDailyTransactions:
      0,

    targetMargin:
      0

  });


  const [
    categories,
    setCategories
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    categoryLoading,
    setCategoryLoading
  ] = useState(false);


  const [
    categoryModal,
    setCategoryModal
  ] = useState(false);


  const [
    categoryForm,
    setCategoryForm
  ] = useState({

    id: null,

    name:
      ''

  });


  const [
    message,
    setMessage
  ] = useState('');


  const [
    error,
    setError
  ] = useState('');


  const [
  passwordModal,
  setPasswordModal
] = useState(false);


const [
  passwordForm,
  setPasswordForm
] = useState({

  currentPassword:
    '',

  newPassword:
    '',

  confirmPassword:
    ''

});


const [
  passwordSaving,
  setPasswordSaving
] = useState(false);


const [
  passwordError,
  setPasswordError
] = useState('');


/* =====================================================
ubah password
===================================================== */
const changePassword =
  async (event) => {

    event.preventDefault();


    setPasswordError('');


    if (
      passwordForm.currentPassword
        .length === 0
    ) {

      setPasswordError(
        'Password saat ini wajib diisi.'
      );

      return;

    }


    if (
      passwordForm.newPassword
        .length < 6
    ) {

      setPasswordError(
        'Password baru minimal 6 karakter.'
      );

      return;

    }


    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {

      setPasswordError(
        'Konfirmasi password tidak cocok.'
      );

      return;

    }


    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {

      setPasswordError(
        'Password baru harus berbeda dari password lama.'
      );

      return;

    }


    try {

      setPasswordSaving(
        true
      );


      await api.post(
        '/auth/change-password',
        {

          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword

        }
      );


      setPasswordModal(
        false
      );


      setPasswordForm({

        currentPassword:
          '',

        newPassword:
          '',

        confirmPassword:
          ''

      });


      alert(
        'Password berhasil diubah.'
      );


    } catch (error) {

      console.error(
        'Gagal mengubah password:',
        error
      );


      setPasswordError(
        error?.response?.data?.error ||
        'Password gagal diubah.'
      );


    } finally {

      setPasswordSaving(
        false
      );

    }

  };



  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  const loadSettings =
    async () => {

      try {

        setLoading(true);

        setError('');

        const response =
          await api.get(
            '/settings'
          );


        const data =
          response.data ||
          {};


        setSettings({

          businessName:
            data.businessName ||
            data.business_name ||
            'Dapoersari',

          businessDescription:
            data.businessDescription ||
            data.business_description ||
            '',

          phone:
            data.phone ||
            '',

          address:
            data.address ||
            '',

          openingHours:
            data.openingHours ||
            data.opening_hours ||
            '',

          shopeefoodPlatformRate:
            Number(
              data.shopeefoodPlatformRate ??
              data.platformFee ??
              data.shopeefood_platform_rate ??
              25
            ),

          targetDailySales:
            Number(
              data.targetDailySales ??
              data.dailyTarget ??
              data.target_daily_sales ??
              0
            ),

          targetMonthlySales:
            Number(
              data.targetMonthlySales ??
              data.monthlyTarget ??
              data.target_monthly_sales ??
              0
            ),

          targetDailyTransactions:
            Number(
              data.targetDailyTransactions ??
              data.target_daily_transactions ??
              0
            ),

          targetMargin:
            Number(
              data.targetMargin ??
              data.target_margin ??
              0
            )

        });


      } catch (e) {

        console.error(
          'Gagal memuat pengaturan:',
          e
        );


        setError(
          e?.response?.data?.error ||
          ''
        );

      } finally {

        setLoading(false);

      }

    };


  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  const loadCategories =
    async () => {

      try {

        setCategoryLoading(
          true
        );


        const response =
          await api.get(
            '/expense-categories'
          );


        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : Array.isArray(
                response.data?.data
              )
              ? response.data.data
              : [];


        setCategories(
          data
        );


      } catch (e) {

        console.error(
          'Kategori gagal dimuat:',
          e
        );

        setCategories([]);

      } finally {

        setCategoryLoading(
          false
        );

      }

    };


  useEffect(() => {

    loadSettings();

    loadCategories();

  }, []);


  /* =====================================================
     UPDATE
  ===================================================== */

  const updateField =
    (
      field,
      value
    ) => {

      setSettings(
        current => ({
          ...current,
          [field]:
            value
        })
      );


      setMessage('');

    };


  /* =====================================================
     SAVE
  ===================================================== */

  const saveSettings =
    async (event) => {

      event.preventDefault();


      try {

        setSaving(true);

        setMessage('');

        setError('');


        await api.put(
          '/settings',
          {

            businessName:
              settings.businessName,

            shopeefoodPlatformRate:
              Number(
                settings.shopeefoodPlatformRate
              ),

            targetDailySales:
              Number(
                settings.targetDailySales
              ),

            targetMonthlySales:
              Number(
                settings.targetMonthlySales
              )

          }
        );


        setMessage(
          'Pengaturan berhasil disimpan.'
        );


      } catch (e) {

        console.error(
          'Gagal menyimpan:',
          e
        );


        setError(
          e?.response?.data?.error ||
          'Pengaturan gagal disimpan.'
        );

      } finally {

        setSaving(false);

      }

    };


  /* =====================================================
     CATEGORY
  ===================================================== */

  const openAddCategory =
    () => {

      setCategoryForm({
        id:
          null,

        name:
          ''
      });

      setCategoryModal(
        true
      );

    };


  const openEditCategory =
    category => {

      setCategoryForm({

        id:
          category.id,

        name:
          category.name || ''

      });

      setCategoryModal(
        true
      );

    };


  const saveCategory =
    async event => {

      event.preventDefault();


      const name =
        categoryForm.name.trim();


      if (!name) {

        alert(
          'Nama kategori wajib diisi.'
        );

        return;

      }


      try {

        setCategoryLoading(
          true
        );


        if (
          categoryForm.id
        ) {

          await api.put(
            `/expense-categories/${categoryForm.id}`,
            { name }
          );

        } else {

          await api.post(
            '/expense-categories',
            { name }
          );

        }


        setCategoryModal(
          false
        );


        await loadCategories();

      } catch (e) {

        alert(
          e?.response?.data?.error ||
          'Kategori gagal disimpan.'
        );

      } finally {

        setCategoryLoading(
          false
        );

      }

    };


  const deleteCategory =
    async id => {

      const confirmed =
        window.confirm(
          'Hapus kategori ini?'
        );


      if (!confirmed) {
        return;
      }


      try {

        await api.delete(
          `/expense-categories/${id}`
        );


        await loadCategories();

      } catch (e) {

        alert(
          e?.response?.data?.error ||
          'Kategori gagal dihapus.'
        );

      }

    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <LoadingPage />
    );

  }


  /* =====================================================
     MENU CONFIG
  ===================================================== */

  const settingMenus = [

    {
      id:
        'usaha',

      title:
        'Profil Usaha',

      description:
        'Identitas, kontak, alamat, dan jam operasional usaha.',

      icon:
        <Store size={19} />

    },

    {
      id:
        'penjualan',

      title:
        'Penjualan',

      description:
        'Atur channel penjualan dan parameter potongan platform.',

      icon:
        <Receipt size={19} />

    },

    {
      id:
        'target',

      title:
        'Target Bisnis',

      description:
        'Tentukan target omzet dan indikator performa usaha.',

      icon:
        <Target size={19} />

    },

    {
      id:
        'kategori',

      title:
        'Kategori Pengeluaran',

      description:
        'Kelola kategori biaya agar pencatatan lebih terstruktur.',

      icon:
        <WalletCards size={19} />

    },

    {
      id:
        'akun',

      title:
        'Akun & Keamanan',

      description:
        'Kelola profil owner dan keamanan akun.',

      icon:
        <Settings size={19} />

    }

  ];


  /* =====================================================
     PAGE HEADER
  ===================================================== */

  return (
    <>

      <PageHeader

        eyebrow="
          PUSAT PENGATURAN
        "

        title="
          Pengaturan
        "

        subtitle="
          Kelola konfigurasi usaha,
          penjualan, target bisnis,
          dan akun owner.
        "

      />


      <div
        className="
          settings-shell
        "
      >


        {/* =================================================
            MENU AWAL
        ================================================= */}

        {!activeSection && (

          <section
            className="
              settings-home
            "
          >

            <div
              className="
                settings-home-intro
              "
            >

           </div>


            <div
              className="
                settings-menu-list
              "
            >

              {settingMenus.map(
                item => (

                  <button

                    key={
                      item.id
                    }

                    type="button"

                    className="
                      settings-menu-card
                    "

                    onClick={() =>
                      setActiveSection(
                        item.id
                      )
                    }

                  >

                    <div
                      className="
                        settings-menu-icon
                      "
                    >

                      {
                        item.icon
                      }

                    </div>


                    <div
                      className="
                        settings-menu-copy
                      "
                    >

                      <strong>
                        {
                          item.title
                        }
                      </strong>

                      <span>
                        {
                          item.description
                        }
                      </span>

                    </div>


                    <ChevronRight
                      size={18}
                      className="
                        settings-menu-arrow
                      "
                    />

                  </button>

                )
              )}

            </div>

          </section>

        )}


        {/* =================================================
            DETAIL
        ================================================= */}

        {activeSection && (

          <section
            className="
              settings-detail
            "
          >

            <button

              type="button"

              className="
                settings-back
              "

              onClick={() =>
                setActiveSection(
                  null
                )
              }

            >

              <ArrowLeft
                size={16}
              />

              Kembali ke Pengaturan

            </button>


            {/* =================================================
                PROFIL USAHA
            ================================================= */}

            {activeSection ===
              'usaha' && (

              <form
                className="
                  settings-detail-card
                "

                onSubmit={
                  saveSettings
                }
              >

                <div
                  className="
                    settings-detail-head
                  "
                >

                  <div
                    className="
                      settings-detail-icon
                    "
                  >
                    <Store
                      size={19}
                    />
                  </div>

                  <div>

                    <span>
                      PROFIL USAHA
                    </span>

                    <h2>
                      Profil Usaha
                    </h2>

                    <p>
                      Identitas yang digunakan
                      dalam sistem.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    settings-form
                  "
                >

                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Nama Usaha
                    </label>

                    <input
                      value={
                        settings.businessName
                      }
                      onChange={e =>
                        updateField(
                          'businessName',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Nomor Telepon
                    </label>

                    <input
                      value={
                        settings.phone
                      }
                      onChange={e =>
                        updateField(
                          'phone',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                      settings-field-full
                    "
                  >

                    <label>
                      Deskripsi Usaha
                    </label>

                    <textarea
                      value={
                        settings.businessDescription
                      }
                      onChange={e =>
                        updateField(
                          'businessDescription',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                      settings-field-full
                    "
                  >

                    <label>
                      Alamat Usaha
                    </label>

                    <textarea
                      value={
                        settings.address
                      }
                      onChange={e =>
                        updateField(
                          'address',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Jam Operasional
                    </label>

                    <input
                      value={
                        settings.openingHours
                      }
                      onChange={e =>
                        updateField(
                          'openingHours',
                          e.target.value
                        )
                      }
                      placeholder="
                        10.00 - 22.00
                      "
                    />

                  </div>

                </div>


                <div
                  className="
                    settings-card-foot
                  "
                >

                  <div>

                    {message && (
                      <span
                        className="
                          settings-success
                        "
                      >
                        {message}
                      </span>
                    )}

                    {error && (
                      <span
                        className="
                          settings-error
                        "
                      >
                        {error}
                      </span>
                    )}

                  </div>


                  <button
                    type="submit"
                    className="
                      primary-btn
                    "
                    disabled={
                      saving
                    }
                  >

                    {saving
                      ? 'Menyimpan...'
                      : 'Simpan Perubahan'
                    }

                  </button>

                </div>

              </form>

            )}


            {/* =================================================
                PENJUALAN
            ================================================= */}

            {activeSection ===
              'penjualan' && (

              <form
                className="
                  settings-detail-card
                "
                onSubmit={
                  saveSettings
                }
              >

                <div
                  className="
                    settings-detail-head
                  "
                >

                  <div
                    className="
                      settings-detail-icon
                    "
                  >
                    <Receipt
                      size={19}
                    />
                  </div>

                  <div>

                    <span>
                      PENJUALAN
                    </span>

                    <h2>
                      Konfigurasi Penjualan
                    </h2>

                    <p>
                      Pengaturan yang digunakan
                      untuk perhitungan penjualan.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    settings-form
                  "
                >

                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Potongan ShopeeFood (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        settings.shopeefoodPlatformRate
                      }
                      onChange={e =>
                        updateField(
                          'shopeefoodPlatformRate',
                          e.target.value
                        )
                      }
                    />

                    <small
                      className="
                        settings-help
                      "
                    >
                      Digunakan untuk menghitung
                      penjualan bersih.
                    </small>

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Channel Penjualan
                    </label>

                    <div
                      className="
                        settings-static-box
                      "
                    >

                      <span>
                        Website
                      </span>

                      <b>
                        Aktif
                      </b>

                    </div>


                    <div
                      className="
                        settings-static-box
                      "
                    >

                      <span>
                        Offline
                      </span>

                      <b>
                        Aktif
                      </b>

                    </div>


                    <div
                      className="
                        settings-static-box
                      "
                    >

                      <span>
                        ShopeeFood
                      </span>

                      <b>
                        Aktif
                      </b>

                    </div>

                  </div>

                </div>


                <div
                  className="
                    settings-card-foot
                  "
                >

                  <div />

                  <button
                    type="submit"
                    className="
                      primary-btn
                    "
                    disabled={
                      saving
                    }
                  >

                    {saving
                      ? 'Menyimpan...'
                      : 'Simpan Konfigurasi'
                    }

                  </button>

                </div>

              </form>

            )}


            {/* =================================================
                TARGET
            ================================================= */}

            {activeSection ===
              'target' && (

              <form
                className="
                  settings-detail-card
                "
                onSubmit={
                  saveSettings
                }
              >

                <div
                  className="
                    settings-detail-head
                  "
                >

                  <div
                    className="
                      settings-detail-icon
                    "
                  >
                    <Target
                      size={19}
                    />
                  </div>

                  <div>

                    <span>
                      TARGET BISNIS
                    </span>

                    <h2>
                      Target Bisnis
                    </h2>

                    <p>
                      Target digunakan sebagai
                      dasar evaluasi performa toko.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    settings-form
                  "
                >

                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Target Penjualan Harian
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        settings.targetDailySales
                      }
                      onChange={e =>
                        updateField(
                          'targetDailySales',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Target Penjualan Bulanan
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        settings.targetMonthlySales
                      }
                      onChange={e =>
                        updateField(
                          'targetMonthlySales',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Target Transaksi Harian
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        settings.targetDailyTransactions
                      }
                      onChange={e =>
                        updateField(
                          'targetDailyTransactions',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div
                    className="
                      settings-field
                    "
                  >

                    <label>
                      Target Margin (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        settings.targetMargin
                      }
                      onChange={e =>
                        updateField(
                          'targetMargin',
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div
                  className="
                    settings-target-preview
                  "
                >

                  <div>

                    <span>
                      Target harian
                    </span>

                    <strong>
                      {money(
                        Number(
                          settings.targetDailySales
                        )
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Target bulanan
                    </span>

                    <strong>
                      {money(
                        Number(
                          settings.targetMonthlySales
                        )
                      )}
                    </strong>

                  </div>

                </div>


                <div
                  className="
                    settings-card-foot
                  "
                >

                  <div />

                  <button
                    type="submit"
                    className="
                      primary-btn
                    "
                    disabled={
                      saving
                    }
                  >

                    {saving
                      ? 'Menyimpan...'
                      : 'Simpan Target'
                    }

                  </button>

                </div>

              </form>

            )}


            {/* =================================================
                KATEGORI
            ================================================= */}

            {activeSection ===
              'kategori' && (

              <div
                className="
                  settings-detail-card
                "
              >

                <div
                  className="
                    settings-detail-head
                  "
                >

                  <div
                    className="
                      settings-detail-icon
                    "
                  >
                    <WalletCards
                      size={19}
                    />
                  </div>

                  <div>

                    <span>
                      PENGELUARAN
                    </span>

                    <h2>
                      Kategori Pengeluaran
                    </h2>

                    <p>
                      Kelola kategori biaya
                      operasional usaha.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    settings-toolbar
                  "
                >

                  <div>

                    <strong>
                      {
                        categories.length
                      }
                    </strong>

                    <span>
                      kategori tersedia
                    </span>

                  </div>


                  <button
                    type="button"
                    className="
                      primary-btn
                      small
                    "
                    onClick={
                      openAddCategory
                    }
                  >

                    <Plus
                      size={15}
                    />

                    Tambah Kategori

                  </button>

                </div>


                <div
                  className="
                    category-settings-list
                  "
                >

                  {categoryLoading ? (

                    <div
                      className="
                        settings-inline-loading
                      "
                    >
                      Memuat kategori...
                    </div>

                  ) : categories.length ===
                    0 ? (

                    <div
                      className="
                        settings-empty
                      "
                    >

                      <strong>
                        Belum ada kategori
                      </strong>

                      <span>
                        Tambahkan kategori
                        untuk mempermudah
                        pencatatan biaya.
                      </span>

                    </div>

                  ) : (

                    categories.map(
                      category => (

                        <div
                          key={
                            category.id
                          }
                          className="
                            category-settings-row
                          "
                        >

                          <div>

                            <span
                              className="
                                category-dot
                              "
                            />

                            <strong>
                              {
                                category.name
                              }
                            </strong>

                          </div>


                          <div
                            className="
                              category-actions
                            "
                          >

                            <button

                              type="button"

                              className="
                                ghost-icon
                              "

                              onClick={() =>
                                openEditCategory(
                                  category
                                )
                              }

                            >

                              <Pencil
                                size={15}
                              />

                            </button>


                            <button

                              type="button"

                              className="
                                ghost-icon
                                danger
                              "

                              onClick={() =>
                                deleteCategory(
                                  category.id
                                )
                              }

                            >

                              <Trash2
                                size={15}
                              />

                            </button>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )}


            {/* =================================================
                AKUN
            ================================================= */}

            {activeSection ===
              'akun' && (

              <div
                className="
                  settings-stack
                "
              >

                <div
                  className="
                    settings-detail-card
                  "
                >

                  <div
                    className="
                      settings-detail-head
                    "
                  >

                    <div
                      className="
                        settings-detail-icon
                      "
                    >
                      <Settings
                        size={19}
                      />
                    </div>

                    <div>

                      <span>
                        OWNER
                      </span>

                      <h2>
                        Akun & Keamanan
                      </h2>

                      <p>
                        Kelola profil dan
                        keamanan akun owner.
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      account-profile
                    "
                  >

                    <div
                      className="
                        account-avatar
                      "
                    >
                      L
                    </div>


                    <div>

                      <strong>
                        Linda Kumalasari
                      </strong>

                      <span>
                        Owner
                      </span>

                    </div>

                  </div>

                </div>


                <div
                  className="
                    settings-detail-card
                  "
                >

                  <div
                    className="
                      security-row
                    "
                  >

                    <div>

                      <strong>
                        Password
                      </strong>

                      <span>
                        Ubah password akun
                        untuk menjaga keamanan.
                      </span>

                    </div>


                    <button
                    type="button"
                    className="
                      secondary-btn
                    "
                    onClick={() => {

                      setPasswordError('');

                      setPasswordForm({

                        currentPassword:
                          '',

                        newPassword:
                          '',

                        confirmPassword:
                          ''

                      });

                      setPasswordModal(
                        true
                      );

                    }}
                  >
                    Ubah Password
                  </button>

                  </div>


                  <div
                    className="
                      security-row
                    "
                  >

                    <div>

                      <strong>
                        Keluar dari aplikasi
                      </strong>

                      <span>
                        Sesi owner akan
                        diakhiri pada perangkat ini.
                      </span>

                    </div>


                    <button
                      type="button"
                      className="
                        secondary-btn
                        danger-btn
                      "
                      onClick={() => {

                        const confirmed =
                          window.confirm(
                            'Apakah Anda yakin ingin keluar dari Dapoersari Seller?'
                          );


                        if (
                          !confirmed
                        ) {
                          return;
                        }


                        localStorage.removeItem(
                          'p2_token'
                        );


                        window.location.href =
                          '/login';

                      }}
                    >
                      Keluar
                    </button>

                  </div>

                </div>

              </div>

            )}

          </section>

        )}

      </div>

           
      {passwordModal && (

  <div
    className="
      modal-backdrop
    "

    onMouseDown={(event) => {

      if (
        event.target ===
        event.currentTarget
      ) {

        if (
          !passwordSaving
        ) {

          setPasswordModal(
            false
          );

        }

      }

    }}
  >

    <div
      className="
        modal-card
        password-modal
      "
      role="dialog"
      aria-modal="true"
    >


      {/* HEADER */}

      <div
        className="
          modal-head
        "
      >

        <div>

          <span
            className="
              modal-eyebrow
            "
          >
            KEAMANAN AKUN
          </span>

          <h3>
            Ubah Password
          </h3>

        </div>


        <button

          type="button"

          className="
            ghost-icon
          "

          disabled={
            passwordSaving
          }

          onClick={() =>
            setPasswordModal(
              false
            )
          }

          aria-label="
            Tutup
          "

        >

          <X
            size={18}
          />

        </button>

      </div>


      {/* CONTENT */}

      <form
        className="
          password-form
        "
        onSubmit={
          changePassword
        }
      >


        <div
          className="
            password-intro
          "
        >

          <div
            className="
              password-intro-icon
            "
          >

            <Settings
              size={18}
            />

          </div>


          <div>

            <strong>
              Perbarui keamanan akun
            </strong>

            <span>
              Gunakan password baru yang
              sulit ditebak dan mudah
              kamu ingat.
            </span>

          </div>

        </div>


        {/* PASSWORD LAMA */}

        <label>

          Password Saat Ini

          <input

            type="password"

            value={
              passwordForm.currentPassword
            }

            onChange={(event) =>
              setPasswordForm(
                (current) => ({

                  ...current,

                  currentPassword:
                    event.target.value

                })
              )
            }

            placeholder="
              Masukkan password saat ini
            "

            autoComplete="
              current-password
            "

          />

        </label>


        {/* PASSWORD BARU */}

        <label>

          Password Baru

          <input

            type="password"

            value={
              passwordForm.newPassword
            }

            onChange={(event) =>
              setPasswordForm(
                (current) => ({

                  ...current,

                  newPassword:
                    event.target.value

                })
              )
            }

            placeholder="
              Minimal 6 karakter
            "

            autoComplete="
              new-password
            "

          />

        </label>


        {/* KONFIRMASI */}

        <label>

          Konfirmasi Password Baru

          <input

            type="password"

            value={
              passwordForm.confirmPassword
            }

            onChange={(event) =>
              setPasswordForm(
                (current) => ({

                  ...current,

                  confirmPassword:
                    event.target.value

                })
              )
            }

            placeholder="
              Ulangi password baru
            "

            autoComplete="
              new-password
            "

          />

        </label>


        {passwordError && (

          <div
            className="
              password-error
            "
          >

            {passwordError}

          </div>

        )}


        <div
          className="
            modal-actions
          "
        >

          <button

            type="button"

            className="
              secondary-btn
            "

            disabled={
              passwordSaving
            }

            onClick={() =>
              setPasswordModal(
                false
              )
            }

          >
            Batal
          </button>


          <button

            type="submit"

            className="
              primary-btn
            "

            disabled={
              passwordSaving
            }

          >

            {passwordSaving
              ? 'Menyimpan...'
              : 'Simpan Password'
            }

          </button>

        </div>

      </form>

    </div>

  </div>

)}


      {/* =====================================================
          MODAL KATEGORI
      ===================================================== */}

      {categoryModal && (

        <div
          className="
            modal-backdrop
          "

          onMouseDown={
            event => {

              if (
                event.target ===
                event.currentTarget
              ) {

                setCategoryModal(
                  false
                );

              }

            }
          }
        >

          <div
            className="
              modal-card
              category-modal
            "
          >

            <div
              className="
                modal-head
              "
            >

              <div>

                <span
                  className="
                    modal-eyebrow
                  "
                >
                  KATEGORI PENGELUARAN
                </span>

                <h3>
                  {
                    categoryForm.id
                      ? 'Edit Kategori'
                      : 'Tambah Kategori'
                  }
                </h3>

              </div>


              <button

                type="button"

                className="
                  ghost-icon
                "

                onClick={() =>
                  setCategoryModal(
                    false
                  )
                }

              >

                <X
                  size={18}
                />

              </button>

            </div>


            <form
              className="
                settings-modal-form
              "
              onSubmit={
                saveCategory
              }
            >

              <label>

                Nama Kategori

                <input

                  type="text"

                  value={
                    categoryForm.name
                  }

                  onChange={e =>
                    setCategoryForm(
                      current => ({
                        ...current,
                        name:
                          e.target.value
                      })
                    )
                  }

                  placeholder="
                    Contoh: Bahan Baku
                  "

                  autoFocus

                />

              </label>


              <div
                className="
                  modal-actions
                "
              >

                <button
                  type="button"
                  className="
                    secondary-btn
                  "
                  onClick={() =>
                    setCategoryModal(
                      false
                    )
                  }
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="
                    primary-btn
                  "
                  disabled={
                    categoryLoading
                  }
                >

                  {categoryLoading
                    ? 'Menyimpan...'
                    : 'Simpan Kategori'
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}


/* =========================================================
   PROTECTED LAYOUT
   ========================================================= */

function ProtectedLayout() {
  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* =====================================================
     LOAD PROFILE
     ===================================================== */

  useEffect(() => {
    let mounted = true;

    api
      .get('/me')
      .then((response) => {
        if (!mounted) {
          return;
        }

        setProfile(
          response.data.profile
        );
      })
      .catch(() => {
        localStorage.removeItem(
          'p2_token'
        );

        navigate(
          '/login',
          {
            replace: true
          }
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);


  /* =====================================================
     CLOSE MOBILE MENU WHEN PAGE CHANGES
     ===================================================== */

  useEffect(() => {
    setMobileOpen(false);
  }, [
    location.pathname
  ]);


  /* =====================================================
     CLOSE POPUPS WHEN MOBILE MENU OPENS
     ===================================================== */

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    document.dispatchEvent(
      new Event(
        'dapoersari:close-popups'
      )
    );
  }, [
    mobileOpen
  ]);


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="boot-screen">

        <div className="boot-content">

          <div className="boot-logo">

            <img
              src="/favicon-dapoersari.png"
              alt="Dapoersari"
            />

          </div>


          <div className="boot-text">

            <strong>
              Dapoersari
            </strong>

            <span>
              Owner Workspace
            </span>

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     PROTECT ROUTE
     ===================================================== */

  if (!profile) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* =====================================================
     OWNER
     ===================================================== */

  const ownerName =
    profile?.full_name?.trim() ||
    'Owner Dapoersari';


  const ownerInitial =
    ownerName
      .charAt(0)
      .toUpperCase() ||
    'O';


  /* =====================================================
     GREETING
     ===================================================== */

  const hour =
    new Date().getHours();


  let greeting;

  if (
    hour >= 5 &&
    hour < 11
  ) {
    greeting =
      'Selamat pagi';
  } else if (
    hour >= 11 &&
    hour < 15
  ) {
    greeting =
      'Selamat siang';
  } else if (
    hour >= 15 &&
    hour < 18
  ) {
    greeting =
      'Selamat sore';
  } else {
    greeting =
      'Selamat malam';
  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = () => {
    const confirmed =
      window.confirm(
        'Apakah Anda yakin ingin keluar dari Dapoersari Seller?'
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      'p2_token'
    );

    navigate(
      '/login',
      {
        replace: true
      }
    );
  };


  /* =====================================================
     MOBILE MENU
     ===================================================== */

  const toggleMobileMenu = () => {
    setMobileOpen(
      (current) => !current
    );
  };


  const closeMobileMenu = () => {
    setMobileOpen(false);
  };


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="app-shell">


      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={
          `sidebar ${
            mobileOpen
              ? 'open'
              : ''
          }`
        }
      >

        <div className="brand">

          <div className="brand-mark">

            <img
              src="/favicon-dapoersari.png"
              alt="Dapoersari"
            />

          </div>


          <div className="brand-copy">

            <strong>
              Dapoersari
            </strong>

            <span>
              Owner Workspace
            </span>

          </div>

        </div>


        <div className="sidebar-caption">
          MANAGEMENT
        </div>


        <nav className="nav-list">

          <NavItem
            to="/"
            icon={
              <Gauge
                size={18}
              />
            }
            label="Dashboard"
          />


          <NavItem
            to="/penjualan"
            icon={
              <Receipt
                size={18}
              />
            }
            label="Penjualan"
          />


          <NavItem
            to="/pengeluaran"
            icon={
              <WalletCards
                size={18}
              />
            }
            label="Pengeluaran"
          />


          <NavItem
            to="/analitik"
            icon={
              <BarChart3
                size={18}
              />
            }
            label="Performa Toko"
          />


          <NavItem
            to="/laporan"
            icon={
              <FileText
                size={18}
              />
            }
            label="Laporan"
          />


          <NavItem
            to="/pengaturan"
            icon={
              <Settings
                size={18}
              />
            }
            label="Pengaturan"
          />

        </nav>


        <div className="sidebar-footer">

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >

            <LogOut
              size={17}
            />

            <span>
              Keluar
            </span>

          </button>

        </div>

      </aside>


      {/* =================================================
          MOBILE BACKDROP
          ================================================= */}

      {mobileOpen && (

        <div
          className="mobile-backdrop"
          onClick={
            closeMobileMenu
          }
          aria-hidden="true"
        />

      )}


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="main-area">


        {/* =================================================
            TOPBAR
            ================================================= */}

        <header
          className="topbar"
        >


          {/* MOBILE MENU */}

          <button
            type="button"
            className="mobile-menu-button mobile-only"
            onClick={
              toggleMobileMenu
            }
            aria-label={
              mobileOpen
                ? 'Tutup menu'
                : 'Buka menu'
            }
            aria-expanded={
              mobileOpen
            }
          >

            {mobileOpen ? (
              <X
                size={21}
              />
            ) : (
              <MenuIcon
                size={21}
              />
            )}

          </button>


          {/* BREADCRUMB */}

          <div className="crumb">

            <span>
              Owner
            </span>

            <b>
              •
            </b>

            <strong>
              {pageName(
                location.pathname
              )}
            </strong>

          </div>


          {/* TOP ACTIONS */}

          <div className="top-actions">


            {/* DATE */}

            <div className="date-chip">

              <CalendarDays
                size={16}
              />

              <span>
                {new Date()
                  .toLocaleDateString(
                    'id-ID',
                    {
                      weekday:
                        'long',
                      day:
                        '2-digit',
                      month:
                        'long',
                      year:
                        'numeric'
                    }
                  )}
              </span>

            </div>


            {/* NOTIFICATION */}

            <button
              type="button"
              className="notification"
              aria-label="Notifikasi"
            >

              <Bell
                size={18}
              />

              <i />

            </button>


            {/* PROFILE */}

            <div
              className="profile-chip"
              title={ownerName}
            >

              <div className="profile-avatar">

                {ownerInitial}

              </div>


              <div className="profile-copy">

                <strong>
                  {ownerName}
                </strong>

                <span>
                  Owner
                </span>

              </div>


              <ChevronDown
                size={15}
                className="profile-chevron"
              />

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <div className="page-content">

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard
                  greeting={
                    greeting
                  }
                  ownerName={
                    ownerName
                  }
                />
              }
            />


            <Route
              path="/penjualan"
              element={
                <Sales />
              }
            />


            <Route
              path="/pengeluaran"
              element={
                <Finance />
              }
            />


            <Route
              path="/analitik"
              element={
                <Analytics />
              }
            />


            <Route
              path="/laporan"
              element={
                <Reports />
              }
            />


            <Route
              path="/pengaturan"
              element={
                <SettingsPage />
              }
            />


            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function NavItem({
  to,
  icon,
  label
}) {

  return (
    <NavLink
      to={to}
      end={
        to === '/'
      }
      className={
        ({ isActive }) =>
          `nav-item ${
            isActive
              ? 'active'
              : ''
          }`
      }
    >

      {icon}

      <span>
        {label}
      </span>

    </NavLink>
  );
}


function pageName(path) {

  if (
    path === '/'
  ) {
    return 'Dashboard';
  }

  if (
    path.includes(
      'penjualan'
    )
  ) {
    return 'Penjualan';
  }

  if (
    path.includes(
      'pengeluaran'
    )
  ) {
    return 'Pengeluaran';
  }

  if (
    path.includes(
      'analitik'
    )
  ) {
    return 'Performa Toko';
  }

  if (
    path.includes(
      'rekomendasi'
    )
  ) {
    return 'Performa Toko';
  }

  if (
    path.includes(
      'laporan'
    )
  ) {
    return 'Laporan';
  }

  return 'Pengaturan';
}


/* =========================================================
   LOGIN
   ========================================================= */

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loginPhase, setLoginPhase] = useState('intro');

  const navigate = useNavigate();

  /* =====================================================
     SPLASH TIMING
     ===================================================== */

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setLoginPhase('exiting');
    }, 2300);

    const loginTimer = setTimeout(() => {
      setLoginPhase('login');
    }, 3000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(loginTimer);
    };
  }, []);

  /* =====================================================
     LOGIN SUBMIT
     ===================================================== */

  const submit = async (e) => {
    e.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        form
      );

      const token =
        response?.data?.session?.access_token;

      if (!token) {
        throw new Error(
          'Token login tidak ditemukan.'
        );
      }

      localStorage.setItem(
        'p2_token',
        token
      );

      navigate('/', {
        replace: true
      });

    } catch (err) {
      console.error(
        'Login error:',
        err
      );

      setError(
        err?.response?.data?.error ||
        err?.message ||
        'Login gagal.'
      );

    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`login-page phase-${loginPhase}`}
    >

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="login-background">
        <div className="login-glow login-glow-a" />
        <div className="login-glow login-glow-b" />
        <div className="login-grid" />
      </div>


      {/* =================================================
          SPLASH SCREEN
          ================================================= */}

      <div className="login-splash">

        <div className="splash-orb splash-orb-a" />
        <div className="splash-orb splash-orb-b" />

        <div className="splash-content">

          <div className="splash-logo">
            <img
              src="/favicon-dapoersari.png"
              alt="Dapoersari"
            />
          </div>

          <span className="splash-eyebrow">
            OWNER MANAGEMENT
          </span>

          <h1>
            Control the
            <br />
            <em>business</em>.
          </h1>

          <p>
            Ruang kerja owner untuk
            memantau penjualan,
            keuangan, dan kinerja
            operasional Dapoersari.
          </p>

          <div className="splash-note">
            <Sparkles size={16} />

            <span>
              Data transaksi tersinkron
              langsung dengan aktivitas
              penjualan.
            </span>
          </div>

        </div>

      </div>


      {/* =================================================
          LOGIN PANEL
          ================================================= */}

      <div className="login-panel">

        <div className="login-center">

          {/* =================================================
              BRANDING
              ================================================= */}

          <div className="login-brand">

            <div className="login-brand-logo">
              <img
                src="/favicon-dapoersari.png"
                alt="Dapoersari"
              />
            </div>

            <div className="login-brand-name">
              Dapoersari
            </div>

            <div className="login-brand-divider" />

            <span className="login-eyebrow">
              OWNER MANAGEMENT
            </span>

            <h1>
              Masuk ke Dapoersari
              <br />
              <span>Seller</span>
            </h1>

            <p>
              Kelola penjualan, keuangan,
              dan performa bisnis dalam
              satu ruang kerja.
            </p>

          </div>


          {/* =================================================
              LOGIN CARD
              ================================================= */}

          <div className="login-card">

            <form
              onSubmit={submit}
              className="login-form"
            >

              {/* EMAIL */}

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value
                    })
                  }
                  placeholder="owner@email.com"
                  autoComplete="email"
                  required
                />
              </label>


              {/* PASSWORD */}

              <label>
                Password

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value
                    })
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>


              {/* ERROR */}

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="primary-btn login-submit"
                disabled={busy}
              >

                <span>
                  {busy
                    ? 'Memproses...'
                    : 'Masuk'}
                </span>

                <ArrowUpRight
                  size={18}
                />

              </button>

            </form>


            {/* SECURITY */}

            <div className="login-security">

              <LockIcon />

              <span>
                Akses aman untuk akun Owner
              </span>

            </div>

          </div>


          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="login-footer">
            Dapoersari Owner Workspace
          </div>

        </div>

      </div>

    </div>
  );
}


function LockIcon() {

  return (
    <span className="tiny-lock">
      ●
    </span>
  );
}


/* =========================================================
   COMMON
   ========================================================= */

function useRange(
  initial = '30d'
) {

  const [
    range,
    setRange
  ] = useState(initial);

  return [
    range,
    setRange
  ];
}


function RangeSelect({
  value,
  onChange
}) {

  return (
    <select
      className="range-select"
      value={value}
      onChange={
        (e) =>
          onChange(
            e.target.value
          )
      }
    >

      <option value="today">
        Hari ini
      </option>

      <option value="7d">
        7 hari
      </option>

      <option value="30d">
        30 hari
      </option>

      <option value="90d">
        90 hari
      </option>

    </select>
  );
}


function PageHeader({
  eyebrow,
  title,
  subtitle,
  action
}) {

  return (
    <div className="page-head">

      <div>

        <div className="eyebrow dark">
          {eyebrow}
        </div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>


      {action}

    </div>
  );
}


function Metric({
  label,
  value,
  sub,
  icon,
  positive = true
}) {

  return (
    <div className="metric-card">

      <div className="metric-top">

        <span>
          {label}
        </span>

        <div className="metric-icon">
          {icon}
        </div>

      </div>


      <strong>
        {value}
      </strong>


      <div
        className={
          `metric-sub ${
            positive
              ? 'positive'
              : ''
          }`
        }
      >

        {positive ? (
          <ArrowUpRight
            size={14}
          />
        ) : (
          <ArrowDownRight
            size={14}
          />
        )}

        {sub}

      </div>

    </div>
  );
}

/* =========================================================
SAPAAN DASHBOARD
========================================================= */

function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return 'Selamat pagi';
  }

  if (hour >= 11 && hour < 15) {
    return 'Selamat siang';
  }

  if (hour >= 15 && hour < 18) {
    return 'Selamat sore';
  }

  return 'Selamat malam';
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  greeting,
  ownerName
}) {

  const [
    range,
    setRange
  ] = useRange('30d');

    
  const [
    data,
    setData
  ] = useState(null);

  
  const [
    error,
    setError
  ] = useState('');


  useEffect(() => {

    setError('');

    api
      .get(
        '/dashboard',
        {
          params: {
            range
          }
        }
      )

      .then(
        (r) =>
          setData(
            r.data
          )
      )

      .catch(
        (e) =>
          setError(
            e?.response
              ?.data
              ?.error ||
            'Gagal memuat dashboard.'
          )
      );

  }, [range]);


          if (error) {
            return (
              <ErrorState
                message={error}
              />
            );
          }


          if (!data) {
            return (
              <LoadingPage />
            );
          }


          const s =
            data.summary;


          return (
            <>

           <section className="dashboard-greeting">
            <div className="dashboard-greeting-main">

              <div className="dashboard-greeting-label">
                {greeting}
              </div>

              <h2>
                {ownerName}
              </h2>

              <p>
                Ringkasan kinerja bisnis Anda untuk hari ini.
              </p>

            </div>
          </section>

      <PageHeader
       title="Dashboard Bisnis"
        subtitle="Ringkasan kinerja penjualan dan keuangan Dapoersari."
        action={
          <RangeSelect
            value={range}
            onChange={setRange}
          />
        }
      />


      <div className="metric-grid">

        <Metric
          label="Penjualan Kotor"
          value={
            shortMoney(
              s.grossSales
            )
          }
          sub={
            `${s.transactionCount} transaksi selesai`
          }
          icon={
            <CircleDollarSign
              size={18}
            />
          }
        />


        <Metric
          label="Penjualan Bersih"
          value={
            shortMoney(
              s.netSales
            )
          }
          sub="setelah potongan platform"
          icon={
            <TrendingUp
              size={18}
            />
          }
        />


        <Metric
          label="Pengeluaran"
          value={
            shortMoney(
              s.expenseTotal
            )
          }
          sub={
            `${data.expenseCount} catatan pengeluaran`
          }
          icon={
            <WalletCards
              size={18}
            />
          }
          positive={false}
        />


        <Metric
          label="Laba Bersih"
          value={
            shortMoney(
              s.netProfit
            )
          }
          sub={
            `${s.grossSales ? ((s.netProfit / s.grossSales) * 100).toFixed(1) : 0}% margin`
          }
          icon={
            <Target
              size={18}
            />
          }
        />

      </div>


      <div className="two-col-grid">

        <Panel
          title="Tren penjualan"
          hint="Periode terpilih"
        >

          <div className="chart-box">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={
                  data.trend
                }
              >

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e7e8eb"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={
                    dateLabel
                  }
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />

                <YAxis
                  tickFormatter={
                    shortMoney
                  }
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />

                <Tooltip
                  formatter={
                    (v) =>
                      money(v)
                  }
                  labelFormatter={
                    (l) =>
                      new Date(l)
                        .toLocaleDateString(
                          'id-ID'
                        )
                  }
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#111827"
                  strokeWidth={3}
                  dot={false}
                  animationDuration={800}
                  animationEasing="ease-out"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </Panel>


        <Panel
          title="Kategori penjualan"
          hint="Omzet kotor"
        >

          <div className="channel-list">

            {Object.entries(
              s.channel
            ).map(
              ([
                key,
                val
              ]) => (

                <div
                  className="channel-row"
                  key={key}
                >

                  <div>

                    <span className="dot" />

                    <strong>
                      {channelLabel(
                        key
                      )}
                    </strong>

                  </div>

                  <strong>
                    {money(val)}
                  </strong>

                </div>

              )
            )}

          </div>


          <div className="mini-highlight">

            <div>

              <span>
                Potongan ShopeeFood
              </span>

              <strong>
                {money(
                  s.platformDeduction
                )}
              </strong>

            </div>

            <Percent
              size={22}
            />

          </div>

        </Panel>

      </div>


      <div className="insight-strip">

        <div className="insight-icon">
          <Sparkles
            size={18}
          />
        </div>


        <div>

          <strong>
            Owner insight
          </strong>

          <span>

            {s.transactionCount
              ? `Periode ini mencatat ${s.transactionCount} transaksi selesai. Gunakan Performa Toko untuk melihat produk dan jam paling potensial.`
              : 'Belum ada transaksi selesai pada periode ini.'
            }

          </span>

        </div>

      </div>

    </>
  );
}


/* =========================================================
   SALES
   ========================================================= */

function Sales() {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false); 

  const openOrderDetail = async (order) => {
  setDetailLoading(true);

  try {
    const response = await api.get(
      `/sales/${order.id}`
    );

    setSelectedOrder(
      response.data
    );

  } catch (e) {

    console.error(
      'Gagal memuat detail transaksi:',
      e
    );

    alert(
      e?.response?.data?.error ||
      'Detail transaksi gagal dimuat.'
    );

  } finally {
    setDetailLoading(false);
  }
};

  const [
    range,
    setRange
  ] = useRange('30d');


  const [
    rows,
    setRows
  ] = useState(null);


  const [
    error,
    setError
  ] = useState('');


  useEffect(() => {

    setRows(null);
    setError('');


    api
      .get(
        '/sales',
        {
          params: {
            range
          }
        }
      )

      .then(
        (response) => {

          /*
           * Backend /api/sales
           * mengembalikan:
           *
           * {
           *   range,
           *   rows: [...]
           * }
           */

          const salesRows =
            Array.isArray(
              response.data?.rows
            )
              ? response.data.rows
              : [];


          setRows(
            salesRows.map(
              (order) => ({

                id:
                  order.id ||
                  order.orderId ||
                  null,

                orderCode:
                  order.orderCode ||
                  order.order_code ||
                  '-',

                orderedAt:
                  order.orderedAt ||
                  order.ordered_at ||
                  null,

                channel:
                  order.channel ||
                  order.sales_channel ||
                  'website',

                status:
                  order.status ||
                  'completed',

                total:
                  Number(
                    order.total ||
                    0
                  )

              })
            )
          );

        }
      )

      .catch(
        (e) => {

          console.error(
            'Gagal memuat penjualan:',
            e
          );


          setError(
            e?.response
              ?.data
              ?.error ||

            e?.message ||

            'Gagal memuat data penjualan.'
          );

        }
      );

  }, [range]);


  if (error) {

    return (
      <ErrorState
        message={error}
      />
    );

  }


  if (!rows) {

    return (
      <LoadingPage />
    );

  }


  const totalRevenue =
    rows.reduce(
      (
        sum,
        row
      ) =>

        sum +
        Number(
          row.total ||
          0
        ),

      0
    );


  const average =
    rows.length
      ? totalRevenue /
        rows.length
      : 0;


  return (
    <>

      <PageHeader

        eyebrow="
          KINERJA PENJUALAN
        "

        title="Penjualan"

        subtitle="
          Pantau seluruh transaksi
          dari Project 1 berdasarkan
          periode yang dipilih.
        "

        action={

          <RangeSelect

            value={
              range
            }

            onChange={
              setRange
            }

          />

        }

      />


      {/* =================================================
          RINGKASAN PENJUALAN
      ================================================= */}

      <div
        className="
          finance-grid
        "
      >

        <div
          className="
            finance-summary
          "
        >

          <div
            className="
              finance-summary-icon
            "
          >

            <Receipt
              size={18}
            />

          </div>


          <div>

            <span>
              Total Penjualan
            </span>


            <strong>

              {money(
                totalRevenue
              )}

            </strong>

          </div>

        </div>


        <div
          className="
            finance-summary
          "
        >

          <div
            className="
              finance-summary-icon
            "
          >

            <ShoppingBag
              size={18}
            />

          </div>


          <div>

            <span>
              Transaksi Selesai
            </span>


            <strong>

              {
                rows.length
              }

            </strong>

          </div>

        </div>


        <div
          className="
            finance-summary
          "
        >

          <div
            className="
              finance-summary-icon
            "
          >

            <CircleDollarSign
              size={18}
            />

          </div>


          <div>

            <span>
              Rata-rata Transaksi
            </span>


            <strong>

              {money(
                average
              )}

            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          DAFTAR TRANSAKSI
      ================================================= */}

      <div
        className="
          table-panel
        "
      >

        <div
          className="
            table-head
          "
        >

          <div>

            <strong>
              Daftar Transaksi
            </strong>


            <span>

              {
                rows.length
              }

              {' '}

              transaksi selesai

            </span>

          </div>

        </div>


        <div
          className="
            table-scroll
          "
        >

          <table>

            <thead>

              <tr>

                <th>
                  Kode
                </th>


                <th>
                  Tanggal
                </th>


                <th>
                  Kategori
                </th>


                <th>
                  Status
                </th>


                <th
                  className="
                    right
                  "
                >
                  Total
                </th>

              </tr>

            </thead>


            <tbody>
              {rows.map(
                (row) => (
                  <tr
                    key={`${row.orderCode}-${row.orderedAt}`}
                    className="transaction-row"
                    onClick={() => {
                      if (!row.id) {
                        alert(
                          'ID transaksi tidak tersedia.'
                        );
                        return;
                      }

                      openOrderDetail(row);

                    }}
                  >
                    <td>
                      <strong>
                        {
                          row.orderCode
                        }
                      </strong>
                    </td>

                    <td>

                      {
                        row.orderedAt
                          ? new Date(
                              row.orderedAt
                            ).toLocaleString(
                              'id-ID'
                            )
                          : '-'
                      }

                    </td>


                    <td>

                      <ChannelBadge

                        channel={
                          row.channel
                        }

                      />

                    </td>


                    <td>

                      <span
                        className="
                          status-badge
                          done
                        "
                      >

                        Selesai

                      </span>

                    </td>


                    <td
                      className="
                        right
                      "
                    >

                      <strong>

                        {
                          money(
                            row.total
                          )
                        }

                      </strong>

                    </td>

                  </tr>

                )

              )}


              {rows.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      empty-cell
                    "
                  >

                    Belum ada transaksi
                    selesai pada periode ini.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {selectedOrder && (

        <OrderDetailModal
          order={selectedOrder}
          loading={detailLoading}
          onClose={() =>
            setSelectedOrder(null)
          }
        />

      )}

    </>
  );
}

// =========================================================
// OrderDetailModal //

function OrderDetailModal({
  order,
  loading,
  onClose
}) {

  if (loading) {
    return (
      <div className="modal-backdrop">

        <div className="modal-card">

          <div className="loading-page">
            <div className="spinner" />

            <span>
              Memuat detail transaksi...
            </span>
          </div>

        </div>

      </div>
    );
  }


  const channel =
    order?.sales_channel ||
    order?.channel ||
    'website';


  const gross =
    Number(
      order?.total ||
      0
    );


  const platformRate =
    channel === 'shopeefood'
      ? 0.25
      : 0;


  const platformFee =
    gross *
    platformRate;


  const netSales =
    gross -
    platformFee;


  const items =
    Array.isArray(
      order?.order_items
    )
      ? order.order_items
      : [];


  return (

    <div
      className="
        modal-backdrop
      "
      onClick={onClose}
    >

      <div
        className="
          modal-card
          order-detail-modal
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-head">

          <div>

            <span
              className="
                eyebrow
                dark
              "
            >
              DETAIL TRANSAKSI
            </span>

            <h3>
              {
                order?.order_code ||
                '-'
              }
            </h3>

          </div>


          <button
            type="button"
            className="ghost-icon"
            onClick={onClose}
          >

            <X
              size={18}
            />

          </button>

        </div>


        {/* INFORMASI UTAMA */}

        <div className="order-detail-info">

          <div>

            <span>
              Kode Pesanan
            </span>

            <strong>
              {
                order?.order_code ||
                '-'
              }
            </strong>

          </div>


          <div>

            <span>
              Tanggal
            </span>

            <strong>

              {
                order?.ordered_at
                  ? new Date(
                      order.ordered_at
                    ).toLocaleString(
                      'id-ID',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }
                    )
                  : '-'
              }

            </strong>

          </div>


          <div>

            <span>
              Channel
            </span>

            <strong>
              {
                channel ===
                'shopeefood'
                  ? 'ShopeeFood'
                  : channel ===
                    'offline'
                  ? 'Offline'
                  : 'Website'
              }
            </strong>

          </div>


          <div>

            <span>
              Metode Pembayaran
            </span>

            <strong>
              {
                (
                  order?.payment_method ||
                  '-'
                ).toUpperCase()
              }
            </strong>

          </div>

        </div>


        {/* ITEM PESANAN */}

        <div className="order-detail-section">

          <div className="order-detail-section-head">

            <strong>
              Detail Pesanan
            </strong>

            <span>
              {
                items.length
              } item
            </span>

          </div>


          <div className="order-item-list">

            {items.map(
              (item) => {

                const itemName =
                  item?.menu?.name ||
                  item?.name ||
                  'Menu';


                const quantity =
                  Number(
                    item?.quantity ||
                    0
                  );


                const unitPrice =
                  Number(
                    item?.unit_price ||
                    0
                  );


                const subtotal =
                  quantity *
                  unitPrice;


                return (

                  <div
                    className="
                      order-item-row
                    "
                    key={
                      item.id
                    }
                  >

                    <div>

                      <strong>
                        {
                          itemName
                        }
                      </strong>

                      <span>

                        {quantity}

                        {' × '}

                        {money(
                          unitPrice
                        )}

                      </span>

                    </div>


                    <strong>

                      {money(
                        subtotal
                      )}

                    </strong>

                  </div>

                );

              }
            )}


            {items.length === 0 && (

              <div
                className="
                  empty-cell
                "
              >
                Detail item tidak tersedia.
              </div>

            )}

          </div>

        </div>


        {/* RINGKASAN NILAI */}

        <div className="order-total-card">

          <div>

            <span>
              Penjualan Kotor
            </span>

            <strong>
              {money(
                gross
              )}
            </strong>

          </div>


          <div>

            <span>
              Potongan Platform
              {
                platformRate > 0
                  ? ` (${platformRate * 100}%)`
                  : ''
              }
            </span>

            <strong>
              {money(
                platformFee
              )}
            </strong>

          </div>


          <div className="net">

            <span>
              Penjualan Bersih
            </span>

            <strong>
              {money(
                netSales
              )}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// ChannelBadge //

function ChannelBadge({
  channel
}) {

  return (
    <span
      className={
        `channel-badge ${
          channel ||
          'website'
        }`
      }
    >

      {channelLabel(
        channel
      )}

    </span>
  );
}


function channelLabel(
  c
) {

  return (
    {
      website:
        'Website',

      offline:
        'Offline',

      shopeefood:
        'ShopeeFood'

    }[c] ||
    c ||
    'Website'
  );
}


/* =========================================================
   FINANCE
   ========================================================= */

function Finance() {

  const [
    expenses,
    setExpenses
  ] = useState(null);

  const [
    categories,
    setCategories
  ] = useState([]);

  const [
    modal,
    setModal
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');


  /* =====================================================
     LOAD EXPENSES
  ===================================================== */

  const loadExpenses =
    async () => {

      const response =
        await api.get(
          '/expenses'
        );

      const rawData =
        Array.isArray(
          response.data
        )
          ? response.data
          : (
              Array.isArray(
                response.data?.data
              )
                ? response.data.data
                : []
            );


      /*
       * NORMALISASI DATA
       *
       * Support format backend:
       * expenseDate / spent_at
       * categoryName / category
       * note / title / notes
       */

      const normalized =
        rawData.map(
          (expense) => {

            return {

              id:
                expense.id,

              categoryId:
                expense.categoryId ??
                expense.expense_category_id ??
                null,

              categoryName:
                expense.categoryName ||
                expense.category ||
                expense.expense_categories?.name ||
                'Tanpa kategori',

              amount:
                Number(
                  expense.amount ||
                  0
                ),

              expenseDate:
                expense.expenseDate ||
                expense.spent_at ||
                expense.expense_date ||
                expense.created_at ||
                null,

              note:
                expense.note ||
                expense.title ||
                expense.notes ||
                expense.description ||
                'Pengeluaran',

              createdAt:
                expense.createdAt ||
                expense.created_at ||
                null

            };

          }
        );


      setExpenses(
        normalized
      );

    };


  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  const loadCategories =
  async () => {

    try {

      const response =
        await api.get(
          '/expense-categories'
        );

      const rawData =
        Array.isArray(
          response.data
        )
          ? response.data
          : (
              Array.isArray(
                response.data?.data
              )
                ? response.data.data
                : []
            );

      console.log(
        'CATEGORY DATA:',
        rawData
      );

      setCategories(
        rawData
      );

    } catch (e) {

      console.error(
        'Kategori gagal dimuat:',
        e
      );

      /*
       * Fallback jika endpoint/database
       * sedang bermasalah.
       */
      setCategories([
        {
          id: 1,
          name: 'Bahan Baku'
        },
        {
          id: 2,
          name: 'Operasional'
        },
        {
          id: 3,
          name: 'Transportasi'
        },
        {
          id: 4,
          name: 'Listrik'
        },
        {
          id: 5,
          name: 'Perawatan'
        },
        {
          id: 6,
          name: 'Lainnya'
        }
      ]);

    }

  };


const openExpenseModal =
  async () => {

    await loadCategories();

    setModal(true);

  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

 useEffect(() => {

  loadExpenses()
    .catch((e) => {

      console.error(
        'Gagal memuat keuangan:',
        e
      );

      setError(
        e?.response?.data?.error ||
        e?.message ||
        'Gagal memuat data keuangan.'
      );

    });

}, []);


  /* =====================================================
     SAVE EXPENSE
  ===================================================== */

  const save =
    async (form) => {

      await api.post(
        '/expenses',
        {

          categoryId:
            Number(
              form.categoryId
            ),

          amount:
            Number(
              form.amount
            ),

          expenseDate:
            form.expenseDate,

          note:
            form.note

        }
      );


      setModal(false);

      await loadExpenses();

    };


  /* =====================================================
     DELETE EXPENSE
  ===================================================== */

  const remove =
    async (id) => {

      const confirmed =
        window.confirm(
          'Hapus pengeluaran ini?'
        );


      if (!confirmed) {
        return;
      }


      try {

        await api.delete(
          `/expenses/${id}`
        );


        await loadExpenses();


      } catch (e) {

        console.error(
          'Gagal menghapus pengeluaran:',
          e
        );


        alert(
          e?.response
            ?.data
            ?.error ||
          e?.message ||
          'Pengeluaran gagal dihapus.'
        );

      }

    };


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (
      <ErrorState
        message={
          error
        }
      />
    );

  }


  /* =====================================================
     LOADING
  ===================================================== */

  if (!expenses) {

    return (
      <LoadingPage />
    );

  }


  /* =====================================================
     TOTAL EXPENSE
  ===================================================== */

  const totalExpense =
    expenses.reduce(
      (
        sum,
        expense
      ) =>

        sum +
        Number(
          expense.amount ||
          0
        ),

      0
    );


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatExpenseDate =
    (value) => {

      if (!value) {
        return '-';
      }


      const date =
        new Date(
          value
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return '-';

      }


      return date.toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      );

    };


  /* =====================================================
     UI
  ===================================================== */

  return (
    <>

      <PageHeader

        eyebrow="
          KEUANGAN USAHA
        "

        title="Pengeluaran"

        subtitle="
          Catat dan kendalikan
          seluruh biaya operasional
          usaha.
        "

        action={

          <button

            className="
              primary-btn
              small
            "

            onClick={
              openExpenseModal
            }

          >

            <Plus
              size={17}
            />

            Tambah Pengeluaran

          </button>

        }

      />


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className="
          finance-grid
        "
      >

        <div
          className="
            finance-summary
          "
        >

          <div
            className="
              finance-summary-icon
            "
          >

            <WalletCards
              size={18}
            />

          </div>


          <div>

            <span>
              Total Pengeluaran
            </span>


            <strong>

              {money(
                totalExpense
              )}

            </strong>

          </div>

        </div>


        <div
          className="
            finance-summary
          "
        >

          <div
            className="
              finance-summary-icon
            "
          >

            <Receipt
              size={18}
            />

          </div>


          <div>

            <span>
              Jumlah Catatan
            </span>


            <strong>

              {
                expenses.length
              }

            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          EXPENSE TABLE
      ================================================= */}

      <div
        className="
          table-panel
        "
      >

        <div
          className="
            table-head
          "
        >

          <div>

            <strong>
              Riwayat Pengeluaran
            </strong>


            <span>
              Pengeluaran terbaru
            </span>

          </div>

        </div>


        <div
          className="
            table-scroll
          "
        >

          <table>

            <thead>

              <tr>

                <th>
                  Tanggal
                </th>

                <th>
                  Kategori
                </th>

                <th>
                  Keterangan
                </th>

                <th
                  className="
                    right
                  "
                >
                  Nominal
                </th>

                <th>
                </th>

              </tr>

            </thead>


            <tbody>

              {expenses.map(
                (expense) => (

                  <tr
                    key={
                      expense.id
                    }
                  >

                    {/* TANGGAL */}

                    <td>

                      {
                        formatExpenseDate(
                          expense.expenseDate
                        )
                      }

                    </td>


                    {/* KATEGORI */}

                    <td>

                      <span
                        className="
                          category-chip
                        "
                      >

                        {
                          expense.categoryName ||
                          'Tanpa kategori'
                        }

                      </span>

                    </td>


                    {/* KETERANGAN */}

                    <td>

                      {
                        expense.note ||
                        'Pengeluaran'
                      }

                    </td>


                    {/* NOMINAL */}

                    <td
                      className="
                        right
                      "
                    >

                      <strong>

                        {money(
                          expense.amount
                        )}

                      </strong>

                    </td>


                    {/* DELETE */}

                    <td
                      className="
                        actions-cell
                      "
                    >

                      <button

                        type="button"

                        className="
                          ghost-icon
                          danger
                        "

                        onClick={() =>
                          remove(
                            expense.id
                          )
                        }

                        aria-label="
                          Hapus pengeluaran
                        "

                      >

                        <Trash2
                          size={15}
                        />

                      </button>

                    </td>

                  </tr>

                )
              )}


              {/* EMPTY */}

              {expenses.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      empty-cell
                    "
                  >

                    Belum ada
                    pengeluaran.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          MODAL
      ================================================= */}

      {modal && (

        <ExpenseModal

          categories={
            categories
          }

          onClose={() =>
            setModal(false)
          }

          onSave={
            save
          }

        />

      )}

    </>
  );
}


/* =========================================================
   EXPENSE MODAL
   ========================================================= */

function ExpenseModal({
  categories,
  onClose,
  onSave
}) {

  const [
    form,
    setForm
  ] = useState({

    categoryId:
      categories[0]?.id ||
      '',

    amount:
      '',

    expenseDate:
      new Date()
        .toISOString()
        .slice(
          0,
          10
        ),

    note:
      ''

  });


  const [
    saving,
    setSaving
  ] = useState(false);


  const submit =
    async (e) => {

      e.preventDefault();

      if (
        !form.categoryId
      ) {

        alert(
          'Pilih kategori pengeluaran.'
        );

        return;

      }


      if (
        Number(
          form.amount
        ) <= 0
      ) {

        alert(
          'Nominal harus lebih dari 0.'
        );

        return;

      }


      setSaving(true);

      try {

        await onSave(
          form
        );

      } catch (e) {

        alert(
          e?.response
            ?.data
            ?.error ||
          'Gagal menyimpan pengeluaran.'
        );

      } finally {

        setSaving(false);

      }

    };


  return (

    <div
      className="
        modal-backdrop
      "
    >

      <form
        className="
          modal-card
        "

        onSubmit={
          submit
        }
      >

        <div
          className="
            modal-head
          "
        >

          <div>

            <span
              className="
                eyebrow
                dark
              "
            >
              PENCATATAN KEUANGAN
            </span>

            <h3>
              Tambah Pengeluaran
            </h3>

          </div>


          <button
            type="button"
            className="
              ghost-icon
            "
            onClick={
              onClose
            }
          >

            <X
              size={18}
            />

          </button>

        </div>


        <div
          className="
            form-grid
          "
        >

          <label>

            Tanggal

            <input
              type="date"

              value={
                form.expenseDate
              }

              onChange={
                (e) =>
                  setForm({
                    ...form,
                    expenseDate:
                      e.target.value
                  })
              }

              required
            />

          </label>


          <label>

            Kategori

            <select
              value={
                form.categoryId
              }

              onChange={
                (e) =>
                  setForm({
                    ...form,
                    categoryId:
                      e.target.value
                  })
              }

              required
            >

              <option value="">
                Pilih kategori
              </option>

              {categories.map(
                (category) => (

                  <option
                    key={
                      category.id
                    }

                    value={
                      category.id
                    }
                  >

                    {
                      category.name
                    }

                  </option>

                )
              )}

            </select>

          </label>


          <label
            className="full"
          >

            Keterangan

            <input
              value={
                form.note
              }

              onChange={
                (e) =>
                  setForm({
                    ...form,
                    note:
                      e.target.value
                  })
              }

              placeholder="
                Contoh: Restock ayam 10 kg
              "

              required
            />

          </label>


          <label
            className="full"
          >

            Nominal

            <input
              type="number"

              min="0"

              value={
                form.amount
              }

              onChange={
                (e) =>
                  setForm({
                    ...form,
                    amount:
                      e.target.value
                  })
              }

              placeholder="0"

              required
            />

          </label>

        </div>


        <div
          className="
            modal-actions
          "
        >

          <button
            type="button"
            className="
              secondary-btn
            "
            onClick={
              onClose
            }
          >
            Batal
          </button>


          <button
            className="
              primary-btn
            "
            disabled={
              saving
            }
          >

            {saving
              ? 'Menyimpan...'
              : 'Simpan Pengeluaran'}

          </button>

        </div>

      </form>

    </div>

  );
}


/* =========================================================
   ANALYTICS
   ========================================================= */

function Analytics() {

  const [
    range,
    setRange
  ] = useRange('30d');


  const [
    data,
    setData
  ] = useState(null);


  const [
    recommendationData,
    setRecommendationData
  ] = useState(null);


  const [
    error,
    setError
  ] = useState('');


  useEffect(() => {

    let active = true;

    setError('');
    setData(null);
    setRecommendationData(
      null
    );


    Promise.all([

      api.get(
        '/analytics',
        {
          params: {
            range
          }
        }
      ),

      api.get(
        '/recommendations',
        {
          params: {
            range
          }
        }
      )

    ])

      .then(
        ([
          analyticsResponse,
          recommendationResponse
        ]) => {

          if (!active) {
            return;
          }


          setData(
            analyticsResponse.data
          );


          setRecommendationData(
            recommendationResponse.data
          );

        }
      )

      .catch(
        (e) => {

          if (!active) {
            return;
          }


          console.error(
            'Gagal memuat performa toko:',
            e
          );


          setError(
            e?.response
              ?.data
              ?.error ||
            'Gagal memuat data performa toko.'
          );

        }
      );


    return () => {

      active = false;

    };

  }, [range]);


  if (error) {

    return (
      <ErrorState
        message={error}
      />
    );

  }


  if (
    !data ||
    !recommendationData
  ) {

    return (
      <LoadingPage />
    );

  }


  const channelPalette = [
    '#122338',
    '#9A7B4D',
    '#6D7D90'
  ];


  const iconForRecommendation =
    (type) => {

      if (
        type ===
        'product'
      ) {

        return (
          <PackageSearch
            size={18}
          />
        );

      }


      if (
        type ===
        'margin'
      ) {

        return (
          <Percent
            size={18}
          />
        );

      }


      return (
        <TrendingUp
          size={18}
        />
      );

    };


  return (
    <>

      <PageHeader
        eyebrow="PERFORMA BISNIS"
        title="Performa Toko"
        subtitle="Pantau perkembangan penjualan, produk, kategori penjualan, dan aktivitas toko."
        action={

          <RangeSelect
            value={
              range
            }

            onChange={
              setRange
            }
          />

        }
      />


      {/* =================================================
          ANALISIS PENJUALAN
          ================================================= */}

      <div className="analytics-grid">


        {/* CHANNEL */}

        <Panel
          title="Kategori Penjualan"
          hint="Pendapatan berdasarkan sumber penjualan"
        >

          <div
            className="
              analytics-chart
            "
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  data.channelStats ||
                  []
                }

                margin={{
                  top:
                    12,

                  right:
                    8,

                  left:
                    4,

                  bottom:
                    4
                }}
              >


                <CartesianGrid
                  vertical={false}

                  stroke="#E7EBEF"

                  strokeDasharray="
                    4 4
                  "
                />


                <XAxis
                  dataKey="channel"

                  tickFormatter={
                    channelLabel
                  }

                  tickLine={false}

                  axisLine={false}

                  tick={{
                    fontSize:
                      11,

                    fill:
                      '#687587'
                  }}
                />


                <YAxis
                  tickFormatter={
                    shortMoney
                  }

                  tickLine={false}

                  axisLine={false}

                  width={
                    48
                  }

                  tick={{
                    fontSize:
                      10,

                    fill:
                      '#8995A4'
                  }}
                />


                <Tooltip

                  formatter={
                    (value) =>
                      money(
                        value
                      )
                  }

                  contentStyle={{
                    background:
                      '#FFFFFF',

                    border:
                      '1px solid #E2E7ED',

                    borderRadius:
                      8,

                    boxShadow:
                      '0 10px 25px rgba(18,35,56,.10)',

                    fontSize:
                      11
                  }}

                  labelStyle={{
                    color:
                      '#263444',

                    fontWeight:
                      650,

                    marginBottom:
                      4
                  }}

                  cursor={{
                    fill:
                      'rgba(18,35,56,.035)'
                  }}

                />


                <Bar
                  dataKey="revenue"

                  radius={[
                    6,
                    6,
                    2,
                    2
                  ]}

                  animationDuration={
                    900
                  }

                  animationEasing="ease-out"
                >


                  {(
                    data.channelStats ||
                    []
                  ).map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={
                          `channel-${index}`
                        }

                        fill={
                          channelPalette[
                            index %
                            channelPalette.length
                          ]
                        }
                      />

                    )
                  )}


                </Bar>


              </BarChart>

            </ResponsiveContainer>

          </div>

        </Panel>


        {/* JAM RAMAI */}

        <Panel
          title="Jam Ramai"
          hint="Frekuensi transaksi berdasarkan waktu"
        >

          <div
            className="
              analytics-chart
            "
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={
                  data.hourly ||
                  []
                }

                margin={{
                  top:
                    12,

                  right:
                    8,

                  left:
                    0,

                  bottom:
                    4
                }}
              >


                <defs>

                  <linearGradient
                    id="
                      hourAreaGradient
                    "
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#B39463"
                      stopOpacity={
                        0.28
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor="#B39463"
                      stopOpacity={
                        0.02
                      }
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  vertical={false}

                  stroke="#E7EBEF"

                  strokeDasharray="
                    4 4
                  "
                />


                <XAxis
                  dataKey="hour"

                  tickFormatter={
                    (hour) =>
                      `${hour}:00`
                  }

                  tickLine={false}

                  axisLine={false}

                  tick={{
                    fontSize:
                      10,

                    fill:
                      '#687587'
                  }}
                />


                <YAxis
                  allowDecimals={
                    false
                  }

                  tickLine={false}

                  axisLine={false}

                  width={
                    25
                  }

                  tick={{
                    fontSize:
                      10,

                    fill:
                      '#8995A4'
                  }}
                />


                <Tooltip

                  labelFormatter={
                    (hour) =>
                      `${hour}:00`
                  }

                  formatter={
                    (value) =>
                      [
                        `${value} transaksi`,
                        'Transaksi'
                      ]
                  }

                  contentStyle={{
                    background:
                      '#FFFFFF',

                    border:
                      '1px solid #E2E7ED',

                    borderRadius:
                      8,

                    boxShadow:
                      '0 10px 25px rgba(18,35,56,.10)',

                    fontSize:
                      11
                  }}

                  labelStyle={{
                    color:
                      '#263444',

                    fontWeight:
                      650,

                    marginBottom:
                      4
                  }}

                  cursor={{
                    stroke:
                      '#B39463',

                    strokeWidth:
                      1
                  }}

                />


                <Area
                  type="monotone"

                  dataKey="transactions"

                  stroke="#9A7B4D"

                  strokeWidth={
                    2.3
                  }

                  fill="
                    url(#hourAreaGradient)
                  "

                  activeDot={{
                    r:
                      4,

                    fill:
                      '#FFFFFF',

                    stroke:
                      '#9A7B4D',

                    strokeWidth:
                      2
                  }}

                  animationDuration={
                    1000
                  }

                  animationEasing="ease-out"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </Panel>

      </div>


      {/* =================================================
          PRODUK TERLARIS
          ================================================= */}

      <Panel
        title="Produk Terlaris"
        hint="Berdasarkan jumlah item terjual"
      >

        <div className="rank-list">

          {(
            data.products ||
            []
          ).map(
            (
              p,
              i
            ) => (

              <div
                className="rank-row"
                key={
                  p.menuId
                }
              >

                <div className="rank-num">

                  {String(
                    i + 1
                  ).padStart(
                    2,
                    '0'
                  )}

                </div>


                <div
                  className="
                    rank-main
                  "
                >

                  <strong>
                    {p.name}
                  </strong>

                  <span>
                    {
                      p.quantity
                    }
                    {' '}
                    item terjual
                  </span>

                </div>


                <div
                  className="
                    rank-revenue
                  "
                >

                  {money(
                    p.revenue
                  )}

                </div>

              </div>

            )
          )}


          {!(
            data.products ||
            []
          ).length && (

            <div
              className="
                empty-state
              "
            >
              Belum cukup data produk.
            </div>

          )}

        </div>

      </Panel>


      {/* =================================================
          REKOMENDASI BISNIS
          ================================================= */}

      <section
        className="
          performance-recommendations
        "
      >

        <div
          className="
            section-heading
          "
        >

          <div>

            <span
              className="
                eyebrow
                dark
              "
            >
              DECISION SUPPORT
            </span>


            <h2>
              Rekomendasi Bisnis
            </h2>


            <p>
              Saran berdasarkan pola
              penjualan dan kondisi
              bisnis pada periode
              terpilih.
            </p>

          </div>

        </div>


        <div
          className="
            recommendation-list
          "
        >

          {(
            recommendationData
              .recommendations ||
            []
          ).map(
            (
              r,
              i
            ) => (

              <div
                className={
                  `recommend-card ${
                    r.level
                  }`
                }

                key={i}
              >

                <div
                  className="
                    recommend-icon
                  "
                >

                  {
                    iconForRecommendation(
                      r.type
                    )
                  }

                </div>


                <div>

                  <span
                    className="
                      recommend-label
                    "
                  >

                    {r.level ===
                    'high'
                      ? 'PRIORITAS TINGGI'
                      : r.level ===
                        'medium'
                      ? 'PERLU DIPERHATIKAN'
                      : 'INFORMASI'}

                  </span>


                  <h3>
                    {r.title}
                  </h3>


                  <p>
                    {r.text}
                  </p>

                </div>

              </div>

            )
          )}


          {!(
            recommendationData
              .recommendations ||
            []
          ).length && (

            <div
              className="
                empty-state
              "
            >
              Belum ada rekomendasi
              untuk periode ini.
            </div>

          )}

        </div>


        <div
          className="
            recommend-note
          "
        >

          <Sparkles
            size={18}
          />

          <div>

            <strong>
              Dasar rekomendasi
            </strong>


            <p>
              Rekomendasi dibuat dari
              data transaksi selesai,
              performa produk,
              channel penjualan,
              dan tarif platform.
            </p>

          </div>

        </div>

      </section>

    </>
  );
}


/* =========================================================
   REPORTS
   ========================================================= */

function Reports() {
  const [range, setRange] = useRange('30d');

  const [exportOpen, setExportOpen] =
    useState(false);

  const exportMenuRef =
    useRef(null);

  const [dash, setDash] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [sales, setSales] = useState(null);

  const [activeReport, setActiveReport] =
    useState('ringkasan');

  const [error, setError] = useState('');


  /* =====================================================
     LOAD DATA
     ===================================================== */

  useEffect(() => {
    setDash(null);
    setAnalytics(null);
    setSales(null);
    setError('');
    setExportOpen(false);

    Promise.all([
      api.get('/dashboard', {
        params: {
          range
        }
      }),

      api.get('/analytics', {
        params: {
          range
        }
      }),

      api.get('/sales', {
        params: {
          range
        }
      })
    ])
      .then(
        ([
          dashboardResponse,
          analyticsResponse,
          salesResponse
        ]) => {
          setDash(
            dashboardResponse.data
          );

          setAnalytics(
            analyticsResponse.data
          );

          setSales(
            salesResponse.data
          );
        }
      )
      .catch((e) => {
        console.error(
          'Gagal memuat laporan:',
          e
        );

        setError(
          e?.response?.data?.error ||
          e?.message ||
          'Gagal memuat laporan.'
        );
      });
  }, [range]);


  /* =====================================================
     CLOSE EXPORT MENU WHEN CLICK OUTSIDE
     ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(
          event.target
        )
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener(
      'click',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'click',
        handleOutsideClick
      );
    };
  }, []);


  /* =====================================================
     STATE
     ===================================================== */

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }


  if (!dash || !analytics || !sales) {
    return (
      <LoadingPage />
    );
  }


  /* =====================================================
     DATA
     ===================================================== */

  const summary =
    dash?.summary || {};


  const rows =
    Array.isArray(
      sales?.rows
    )
      ? sales.rows
      : [];


  const grossSales =
    Number(
      summary.grossSales || 0
    );


  const platformDeduction =
    Number(
      summary.platformDeduction || 0
    );


  const netSales =
    Number(
      summary.netSales ??
      (
        grossSales -
        platformDeduction
      )
    );


  const expenseTotal =
    Number(
      summary.expenseTotal || 0
    );


  const netProfit =
    Number(
      summary.netProfit ??
      (
        netSales -
        expenseTotal
      )
    );


  const transactionCount =
    Number(
      summary.transactionCount ??
      rows.length ??
      0
    );


  const averageTransaction =
    transactionCount > 0
      ? grossSales /
        transactionCount
      : 0;


  const profitMargin =
    grossSales > 0
      ? (
          netProfit /
          grossSales
        ) *
        100
      : 0;


  /* =====================================================
     CHANNEL
     ===================================================== */

  const channelTotals = {
    website: 0,
    offline: 0,
    shopeefood: 0
  };


  const analyticsChannels =
    Array.isArray(
      analytics?.channelStats
    )
      ? analytics.channelStats
      : [];


  analyticsChannels.forEach(
    (item) => {
      const key =
        String(
          item.channel || ''
        ).toLowerCase();

      if (
        Object.prototype.hasOwnProperty.call(
          channelTotals,
          key
        )
      ) {
        channelTotals[key] +=
          Number(
            item.revenue ||
            item.total ||
            item.amount ||
            0
          );
      }
    }
  );


  /*
   * Fallback menggunakan transaksi
   */

  const hasChannelData =
    Object.values(
      channelTotals
    ).some(
      (value) =>
        Number(value) > 0
    );


  if (!hasChannelData) {
    rows.forEach(
      (row) => {
        const key =
          String(
            row.channel ||
            'website'
          ).toLowerCase();

        if (
          Object.prototype.hasOwnProperty.call(
            channelTotals,
            key
          )
        ) {
          channelTotals[key] +=
            Number(
              row.total || 0
            );
        }
      }
    );
  }


  const largestChannelEntry =
    Object.entries(
      channelTotals
    )
      .sort(
        (
          [, a],
          [, b]
        ) =>
          Number(b) -
          Number(a)
      )[0];


  const largestChannel =
    largestChannelEntry &&
    Number(
      largestChannelEntry[1]
    ) > 0
      ? channelLabel(
          largestChannelEntry[0]
        )
      : '-';


  /* =====================================================
     PRODUK
     ===================================================== */

  const products =
    Array.isArray(
      analytics?.products
    )
      ? analytics.products
      : [];


  const totalProductsSold =
    products.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );


  const bestProduct =
    [...products]
      .sort(
        (
          a,
          b
        ) =>
          Number(
            b.quantity || 0
          ) -
          Number(
            a.quantity || 0
          )
      )[0];


  const bestProductName =
    bestProduct?.name ||
    '-';


  /* =====================================================
     TREND PENJUALAN
     DIBUAT DARI DATA TRANSAKSI
     ===================================================== */

  const trendMap = {};


  rows.forEach(
    (row) => {
      if (!row.orderedAt) {
        return;
      }

      const date =
        new Date(
          row.orderedAt
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }


      const key =
        date.toISOString()
          .slice(
            0,
            10
          );


      trendMap[key] =
        (
          trendMap[key] || 0
        ) +
        Number(
          row.total || 0
        );
    }
  );


  const trend =
    Object.entries(
      trendMap
    )
      .sort(
        ([a], [b]) =>
          a.localeCompare(b)
      )
      .slice(-14);


  const maxTrend =
    Math.max(
      ...trend.map(
        ([, value]) =>
          Number(value)
      ),
      1
    );


  const formatTrendDate =
    (value) => {
      const date =
        new Date(
          `${value}T00:00:00`
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '-';
      }

      return date.toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: 'short'
        }
      );
    };


  /* =====================================================
     EXPORT CSV
     ===================================================== */

  const exportCSV = () => {
    const header = [
      'Bagian',
      'Indikator',
      'Nilai'
    ];


    const body = [
      [
        'Ringkasan Keuangan',
        'Penjualan Kotor',
        grossSales
      ],

      [
        'Ringkasan Keuangan',
        'Potongan Platform',
        platformDeduction
      ],

      [
        'Ringkasan Keuangan',
        'Penjualan Bersih',
        netSales
      ],

      [
        'Ringkasan Keuangan',
        'Pengeluaran',
        expenseTotal
      ],

      [
        'Ringkasan Keuangan',
        'Laba Bersih',
        netProfit
      ],

      [
        'Ringkasan Keuangan',
        'Margin Laba Bersih',
        `${profitMargin.toFixed(1)}%`
      ],

      [
        'Performa Channel',
        'Website',
        channelTotals.website
      ],

      [
        'Performa Channel',
        'Offline',
        channelTotals.offline
      ],

      [
        'Performa Channel',
        'ShopeeFood',
        channelTotals.shopeefood
      ],

      [
        'Performa Channel',
        'Total',
        grossSales
      ],

      [
        'Operasional',
        'Total Transaksi',
        transactionCount
      ],

      [
        'Operasional',
        'Rata-rata Transaksi',
        averageTransaction
      ],

      [
        'Operasional',
        'Produk Terjual',
        totalProductsSold
      ],

      [
        'Operasional',
        'Channel Terbesar',
        largestChannel
      ],

      [
        'Operasional',
        'Produk Terlaris',
        bestProductName
      ]
    ];


    const csv =
      [
        header,
        ...body
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value ?? ''
                  ).replaceAll(
                    '"',
                    '""'
                  )}"`
              )
              .join(',')
        )
        .join('\n');


    const blob =
      new Blob(
        [
          '\ufeff',
          csv
        ],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    link.download =
      `laporan-manajemen-${range}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );
  };


  /* =====================================================
     EXPORT EXCEL
     ===================================================== */

  const exportExcel = () => {
    const data = [
      [
        'LAPORAN MANAJEMEN DAPOERSARI'
      ],

      [],

      [
        'Periode',
        range
      ],

      [],

      [
        'RINGKASAN KEUANGAN'
      ],

      [
        'Penjualan Kotor',
        grossSales
      ],

      [
        'Potongan Platform',
        platformDeduction
      ],

      [
        'Penjualan Bersih',
        netSales
      ],

      [
        'Pengeluaran',
        expenseTotal
      ],

      [
        'Laba Bersih',
        netProfit
      ],

      [
        'Margin Laba',
        `${profitMargin.toFixed(1)}%`
      ],

      [],

      [
        'PERFORMA CHANNEL'
      ],

      [
        'Website',
        channelTotals.website
      ],

      [
        'ShopeeFood',
        channelTotals.shopeefood
      ],

      [
        'Offline',
        channelTotals.offline
      ],

      [],

      [
        'OPERASIONAL'
      ],

      [
        'Total Transaksi',
        transactionCount
      ],

      [
        'Rata-rata Transaksi',
        averageTransaction
      ],

      [
        'Produk Terjual',
        totalProductsSold
      ],

      [
        'Channel Terbesar',
        largestChannel
      ],

      [
        'Produk Terlaris',
        bestProductName
      ]
    ];


    const worksheet =
      XLSX.utils.aoa_to_sheet(
        data
      );


    worksheet['!cols'] = [
      {
        wch: 30
      },

      {
        wch: 24
      }
    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Laporan'
    );


    XLSX.writeFile(
      workbook,
      `laporan-dapoersari-${range}.xlsx`
    );
  };


  /* =====================================================
     EXPORT PDF
     ===================================================== */

  const exportPDF = () => {
    const doc =
      new jsPDF({
        orientation:
          'portrait',

        unit:
          'mm',

        format:
          'a4'
      });


    const pageWidth =
      doc.internal.pageSize.getWidth();


    doc.setTextColor(
      15,
      31,
      47
    );


    doc.setFontSize(
      18
    );


    doc.setFont(
      'helvetica',
      'bold'
    );


    doc.text(
      'Laporan Manajemen Dapoersari',
      14,
      18
    );


    doc.setFontSize(
      9
    );


    doc.setFont(
      'helvetica',
      'normal'
    );


    doc.setTextColor(
      100,
      116,
      132
    );


    doc.text(
      `Periode: ${range}`,
      14,
      25
    );


    autoTable(
      doc,
      {
        startY:
          32,

        head: [
          [
            'Indikator',
            'Nilai'
          ]
        ],

        body: [
          [
            'Penjualan Kotor',
            money(
              grossSales
            )
          ],

          [
            'Potongan Platform',
            money(
              platformDeduction
            )
          ],

          [
            'Penjualan Bersih',
            money(
              netSales
            )
          ],

          [
            'Pengeluaran',
            money(
              expenseTotal
            )
          ],

          [
            'Laba Bersih',
            money(
              netProfit
            )
          ],

          [
            'Margin Laba',
            `${profitMargin.toFixed(1)}%`
          ],

          [
            'Total Transaksi',
            transactionCount
          ],

          [
            'Produk Terjual',
            totalProductsSold
          ],

          [
            'Rata-rata Transaksi',
            money(
              averageTransaction
            )
          ],

          [
            'Channel Terbesar',
            largestChannel
          ],

          [
            'Produk Terlaris',
            bestProductName
          ]
        ],

        theme:
          'grid',

        styles: {
          font:
            'helvetica',

          fontSize:
            9,

          cellPadding:
            5,

          textColor: [
            50,
            63,
            77
          ]
        },

        headStyles: {
          fillColor: [
            11,
            26,
            42
          ],

          textColor: [
            255,
            255,
            255
          ],

          fontStyle:
            'bold'
        },

        alternateRowStyles: {
          fillColor: [
            248,
            250,
            251
          ]
        },

        columnStyles: {
          0: {
            cellWidth:
              95
          },

          1: {
            cellWidth:
              pageWidth -
              109
          }
        }
      }
    );


    const finalY =
      doc.lastAutoTable?.finalY ||
      45;


    doc.setFontSize(
      9
    );


    doc.setTextColor(
      130,
      140,
      150
    );


    doc.text(
      'Dapoersari Owner Workspace',
      14,
      finalY + 12
    );


    doc.save(
      `laporan-dapoersari-${range}.pdf`
    );
  };


  /* =====================================================
     CHANNEL ITEM
     ===================================================== */

  const ReportChannel = ({
    name,
    value
  }) => {

    const percentage =
      grossSales > 0
        ? (
            Number(
              value || 0
            ) /
            grossSales
          ) *
          100
        : 0;


    return (
      <div className="report-channel-item">

        <div className="report-channel-top">

          <div className="report-channel-label">

            <span className="report-channel-dot" />

            <span>
              {name}
            </span>

          </div>


          <strong>
            {money(value)}
          </strong>

        </div>


        <div className="report-channel-track">

          <span
            className="report-channel-progress"
            style={{
              width:
                `${Math.min(
                  100,
                  percentage
                )}%`
            }}
          />

        </div>


        <small>
          {percentage.toFixed(1)}%
        </small>

      </div>
    );
  };


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <>

      <PageHeader
        eyebrow="LAPORAN MANAJEMEN"
        title="Laporan"
        subtitle="Ringkasan kinerja bisnis berdasarkan periode."
        action={
          <div
            className="report-header-actions"
            style={{
              position:
                'relative',
            }}
          >

            <RangeSelect
              value={range}
              onChange={setRange}
            />


            <div
              className="report-export-group"
              ref={exportMenuRef}
              style={{
                position:
                  'relative',

                zIndex:
                  1001
              }}
            >

              <button
                type="button"
                className="secondary-btn report-export-trigger"
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setExportOpen(
                    (prev) =>
                      !prev
                  );
                }}
              >

                <FileText
                  size={16}
                />

                <span>
                  Export
                </span>

                <ChevronDown
                  size={15}
                />

              </button>


              {exportOpen && (

                <div
                  className="report-export-dropdown"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  style={{
                    position:
                      'absolute',

                    top:
                      'calc(100% + 8px)',

                    right:
                      0,

                    zIndex:
                      99999,

                    pointerEvents:
                      'auto'
                  }}
                >

                  {/* CSV */}

                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      exportCSV();

                      setExportOpen(
                        false
                      );
                    }}
                  >

                    <FileText
                      size={15}
                    />

                    <span>
                      Export CSV
                    </span>

                  </button>


                  {/* EXCEL */}

                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      exportExcel();

                      setExportOpen(
                        false
                      );
                    }}
                  >

                    <FileSpreadsheet
                      size={15}
                    />

                    <span>
                      Export Excel
                    </span>

                  </button>


                  {/* PDF */}

                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      exportPDF();

                      setExportOpen(
                        false
                      );
                    }}
                  >

                    <FileText
                      size={15}
                    />

                    <span>
                      Export PDF
                    </span>

                  </button>

                </div>

              )}

            </div>

          </div>
        }
      />


      <div className="report-page">


        {/* =================================================
            TAB
            ================================================= */}

        <div className="report-tabs">

          <button
            type="button"
            className={
              activeReport ===
              'ringkasan'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveReport(
                'ringkasan'
              )
            }
          >
            Ringkasan
          </button>


          <button
            type="button"
            className={
              activeReport ===
              'penjualan'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveReport(
                'penjualan'
              )
            }
          >
            Penjualan
          </button>


          <button
            type="button"
            className={
              activeReport ===
              'laba'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveReport(
                'laba'
              )
            }
          >
            Laba & Rugi
          </button>

        </div>


        {/* =================================================
            RINGKASAN
            ================================================= */}

        {activeReport ===
          'ringkasan' && (

          <div className="report-summary">


            {/* =================================================
                HERO
                ================================================= */}

            <section className="report-main-kpi">

              <div className="report-net-sales">

                <div className="report-kpi-label">
                  PENJUALAN BERSIH
                </div>

                <div className="report-net-sales-value">
                  {money(netSales)}
                </div>

                <div className="report-kpi-description">
                  Pendapatan setelah potongan platform
                </div>

              </div>


              <div className="report-profit-highlight">

                <div className="report-kpi-label">
                  LABA BERSIH
                </div>

                <strong>
                  {money(netProfit)}
                </strong>

                <span>
                  Margin {profitMargin.toFixed(1)}%
                </span>

              </div>

            </section>


            {/* =================================================
                METRIC
                ================================================= */}

            <section className="report-metric-grid">

              <div className="report-metric-card">

                <span>
                  Penjualan Kotor
                </span>

                <strong>
                  {money(grossSales)}
                </strong>

              </div>


              <div className="report-metric-card">

                <span>
                  Potongan Platform
                </span>

                <strong>
                  {money(platformDeduction)}
                </strong>

              </div>


              <div className="report-metric-card">

                <span>
                  Pengeluaran
                </span>

                <strong>
                  {money(expenseTotal)}
                </strong>

              </div>


              <div className="report-metric-card">

                <span>
                  Margin Laba
                </span>

                <strong>
                  {profitMargin.toFixed(1)}%
                </strong>

              </div>

            </section>


            {/* =================================================
                TREND + CHANNEL
                ================================================= */}

            <section className="report-analysis-grid">


              {/* TREND */}

              <div className="report-card report-trend-card">

                <div className="report-card-header">

                  <div>

                    <span>
                      PERFORMA PENJUALAN
                    </span>

                    <h3>
                      Tren penjualan
                    </h3>

                    <p>
                      Pergerakan omzet berdasarkan transaksi.
                    </p>

                  </div>

                </div>


                {trend.length > 0 ? (

                  <div className="report-trend-chart">

                    <div className="report-trend-bars">

                      {trend.map(
                        (
                          [date, value],
                          index
                        ) => {

                          const percentage =
                            (
                              Number(value) /
                              maxTrend
                            ) *
                            100;


                          return (
                            <div
                              key={
                                `${date}-${index}`
                              }
                              className="report-trend-column"
                            >

                              <div
                                className="report-trend-value"
                              >
                                {money(value)}
                              </div>


                              <div className="report-trend-bar-wrap">

                                <div
                                  className="report-trend-bar"
                                  style={{
                                    height:
                                      `${Math.max(
                                        8,
                                        percentage
                                      )}%`
                                  }}
                                />

                              </div>


                              <small>
                                {formatTrendDate(
                                  date
                                )}
                              </small>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                ) : (

                  <div className="report-empty">
                    Belum ada data penjualan pada periode ini.
                  </div>

                )}

              </div>


              {/* CHANNEL */}

              <div className="report-card">

                <div className="report-card-header">

                  <div>

                    <span>
                      PERFORMA CHANNEL
                    </span>

                    <h3>
                      Sumber penjualan
                    </h3>

                    <p>
                      Kontribusi setiap channel terhadap omzet.
                    </p>

                  </div>

                </div>


                <div className="report-channel-list">

                  <ReportChannel
                    name="Website"
                    value={
                      channelTotals.website
                    }
                  />


                  <ReportChannel
                    name="ShopeeFood"
                    value={
                      channelTotals.shopeefood
                    }
                  />


                  <ReportChannel
                    name="Offline"
                    value={
                      channelTotals.offline
                    }
                  />

                </div>


                <div className="report-small-highlight">

                  <span>
                    Channel terbesar
                  </span>

                  <strong>
                    {largestChannel}
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                OPERASIONAL
                ================================================= */}

            <section className="report-card">

              <div className="report-card-header">

                <div>

                  <span>
                    OPERASIONAL
                  </span>

                  <h3>
                    Indikator bisnis
                  </h3>

                  <p>
                    Ringkasan aktivitas usaha selama periode terpilih.
                  </p>

                </div>

              </div>


              <div className="report-operation-grid">

                <div className="report-operation-item">

                  <span>
                    Total transaksi
                  </span>

                  <strong>
                    {transactionCount}
                  </strong>

                  <small>
                    transaksi selesai
                  </small>

                </div>


                <div className="report-operation-item">

                  <span>
                    Rata-rata transaksi
                  </span>

                  <strong>
                    {money(
                      averageTransaction
                    )}
                  </strong>

                  <small>
                    nilai rata-rata
                  </small>

                </div>


                <div className="report-operation-item">

                  <span>
                    Produk terjual
                  </span>

                  <strong>
                    {totalProductsSold}
                  </strong>

                  <small>
                    item
                  </small>

                </div>


                <div className="report-operation-item">

                  <span>
                    Channel terbesar
                  </span>

                  <strong>
                    {largestChannel}
                  </strong>

                  <small>
                    kontributor omzet
                  </small>

                </div>


                <div className="report-operation-item">

                  <span>
                    Produk terlaris
                  </span>

                  <strong
                    title={
                      bestProductName
                    }
                  >
                    {bestProductName}
                  </strong>

                  <small>
                    produk dengan penjualan tertinggi
                  </small>

                </div>


                <div className="report-operation-item featured">

                  <span>
                    Margin laba bersih
                  </span>

                  <strong>
                    {profitMargin.toFixed(1)}%
                  </strong>

                  <small>
                    dari penjualan kotor
                  </small>

                </div>

              </div>

            </section>


            {/* =================================================
                INSIGHT
                ================================================= */}

            <section className="report-insight-grid">

              <div className="report-insight-card">

                <div className="report-insight-badge">
                  PRODUK TERLARIS
                </div>

                <h3>
                  {bestProductName}
                </h3>

                <p>
                  {bestProduct
                    ? `${Number(
                        bestProduct.quantity || 0
                      )} item terjual pada periode ini.`
                    : 'Belum tersedia data produk.'}
                </p>

              </div>


              <div className="report-insight-card">

                <div className="report-insight-badge">
                  CATATAN KEUANGAN
                </div>

                <h3>
                  Kenali selisih omzet
                </h3>

                <p>
                  Penjualan kotor sebesar{' '}
                  <strong>
                    {money(grossSales)}
                  </strong>
                  {' '}menjadi{' '}
                  <strong>
                    {money(netSales)}
                  </strong>
                  {' '}setelah potongan platform.
                </p>

              </div>


              <div className="report-insight-card">

                <div className="report-insight-badge">
                  HASIL USAHA
                </div>

                <h3>
                  Laba bersih
                </h3>

                <p>
                  Setelah memperhitungkan
                  pengeluaran usaha, laba bersih
                  tercatat sebesar{' '}
                  <strong>
                    {money(netProfit)}
                  </strong>.
                </p>

              </div>

            </section>

          </div>
        )}


        {/* =================================================
            PENJUALAN
            ================================================= */}

        {activeReport ===
          'penjualan' && (

          <div className="report-summary">

            <section className="report-card">

              <div className="report-card-header">

                <div>

                  <span>
                    LAPORAN PENJUALAN
                  </span>

                  <h3>
                    Rekap transaksi
                  </h3>

                  <p>
                    Daftar transaksi yang selesai pada periode terpilih.
                  </p>

                </div>

              </div>


              <div className="report-sales-summary">

                <div>

                  <span>
                    Penjualan kotor
                  </span>

                  <strong>
                    {money(grossSales)}
                  </strong>

                </div>


                <div>

                  <span>
                    Penjualan bersih
                  </span>

                  <strong>
                    {money(netSales)}
                  </strong>

                </div>


                <div>

                  <span>
                    Total transaksi
                  </span>

                  <strong>
                    {transactionCount}
                  </strong>

                </div>


                <div>

                  <span>
                    Rata-rata
                  </span>

                  <strong>
                    {money(
                      averageTransaction
                    )}
                  </strong>

                </div>

              </div>

            </section>


            <section className="report-card">

              <div className="report-card-header">

                <div>

                  <span>
                    DETAIL TRANSAKSI
                  </span>

                  <h3>
                    Penjualan selesai
                  </h3>

                  <p>
                    Gunakan tabel ini untuk melihat transaksi individual.
                  </p>

                </div>

              </div>


              <div className="table-panel report-table-panel">

                <div className="table-scroll">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Kode
                        </th>

                        <th>
                          Tanggal
                        </th>

                        <th>
                          Channel
                        </th>

                        <th>
                          Status
                        </th>

                        <th className="right">
                          Total
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {rows.map(
                        (row) => (

                          <tr
                            key={
                              `${row.orderCode}-${row.orderedAt}`
                            }
                          >

                            <td>
                              <strong>
                                {row.orderCode}
                              </strong>
                            </td>


                            <td>

                              {row.orderedAt
                                ? new Date(
                                    row.orderedAt
                                  ).toLocaleString(
                                    'id-ID'
                                  )
                                : '-'}

                            </td>


                            <td>

                              <ChannelBadge
                                channel={
                                  row.channel
                                }
                              />

                            </td>


                            <td>

                              <span className="status-badge done">
                                Selesai
                              </span>

                            </td>


                            <td className="right">

                              <strong>
                                {money(
                                  row.total
                                )}
                              </strong>

                            </td>

                          </tr>

                        )
                      )}


                      {!rows.length && (

                        <tr>

                          <td
                            colSpan="5"
                            className="empty-cell"
                          >
                            Belum ada transaksi
                            pada periode ini.
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>


            <section className="report-card">

              <div className="report-card-header">

                <div>

                  <span>
                    PRODUK
                  </span>

                  <h3>
                    Produk terlaris
                  </h3>

                </div>

              </div>


              <div className="report-product-list">

                {products.length > 0 ? (

                  products
                    .slice(0, 8)
                    .map(
                      (
                        product,
                        index
                      ) => (

                        <div
                          className="report-product-item"
                          key={
                            product.menuId ||
                            `${product.name}-${index}`
                          }
                        >

                          <div className="report-product-rank">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              '0'
                            )}
                          </div>


                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {Number(
                                product.quantity || 0
                              )}{' '}
                              item terjual
                            </span>

                          </div>


                          <strong>
                            {money(
                              product.revenue || 0
                            )}
                          </strong>

                        </div>

                      )
                    )

                ) : (

                  <div className="report-empty">
                    Belum ada data produk.
                  </div>

                )}

              </div>

            </section>

          </div>
        )}


        {/* =================================================
            LABA RUGI
            ================================================= */}

        {activeReport ===
          'laba' && (

          <div className="report-summary">


            <section className="report-profit-hero">

              <div>

                <span>
                  LABA BERSIH
                </span>

                <strong>
                  {money(netProfit)}
                </strong>

                <p>
                  Margin laba bersih{' '}
                  {profitMargin.toFixed(1)}%
                </p>

              </div>


              <div className="report-profit-side">

                <div>

                  <span>
                    Penjualan Bersih
                  </span>

                  <strong>
                    {money(netSales)}
                  </strong>

                </div>


                <div>

                  <span>
                    Pengeluaran
                  </span>

                  <strong>
                    {money(expenseTotal)}
                  </strong>

                </div>

              </div>

            </section>


            <section className="report-card">

              <div className="report-card-header">

                <div>

                  <span>
                    LABA RUGI
                  </span>

                  <h3>
                    Perhitungan laba bersih
                  </h3>

                  <p>
                    Komponen pendapatan dan biaya usaha.
                  </p>

                </div>

              </div>


              <div className="report-profit-list">

                <div className="report-profit-row">

                  <span>
                    Penjualan Kotor
                  </span>

                  <strong>
                    {money(
                      grossSales
                    )}
                  </strong>

                </div>


                <div className="report-profit-row deduction">

                  <span>
                    Potongan Platform
                  </span>

                  <strong>
                    - {money(
                      platformDeduction
                    )}
                  </strong>

                </div>


                <div className="report-profit-row subtotal">

                  <span>
                    Penjualan Bersih
                  </span>

                  <strong>
                    {money(
                      netSales
                    )}
                  </strong>

                </div>


                <div className="report-profit-row deduction">

                  <span>
                    Pengeluaran
                  </span>

                  <strong>
                    - {money(
                      expenseTotal
                    )}
                  </strong>

                </div>


                <div className="report-profit-row final">

                  <span>
                    Laba Bersih
                  </span>

                  <strong>
                    {money(
                      netProfit
                    )}
                  </strong>

                </div>

              </div>

            </section>


            <section className="report-insight-grid">

              <div className="report-insight-card">

                <div className="report-insight-badge">
                  MARGIN LABA
                </div>

                <h3>
                  {profitMargin.toFixed(1)}%
                </h3>

                <p>
                  Persentase laba bersih dibanding penjualan kotor.
                </p>

              </div>


              <div className="report-insight-card">

                <div className="report-insight-badge">
                  POTONGAN PLATFORM
                </div>

                <h3>
                  {money(
                    platformDeduction
                  )}
                </h3>

                <p>
                  Potongan platform yang memengaruhi penjualan bersih.
                </p>

              </div>


              <div className="report-insight-card">

                <div className="report-insight-badge">
                  PENGELUARAN
                </div>

                <h3>
                  {money(
                    expenseTotal
                  )}
                </h3>

                <p>
                  Total biaya usaha yang diperhitungkan dalam laporan.
                </p>

              </div>

            </section>

          </div>
        )}

      </div>
    </>
  );
}


/* =========================================================
   PANEL
   ========================================================= */

function Panel({
  title,
  hint,
  children
}) {

  return (
    <section
      className="
        panel
      "
    >

      <div
        className="
          panel-head
        "
      >

        <div>

          <strong>
            {title}
          </strong>

          <span>
            {hint}
          </span>

        </div>

      </div>


      {children}

    </section>
  );
}


/* =========================================================
   LOADING
   ========================================================= */

function LoadingPage() {

  return (
    <div
      className="
        loading-page
      "
    >

      <div
        className="
          spinner
        "
      />

      <span>
        Menyiapkan data...
      </span>

    </div>
  );
}


/* =========================================================
   ERROR
   ========================================================= */

function ErrorState({
  message
}) {

  return (
    <div
      className="
        error-page
      "
    >

      <div
        className="
          error-icon
        "
      >
        !
      </div>


      <h2>
        Data belum bisa dimuat
      </h2>


      <p>
        {message}
      </p>

    </div>
  );
}


/* =========================================================
   REACT ROOT
   ========================================================= */

ReactDOM
  .createRoot(
    document.getElementById(
      'root'
    )
  )
  .render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );