import { pool } from './config/db'

/**
 * Seed script — inserts the mock data into PostgreSQL.
 * Run once: npx tsx src/seed.ts
 */
async function seed(): Promise<void> {
  console.log('[Seed] Starting...')

  // ─── Products ──────────────────────────────────────────────────
  const products = [
    {
      id: 'srv-001', slug: 'facial-hydration-therapy',
      name: 'Facial Hydration Therapy', name_en: 'Facial Hydration Therapy', name_vi: 'Liệu Pháp Cấp Ẩm Phục Hồi',
      short_description: 'Deep hydration therapy for soft, glowing skin using advanced technology.',
      short_description_en: 'Deep hydration therapy for soft, glowing skin using advanced technology.',
      short_description_vi: 'Liệu pháp cấp ẩm chuyên sâu giúp da mềm mại, tươi sáng với công nghệ hiện đại.',
      description: '<p>Liệu pháp <strong>Facial Hydration Therapy</strong> sử dụng kỹ thuật tiên tiến kết hợp serum hyaluronic acid và collagen peptide để phục hồi độ ẩm sâu cho da.</p>',
      price: 850000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&fit=crop']),
      category: 'Facial', tags: JSON.stringify(['popular', 'hydration']),
    },
    {
      id: 'srv-002', slug: 'deep-tissue-massage',
      name: 'Deep Tissue Massage', name_en: 'Deep Tissue Massage', name_vi: 'Massage Mô Sâu',
      short_description: 'Deep tissue massage to relieve tension, reduce muscle pain and restore the body.',
      short_description_en: 'Deep tissue massage to relieve tension, reduce muscle pain and restore the body.',
      short_description_vi: 'Massage mô sâu giúp giải tỏa căng thẳng, giảm đau cơ và phục hồi cơ thể.',
      description: '<p><strong>Deep Tissue Massage</strong> là liệu pháp massage chuyên sâu nhắm vào các lớp cơ bên dưới.</p>',
      price: 1200000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&fit=crop']),
      category: 'Massage', tags: JSON.stringify(['popular', 'therapeutic']),
    },
    {
      id: 'srv-003', slug: 'aromatherapy-relaxation',
      name: 'Aromatherapy Relaxation', name_en: 'Aromatherapy Relaxation', name_vi: 'Thư Giãn Tinh Dầu',
      short_description: 'Full-body aromatherapy to balance mind and body with natural oils.',
      short_description_en: 'Full-body aromatherapy to balance mind and body with natural oils.',
      short_description_vi: 'Liệu pháp tinh dầu thư giãn toàn thân, cân bằng tâm trí và cơ thể.',
      description: '<p>Phiên <strong>Aromatherapy Relaxation</strong> kết hợp tinh dầu thiên nhiên với kỹ thuật massage nhẹ nhàng.</p>',
      price: 950000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&fit=crop']),
      category: 'Wellness', tags: JSON.stringify(['relaxation']),
    },
    {
      id: 'srv-004', slug: 'led-light-skin-rejuvenation',
      name: 'LED Light Skin Rejuvenation', name_en: 'LED Light Skin Rejuvenation', name_vi: 'Trẻ Hóa Da Bằng Đèn LED',
      short_description: 'LED light technology to stimulate collagen and rejuvenate the skin.',
      short_description_en: 'LED light technology to stimulate collagen and rejuvenate the skin.',
      short_description_vi: 'Công nghệ ánh sáng LED kích thích tái tạo collagen, trẻ hóa làn da.',
      description: '<p><strong>LED Light Therapy</strong> sử dụng các bước sóng ánh sáng khác nhau.</p>',
      price: 650000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&fit=crop']),
      category: 'Technology', tags: JSON.stringify(['new', 'anti-aging']),
    },
    {
      id: 'srv-005', slug: 'hot-stone-therapy',
      name: 'Hot Stone Therapy', name_en: 'Hot Stone Therapy', name_vi: 'Trị Liệu Đá Nóng',
      short_description: 'Basalt hot stone therapy to relax deep muscles and improve blood circulation.',
      short_description_en: 'Basalt hot stone therapy to relax deep muscles and improve blood circulation.',
      short_description_vi: 'Liệu pháp đá nóng bazan thư giãn cơ sâu, cải thiện tuần hoàn máu.',
      description: '<p><strong>Hot Stone Therapy</strong> sử dụng đá bazan tự nhiên được nung nóng.</p>',
      price: 1100000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&fit=crop']),
      category: 'Massage', tags: JSON.stringify(['premium']),
    },
    {
      id: 'srv-006', slug: 'premium-anti-aging-facial',
      name: 'Premium Anti-Aging Facial', name_en: 'Premium Anti-Aging Facial', name_vi: 'Trẻ Hóa Da Cao Cấp',
      short_description: 'Premium anti-aging treatment with RF technology and 24K gold serum.',
      short_description_en: 'Premium anti-aging treatment with RF technology and 24K gold serum.',
      short_description_vi: 'Liệu trình chống lão hóa cao cấp với công nghệ RF và serum vàng 24K.',
      description: '<p>Liệu trình <strong>Premium Anti-Aging</strong> kết hợp nhiều công nghệ tiên tiến.</p>',
      price: 2500000, currency: 'VND',
      cover_image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=640&h=360&fit=crop',
      images: JSON.stringify(['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&fit=crop']),
      category: 'Facial', tags: JSON.stringify(['popular', 'premium', 'anti-aging']),
    },
  ]

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, slug, name, name_en, name_vi, short_description, short_description_en, short_description_vi, description, price, currency, cover_image, images, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.slug, p.name, p.name_en, p.name_vi, p.short_description, p.short_description_en, p.short_description_vi, p.description, p.price, p.currency, p.cover_image, p.images, p.category, p.tags]
    )
  }
  console.log(`[Seed] ✓ ${products.length} products inserted`)

  // ─── Practitioners ─────────────────────────────────────────────
  const practitioners = [
    { id: 'prac-001', name: 'Nguyễn Thị Minh Anh', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', bio: '10+ năm kinh nghiệm trong trị liệu da mặt và chống lão hóa.', specialties: JSON.stringify(['Facial', 'Anti-Aging']), services: JSON.stringify(['srv-001', 'srv-004', 'srv-006']) },
    { id: 'prac-002', name: 'Trần Văn Hoàng', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', bio: 'Chuyên gia massage trị liệu, chứng chỉ quốc tế từ ITEC.', specialties: JSON.stringify(['Deep Tissue', 'Sports Massage']), services: JSON.stringify(['srv-002', 'srv-005']) },
    { id: 'prac-003', name: 'Lê Thị Hương', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', bio: 'Chuyên viên aromatherapy và wellness, đào tạo tại Thái Lan.', specialties: JSON.stringify(['Aromatherapy', 'Wellness']), services: JSON.stringify(['srv-003', 'srv-005']) },
    { id: 'prac-004', name: 'Phạm Quốc Đạt', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', bio: 'Kỹ thuật viên công nghệ cao, chuyên LED và RF therapy.', specialties: JSON.stringify(['Technology', 'Skin Rejuvenation']), services: JSON.stringify(['srv-001', 'srv-004', 'srv-006']) },
  ]

  for (const p of practitioners) {
    await pool.query(
      `INSERT INTO practitioners (id, name, avatar, bio, specialties, services) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.avatar, p.bio, p.specialties, p.services]
    )
  }
  console.log(`[Seed] ✓ ${practitioners.length} practitioners inserted`)

  // ─── Practitioner-Service Links ────────────────────────────────
  const links = [
    ['prac-001', 'srv-001'], ['prac-001', 'srv-004'], ['prac-001', 'srv-006'],
    ['prac-002', 'srv-002'], ['prac-002', 'srv-005'],
    ['prac-003', 'srv-003'], ['prac-003', 'srv-005'],
    ['prac-004', 'srv-001'], ['prac-004', 'srv-004'], ['prac-004', 'srv-006'],
  ]

  for (const [pid, sid] of links) {
    await pool.query(
      `INSERT INTO practitioner_services (practitioner_id, service_id) VALUES ($1, $2)
       ON CONFLICT (practitioner_id, service_id) DO NOTHING`,
      [pid, sid]
    )
  }
  console.log(`[Seed] ✓ ${links.length} practitioner-service links inserted`)

  console.log('[Seed] Done!')
  await pool.end()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('[Seed] Error:', err)
  await pool.end()
  process.exit(1)
})
