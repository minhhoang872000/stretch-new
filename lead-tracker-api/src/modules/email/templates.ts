import { env } from '../../config/env'
import type { Mail } from './mailer'

/**
 * The automated emails, in Vietnamese — the Learning Hub's only language.
 *
 * One table-based layout for all of them: email clients still render HTML like
 * it is 2008, and a flex/grid layout that looks right in a browser arrives in
 * Outlook as a single column of unstyled text. Every email carries a plain-text
 * twin too, which some clients show and every spam filter reads.
 */

const NAVY = '#0b2a4a'
const ACCENT = '#f47a1f'
const MUTED = '#5b6b7c'

const hub = (path = '') => `${env.siteBaseUrl}/vi/learning-hub${path}`

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const vnd = (n: number) => `${Math.max(0, Math.round(Number(n) || 0)).toLocaleString('vi-VN')}đ`

function firstName(name: string): string {
  const words = String(name || '').trim().split(/\s+/)
  return words[words.length - 1] || 'bạn'
}

interface Layout {
  preheader: string
  heading: string
  /** Paragraphs of trusted HTML — callers escape what they interpolate. */
  body: string[]
  cta?: { label: string; url: string }
  footnote?: string
}

function layout({ preheader, heading, body, cta, footnote }: Layout): string {
  const paragraphs = body
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${NAVY}">${p}</p>`)
    .join('')
  const button = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 6px"><tr>
         <td style="border-radius:10px;background:${ACCENT}">
           <a href="${esc(cta.url)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">${esc(cta.label)}</a>
         </td></tr></table>`
    : ''
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f9;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="padding:22px 28px;border-bottom:1px solid #e6ebf1">
      <span style="font-size:18px;font-weight:800;color:${NAVY};letter-spacing:-0.02em">Stretch<span style="color:${ACCENT}">.</span>vn</span>
      <span style="display:block;margin-top:2px;font-size:10px;font-weight:700;letter-spacing:0.2em;color:${MUTED}">LEARNING HUB</span>
    </td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:21px;line-height:1.35;color:${NAVY}">${esc(heading)}</h1>
      ${paragraphs}
      ${button}
      ${footnote ? `<p style="margin:18px 0 0;font-size:12.5px;line-height:1.55;color:${MUTED}">${footnote}</p>` : ''}
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f8fafc;font-size:11.5px;line-height:1.55;color:${MUTED}">
      Bạn nhận email này vì có tài khoản tại Stretch Learning Hub.<br>
      Cần hỗ trợ? Trả lời thẳng email này — đội ngũ Stretch sẽ phản hồi.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`
}

/** Plain-text twin: the same words, with links written out. */
function plain(heading: string, lines: string[], cta?: { label: string; url: string }): string {
  return [heading, '', ...lines, ...(cta ? ['', `${cta.label}: ${cta.url}`] : []), '', '— Stretch Learning Hub'].join('\n')
}

const strip = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')

function build(to: string, subject: string, l: Layout): Mail {
  return {
    to,
    subject,
    html: layout(l),
    text: plain(l.heading, l.body.map(strip), l.cta),
  }
}

// ─── The emails ──────────────────────────────────────────────────────

export function welcomeEmail(learner: { name: string; email: string }): Mail {
  const name = esc(firstName(learner.name))
  return build(learner.email, 'Chào mừng bạn đến với Stretch Learning Hub', {
    preheader: 'Tài khoản của bạn đã sẵn sàng — bắt đầu với một khoá miễn phí nhé.',
    heading: `Chào ${firstName(learner.name)}, rất vui được gặp bạn!`,
    body: [
      `Cảm ơn ${name} đã tạo tài khoản tại <strong>Stretch Learning Hub</strong> — nơi các chuyên viên phục hồi chức năng học giải phẫu, lượng giá và vận động trị liệu theo cách thực hành được ngay.`,
      'Tiến độ học, ghi chú và chứng nhận của bạn giờ được lưu theo tài khoản — học trên điện thoại, xem tiếp trên máy tính.',
      'Nếu chưa biết bắt đầu từ đâu, các khoá và tài liệu miễn phí là điểm khởi đầu tốt.',
    ],
    cta: { label: 'Khám phá chương trình', url: hub('/programs') },
  })
}

export function orderEmail(order: {
  email: string
  customer: string
  code: string
  programTitle: string
  subtotal: number
  discount: number
  total: number
  couponCode?: string | null
  programSlug?: string | null
}): Mail {
  const rows = [
    `Mã đơn: <strong>${esc(order.code)}</strong>`,
    `Chương trình: <strong>${esc(order.programTitle)}</strong>`,
    `Tạm tính: ${vnd(order.subtotal)}${order.discount ? ` · Giảm ${vnd(order.discount)}${order.couponCode ? ` (mã ${esc(order.couponCode)})` : ''}` : ''}`,
    `<strong>Cần thanh toán: ${vnd(order.total)}</strong>`,
  ]
  return build(order.email, `Đã nhận đơn ${order.code} — ${order.programTitle}`, {
    preheader: `Chuyển khoản ${vnd(order.total)} với nội dung ${order.code} để kích hoạt khoá học.`,
    heading: 'Stretch đã nhận đơn đăng ký của bạn',
    body: [
      `Chào ${esc(firstName(order.customer))}, cảm ơn bạn đã đăng ký học.`,
      rows.join('<br>'),
      `Vui lòng chuyển khoản theo hướng dẫn trên trang thanh toán và ghi đúng nội dung <strong>${esc(order.code)}</strong>. Khi Stretch xác nhận đã nhận tiền, khoá học sẽ xuất hiện trong "Khoá học của tôi" và bạn sẽ nhận thêm một email.`,
    ],
    cta: order.programSlug
      ? { label: 'Xem hướng dẫn thanh toán', url: hub(`/checkout/${order.programSlug}`) }
      : { label: 'Khoá học của tôi', url: hub('/my-courses') },
  })
}

export function paidEmail(order: { email: string; customer: string; code: string; programTitle: string; programSlug?: string | null }): Mail {
  return build(order.email, `Thanh toán thành công — ${order.programTitle}`, {
    preheader: 'Khoá học đã được kích hoạt trong tài khoản của bạn.',
    heading: 'Thanh toán đã được xác nhận 🎉',
    body: [
      `Chào ${esc(firstName(order.customer))}, Stretch đã nhận thanh toán cho đơn <strong>${esc(order.code)}</strong>.`,
      `<strong>${esc(order.programTitle)}</strong> đã sẵn sàng trong "Khoá học của tôi". Chúc bạn học vui!`,
    ],
    cta: order.programSlug
      ? { label: 'Vào học ngay', url: hub(`/learn/${order.programSlug}`) }
      : { label: 'Khoá học của tôi', url: hub('/my-courses') },
  })
}

export function reminderEmail(s: {
  email: string
  name: string
  title: string
  date: string
  time: string
  location?: string
  url?: string
  kind: 'session' | 'mentorship'
}): Mail {
  const when = `${esc(s.time)} ngày ${esc(s.date.split('-').reverse().join('/'))}`
  const where = s.location ? `<br>Địa điểm: <strong>${esc(s.location)}</strong>` : ''
  const isMentor = s.kind === 'mentorship'
  return build(s.email, `Nhắc lịch: ${s.title} — ${s.time} ngày mai`, {
    preheader: `Buổi ${isMentor ? 'mentor 1-1' : 'học'} của bạn bắt đầu lúc ${s.time} ngày mai.`,
    heading: isMentor ? 'Ngày mai bạn có buổi mentor 1-1' : 'Ngày mai bạn có buổi học',
    body: [
      `Chào ${esc(firstName(s.name))}, Stretch nhắc bạn lịch sắp tới:`,
      `<strong>${esc(s.title)}</strong><br>Thời gian: <strong>${when}</strong>${where}`,
      isMentor
        ? 'Hãy chuẩn bị sẵn câu hỏi hoặc ca lâm sàng bạn muốn trao đổi — buổi 1-1 hiệu quả nhất khi có một vấn đề cụ thể.'
        : 'Nhớ đến sớm 10 phút để ổn định chỗ ngồi. Nếu không tham gia được, trả lời email này để Stretch sắp xếp lại.',
    ],
    cta: s.url ? { label: isMentor ? 'Mở link buổi họp' : 'Xem chi tiết', url: s.url } : undefined,
  })
}

export function nudgeEmail(n: { email: string; name: string; title: string; slug: string; percent: number; lessonTitle?: string | null }): Mail {
  return build(n.email, `Học tiếp "${n.title}" nhé?`, {
    preheader: `Bạn đã đi được ${n.percent}% — chỉ cần 15 phút hôm nay.`,
    heading: `${firstName(n.name)} ơi, khoá học đang chờ bạn`,
    body: [
      `Đã vài ngày bạn chưa quay lại <strong>${esc(n.title)}</strong>. Bạn đã hoàn thành <strong>${n.percent}%</strong> rồi — đừng để mạch học bị đứt.`,
      n.lessonTitle ? `Bài tiếp theo: <strong>${esc(n.lessonTitle)}</strong>.` : 'Mở lại là bạn sẽ vào đúng bài đang học dở.',
      'Mẹo nhỏ: 15 phút mỗi ngày đều đặn hiệu quả hơn một buổi dài mỗi tuần.',
    ],
    cta: { label: 'Học tiếp', url: hub(`/learn/${n.slug}`) },
    footnote: 'Stretch chỉ nhắc một lần cho mỗi lần bạn tạm nghỉ.',
  })
}

export function certificateEmail(c: { email: string; name: string; programTitle: string; code: string }): Mail {
  const url = `${env.siteBaseUrl}/verify/${encodeURIComponent(c.code)}`
  return build(c.email, `Chúc mừng! Bạn đã nhận chứng nhận "${c.programTitle}"`, {
    preheader: `Mã chứng nhận ${c.code} — chia sẻ lên LinkedIn chỉ với một cú nhấp.`,
    heading: 'Chúc mừng bạn đã hoàn thành khoá học!',
    body: [
      `${esc(firstName(c.name))} đã hoàn thành <strong>${esc(c.programTitle)}</strong>. Chứng nhận của bạn đã được cấp với mã tra cứu <strong>${esc(c.code)}</strong>.`,
      'Bạn có thể in, lưu PDF, hoặc thêm vào mục "Licenses & certifications" trên LinkedIn — bất kỳ ai cũng kiểm tra được chứng nhận qua đường link.',
      'Nếu có vài phút, hãy để lại đánh giá cho khoá học — góp ý của bạn giúp Stretch làm khoá sau tốt hơn.',
    ],
    cta: { label: 'Xem chứng nhận', url },
  })
}

export function rewardEmail(r: { email: string; name: string; refereeName: string; code: string; percent: number; endsAt: string }): Mail {
  return build(r.email, `Bạn vừa nhận mã giảm ${r.percent}% nhờ giới thiệu bạn bè`, {
    preheader: `${r.refereeName} đã đăng ký học qua link của bạn.`,
    heading: 'Cảm ơn bạn đã giới thiệu Stretch!',
    body: [
      `Chào ${esc(firstName(r.name))}, <strong>${esc(r.refereeName)}</strong> vừa đăng ký học qua link giới thiệu của bạn.`,
      `Quà của bạn: mã <strong style="font-size:17px;color:${ACCENT}">${esc(r.code)}</strong> giảm <strong>${r.percent}%</strong> cho khoá học tiếp theo, dùng một lần, hạn đến ${esc(r.endsAt.split('-').reverse().join('/'))}.`,
    ],
    cta: { label: 'Chọn khoá học', url: hub('/programs') },
  })
}

export function materialEmail(m: { email: string; name: string; title: string; url: string }): Mail {
  return build(m.email, `Tài liệu của bạn: ${m.title}`, {
    preheader: 'Link tải tài liệu miễn phí từ Stretch.',
    heading: 'Tài liệu bạn đã yêu cầu',
    body: [
      `Chào ${esc(firstName(m.name))}, đây là tài liệu <strong>${esc(m.title)}</strong> bạn đã yêu cầu tại Stretch Learning Hub.`,
      'Lưu email này lại để tải về bất cứ lúc nào.',
    ],
    cta: { label: 'Tải tài liệu', url: m.url },
  })
}
