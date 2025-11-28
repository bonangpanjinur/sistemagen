import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon, 
  PlusCircleIcon,
  BanknotesIcon,
  TagIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  ChartBarIcon,
  IdentificationIcon,
  MegaphoneIcon,
  FunnelIcon,
  UserCircleIcon,
  ServerIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  
  // MODUL 1: TRANSAKSI (Core Business)
  { 
    label: 'Transaksi', 
    icon: ClipboardDocumentListIcon,
    submenu: [
      { path: '/bookings/create', label: 'Buat Booking Baru', icon: PlusCircleIcon },
      { path: '/bookings', label: 'Data Transaksi', icon: DocumentTextIcon },
    ]
  },

  // MODUL 2: PRODUK & INVENTORY
  { 
    label: 'Produk Paket', 
    icon: BriefcaseIcon,
    submenu: [
      { path: '/packages', label: 'Katalog Paket', icon: BriefcaseIcon },
      { path: '/departures', label: 'Jadwal Keberangkatan', icon: CalendarIcon },
      { path: '/package-categories', label: 'Kategori Paket', icon: TagIcon },
      { path: '/flights', label: 'Data Penerbangan', icon: PaperAirplaneIcon },
      { path: '/hotels', label: 'Data Hotel', icon: BuildingOfficeIcon },
    ]
  },

  // MODUL 3: CRM (JEMAAH)
  { path: '/jamaah', label: 'Data Jemaah (CRM)', icon: UsersIcon },

  // MODUL 4: OPERASIONAL
  { 
    label: 'Operasional', 
    icon: ClipboardDocumentCheckIcon,
    submenu: [
      { path: '/tasks', label: 'Manajemen Tugas', icon: ClipboardDocumentCheckIcon },
      { path: '/logistics', label: 'Logistik & Perlengkapan', icon: TruckIcon },
    ]
  },

  // MODUL 5: KEUANGAN
  { 
    label: 'Keuangan', 
    icon: CurrencyDollarIcon,
    submenu: [
      { path: '/finance', label: 'Laporan Keuangan', icon: ChartBarIcon },
      { path: '/finance/expenses', label: 'Pengeluaran', icon: BanknotesIcon },
    ]
  },

  // MODUL 6: HR & KARYAWAN
  { 
    label: 'HR & Kepegawaian', 
    icon: IdentificationIcon,
    submenu: [
      { path: '/hr', label: 'Data Karyawan & Absensi', icon: IdentificationIcon },
    ]
  },

  // MODUL 7: MARKETING & AGEN
  { 
    label: 'Marketing & Agen', 
    icon: MegaphoneIcon,
    submenu: [
      { path: '/marketing', label: 'Leads & Prospek', icon: FunnelIcon },
      { path: '/agents', label: 'Kemitraan Agen', icon: UserCircleIcon },
    ]
  },

  // MODUL 8: SYSTEM & MASTER DATA
  { 
    label: 'Master Data', 
    icon: ServerIcon,
    submenu: [
      { path: '/masters', label: 'Master Umum', icon: ServerIcon },
      { path: '/users', label: 'Pengguna Sistem', icon: UsersIcon },
      { path: '/roles', label: 'Hak Akses (Role)', icon: LockClosedIcon },
    ]
  },

  { path: '/settings', label: 'Pengaturan', icon: Cog6ToothIcon },
];