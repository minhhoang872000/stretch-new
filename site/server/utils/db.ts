/**
 * In-memory mock database for demo purposes.
 * Replace with Prisma / Drizzle / Supabase in production.
 */

export interface MockProduct {
  id: string
  slug: string
  name: string
  nameEn: string
  nameVi: string
  shortDescription: string
  shortDescriptionEn: string
  shortDescriptionVi: string
  description: string
  price: number
  currency: string
  coverImage: string
  images: string[]
  category: string
  tags: string[]
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface MockPractitioner {
  id: string
  name: string
  avatar: string
  bio: string
  specialties: string[]
  services: string[]
}

export interface MockBooking {
  id: string
  service: string
  practitioner: string | null
  date: string
  time: string
  name: string
  phone: string
  email?: string
  note?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

// ───── Products ─────
export const products: MockProduct[] = [
  {
    id: 'srv-001',
    slug: 'facial-hydration-therapy',
    name: 'Facial Hydration Therapy',
    nameEn: 'Facial Hydration Therapy',
    nameVi: 'Liệu Pháp Cấp Ẩm Phục Hồi',
    shortDescription: 'Deep hydration therapy for soft, glowing skin using advanced technology.',
    shortDescriptionEn: 'Deep hydration therapy for soft, glowing skin using advanced technology.',
    shortDescriptionVi: 'Liệu pháp cấp ẩm chuyên sâu giúp da mềm mại, tươi sáng với công nghệ hiện đại.',
    description: `<p>Liệu pháp <strong>Facial Hydration Therapy</strong> sử dụng kỹ thuật tiên tiến kết hợp serum hyaluronic acid và collagen peptide để phục hồi độ ẩm sâu cho da.</p>
<ul>
  <li>Làm sạch sâu với enzyme nhẹ nhàng</li>
  <li>Đắp mặt nạ bio-cellulose cấp ẩm</li>
  <li>Massage kích thích tuần hoàn</li>
  <li>Kết thúc với kem dưỡng chống lão hóa</li>
</ul>
<p>Thời gian: 60 phút | Phù hợp mọi loại da</p>`,
    price: 850000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&fit=crop',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&fit=crop',
      'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&fit=crop',
    ],
    category: 'Facial',
    tags: ['popular', 'hydration'],
    available: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-04-20T00:00:00Z',
  },
  {
    id: 'srv-002',
    slug: 'deep-tissue-massage',
    name: 'Deep Tissue Massage',
    nameEn: 'Deep Tissue Massage',
    nameVi: 'Massage Mô Sâu',
    shortDescription: 'Deep tissue massage to relieve tension, reduce muscle pain and restore the body.',
    shortDescriptionEn: 'Deep tissue massage to relieve tension, reduce muscle pain and restore the body.',
    shortDescriptionVi: 'Massage mô sâu giúp giải tỏa căng thẳng, giảm đau cơ và phục hồi cơ thể.',
    description: `<p><strong>Deep Tissue Massage</strong> là liệu pháp massage chuyên sâu nhắm vào các lớp cơ bên dưới, giúp:</p>
<ul>
  <li>Giải phóng các điểm căng cơ (trigger points)</li>
  <li>Tăng lưu thông máu và giảm viêm</li>
  <li>Cải thiện phạm vi chuyển động</li>
  <li>Giảm đau mãn tính vùng lưng, cổ, vai</li>
</ul>
<p>Thời gian: 90 phút | Áp lực từ trung bình đến mạnh</p>`,
    price: 1200000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&fit=crop',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&fit=crop',
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&fit=crop',
    ],
    category: 'Massage',
    tags: ['popular', 'therapeutic'],
    available: true,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-04-18T00:00:00Z',
  },
  {
    id: 'srv-003',
    slug: 'aromatherapy-relaxation',
    name: 'Aromatherapy Relaxation',
    nameEn: 'Aromatherapy Relaxation',
    nameVi: 'Thư Giãn Tinh Dầu',
    shortDescription: 'Full-body aromatherapy to balance mind and body with natural oils.',
    shortDescriptionEn: 'Full-body aromatherapy to balance mind and body with natural oils.',
    shortDescriptionVi: 'Liệu pháp tinh dầu thư giãn toàn thân, cân bằng tâm trí và cơ thể.',
    description: `<p>Phiên <strong>Aromatherapy Relaxation</strong> kết hợp tinh dầu thiên nhiên với kỹ thuật massage nhẹ nhàng:</p>
<ul>
  <li>Lựa chọn tinh dầu theo nhu cầu cá nhân</li>
  <li>Massage toàn thân với áp lực nhẹ</li>
  <li>Liệu pháp đá nóng bổ sung</li>
  <li>Thiền định hướng dẫn kết thúc phiên</li>
</ul>
<p>Thời gian: 75 phút | Phù hợp cho stress, mất ngủ</p>`,
    price: 950000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&fit=crop',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&fit=crop',
      'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&fit=crop',
    ],
    category: 'Wellness',
    tags: ['relaxation'],
    available: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-04-15T00:00:00Z',
  },
  {
    id: 'srv-004',
    slug: 'led-light-skin-rejuvenation',
    name: 'LED Light Skin Rejuvenation',
    nameEn: 'LED Light Skin Rejuvenation',
    nameVi: 'Trẻ Hóa Da Bằng Đèn LED',
    shortDescription: 'LED light technology to stimulate collagen and rejuvenate the skin.',
    shortDescriptionEn: 'LED light technology to stimulate collagen and rejuvenate the skin.',
    shortDescriptionVi: 'Công nghệ ánh sáng LED kích thích tái tạo collagen, trẻ hóa làn da.',
    description: `<p><strong>LED Light Therapy</strong> sử dụng các bước sóng ánh sáng khác nhau để:</p>
<ul>
  <li>Đỏ (630nm): Kích thích collagen, giảm nếp nhăn</li>
  <li>Xanh (415nm): Diệt khuẩn P.acnes, giảm mụn</li>
  <li>Hồng ngoại (850nm): Giảm viêm, phục hồi sâu</li>
</ul>
<p>Không đau, không xâm lấn. Thời gian: 45 phút</p>`,
    price: 650000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&fit=crop',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&fit=crop',
    ],
    category: 'Technology',
    tags: ['new', 'anti-aging'],
    available: true,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-04-22T00:00:00Z',
  },
  {
    id: 'srv-005',
    slug: 'hot-stone-therapy',
    name: 'Hot Stone Therapy',
    nameEn: 'Hot Stone Therapy',
    nameVi: 'Trị Liệu Đá Nóng',
    shortDescription: 'Basalt hot stone therapy to relax deep muscles and improve blood circulation.',
    shortDescriptionEn: 'Basalt hot stone therapy to relax deep muscles and improve blood circulation.',
    shortDescriptionVi: 'Liệu pháp đá nóng bazan thư giãn cơ sâu, cải thiện tuần hoàn máu.',
    description: `<p><strong>Hot Stone Therapy</strong> sử dụng đá bazan tự nhiên được nung nóng:</p>
<ul>
  <li>Đá được đặt tại các huyệt đạo quan trọng</li>
  <li>Kết hợp massage thụy điển nhẹ nhàng</li>
  <li>Giãn cơ sâu không cần áp lực mạnh</li>
  <li>Giảm stress và cải thiện giấc ngủ</li>
</ul>
<p>Thời gian: 90 phút | Nhiệt độ được kiểm soát an toàn</p>`,
    price: 1100000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&fit=crop',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&fit=crop',
    ],
    category: 'Massage',
    tags: ['premium'],
    available: true,
    createdAt: '2025-02-15T00:00:00Z',
    updatedAt: '2025-04-10T00:00:00Z',
  },
  {
    id: 'srv-006',
    slug: 'premium-anti-aging-facial',
    name: 'Premium Anti-Aging Facial',
    nameEn: 'Premium Anti-Aging Facial',
    nameVi: 'Trẻ Hóa Da Cao Cấp',
    shortDescription: 'Premium anti-aging treatment with RF technology and 24K gold serum.',
    shortDescriptionEn: 'Premium anti-aging treatment with RF technology and 24K gold serum.',
    shortDescriptionVi: 'Liệu trình chống lão hóa cao cấp với công nghệ RF và serum vàng 24K.',
    description: `<p>Liệu trình <strong>Premium Anti-Aging</strong> kết hợp nhiều công nghệ tiên tiến:</p>
<ul>
  <li>Làm sạch và tẩy tế bào chết enzyme</li>
  <li>Nâng cơ bằng sóng RF (Radio Frequency)</li>
  <li>Serum vàng 24K chống oxy hóa</li>
  <li>Mặt nạ collagen vàng sinh học</li>
  <li>Kem dưỡng peptide chuyên sâu</li>
</ul>
<p>Thời gian: 120 phút | Kết quả thấy rõ sau 1 liệu trình</p>`,
    price: 2500000,
    currency: 'VND',
    coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=640&h=360&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&fit=crop',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&fit=crop',
    ],
    category: 'Facial',
    tags: ['popular', 'premium', 'anti-aging'],
    available: true,
    createdAt: '2025-03-10T00:00:00Z',
    updatedAt: '2025-04-25T00:00:00Z',
  },
]

// ───── Practitioners ─────
export const practitioners: MockPractitioner[] = [
  {
    id: 'prac-001',
    name: 'Nguyễn Thị Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    bio: '10+ năm kinh nghiệm trong trị liệu da mặt và chống lão hóa.',
    specialties: ['Facial', 'Anti-Aging'],
    services: ['srv-001', 'srv-004', 'srv-006'],
  },
  {
    id: 'prac-002',
    name: 'Trần Văn Hoàng',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Chuyên gia massage trị liệu, chứng chỉ quốc tế từ ITEC.',
    specialties: ['Deep Tissue', 'Sports Massage'],
    services: ['srv-002', 'srv-005'],
  },
  {
    id: 'prac-003',
    name: 'Lê Thị Hương',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    bio: 'Chuyên viên aromatherapy và wellness, đào tạo tại Thái Lan.',
    specialties: ['Aromatherapy', 'Wellness'],
    services: ['srv-003', 'srv-005'],
  },
  {
    id: 'prac-004',
    name: 'Phạm Quốc Đạt',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: 'Kỹ thuật viên công nghệ cao, chuyên LED và RF therapy.',
    specialties: ['Technology', 'Skin Rejuvenation'],
    services: ['srv-001', 'srv-004', 'srv-006'],
  },
]

// ───── Bookings Store ─────
export const bookings: MockBooking[] = []

// ───── Helpers ─────
let bookingCounter = 1

export function createBooking(data: Omit<MockBooking, 'id' | 'status' | 'createdAt'>): MockBooking {
  const booking: MockBooking = {
    ...data,
    id: `bk-${String(bookingCounter++).padStart(4, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  bookings.push(booking)
  return booking
}

export function getProductBySlug(slug: string): MockProduct | undefined {
  return products.find(p => p.slug === slug)
}

export function getAvailableProducts(): MockProduct[] {
  return products.filter(p => p.available)
}

export function getPractitionersByService(serviceId: string): MockPractitioner[] {
  return practitioners.filter(p => p.services.includes(serviceId))
}

export function getAvailableSlots(practitionerId: string, date: string): string[] {
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00',
  ]

  const bookedSlots = bookings
    .filter(b => b.practitioner === practitionerId && b.date === date && b.status !== 'cancelled')
    .map(b => b.time)

  const bookedSet = new Set(bookedSlots)
  return allSlots.filter(s => !bookedSet.has(s))
}

export function getBookings(filter?: {
  status?: MockBooking['status']
  date?: string
  service?: string
}): MockBooking[] {
  let result = [...bookings]
  if (filter?.status) {
    result = result.filter(b => b.status === filter.status)
  }
  if (filter?.date) {
    result = result.filter(b => b.date === filter.date)
  }
  if (filter?.service) {
    result = result.filter(b => b.service === filter.service)
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getBookingById(id: string): MockBooking | undefined {
  return bookings.find(b => b.id === id)
}

export function updateBookingStatus(id: string, status: MockBooking['status']): MockBooking | undefined {
  const booking = bookings.find(b => b.id === id)
  if (booking) {
    booking.status = status
    booking.updatedAt = new Date().toISOString()
  }
  return booking
}

export function deleteBooking(id: string): boolean {
  const index = bookings.findIndex(b => b.id === id)
  if (index !== -1) {
    bookings.splice(index, 1)
    return true
  }
  return false
}
