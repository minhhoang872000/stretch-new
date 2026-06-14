import { pool } from './config/db'
import bcrypt from 'bcryptjs'

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

  // ─── Categories ────────────────────────────────────────────────
  const categories = [
    { id: 'cat-articles', key: 'articles', label: 'Knowledge', description: 'Educational articles, guides, and research', icon: 'menu_book', icon_bg: 'bg-teal-50', icon_color: 'text-teal-600', sort_order: 0 },
    { id: 'cat-company-updates', key: 'company_updates', label: 'Company Updates', description: 'News, announcements, and milestones', icon: 'campaign', icon_bg: 'bg-blue-50', icon_color: 'text-blue-600', sort_order: 1 },
    { id: 'cat-team-stories', key: 'team_stories', label: 'Team Stories', description: 'People, culture, and behind the scenes', icon: 'groups', icon_bg: 'bg-purple-50', icon_color: 'text-purple-600', sort_order: 2 },
    { id: 'cat-events', key: 'events', label: 'Events', description: 'Workshops, sessions, and community events', icon: 'event', icon_bg: 'bg-orange-50', icon_color: 'text-orange-500', sort_order: 3 },
  ]

  for (const c of categories) {
    await pool.query(
      `INSERT INTO categories (id, key, label, description, icon, icon_bg, icon_color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [c.id, c.key, c.label, c.description, c.icon, c.icon_bg, c.icon_color, c.sort_order]
    )
  }
  console.log(`[Seed] ✓ ${categories.length} categories inserted`)

  // ─── Blog Posts ────────────────────────────────────────────────
  const blogPosts = [
    // ── Featured Posts (4) ──
    {
      id: 'bp-001', slug: 'what-is-sport-recovery',
      title_en: 'What Is Sport Recovery and Why It Matters for Everyone Who Moves',
      title_vi: 'Phục hồi Thể thao: Tại sao nó Quan trọng với Tất cả Những ai Vận Động',
      excerpt_en: 'Sport recovery is more than rest. It\'s a structured process that helps your body adapt, reduce pain, and perform better.',
      excerpt_vi: 'Phục hồi thể thao không chỉ đơn thuần là nghỉ ngơi. Đó là một quy trình có cấu trúc giúp cơ thể thích nghi, giảm đau và vận động tốt hơn.',
      content_en: JSON.stringify([
        { id: 'what-is-sport-recovery', title: 'What is Sport Recovery?', type: 'intro', text: 'Sport recovery is the deliberate process of helping your body return to balance after physical stress. It supports tissue repair, reduces soreness, and prepares you for your next session or competition.', quote: 'Recovery is where progress happens. Without it, performance won\'t last.' },
        { id: 'why-it-matters', title: 'Why It Matters', type: 'why', text: 'Good recovery helps you:', bullets: ['Reduce soreness and muscle fatigue', 'Lower injury risk', 'Improve flexibility and movement quality', 'Achieve peak performance, more consistently'], image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/recovery-place.webp' },
        { id: 'key-components', title: 'Key Components of Sport Recovery', type: 'components', items: [{ title: 'Movement Restoration', desc: 'Improve flexibility and restore range of motion', icon: 'movement' }, { title: 'Soft Tissue Therapy', desc: 'Release tension and reduce muscle stiffness', icon: 'soft_tissue' }, { title: 'Recovery Modalities', desc: 'Use appropriate tools to accelerate recovery', icon: 'modalities' }, { title: 'Nutrition & Hydration', desc: 'Fuel the body for repair and activity', icon: 'hydration' }, { title: 'Sleep & Rest', desc: 'Quality rest is where the body adapts and grows', icon: 'sleep' }] },
        { id: 'who-can-benefit', title: 'Who Can Benefit?', type: 'text', text: 'Anyone who moves. From professional athletes, recreational sports enthusiasts to office workers, sport recovery helps you move better, feel healthier and maintain consistency.' },
        { id: 'how-to-get-started', title: 'How to Get Started', type: 'text', text: 'Start by understanding your body. Listen to the signals. Then, build a simple recovery routine that works for you. Need support? Our team is always ready to journey alongside you.' },
        { id: 'key-takeaways', title: 'Key Takeaways', type: 'text', text: 'Recovery is a long-term journey, not a one-time destination. Listen to your body, maintain consistency, and don\'t hesitate to seek professional guidance when needed.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'what-is-sport-recovery', title: 'Phục hồi thể thao là gì?', type: 'intro', text: 'Phục hồi thể thao là quá trình có chủ ý nhằm giúp cơ thể bạn trở lại trạng thái cân bằng sau những căng thẳng về thể chất. Nó hỗ trợ sửa chữa mô cơ, giảm đau nhức và chuẩn bị cho bạn cho buổi tập luyện hoặc thi đấu tiếp theo.', quote: 'Phục hồi là nơi sự tiến bộ diễn ra. Không có nó, hiệu suất sẽ không kéo dài.' },
        { id: 'why-it-matters', title: 'Tại sao nó quan trọng', type: 'why', text: 'Phục hồi tốt giúp bạn:', bullets: ['Giảm đau nhức và mỏi cơ', 'Giảm nguy cơ chấn thương', 'Cải thiện tính linh hoạt và chất lượng vận động', 'Đạt hiệu suất tốt nhất, ổn định hơn'], image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/recovery-place.webp' },
        { id: 'key-components', title: 'Các thành phần chính của phục hồi thể thao', type: 'components', items: [{ title: 'Khôi phục Vận Động', desc: 'Cải thiện tính linh hoạt và khôi phục biên độ vận động', icon: 'movement' }, { title: 'Trị liệu Mô mềm', desc: 'Giải phóng căng thẳng và giảm cứng cơ', icon: 'soft_tissue' }, { title: 'Phương pháp Phục hồi', desc: 'Sử dụng các công cụ phù hợp để tăng tốc độ phục hồi', icon: 'modalities' }, { title: 'Dinh dưỡng & Nước', desc: 'Cung cấp năng lượng cho cơ thể để sửa chữa và hoạt động', icon: 'hydration' }, { title: 'Giấc ngủ & Nghỉ ngơi', desc: 'Nghỉ ngơi chất lượng là nơi cơ thể thích nghi và phát triển', icon: 'sleep' }] },
        { id: 'who-can-benefit', title: 'Ai có thể hưởng lợi?', type: 'text', text: 'Bất kỳ ai vận động. Từ vận động viên chuyên nghiệp, người chơi thể thao phong trào đến những người làm việc văn phòng, phục hồi thể thao đều giúp bạn vận động tốt hơn, cảm thấy khỏe hơn và duy trì sự ổn định.' },
        { id: 'how-to-get-started', title: 'Làm thế nào để bắt đầu', type: 'text', text: 'Hãy bắt đầu bằng việc thấu hiểu cơ thể bạn. Lắng nghe các tín hiệu. Sau đó, xây dựng một thói quen phục hồi đơn giản phù hợp với bạn. Cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng đồng hành cùng bạn.' },
        { id: 'key-takeaways', title: 'Điểm mấu chốt cần nhớ', type: 'text', text: 'Phục hồi là một hành trình dài hạn, không phải là đích đến nhất thời. Hãy lắng nghe cơ thể bạn, duy trì tính nhất quán và đừng ngần ngại tìm kiếm sự hướng dẫn chuyên nghiệp khi cần thiết.' },
      ]),
      category: 'articles', tags: JSON.stringify(['Recovery', 'Movement', 'Performance']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/business_solution_sidebar.png', author: 'Stretch Team', read_time: '6 min read',
      featured: true, published: true, published_at: '2025-05-10T00:00:00Z',
    },
    {
      id: 'bp-002', slug: 'new-chapter-stretch',
      title_en: 'A New Chapter for Stretch.vn',
      title_vi: 'Một chương mới cho Stretch.vn',
      excerpt_en: 'Exciting updates on our recent developments and what\'s ahead.',
      excerpt_vi: 'Cập nhật thú vị về những phát triển gần đây và điều gì đang chờ đợi phía trước.',
      content_en: JSON.stringify([
        { id: 'new-chapter', title: 'A New Beginning', type: 'intro', text: 'Stretch.vn has reached an exciting milestone. After months of development, we are thrilled to share our latest updates with the community. This marks a new chapter in our journey to make professional recovery and movement services accessible to everyone.', quote: 'Every step forward is a step toward building something meaningful.' },
        { id: 'whats-new', title: 'What\'s New', type: 'text', text: 'We have expanded our team, upgraded our facilities, and launched new service offerings. Our commitment to quality care and evidence-based practices remains at the heart of everything we do.' },
        { id: 'looking-ahead', title: 'Looking Ahead', type: 'text', text: 'The future is bright. We are planning community events, educational workshops, and partnerships that will bring even more value to our clients and the broader community.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'new-chapter', title: 'Một khởi đầu mới', type: 'intro', text: 'Stretch.vn đã đạt được một cột mốc quan trọng. Sau nhiều tháng phát triển, chúng tôi rất vui được chia sẻ những cập nhật mới nhất với cộng đồng. Đây đánh dấu một chương mới trong hành trình làm cho dịch vụ phục hồi và vận động chuyên nghiệp trở nên dễ tiếp cận hơn.', quote: 'Mỗi bước tiến là một bước hướng tới việc xây dựng điều gì đó có ý nghĩa.' },
        { id: 'whats-new', title: 'Có gì mới', type: 'text', text: 'Chúng tôi đã mở rộng đội ngũ, nâng cấp cơ sở vật chất và ra mắt các dịch vụ mới. Cam kết về chăm sóc chất lượng và thực hành dựa trên bằng chứng luôn là trọng tâm của mọi điều chúng tôi làm.' },
        { id: 'looking-ahead', title: 'Hướng tới tương lai', type: 'text', text: 'Tương lai rất tươi sáng. Chúng tôi đang lên kế hoạch cho các sự kiện cộng đồng, hội thảo giáo dục và hợp tác mang lại giá trị nhiều hơn cho khách hàng và cộng đồng.' },
      ]),
      category: 'company_updates', tags: JSON.stringify(['Stretch.vn']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/monaco-healthcare.png', author: 'Stretch Team', read_time: '4 min read',
      featured: true, published: true, published_at: '2025-05-08T00:00:00Z',
    },
    {
      id: 'bp-003', slug: 'meet-huy-team-story',
      title_en: 'Meet Huy: Driven by Curiosity, Guided by Purpose',
      title_vi: 'Gặp gỡ Huy: Được thúc đẩy bởi sự tò mò, dẫn dắt bởi mục đích',
      excerpt_en: 'Get to know the people behind your progress.',
      excerpt_vi: 'Tìm hiểu về những con người đứng sau sự tiến bộ của bạn.',
      content_en: JSON.stringify([
        { id: 'meet-huy', title: 'Who is Huy?', type: 'intro', text: 'Huy joined Stretch.vn with a passion for understanding the human body and a deep curiosity about movement science. His journey from physical therapy student to recovery specialist has been defined by continuous learning and genuine care for every client.', quote: 'The best part of my job is seeing someone move without pain for the first time in months.' },
        { id: 'philosophy', title: 'His Approach', type: 'text', text: 'Huy believes in listening first. Every session starts with understanding the client\'s story, their goals, and their challenges. This personal approach ensures that each treatment plan is tailored and effective.' },
        { id: 'advice', title: 'Huy\'s Advice', type: 'text', text: 'Don\'t wait until you\'re injured to start recovery. Build it into your routine now, and your body will thank you later.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'meet-huy', title: 'Huy là ai?', type: 'intro', text: 'Huy gia nhập Stretch.vn với niềm đam mê tìm hiểu cơ thể con người và sự tò mò sâu sắc về khoa học vận động. Hành trình từ sinh viên vật lý trị liệu đến chuyên gia phục hồi được định hình bởi việc học hỏi liên tục và sự quan tâm chân thành đến mỗi khách hàng.', quote: 'Phần tuyệt vời nhất trong công việc của tôi là nhìn thấy ai đó vận động mà không đau lần đầu tiên sau nhiều tháng.' },
        { id: 'philosophy', title: 'Cách tiếp cận của anh ấy', type: 'text', text: 'Huy tin vào việc lắng nghe trước. Mỗi buổi tập bắt đầu bằng việc hiểu câu chuyện của khách hàng, mục tiêu và thách thức của họ. Cách tiếp cận cá nhân này đảm bảo mỗi kế hoạch điều trị đều được tùy chỉnh và hiệu quả.' },
        { id: 'advice', title: 'Lời khuyên của Huy', type: 'text', text: 'Đừng đợi đến khi bị chấn thương mới bắt đầu phục hồi. Hãy đưa nó vào thói quen ngay bây giờ, cơ thể bạn sẽ cảm ơn bạn sau này.' },
      ]),
      category: 'team_stories', tags: JSON.stringify(['Recovery', 'Performance']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/individual-hero.webp', author: 'Stretch Team', read_time: '5 min read',
      featured: true, published: true, published_at: '2025-05-02T00:00:00Z',
    },
    {
      id: 'bp-004', slug: 'recovery-day-vn-runners',
      title_en: 'Recovery Day with VN Runners Club',
      title_vi: 'Ngày phục hồi cùng CLB VN Runners',
      excerpt_en: 'A day of movement, recovery, and community in action.',
      excerpt_vi: 'Một ngày vận động, phục hồi và cộng đồng cùng hành động.',
      content_en: JSON.stringify([
        { id: 'event-overview', title: 'Event Overview', type: 'intro', text: 'We partnered with VN Runners Club for a special Recovery Day event. The day featured hands-on stretching demonstrations, recovery workshops, and community building activities that brought together runners of all levels.', quote: 'Movement is better together.' },
        { id: 'highlights', title: 'Highlights', type: 'text', text: 'Participants learned foam rolling techniques, dynamic stretching routines, and post-run recovery protocols. Our team provided personalized tips and assessments throughout the event.' },
        { id: 'community', title: 'Building Community', type: 'text', text: 'Events like these remind us why we do what we do. The energy, the questions, the shared passion for movement — it\'s what drives us to keep growing and sharing.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'event-overview', title: 'Tổng quan sự kiện', type: 'intro', text: 'Chúng tôi hợp tác với CLB VN Runners cho sự kiện Ngày Phục Hồi đặc biệt. Sự kiện bao gồm trình diễn kéo giãn thực hành, hội thảo phục hồi và các hoạt động xây dựng cộng đồng quy tụ những người chạy bộ ở mọi cấp độ.', quote: 'Vận động cùng nhau sẽ tốt hơn.' },
        { id: 'highlights', title: 'Điểm nổi bật', type: 'text', text: 'Người tham gia đã học các kỹ thuật foam rolling, bài tập kéo giãn động và quy trình phục hồi sau chạy. Đội ngũ của chúng tôi đã cung cấp các mẹo và đánh giá cá nhân hóa trong suốt sự kiện.' },
        { id: 'community', title: 'Xây dựng cộng đồng', type: 'text', text: 'Những sự kiện như thế này nhắc nhở chúng tôi tại sao chúng tôi làm những gì chúng tôi làm. Năng lượng, câu hỏi, niềm đam mê chung về vận động — đó là điều thúc đẩy chúng tôi tiếp tục phát triển và chia sẻ.' },
      ]),
      category: 'events', tags: JSON.stringify(['Movement', 'Recovery']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/marathon.png', author: 'Stretch Team', read_time: '4 min read',
      featured: true, published: true, published_at: '2025-04-28T00:00:00Z',
    },
    // ── Regular Posts (8) ──
    {
      id: 'bp-005', slug: 'foam-rolling-101',
      title_en: 'Foam Rolling 101: Simple Habits for Better Recovery',
      title_vi: 'Foam Rolling 101: Thói quen đơn giản cho phục hồi tốt hơn',
      excerpt_en: 'How this accessible tool can reduce tension and support your daily performance.',
      excerpt_vi: 'Công cụ dễ tiếp cận này có thể giảm căng thẳng và hỗ trợ hiệu suất hàng ngày của bạn.',
      content_en: JSON.stringify([
        { id: 'what-is-foam-rolling', title: 'What is Foam Rolling?', type: 'text', text: 'Foam rolling is a self-myofascial release (SMR) technique. It can help relieve muscle tightness, soreness, and inflammation, and increase your joint range of motion.' },
        { id: 'how-it-helps', title: 'How Foam Rolling Helps Your Recovery', type: 'text', text: 'By applying targeted pressure to specific points on your body, you are able to aid in the recovery of muscles and assist in returning them to normal function. Normal function means your muscles are elastic, healthy, and ready to perform.' },
        { id: 'getting-started', title: 'Getting Started with Foam Rolling', type: 'text', text: 'Start slow and apply light pressure. When you find a trigger point or tight knot, hold the pressure there for 20 to 30 seconds to allow the tissue to release. Keep breathing and maintain regular sessions for the best results.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'what-is-foam-rolling', title: 'Foam Rolling là gì?', type: 'text', text: 'Foam rolling là kỹ thuật tự giải phóng cân mạc (SMR). Nó có thể giúp giảm căng cơ, đau nhức và viêm, đồng thời tăng phạm vi chuyển động của khớp.' },
        { id: 'how-it-helps', title: 'Foam Rolling giúp phục hồi như thế nào', type: 'text', text: 'Bằng cách áp dụng áp lực có mục tiêu vào các điểm cụ thể trên cơ thể, bạn có thể hỗ trợ phục hồi cơ bắp và giúp chúng trở lại chức năng bình thường. Chức năng bình thường có nghĩa là cơ bắp đàn hồi, khỏe mạnh và sẵn sàng hoạt động.' },
        { id: 'getting-started', title: 'Bắt đầu với Foam Rolling', type: 'text', text: 'Bắt đầu chậm và áp dụng áp lực nhẹ. Khi bạn tìm thấy điểm kích hoạt hoặc nút thắt chặt, giữ áp lực ở đó trong 20 đến 30 giây để cho phép mô giải phóng. Tiếp tục thở và duy trì các buổi tập thường xuyên để đạt kết quả tốt nhất.' },
      ]),
      category: 'articles', tags: JSON.stringify(['Recovery', 'Mobility']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/recovery-who.png', author: 'Stretch Team', read_time: '5 min read',
      featured: false, published: true, published_at: '2025-05-08T00:00:00Z',
    },
    {
      id: 'bp-006', slug: 'new-space-thao-dien',
      title_en: 'Our New Space in Thao Dien is Now Open',
      title_vi: 'Không gian mới tại Thảo Điền đã mở cửa',
      excerpt_en: 'A space designed for focused care, better movement, and meaningful connections.',
      excerpt_vi: 'Một không gian được thiết kế cho chăm sóc tập trung, vận động tốt hơn và kết nối có ý nghĩa.',
      content_en: JSON.stringify([
        { id: 'new-space', title: 'Welcome to Our New Home', type: 'text', text: 'We are excited to announce the opening of our new space in Thao Dien, District 2. This location has been carefully designed to provide a calm, professional environment where you can focus on your recovery and movement goals.' },
        { id: 'features', title: 'What Makes It Special', type: 'text', text: 'The new space features dedicated treatment rooms, a movement studio, and a welcoming reception area. Every detail has been considered to enhance your experience with us.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'new-space', title: 'Chào mừng đến ngôi nhà mới', type: 'text', text: 'Chúng tôi rất vui thông báo khai trương không gian mới tại Thảo Điền, Quận 2. Địa điểm này được thiết kế cẩn thận để tạo môi trường yên tĩnh, chuyên nghiệp nơi bạn có thể tập trung vào mục tiêu phục hồi và vận động.' },
        { id: 'features', title: 'Điều gì làm nó đặc biệt', type: 'text', text: 'Không gian mới có phòng điều trị riêng, studio vận động và khu tiếp tân thân thiện. Mọi chi tiết đều được xem xét để nâng cao trải nghiệm của bạn.' },
      ]),
      category: 'company_updates', tags: JSON.stringify(['Stretch.vn']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/education-workshop.png', author: 'Stretch Team', read_time: '3 min read',
      featured: false, published: true, published_at: '2025-05-06T00:00:00Z',
    },
    {
      id: 'bp-007', slug: 'behind-session-listening',
      title_en: 'Behind the Session: The Power of Listening',
      title_vi: 'Đằng sau buổi tập: Sức mạnh của lắng nghe',
      excerpt_en: 'Why understanding your story is the key to effective treatment and training.',
      excerpt_vi: 'Tại sao hiểu câu chuyện của bạn là chìa khóa cho điều trị và huấn luyện hiệu quả.',
      content_en: JSON.stringify([
        { id: 'listening', title: 'The Art of Listening', type: 'text', text: 'Before any stretching begins, before any assessment is done, we listen. Understanding your story — your habits, your pain points, your goals — is the foundation of every effective session.' },
        { id: 'why-it-matters', title: 'Why Listening Matters', type: 'text', text: 'Two people with the same complaint can have very different causes. By taking the time to truly understand your situation, we can create a treatment plan that addresses the root cause, not just the symptoms.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'listening', title: 'Nghệ thuật lắng nghe', type: 'text', text: 'Trước khi bất kỳ bài kéo giãn nào bắt đầu, trước khi bất kỳ đánh giá nào được thực hiện, chúng tôi lắng nghe. Hiểu câu chuyện của bạn — thói quen, điểm đau, mục tiêu — là nền tảng của mỗi buổi tập hiệu quả.' },
        { id: 'why-it-matters', title: 'Tại sao lắng nghe quan trọng', type: 'text', text: 'Hai người có cùng triệu chứng có thể có nguyên nhân rất khác nhau. Bằng cách dành thời gian thực sự hiểu tình huống của bạn, chúng tôi có thể tạo ra kế hoạch điều trị giải quyết nguyên nhân gốc rễ, không chỉ triệu chứng.' },
      ]),
      category: 'team_stories', tags: JSON.stringify(['Recovery', 'Performance']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/active-who.png', author: 'Stretch Team', read_time: '4 min read',
      featured: false, published: true, published_at: '2025-05-04T00:00:00Z',
    },
    {
      id: 'bp-008', slug: 'movement-workshop-rmit',
      title_en: 'Movement Workshop at RMIT Vietnam',
      title_vi: 'Hội thảo vận động tại RMIT Việt Nam',
      excerpt_en: 'Great energy and thoughtful questions from an engaged community.',
      excerpt_vi: 'Năng lượng tuyệt vời và những câu hỏi sâu sắc từ cộng đồng tham gia.',
      content_en: JSON.stringify([
        { id: 'workshop-overview', title: 'Workshop Overview', type: 'text', text: 'We had the pleasure of hosting a movement workshop at RMIT Vietnam. Students and staff came together for an afternoon of learning about body mechanics, stretching techniques, and the importance of movement in daily life.' },
        { id: 'takeaways', title: 'Key Takeaways', type: 'text', text: 'The workshop covered basic mobility assessments, desk-friendly stretches, and strategies for incorporating movement into busy academic schedules. The engagement and questions from participants made it a truly rewarding experience.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'workshop-overview', title: 'Tổng quan hội thảo', type: 'text', text: 'Chúng tôi rất vui được tổ chức hội thảo vận động tại RMIT Việt Nam. Sinh viên và nhân viên cùng tham gia một buổi chiều học về cơ học cơ thể, kỹ thuật kéo giãn và tầm quan trọng của vận động trong cuộc sống hàng ngày.' },
        { id: 'takeaways', title: 'Điểm chính', type: 'text', text: 'Hội thảo bao gồm đánh giá di động cơ bản, các bài kéo giãn phù hợp cho người ngồi bàn và chiến lược kết hợp vận động vào lịch trình học tập bận rộn. Sự tham gia và câu hỏi từ người tham dự làm cho đây trở thành trải nghiệm thực sự đáng giá.' },
      ]),
      category: 'events', tags: JSON.stringify(['Movement', 'Rehabilitation']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/education-hero.png', author: 'Stretch Team', read_time: '4 min read',
      featured: false, published: true, published_at: '2025-05-01T00:00:00Z',
    },
    {
      id: 'bp-009', slug: 'hip-mobility-key',
      title_en: 'Hip Mobility: The Key to Stronger, Pain-Free Movement',
      title_vi: 'Khả năng vận động hông: Chìa khóa cho vận động mạnh mẽ, không đau',
      excerpt_en: 'Simple assessments and exercises to improve how you move.',
      excerpt_vi: 'Đánh giá và bài tập đơn giản để cải thiện cách bạn vận động.',
      content_en: JSON.stringify([
        { id: 'why-hips-matter', title: 'Why Hip Mobility Matters', type: 'text', text: 'Your hips are the foundation of most movements. Limited hip mobility can lead to compensations in your knees, lower back, and even shoulders. Improving hip mobility is one of the most impactful things you can do for your overall movement quality.' },
        { id: 'simple-tests', title: 'Simple Self-Assessment', type: 'text', text: 'Try these quick tests: Can you squat below parallel comfortably? Can you sit cross-legged without discomfort? Can you touch your toes without rounding your back? If any of these are difficult, your hips may need attention.' },
        { id: 'exercises', title: 'Top Exercises for Hip Mobility', type: 'text', text: 'Start with 90/90 stretches, hip circles, and deep squat holds. Consistency is key — just 5-10 minutes daily can make a significant difference over time.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'why-hips-matter', title: 'Tại sao khả năng vận động hông quan trọng', type: 'text', text: 'Hông của bạn là nền tảng của hầu hết các vận động. Hạn chế khả năng vận động hông có thể dẫn đến bù trừ ở đầu gối, lưng dưới và thậm chí vai. Cải thiện khả năng vận động hông là một trong những điều có tác động lớn nhất bạn có thể làm cho chất lượng vận động tổng thể.' },
        { id: 'simple-tests', title: 'Tự đánh giá đơn giản', type: 'text', text: 'Thử các bài test nhanh: Bạn có thể squat dưới mức song song thoải mái không? Bạn có thể ngồi xếp bằng mà không khó chịu không? Bạn có thể chạm ngón chân mà không cong lưng không? Nếu bất kỳ điều nào trong số này khó khăn, hông của bạn có thể cần được chú ý.' },
        { id: 'exercises', title: 'Bài tập hàng đầu cho khả năng vận động hông', type: 'text', text: 'Bắt đầu với kéo giãn 90/90, xoay hông và giữ squat sâu. Tính nhất quán là chìa khóa — chỉ 5-10 phút mỗi ngày có thể tạo ra sự khác biệt đáng kể theo thời gian.' },
      ]),
      category: 'articles', tags: JSON.stringify(['Mobility', 'Movement', 'Performance']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/runner-who.png', author: 'Stretch Team', read_time: '6 min read',
      featured: false, published: true, published_at: '2025-04-30T00:00:00Z',
    },
    {
      id: 'bp-010', slug: 'growing-team-elevating-care',
      title_en: 'Growing the Team, Elevating Care',
      title_vi: 'Phát triển đội ngũ, nâng cao chất lượng chăm sóc',
      excerpt_en: 'Welcoming new therapists and coaches to the Stretch.vn family.',
      excerpt_vi: 'Chào đón các chuyên viên trị liệu và huấn luyện viên mới vào gia đình Stretch.vn.',
      content_en: JSON.stringify([
        { id: 'growth', title: 'Our Growing Family', type: 'text', text: 'We are proud to welcome new therapists and coaches to the Stretch.vn team. Each brings unique expertise and a shared commitment to helping people move, recover, and live better.' },
        { id: 'standards', title: 'Our Standards', type: 'text', text: 'Every team member goes through our comprehensive training program, ensuring consistency in care quality and alignment with our evidence-based approach. Growth is not just about numbers — it\'s about elevating the standard of care we provide.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'growth', title: 'Gia đình đang phát triển', type: 'text', text: 'Chúng tôi tự hào chào đón các chuyên viên trị liệu và huấn luyện viên mới vào đội ngũ Stretch.vn. Mỗi người mang đến chuyên môn độc đáo và cam kết chung giúp mọi người vận động, phục hồi và sống tốt hơn.' },
        { id: 'standards', title: 'Tiêu chuẩn của chúng tôi', type: 'text', text: 'Mỗi thành viên đội ngũ đều trải qua chương trình đào tạo toàn diện, đảm bảo tính nhất quán trong chất lượng chăm sóc và phù hợp với phương pháp dựa trên bằng chứng. Tăng trưởng không chỉ về số lượng — mà về nâng cao tiêu chuẩn chăm sóc chúng tôi cung cấp.' },
      ]),
      category: 'company_updates', tags: JSON.stringify(['Stretch.vn', 'Recovery']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/education-gallery-1.png', author: 'Stretch Team', read_time: '3 min read',
      featured: false, published: true, published_at: '2025-04-26T00:00:00Z',
    },
    {
      id: 'bp-011', slug: 'setbacks-to-strength-kevin',
      title_en: 'From Setbacks to Strength: Kevin\'s Journey',
      title_vi: 'Từ trở ngại đến sức mạnh: Hành trình của Kevin',
      excerpt_en: 'How consistency, support, and the right plan made the difference.',
      excerpt_vi: 'Cách mà sự kiên trì, hỗ trợ và kế hoạch đúng đắn tạo nên sự khác biệt.',
      content_en: JSON.stringify([
        { id: 'kevins-story', title: 'Kevin\'s Story', type: 'text', text: 'Kevin came to us after a sports injury left him unable to train for months. Frustrated and losing motivation, he needed more than just physical treatment — he needed a plan and a team that believed in his recovery.' },
        { id: 'the-journey', title: 'The Journey', type: 'text', text: 'Through a combination of targeted therapy, progressive movement training, and consistent support, Kevin gradually rebuilt his strength. The key was patience and a structured approach that respected his body\'s healing timeline.' },
        { id: 'today', title: 'Where He Is Today', type: 'text', text: 'Kevin is back to training at full capacity. His experience taught him the value of recovery, and he now incorporates regular maintenance sessions into his routine. His story inspires us every day.' },
      ]),
      content_vi: JSON.stringify([
        { id: 'kevins-story', title: 'Câu chuyện của Kevin', type: 'text', text: 'Kevin đến với chúng tôi sau khi chấn thương thể thao khiến anh không thể tập luyện trong nhiều tháng. Thất vọng và mất động lực, anh cần nhiều hơn chỉ điều trị thể chất — anh cần một kế hoạch và đội ngũ tin vào sự phục hồi của anh.' },
        { id: 'the-journey', title: 'Hành trình', type: 'text', text: 'Thông qua sự kết hợp giữa trị liệu có mục tiêu, huấn luyện vận động tiến dần và hỗ trợ liên tục, Kevin dần dần xây dựng lại sức mạnh. Chìa khóa là sự kiên nhẫn và phương pháp có cấu trúc tôn trọng thời gian hồi phục của cơ thể.' },
        { id: 'today', title: 'Hiện tại', type: 'text', text: 'Kevin đã trở lại tập luyện hết công suất. Trải nghiệm dạy anh giá trị của phục hồi, và anh giờ kết hợp các buổi bảo dưỡng thường xuyên vào thói quen. Câu chuyện của anh truyền cảm hứng cho chúng tôi mỗi ngày.' },
      ]),
      category: 'team_stories', tags: JSON.stringify(['Rehabilitation', 'Recovery']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/athlete-who.png', author: 'Stretch Team', read_time: '5 min read',
      featured: false, published: true, published_at: '2025-04-24T00:00:00Z',
    },
    {
      id: 'bp-012', slug: 'sunrise-stretch-sala',
      title_en: 'Sunrise Stretch & Recover at Sala Park',
      title_vi: 'Kéo giãn & Phục hồi buổi sáng tại Sala Park',
      excerpt_en: 'A refreshing morning of movement and connection.',
      excerpt_vi: 'Một buổi sáng sảng khoái với vận động và kết nối.',
      content_en: JSON.stringify([
        { id: 'sunrise-event', title: 'Morning at Sala Park', type: 'text', text: 'There\'s something special about moving together in the morning light. Our Sunrise Stretch & Recover session at Sala Park brought together people from all walks of life for a refreshing start to the weekend.' },
        { id: 'activities', title: 'What We Did', type: 'text', text: 'The session included guided dynamic stretching, breathing exercises, and light mobility work. It was designed to be accessible for everyone, regardless of fitness level.' },
        { id: 'next-event', title: 'Join Us Next Time', type: 'text', text: 'We plan to host more community events like this. Follow us on social media to stay updated and join the next session!' },
      ]),
      content_vi: JSON.stringify([
        { id: 'sunrise-event', title: 'Buổi sáng tại Sala Park', type: 'text', text: 'Có điều gì đó đặc biệt khi vận động cùng nhau trong ánh sáng buổi sáng. Buổi Kéo giãn & Phục hồi buổi sáng tại Sala Park quy tụ mọi người từ mọi tầng lớp cho một khởi đầu cuối tuần sảng khoái.' },
        { id: 'activities', title: 'Những gì chúng tôi làm', type: 'text', text: 'Buổi tập bao gồm kéo giãn động có hướng dẫn, bài tập hít thở và bài tập di động nhẹ. Nó được thiết kế để dễ tiếp cận cho mọi người, bất kể trình độ thể lực.' },
        { id: 'next-event', title: 'Tham gia cùng chúng tôi', type: 'text', text: 'Chúng tôi có kế hoạch tổ chức thêm các sự kiện cộng đồng như thế này. Theo dõi chúng tôi trên mạng xã hội để cập nhật và tham gia buổi tiếp theo!' },
      ]),
      category: 'events', tags: JSON.stringify(['Movement', 'Recovery']),
      cover_image: 'https://pub-a2c60e7c031c4f5dad3d1dfae791570a.r2.dev/blog/seed/warm-up.webp', author: 'Stretch Team', read_time: '3 min read',
      featured: false, published: true, published_at: '2025-04-22T00:00:00Z',
    },
  ]

  // ── Convert structured sections → a single CKEditor HTML block ──
  // The CMS uses CKEditor (one HTML string), so all blog content is stored as
  // one `text` section holding rich HTML. This keeps create/update/detail and
  // the public site all on the same format.
  const structuredToHtml = (sections: any[]): string => {
    const parts: string[] = []
    for (const s of sections || []) {
      if (s.title) parts.push(`<h2>${s.title}</h2>`)
      if (s.text) parts.push(`<p>${s.text}</p>`)
      if (s.quote) parts.push(`<blockquote><p>${s.quote}</p></blockquote>`)
      if (Array.isArray(s.bullets) && s.bullets.length) {
        parts.push(`<ul>${s.bullets.map((b: string) => `<li>${b}</li>`).join('')}</ul>`)
      }
      if (Array.isArray(s.items) && s.items.length) {
        parts.push(`<ul>${s.items.map((i: any) => `<li><strong>${i.title}</strong>${i.desc ? ` — ${i.desc}` : ''}</li>`).join('')}</ul>`)
      }
      if (s.image) parts.push(`<p><img src="${s.image}" alt="${s.title || ''}"></p>`)
    }
    return parts.join('\n')
  }
  const toHtmlContent = (rawJson: string): string =>
    JSON.stringify([{ id: 'content', title: '', type: 'text', text: structuredToHtml(JSON.parse(rawJson)) }])

  for (const bp of blogPosts) {
    await pool.query(
      `INSERT INTO blog_posts (
        id, slug, title_en, title_vi, excerpt_en, excerpt_vi,
        content_en, content_vi, category, tags, cover_image,
        author, read_time, featured, published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
        content_en = EXCLUDED.content_en,
        content_vi = EXCLUDED.content_vi,
        excerpt_en = EXCLUDED.excerpt_en,
        excerpt_vi = EXCLUDED.excerpt_vi,
        cover_image = EXCLUDED.cover_image,
        updated_at = NOW()`,
      [
        bp.id, bp.slug, bp.title_en, bp.title_vi, bp.excerpt_en, bp.excerpt_vi,
        toHtmlContent(bp.content_en), toHtmlContent(bp.content_vi), bp.category, bp.tags, bp.cover_image,
        bp.author, bp.read_time, bp.featured, bp.published, bp.published_at,
      ]
    )
  }
  console.log(`[Seed] ✓ ${blogPosts.length} blog posts inserted (content → CKEditor HTML)`)

  // ─── Default Admin ─────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stretch.vn'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@stretch1'
  const adminName = process.env.ADMIN_NAME || 'Stretch Admin'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await pool.query(
    `INSERT INTO admins (email, name, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail, adminName, passwordHash]
  )
  console.log(`[Seed] ✓ Admin seeded: ${adminEmail}`)

  console.log('[Seed] Done!')
  await pool.end()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('[Seed] Error:', err)
  await pool.end()
  process.exit(1)
})
