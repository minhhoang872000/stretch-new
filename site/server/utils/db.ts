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

// ───── Posts ─────

export interface PostSection {
  id: string
  title: string
  type: 'intro' | 'why' | 'components' | 'text'
  text?: string
  quote?: string
  bullets?: string[]
  image?: string
  items?: { title: string; desc: string; icon?: string }[]
}

export interface MockPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  categoryKey: 'articles' | 'company_updates' | 'team_stories' | 'events'
  image: string
  author: string
  readTime: string
  tags: string[]
  status: 'published' | 'draft'
  views: number
  date: string
  sections: PostSection[]
  createdAt: string
  updatedAt: string
}

export const posts: MockPost[] = [
  {
    id: 'post-001',
    slug: 'what-is-sport-recovery',
    title: 'What Is Sport Recovery and Why It Matters for Everyone Who Moves',
    excerpt: 'Sport recovery is more than rest. It\'s a structured process that helps your body adapt, reduce pain, and stay ready for what comes next.',
    category: 'Knowledge',
    categoryKey: 'articles',
    image: '/business_solution_sidebar.png',
    author: 'Stretch Team',
    readTime: '6 min read',
    tags: ['Recovery', 'Movement', 'Performance'],
    status: 'published',
    views: 1240,
    date: 'May 10, 2025',
    sections: [
      { id: 'what-is-sport-recovery', title: 'What is sport recovery?', type: 'intro', text: 'Sport recovery is the intentional process of helping your body return to balance after physical stress. It\'s not just about sleep or rest — it includes active techniques, therapeutic tools, and habits that together allow your muscles, joints, and nervous system to repair and adapt.', quote: 'Recovery is where progress happens. Without it, performance doesn\'t last.' },
      { id: 'why-it-matters', title: 'Why it matters', type: 'why', text: 'Good recovery helps you:', bullets: ['Reduce muscle soreness and fatigue', 'Lower risk of injury', 'Improve mobility and movement quality', 'Perform at your best, more consistently'], image: '/homepage-hero.webp' },
      { id: 'key-components', title: 'The key components of sport recovery', type: 'components', items: [{ title: 'Movement Restoration', desc: 'Improve mobility and restore range of motion', icon: 'movement' }, { title: 'Soft Tissue Work', desc: 'Release tension and reduce muscle tightness', icon: 'soft_tissue' }, { title: 'Recovery Modalities', desc: 'Use the right tools to speed up recovery', icon: 'modalities' }, { title: 'Hydration & Nutrition', desc: 'Fuel your body to repair and perform', icon: 'hydration' }, { title: 'Sleep & Rest', desc: 'Quality rest is where your body adapts and grows', icon: 'sleep' }] },
      { id: 'who-can-benefit', title: 'Who can benefit?', type: 'text', text: 'Anyone who moves. From athletes to weekend warriors to people with desk jobs, sport recovery can help reduce discomfort, improve function, and support long-term health.' },
      { id: 'how-to-get-started', title: 'How to get started', type: 'text', text: 'Start with understanding your body. Listen to the signs. Then, build a simple recovery routine that includes movement, rest, and professional support where needed.' },
      { id: 'key-takeaways', title: 'Key takeaways', type: 'text', text: 'Recovery is a journey, not a destination. Listen to your body, stay consistent, and don\'t hesitate to seek expert guidance when something feels off.' },
    ],
    createdAt: '2025-05-10T00:00:00Z',
    updatedAt: '2025-05-10T00:00:00Z',
  },
  {
    id: 'post-002',
    slug: 'foam-rolling-101',
    title: 'Foam Rolling 101: Simple Habits for Better Recovery',
    excerpt: 'Discover how foam rolling can reduce muscle tension, improve mobility, and support your daily recovery — in just a few minutes a day.',
    category: 'Knowledge',
    categoryKey: 'articles',
    image: '/recovery-who.png',
    author: 'Stretch Team',
    readTime: '7 min read',
    tags: ['Recovery', 'Mobility', 'Rehabilitation'],
    status: 'published',
    views: 987,
    date: 'May 8, 2025',
    sections: [
      { id: 'what-is-foam-rolling', title: 'What is foam rolling?', type: 'intro', text: 'Foam rolling is a self-myofascial release (SMR) technique that uses your own body weight to apply targeted pressure to specific muscle groups, releasing tension and improving tissue quality.', quote: 'The best recovery tool is the one you actually use. Foam rolling takes five minutes, costs almost nothing, and works.' },
      { id: 'why-foam-rolling-works', title: 'Why foam rolling works', type: 'why', text: 'Foam rolling works by stimulating blood circulation and releasing fascial tension that builds up from training and daily activity.', bullets: ['Reduce delayed-onset muscle soreness (DOMS) after exercise by up to 30%', 'Increase joint range of motion without decreasing muscle strength', 'Improve blood flow to fatigued muscles, accelerating nutrient delivery', 'Lower perceived fatigue and improve recovery between training sessions'], image: '/homepage-hero.webp' },
      { id: 'how-to-foam-roll', title: 'How to foam roll effectively', type: 'text', text: 'Start by placing the foam roller under the target muscle group. Use your body weight to apply moderate pressure. Roll slowly, 1 inch per second, pausing on tender areas for 20–30 seconds. Breathe deeply and avoid rolling over joints or the lower back.' },
      { id: 'common-mistakes', title: 'Common mistakes to avoid', type: 'text', text: 'Many people roll too quickly, which reduces the effectiveness of the technique. Slow, controlled movements let the fascia release properly. Also avoid rolling directly over a joint, bone, or area of acute injury.' },
      { id: 'building-routine', title: 'Building your foam rolling routine', type: 'text', text: 'Consistency is more important than duration. A simple 5-to-10-minute foam rolling routine before or after training — covering quads, hamstrings, glutes, and thoracic spine — can produce noticeable results within weeks.' },
    ],
    createdAt: '2025-05-08T00:00:00Z',
    updatedAt: '2025-05-08T00:00:00Z',
  },
  {
    id: 'post-003',
    slug: 'hip-mobility-key',
    title: 'Hip Mobility: The Key to Stronger, Pain-Free Movement',
    excerpt: 'Tight hips affect everything from your posture to your performance. Learn simple assessments and exercises to unlock better movement.',
    category: 'Knowledge',
    categoryKey: 'articles',
    image: '/runner-who.png',
    author: 'Stretch Team',
    readTime: '8 min read',
    tags: ['Mobility', 'Movement', 'Rehabilitation'],
    status: 'published',
    views: 856,
    date: 'Apr 30, 2025',
    sections: [
      { id: 'why-hip-mobility-matters', title: 'Why hip mobility matters', type: 'intro', text: 'Your hips are the central hub of your body\'s movement system. They connect your upper body to your lower body, support your spine, and drive almost every functional movement from walking to squatting to sprinting.', quote: 'Your hips don\'t lie — and neither does restricted movement. Unlock your hips, and you unlock your performance.' },
      { id: 'signs-hips-need-attention', title: 'Signs your hips need attention', type: 'why', text: 'Your body sends clear signals when hip mobility is becoming an issue.', bullets: ['Persistent tightness or stiffness in the front of your hips after sitting', 'Lower back pain that worsens with prolonged standing or walking', 'Difficulty squatting deeply or performing lunges with proper form', 'Knee pain or tracking issues during running or climbing stairs'], image: '/active-who.png' },
      { id: 'hip-mobility-assessment', title: 'Simple hip mobility assessments', type: 'text', text: 'You don\'t need expensive equipment to assess your hip mobility. Try the deep squat test: stand with feet shoulder-width apart and squat as deep as possible while keeping your heels on the floor. If your heels lift or your torso collapses forward, hip mobility work is needed.' },
      { id: 'hip-exercises', title: 'Exercises to improve hip mobility', type: 'text', text: 'Start with controlled movements that gradually increase range of motion. The 90/90 stretch, hip circles, deep squat holds, and pigeon pose are all effective starting points.' },
      { id: 'hip-routine', title: 'Making hip mobility part of your routine', type: 'text', text: 'The best hip mobility routine is one you can sustain. Integrate 5 minutes of hip work into your warm-up or cool-down, and aim for consistency over intensity.' },
    ],
    createdAt: '2025-04-30T00:00:00Z',
    updatedAt: '2025-04-30T00:00:00Z',
  },
  {
    id: 'post-004',
    slug: 'new-chapter-stretch',
    title: 'A New Chapter for Stretch.vn',
    excerpt: 'From our roots in sport recovery to a full movement health ecosystem — here\'s what\'s been happening behind the scenes and what\'s coming next.',
    category: 'Company Updates',
    categoryKey: 'company_updates',
    image: '/monaco-healthcare.png',
    author: 'Stretch Team',
    readTime: '6 min read',
    tags: ['Recovery', 'Performance'],
    status: 'published',
    views: 723,
    date: 'May 5, 2025',
    sections: [
      { id: 'where-we-started', title: 'Where we started', type: 'intro', text: 'Stretch.vn began with a simple idea: bring professional-quality recovery to people who move. We started small — a handful of practitioners, a focused set of services, and a belief that recovery deserved the same attention as training.', quote: 'We didn\'t set out to build a company. We set out to solve a problem. The company grew because the problem was real.' },
      { id: 'whats-changed', title: 'What\'s changed', type: 'text', text: 'In the past year, Stretch.vn has evolved from a focused event recovery service into a comprehensive movement health platform. We\'ve expanded our team, added new service modalities, built an online booking system, and launched our Sharing Hub to support ongoing education.' },
      { id: 'what-weve-learned', title: 'What we\'ve learned', type: 'text', text: 'Building Stretch.vn has taught us that people don\'t just want treatment — they want understanding. They want to know why they\'re tight, why they\'re in pain, and what they can do about it. That insight shapes everything we do.' },
      { id: 'whats-next', title: 'What\'s next for Stretch.vn', type: 'text', text: 'Looking ahead, we\'re focused on three priorities: accessibility, education, and community. More locations, more content, and more ways to connect people with the recovery support they need.' },
    ],
    createdAt: '2025-05-05T00:00:00Z',
    updatedAt: '2025-05-05T00:00:00Z',
  },
  {
    id: 'post-005',
    slug: 'new-space-thao-dien',
    title: 'Our New Space in Thao Dien is Now Open',
    excerpt: 'A space designed for focused care, better movement, and meaningful connections. Come see what we\'ve built.',
    category: 'Company Updates',
    categoryKey: 'company_updates',
    image: '/education-workshop.png',
    author: 'Stretch Team',
    readTime: '5 min read',
    tags: ['Recovery'],
    status: 'published',
    views: 612,
    date: 'Apr 25, 2025',
    sections: [
      { id: 'space-with-purpose', title: 'A space built with purpose', type: 'intro', text: 'After months of planning and preparation, we\'re excited to announce that our new recovery and movement space in Thao Dien is officially open.', quote: 'A good space doesn\'t just look good. It makes the work better. That\'s what we built.' },
      { id: 'what-youll-find', title: 'What you\'ll find here', type: 'text', text: 'The Thao Dien space features private treatment rooms equipped for hands-on therapy and assessment, an open movement area for group sessions and functional training, and a consultation zone for intake and progress reviews.' },
      { id: 'designed-for-recovery', title: 'Designed for your recovery', type: 'text', text: 'Our design philosophy was simple: remove friction. We wanted a space where you can arrive, feel comfortable immediately, and focus entirely on recovery.' },
      { id: 'visit-us', title: 'Visit us', type: 'text', text: 'Our Thao Dien space is open Monday through Saturday, with both morning and afternoon sessions available. Book online or drop by to see the space for yourself.' },
    ],
    createdAt: '2025-04-25T00:00:00Z',
    updatedAt: '2025-04-25T00:00:00Z',
  },
  {
    id: 'post-006',
    slug: 'growing-team-elevating-care',
    title: 'Growing the Team, Elevating Care',
    excerpt: 'Welcoming new therapists and coaches to the Stretch.vn family. Meet the people who are raising the standard of recovery.',
    category: 'Company Updates',
    categoryKey: 'company_updates',
    image: '/education-gallery-1.png',
    author: 'Stretch Team',
    readTime: '6 min read',
    tags: ['Performance'],
    status: 'published',
    views: 534,
    date: 'Apr 15, 2025',
    sections: [
      { id: 'why-were-growing', title: 'Why we\'re growing', type: 'intro', text: 'Demand for quality recovery support has grown significantly over the past year. More runners, athletes, and professionals are seeking structured, expert-led recovery.', quote: 'Growing isn\'t about getting bigger. It\'s about getting better — with more hands, more perspectives, and more heart.' },
      { id: 'hiring-philosophy', title: 'Our hiring philosophy', type: 'text', text: 'We don\'t hire based on credentials alone. While clinical qualifications are essential, we look for practitioners who listen well, communicate clearly, and genuinely care about the people they work with.' },
      { id: 'what-this-means', title: 'What this means for you', type: 'text', text: 'More team members mean more availability, shorter wait times, and greater flexibility in scheduling. It also means more specialized expertise available to you.' },
      { id: 'road-ahead', title: 'The road ahead', type: 'text', text: 'Our growth is far from finished. We\'re continuing to invest in our team\'s professional development and looking to bring on more practitioners who share our values.' },
    ],
    createdAt: '2025-04-15T00:00:00Z',
    updatedAt: '2025-04-15T00:00:00Z',
  },
  {
    id: 'post-007',
    slug: 'meet-huy-team-story',
    title: 'Meet Huy: Driven by Curiosity, Guided by Purpose',
    excerpt: 'From sports science student to recovery specialist — Huy shares his journey, his philosophy, and why he believes recovery is the most underrated part of performance.',
    category: 'Team Stories',
    categoryKey: 'team_stories',
    image: '/individual-hero.webp',
    author: 'Stretch Team',
    readTime: '7 min read',
    tags: ['Movement', 'Performance'],
    status: 'published',
    views: 489,
    date: 'May 2, 2025',
    sections: [
      { id: 'the-beginning', title: 'The beginning', type: 'intro', text: 'Huy\'s journey into recovery work didn\'t start in a clinic — it started on the field. As a university athlete, he became fascinated by how the body adapts to stress.', quote: 'I didn\'t choose recovery work. It chose me. Every time I see someone move better after a session, I know I\'m exactly where I should be.' },
      { id: 'finding-his-path', title: 'Finding his path', type: 'text', text: 'Before joining Stretch.vn, Huy worked with amateur football teams and running groups, providing basic recovery support and observing what made the biggest difference.' },
      { id: 'his-approach', title: 'His approach to recovery', type: 'text', text: 'Huy\'s sessions always start with listening. Before he touches a muscle, he wants to understand your goals, your history, and what your body is telling you.' },
      { id: 'what-drives-him', title: 'What drives him every day', type: 'text', text: 'Ask Huy what motivates him, and his answer is simple: progress. Not the dramatic, overnight kind — but the gradual, meaningful kind that changes how someone moves through their day.' },
    ],
    createdAt: '2025-05-02T00:00:00Z',
    updatedAt: '2025-05-02T00:00:00Z',
  },
  {
    id: 'post-008',
    slug: 'behind-session-listening',
    title: 'Behind the Session: The Power of Listening',
    excerpt: 'The most effective recovery starts before any technique is applied. It starts with truly understanding the person in front of you.',
    category: 'Team Stories',
    categoryKey: 'team_stories',
    image: '/active-who.png',
    author: 'Stretch Team',
    readTime: '7 min read',
    tags: ['Recovery', 'Movement'],
    status: 'published',
    views: 445,
    date: 'Apr 20, 2025',
    sections: [
      { id: 'more-than-technique', title: 'More than technique', type: 'intro', text: 'Walk into most recovery or therapy sessions, and the process feels familiar: lie down, describe where it hurts, receive treatment. But at Stretch.vn, the session starts long before any technique is applied.', quote: 'The body doesn\'t speak in diagnoses. It speaks in movement patterns, compensation, and pain signals. Our job is to translate.' },
      { id: 'why-we-listen-first', title: 'Why we listen first', type: 'text', text: 'In clinical practice, the assessment is often the most valuable part of a session. It tells the practitioner not just what is happening, but why — and that distinction changes everything.' },
      { id: 'what-listening-reveals', title: 'What listening reveals', type: 'text', text: 'Every person carries a unique movement history. Your sport, your job, your injuries, your stress levels — all of these shape how your body moves and where tension accumulates.' },
      { id: 'how-this-changes', title: 'How this changes your experience', type: 'text', text: 'When you feel truly heard, the entire recovery experience changes. Trust builds faster. You share more context. The treatment becomes more targeted and more effective.' },
    ],
    createdAt: '2025-04-20T00:00:00Z',
    updatedAt: '2025-04-20T00:00:00Z',
  },
  {
    id: 'post-009',
    slug: 'recovery-day-vn-runners',
    title: 'Recovery Day at VN Runners Festival',
    excerpt: 'We joined hundreds of runners at the VN Runners Festival to provide on-site recovery support. Here\'s what happened.',
    category: 'Events',
    categoryKey: 'events',
    image: '/marathon.png',
    author: 'Stretch Team',
    readTime: '7 min read',
    tags: ['Recovery', 'Performance'],
    status: 'published',
    views: 678,
    date: 'Apr 28, 2025',
    sections: [
      { id: 'day-of-recovery', title: 'A day of recovery', type: 'intro', text: 'The VN Runners Festival brought together over 500 runners from across Ho Chi Minh City. Our team was on-site from sunrise, ready to provide post-race recovery support.', quote: 'Every runner who crossed that finish line deserved to feel good the next day. That\'s what we were there for.' },
      { id: 'what-we-did', title: 'What we did', type: 'text', text: 'Our team provided foam rolling stations, stretching clinics, soft tissue therapy, and hydration guidance throughout the day. We worked with runners of all levels and backgrounds.' },
      { id: 'what-runners-learned', title: 'What runners learned', type: 'text', text: 'The most common insight from runners that day: recovery is not optional. Many had been skipping post-run recovery entirely, and the results showed in their soreness and stiffness.' },
      { id: 'community-in-action', title: 'Community in action', type: 'text', text: 'Events like this remind us why we do what we do. Recovery is a community effort — and every runner who took the time to look after their body that day invested in their future performance.' },
    ],
    createdAt: '2025-04-28T00:00:00Z',
    updatedAt: '2025-04-28T00:00:00Z',
  },
  {
    id: 'post-010',
    slug: 'movement-workshop-rmit',
    title: 'Movement Workshop at RMIT Vietnam',
    excerpt: 'We partnered with RMIT Vietnam to bring movement education to students. Here\'s what we covered and how it went.',
    category: 'Events',
    categoryKey: 'events',
    image: '/education-hero.png',
    author: 'Stretch Team',
    readTime: '6 min read',
    tags: ['Movement', 'Rehabilitation'],
    status: 'published',
    views: 392,
    date: 'Apr 18, 2025',
    sections: [
      { id: 'movement-education-campus', title: 'Movement education on campus', type: 'intro', text: 'University students spend hours sitting — in lectures, in libraries, at their desks. We partnered with RMIT Vietnam to bring practical movement education directly to their campus.', quote: 'Education about movement should be part of every curriculum. The body doesn\'t stop needing care just because you\'re in a lecture hall.' },
      { id: 'what-we-covered', title: 'What we covered', type: 'text', text: 'The workshop covered posture assessment, desk ergonomics, simple mobility exercises, and the basics of recovery. We kept it practical — students left with tools they could use immediately.' },
      { id: 'student-engagement', title: 'Student engagement', type: 'text', text: 'Over 80 students attended across two sessions. The most popular segment was live posture assessment — many students were surprised to learn how significantly their sitting habits were affecting their movement.' },
      { id: 'looking-forward', title: 'Looking forward', type: 'text', text: 'We\'re in conversations with RMIT and other universities about making these workshops a recurring offering. Movement education for students is a long-term commitment we\'re proud to make.' },
    ],
    createdAt: '2025-04-18T00:00:00Z',
    updatedAt: '2025-04-18T00:00:00Z',
  },
  {
    id: 'post-011',
    slug: 'sunrise-stretch-sala',
    title: 'Sunrise Stretch at Sala Riverfront Park',
    excerpt: 'We hosted our first outdoor morning session at Sala Riverfront Park. Here\'s how it went and what\'s next.',
    category: 'Events',
    categoryKey: 'events',
    image: '/warm-up.webp',
    author: 'Stretch Team',
    readTime: '6 min read',
    tags: ['Movement', 'Recovery'],
    status: 'published',
    views: 511,
    date: 'Apr 22, 2025',
    sections: [
      { id: 'morning-movement-park', title: 'Morning movement in the park', type: 'intro', text: 'On a clear Saturday morning, we set up at Sala Riverfront Park for our first Sunrise Stretch community session. Over 60 people joined us for an hour of guided movement and recovery.', quote: 'Movement is better together. When you practice in community, you stay consistent — and you enjoy it more.' },
      { id: 'the-session', title: 'The session', type: 'text', text: 'We led participants through a 60-minute flow: joint mobility warm-up, foam rolling, partner stretching, and a guided cool-down. The session was open to all fitness levels.' },
      { id: 'community-response', title: 'Community response', type: 'text', text: 'The response was overwhelming. Participants ranged from morning joggers to complete beginners. Many said it was the first time they\'d ever done structured recovery work outside of a gym.' },
      { id: 'join-us-next-time', title: 'Join us next time', type: 'text', text: 'We\'re planning our next Sunrise Stretch for next month. Follow us on Instagram or sign up via our website to be the first to know.' },
    ],
    createdAt: '2025-04-22T00:00:00Z',
    updatedAt: '2025-04-22T00:00:00Z',
  },
  {
    id: 'post-012',
    slug: 'setbacks-to-strength-kevin',
    title: 'From Setbacks to Strength: Kevin\'s Story',
    excerpt: 'Kevin came to Stretch.vn after a serious knee injury sidelined him from football. This is his recovery journey.',
    category: 'Team Stories',
    categoryKey: 'team_stories',
    image: '/athlete-who.png',
    author: 'Stretch Team',
    readTime: '8 min read',
    tags: ['Recovery', 'Rehabilitation'],
    status: 'published',
    views: 602,
    date: 'Apr 10, 2025',
    sections: [
      { id: 'moment-everything-changed', title: 'The moment everything changed', type: 'intro', text: 'Kevin was six months into his most consistent training season when his knee gave out during a match. The diagnosis: partial ACL tear. The outlook: months of rehabilitation ahead.', quote: 'I thought the injury was the end. It turned out to be the beginning of understanding how my body actually works.' },
      { id: 'recovery-process', title: 'The recovery process', type: 'text', text: 'Kevin began working with the Stretch.vn team three weeks after his injury. The initial focus was reducing inflammation, restoring range of motion, and rebuilding neuromuscular control around the knee.' },
      { id: 'what-made-difference', title: 'What made the difference', type: 'text', text: 'According to Kevin, the biggest shift was understanding the why behind each exercise. When he understood what he was training and why it mattered, his commitment to the process deepened.' },
      { id: 'where-kevin-is-now', title: 'Where Kevin is now', type: 'text', text: 'Eight months after his injury, Kevin returned to competitive football. He now incorporates structured recovery into his weekly routine — not just when he\'s injured, but as a permanent part of how he trains.' },
    ],
    createdAt: '2025-04-10T00:00:00Z',
    updatedAt: '2025-04-10T00:00:00Z',
  },
]

let postCounter = posts.length + 1

export function getPosts(filter?: {
  status?: MockPost['status']
  categoryKey?: string
  search?: string
}): MockPost[] {
  let result = [...posts]
  if (filter?.status) result = result.filter(p => p.status === filter.status)
  if (filter?.categoryKey) result = result.filter(p => p.categoryKey === filter.categoryKey)
  if (filter?.search) {
    const q = filter.search.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPostBySlug(slug: string): MockPost | undefined {
  return posts.find(p => p.slug === slug)
}

export function createPost(data: Omit<MockPost, 'id' | 'views' | 'createdAt' | 'updatedAt'>): MockPost {
  const post: MockPost = {
    ...data,
    id: `post-${String(postCounter++).padStart(3, '0')}`,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  posts.unshift(post)
  return post
}

export function updatePost(slug: string, data: Partial<Omit<MockPost, 'id' | 'createdAt'>>): MockPost | undefined {
  const post = posts.find(p => p.slug === slug)
  if (!post) return undefined
  Object.assign(post, data, { updatedAt: new Date().toISOString() })
  return post
}

export function deletePost(slug: string): boolean {
  const index = posts.findIndex(p => p.slug === slug)
  if (index !== -1) {
    posts.splice(index, 1)
    return true
  }
  return false
}
