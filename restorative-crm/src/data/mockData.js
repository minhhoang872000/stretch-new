export const kpiData = [
  {
    id: 'registrations',
    icon: 'person_add',
    label: 'Total Registrations',
    value: '1,284',
    badge: '+12%',
    badgeColor: 'primary',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    iconHoverBg: 'group-hover:bg-primary',
    iconHoverText: 'group-hover:text-white'
  },
  {
    id: 'new_today',
    icon: 'today',
    label: 'New Today',
    value: '24',
    badge: 'New',
    badgeColor: 'tertiary',
    iconBg: 'bg-tertiary/10',
    iconColor: 'text-tertiary',
    iconHoverBg: 'group-hover:bg-tertiary',
    iconHoverText: 'group-hover:text-white'
  },
  {
    id: 'unread_forms',
    icon: 'assignment_late',
    label: 'Unread Forms',
    value: '08',
    badge: null,
    pulse: true,
    badgeColor: 'error',
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
    iconHoverBg: 'group-hover:bg-error',
    iconHoverText: 'group-hover:text-white'
  },
  {
    id: 'active_services',
    icon: 'volunteer_activism',
    label: 'Active Services',
    value: '15',
    badge: 'Active',
    badgeColor: 'secondary',
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    iconHoverBg: 'group-hover:bg-secondary',
    iconHoverText: 'group-hover:text-white'
  }
]

export const chartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  heights: ['40%', '65%', '45%', '85%', '55%', '95%', '70%']
}

export const trafficSources = [
  { label: 'Direct Referrals', percent: '58%', color: 'bg-primary' },
  { label: 'Organic Search', percent: '32%', color: 'bg-tertiary' },
  { label: 'Social Media', percent: '10%', color: 'bg-secondary' }
]

export const recentPatients = [
  {
    initials: 'EJ',
    name: 'Elena Jacobs',
    email: 'elena.j@example.com',
    status: 'Pending',
    service: 'Physical Therapy',
    date: 'Oct 24, 2023',
    avatarBg: 'bg-primary-fixed',
    avatarText: 'text-primary'
  },
  {
    initials: 'MR',
    name: 'Marcus Reed',
    email: 'm.reed@wellness.co',
    status: 'Completed',
    service: 'Initial Consultation',
    date: 'Oct 23, 2023',
    avatarBg: 'bg-secondary-fixed',
    avatarText: 'text-secondary'
  },
  {
    initials: 'SL',
    name: 'Sophia Liao',
    email: 'sophia.l@icloud.com',
    status: 'Completed',
    service: 'Post-Op Rehab',
    date: 'Oct 22, 2023',
    avatarBg: 'bg-tertiary-fixed',
    avatarText: 'text-tertiary'
  }
]

export const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/leads', icon: 'person_search', label: 'Leads' },
  { path: '/bookings', icon: 'event_available', label: 'Bookings' },
  { path: '/categories', icon: 'category', label: 'Categories' },
  { path: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { path: '/blog', icon: 'article', label: 'Blog' },
  { path: '/services', icon: 'medical_services', label: 'Services' },
  { path: '/seo-settings', icon: 'travel_explore', label: 'SEO Settings' }
]

export const blogStats = [
  {
    id: 'total_published',
    label: 'Total Published',
    value: '124',
    icon: 'article',
    bgClass: 'bg-surface-container-low',
    textClass: 'text-teal-900',
    iconClass: 'text-primary/5',
    labelClass: 'text-on-surface-variant'
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    value: '12',
    icon: 'schedule',
    bgClass: 'bg-surface-container-low',
    textClass: 'text-teal-900',
    iconClass: 'text-primary/5',
    labelClass: 'text-on-surface-variant'
  },
  {
    id: 'drafts',
    label: 'Drafts',
    value: '8',
    icon: 'edit_note',
    bgClass: 'bg-surface-container-low',
    textClass: 'text-teal-900',
    iconClass: 'text-primary/5',
    labelClass: 'text-on-surface-variant'
  },
  {
    id: 'avg_monthly_views',
    label: 'Avg. Monthly Views',
    value: '14.2k',
    icon: 'trending_up',
    bgClass: 'bg-tertiary-fixed',
    textClass: 'text-on-tertiary-fixed',
    iconClass: 'text-on-tertiary-fixed/5',
    labelClass: 'text-on-tertiary-fixed-variant'
  }
]

export const blogPosts = [
  {
    id: 1,
    title: 'The Science of Myofascial Release',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEiKHkFNCzdm3SKwETvAUk2EjkEUdYpQk9A-YP36Hy0hQGMlK9HqfDygeD8b0NBAJRqmhgBHTgPQlmPyIkz0l9HqMDJyonDpJHI1z63P0i5EY1xwB-zm6xkFaNHuvvrGbEPOUwZAT3FdEBMliVzd7J2-cchWzkAQsyRTRJe94xjuA8Rli-1ho2eGX6LG8qDLC0jsHSYKoTq6HkOFnj3l31VSgqbI2KOkYdX9eoUCawkPHidjJlX8Fq3Y8stTHCqazTE1YMAS7SQf8',
    readTime: '8 min read',
    views: '1.2k views',
    category: 'Physical Health',
    authorInitials: 'AV',
    authorName: 'A. Vance',
    authorBg: 'bg-primary-fixed',
    authorText: 'text-on-primary-fixed',
    date: 'Oct 12, 2023',
    status: 'Published',
    statusColor: 'bg-teal-500',
    statusTextColor: 'text-teal-700'
  },
  {
    id: 2,
    title: 'Neuroplasticity in Adult Recovery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAURWa92koABi7O5ObiNfx5s9dIQ5fYSWBqBAKdtxmP-hYpEq16lAebRJ1ubLwJfzKyxcMiMdHYwA5qBn-Ua7valt3x1Fl0iGpzO1gWRrNFrQgTruiXL2x-ZsCBoX9r8wKgOKSWbw9L37o1fWJA6x0U9XpnqZr1QLopnkJkMRv4gY160Qs4F8RdTb_Nc8zevt0QFAPFP2uBsw5nLwV_2Iy8E0JBES4wlCi9AasLaq6WfrVPiMANyjpqZoBT2hV-IITx2ho_FHCfGdQ',
    readTime: '12 min read',
    views: '840 views',
    category: 'Neurology',
    authorInitials: 'SL',
    authorName: 'S. Lane',
    authorBg: 'bg-tertiary-fixed',
    authorText: 'text-on-tertiary-fixed',
    date: 'Oct 08, 2023',
    status: 'Draft',
    statusColor: 'bg-tertiary',
    statusTextColor: 'text-tertiary'
  },
  {
    id: 3,
    title: 'Managing Chronic Knee Inflammation',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClr70TMFBajHnYoYe5u6c_9cN0yvOI1TzU8AW4Jes7mJ4ECA1aMBQXHL05P4mcj2FwFFtNJmRfD8avGNb61OHegsa229IdBwQvLeztI6vakZMkv_Qw4jXx2vK-aIFJ2w7mbHtFI29TVuzDoFzBrx3HkAQ8GNW76_QiZyKQgbk2foc_krC1ZU2HWLrRczudF_B32qmXC8j8S2TUqPUZGDXDau7Jm68Q7P5jadytzDWOKBr2yuVu3XkETXVLIPSXRFuBuJepA40LCMU',
    readTime: '5 min read',
    views: '2.4k views',
    category: 'Joint Health',
    authorInitials: 'AV',
    authorName: 'A. Vance',
    authorBg: 'bg-primary-fixed',
    authorText: 'text-on-primary-fixed',
    date: 'Sep 28, 2023',
    status: 'Published',
    statusColor: 'bg-teal-500',
    statusTextColor: 'text-teal-700'
  },
  {
    id: 4,
    title: 'Nutrition for Rapid Muscle Repair',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0tCUI8AmoJMK1GZUivhjE1IxfAvBNZj0VOZpFWL0Y9f2FezYcX109HgFVUxRZTGjGdtIeKAGrfAH1RQLevtZGlUdEMHMAku3u-Ev98gI9XhjJwBweQwiUBqE5xp4vDRqWasuz_lUvnMpX8F7jXGiYLSaw7kDQNJwL69uZr8feKi2TfAwbRYyBQL4YWH8jRmGst6UGm07UygPtZ4v86K1eEcLpBsRziwS3SWJ8gL-jF4Uq3TDtvEYJ1TARd8EHfO8OCCHOmlvLeCM',
    readTime: '10 min read',
    views: '560 views',
    category: 'Nutrition',
    authorInitials: 'MB',
    authorName: 'M. Bloom',
    authorBg: 'bg-secondary-fixed',
    authorText: 'text-on-secondary-fixed',
    date: 'Sep 24, 2023',
    status: 'Archived',
    statusColor: 'bg-on-surface-variant',
    statusTextColor: 'text-on-surface-variant opacity-50'
  }
]

export const serviceCategories = [
  { id: 'all', label: 'All Services', active: true },
  { id: 'physio', label: 'Physiotherapy', active: false },
  { id: 'manual', label: 'Manual Therapy', active: false },
  { id: 'diagnostics', label: 'Diagnostics', active: false },
  { id: 'wellness', label: 'Wellness Packs', active: false }
]

export const servicesList = [
  {
    id: 1,
    title: 'Neuromuscular Repatterning',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQfSZvN6lqwIjg-ee7f2nyncOZaG2qZyizNHOQnyoa-RcwBV4b4gA0mpR3vVaMI0DySMEGR7x8rlU08w4Cx2cxi5iJlu6th9BWlYNIOm4hIDlBX0XB0ExDjinDJ35wE6ecVG-sLdWHuEsuM6TzhNHMcD0FVCtwGu3QpogWBnvgn3kZkP_mkZ6JvQd1CjfV5LLIvitvEju7TXGy1kK6PKzyjkRbkPqHQkymMDR59xYOhYbBZCNYFJ0qkqMwaO64iUsRV_PUcdkdw04',
    tag: 'Physio',
    description: 'Advanced motor control exercises focused on reconnecting neural pathways post-injury.',
    subTags: [
      { text: 'Post-Op Patients', style: 'bg-tertiary-container/20 text-tertiary' },
      { text: 'Sports Injury', style: 'bg-secondary-container/30 text-secondary' }
    ]
  },
  {
    id: 2,
    title: 'Osteopathic Spinal Integration',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC31ya2lU-eXLyeiLuexGsU_fekGvb_U7qs-I-6Y7G6JtpINiQCFiNlHLe2ntQtRSyaA73vj1zEyT5ScJRBBN7n129qJ2eQkmMJMJ7J8DmPz05nejU5VLESmHDOOg720mNtlvfp0uOPKMltGrHvhEVsiM5c0p1u9FS7x0n4C_c6U5WkzVI4QPDQH9_1D0YhTC1DaYZwt8U4YcnG3_2JnbrTo5N-9sN3yo5kdgJnvnUgm15U-kr_WDic1JJNdjTz5RqTEns__gm-LBA',
    tag: 'Manual',
    description: 'Holistic structural alignment focusing on long-term mechanical balance and nervous system flow.',
    subTags: [
      { text: 'Chronic Pain', style: 'bg-tertiary-container/20 text-tertiary' },
      { text: 'Geriatric Care', style: 'bg-secondary-container/30 text-secondary' }
    ]
  },
  {
    id: 3,
    title: 'Biomechanical Gait Analysis',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUrv1jCH2D1MOj9XXWRk6F4XNHkXUFM10SEYvTF5bn5ykNtTK4NlS60iVjj9aXRKBrkHy5KX4Wl6ngxT9jliFr5816_eojG2HFr9XNVp3YS0PjKXiUyeqFOidNJba_xNj9Z28ZKodSV67vH00L57drHiIBS3H8EE0IZin2oSXgFoHX7YIAWqJxf9QViDKNBe_z4bV_YzwlMMjEMthmtefRkfoGxU7TlqIqxUDhjYgMRW0-A1MaWGsJBFYPvuyoOXAuZKu1BzAI-I',
    tag: 'Diagnostic',
    description: 'Precision laser and high-speed camera analysis to detect subtle movement inefficiencies.',
    subTags: [
      { text: 'Elite Athletes', style: 'bg-tertiary-container/20 text-tertiary' },
      { text: 'Running Enthusiasts', style: 'bg-secondary-container/30 text-secondary' }
    ]
  },
  {
    id: 4,
    title: 'Hydrostatic Resistance Training',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ9lXyvrRF1jtka5sBv1O-I2QgHsMk2SXArUdwQD8cbQXm1T2aMC_HPujXH7AzZzEr6QUoyVttaS95OjfIt7i8NiRccy6EMJQ56LAQtyqgsZa9zlqtQSWEvi54kqmXQNhs8EK_fanNrkl9VXr1JSQjfwrMZ1HQLq6-c5TDep2bZ_ssno9Z5Qj7cmdB8MfBvsCploWI8wWmDrR0t4u77k-7-Rr0xMxmRew4pwefaFgbS1HrOSh7Ua-p1rv2v52FtuaU8uWRFQi7GDY',
    tag: 'Physio',
    description: 'Zero-impact rehabilitation utilizing water resistance to build strength without joint strain.',
    subTags: [
      { text: 'Joint Replacement', style: 'bg-tertiary-container/20 text-tertiary' },
      { text: 'Arthritis', style: 'bg-secondary-container/30 text-secondary' }
    ]
  },
  {
    id: 5,
    title: 'Dry Needling & Intramuscular',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQyjH0eaxQc4SGXLVHnuGTc3A6kVb62r2q-D2fG-kqbnR9neXJzeVllD_WpawfNVYtGr4CeVaG2Cai1EB5chdyNxhRXcgDCry22bXia0hCiBCUj1-S3gU9QC79ymyAve3wJfigviRc3a2NMSgHAMlhTOn4cr6vtjYSlMy_ld-k9tGp_DzAWwKBks1I9tEwqma8Dda-wKUY20yCgai79wvh2Y27IobNOS58nCHrqBGQJrrJyPSYHtMCwWKEFMzmy_oHDB5C8C673A',
    tag: 'Specialist',
    description: 'Targeting deep myofascial trigger points to release chronic muscle tension and spasms.',
    subTags: [
      { text: 'Active Spasms', style: 'bg-tertiary-container/20 text-tertiary' },
      { text: 'Pain Management', style: 'bg-secondary-container/30 text-secondary' }
    ]
  }
]

export const promoService = {
  title: 'Integrative Recovery Bundle',
  badge: 'Best Value',
  description: 'Combines Assessment, 4 Physio Sessions, and 2 Manual Therapy sessions into a 6-week intensive.',
  price: '$540.00',
  startingAtLabel: 'Starting at'
}

export const serviceStats = [
  {
    id: 'active_services',
    label: 'Total Active Services',
    value: '24',
    valueColor: 'text-primary',
    icon: null
  },
  {
    id: 'top_performer',
    label: 'Top Performer',
    value: 'Physiotherapy',
    valueColor: 'text-on-surface',
    icon: null
  },
  {
    id: 'avg_session',
    label: 'Average Session',
    value: '45m',
    valueColor: 'text-primary',
    icon: null
  },
  {
    id: 'revenue_growth',
    label: 'Revenue Growth',
    value: '+12%',
    valueColor: 'text-on-surface',
    icon: 'trending_up',
    iconColor: 'text-tertiary'
  }
]

export const seoPages = [
  {
    id: 'home',
    name: 'Home',
    title: 'Restorative Grid | Modern Clinic CRM & Management',
    description: "Streamline your clinic's patient flow with the world's most intuitive restorative care platform. Built for professionals.",
    status: 'Optimized',
    statusClass: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'about',
    name: 'About Us',
    title: 'Our Mission & Clinical Excellence | Restorative Grid',
    description: 'Learn about the team behind Restorative Grid and our commitment to clinical zen and patient data integrity.',
    status: 'Optimized',
    statusClass: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'contact',
    name: 'Contact',
    title: 'Get in Touch | Clinical Support & Sales',
    description: 'Missing meta description. Click to add for better click-through rates.',
    status: 'Incomplete',
    statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
  }
]

export const calendarBookings = [
  {
    id: 1,
    patientName: 'John Doe',
    service: 'Acupuncture',
    dateValue: 1,
    time: '09:00',
    displayTime: '09:00 - Acup...',
    color: 'bg-primary-fixed/30',
    textColor: 'text-primary-fixed-variant',
    border: 'border-primary/20'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    service: 'Deep Tissue Massage',
    dateValue: 3,
    time: '14:30',
    displayTime: '14:30 - Deep T...',
    color: 'bg-tertiary-fixed/30',
    textColor: 'text-tertiary',
    border: 'border-tertiary/20'
  },
  {
    id: 5,
    patientName: 'Sienna',
    patientId: 'ID: 84291',
    isVip: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBONNuZRbnCcwVCMgjskkpzHjo9I0ndv4uf0XbV_0tikzvYNmtmvt2pN9Q1CD8KjpQ1GRbKAKNnr-xK06BA1pjpRLv66bB2tiAveWmUnt8U80C-LDX-2YVinYu_eM8YyY0YSEO6-bTM_gfqWkcHFJ9KgJq7eyUT2fKr9x5GkeuK1dloU9r4Tl3Cpzz-LnGUH3drcTVWcFZomRPdD1KlFOku3qI-oPsqJaMhcclVe4LI7wnQqP27UmDNM4PKscS3LmhYw91Q0r-t4Qo',
    service: 'Full-Body Restorative Acupuncture',
    provider: 'Dr. Elena Vance',
    duration: '60 Min',
    dateStr: 'Oct 08, 2024 at 11:15 AM',
    notes: 'Patient reporting recurring cervical spine stiffness. Prefers warm environment during initial consultation.',
    dateValue: 8,
    time: '11:15',
    displayTime: '11:15 - Consult',
    color: 'bg-primary',
    textColor: 'text-on-primary',
    border: 'border-transparent'
  },
  {
    id: 6,
    patientName: 'Mark Johnson',
    service: 'Hydrotherapy',
    dateValue: 8,
    time: '15:00',
    displayTime: '15:00 - Hydrot...',
    color: 'bg-primary-fixed/40',
    textColor: 'text-primary-fixed-variant',
    border: 'border-primary/20'
  }
]

export const dailyProductivity = {
  filled: 12,
  total: 18,
  label: 'Slots filled today'
}
