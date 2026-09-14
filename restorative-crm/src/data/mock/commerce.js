/**
 * Đơn hàng / thanh toán / mã giảm giá.
 *
 * The site has no checkout yet — `enroll()` in
 * site/pages/learning-hub/programs/[slug].vue only raises a "pending" toast.
 * These rows model the flow the console will need the moment it exists:
 * an order is created, a payment is matched against it (bank transfer is
 * still confirmed by hand here), and enrolment follows the paid order.
 */

import { rng, pick, int, weighted, shiftStamp, shiftDate } from './_util.js'
import { programs, learners } from './learning.js'

const rand = rng(760421)

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thu' },
  { value: 'refunded', label: 'Đã hoàn' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

export const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Chuyển khoản' },
  { value: 'vnpay', label: 'VNPay' },
  { value: 'momo', label: 'MoMo' },
  { value: 'cash', label: 'Thu tại studio' },
]

export const coupons = [
  {
    id: 'cpn-01', code: 'HOCVIEN15', type: 'percent', value: 15,
    scope: 'all', minSpend: 0, quota: 200, used: 63,
    startsAt: shiftDate(-52), endsAt: shiftDate(38), status: 'active',
    note: 'Giảm chung cho nhóm học viên cũ.',
  },
  {
    id: 'cpn-02', code: 'GIAIPHAU500', type: 'amount', value: 500000,
    scope: 'program', programId: 'prg-01', minSpend: 2000000, quota: 60, used: 41,
    startsAt: shiftDate(-18), endsAt: shiftDate(12), status: 'active',
    note: 'Chỉ áp cho khoá giải phẫu ứng dụng.',
  },
  {
    id: 'cpn-03', code: 'WORKSHOP10', type: 'percent', value: 10,
    scope: 'kind', kind: 'workshop', minSpend: 0, quota: 40, used: 40,
    startsAt: shiftDate(-90), endsAt: shiftDate(-6), status: 'exhausted',
    note: 'Đã dùng hết suất, chờ quyết định gia hạn.',
  },
  {
    id: 'cpn-04', code: 'GIOITHIEU200', type: 'amount', value: 200000,
    scope: 'all', minSpend: 690000, quota: 500, used: 118,
    startsAt: shiftDate(-140), endsAt: shiftDate(96), status: 'active',
    note: 'Mã giới thiệu bạn bè, gửi kèm email hoàn thành khoá.',
  },
  {
    id: 'cpn-05', code: 'TET2026', type: 'percent', value: 25,
    scope: 'all', minSpend: 1500000, quota: 300, used: 287,
    startsAt: '2026-01-28', endsAt: '2026-02-22', status: 'expired',
    note: 'Chiến dịch Tết, giữ lại để đối chiếu doanh thu.',
  },
  {
    id: 'cpn-06', code: 'HLV40H-EARLY', type: 'amount', value: 1800000,
    scope: 'program', programId: 'prg-07', minSpend: 12800000, quota: 12, used: 4,
    startsAt: shiftDate(-9), endsAt: shiftDate(24), status: 'active',
    note: 'Early bird cho khoá HLV 40 giờ, chỉ 12 suất.',
  },
]

const sellable = programs.filter((p) => p.status === 'published' && p.price > 0)

export const orders = Array.from({ length: 24 }, (_, i) => {
  const learner = pick(rand, learners)
  const program = pick(rand, sellable)
  const status = weighted(rand, [['paid', 6], ['pending', 3], ['refunded', 1], ['cancelled', 1]])
  /**
   * Only a coupon that would really have applied: right scope, and the order
   * clears its minimum. Otherwise the table shows a 590k course discounted by
   * 500k with a code that was never valid for it.
   */
  const usable = coupons.filter((c) => {
    if (c.status !== 'active') return false
    if (c.minSpend && program.price < c.minSpend) return false
    if (c.scope === 'program') return c.programId === program.id
    if (c.scope === 'kind') return c.kind === program.kind
    return true
  })
  const coupon = usable.length && rand() < 0.32 ? pick(rand, usable) : null
  const discount = !coupon
    ? 0
    : coupon.type === 'percent'
      ? Math.round((program.price * coupon.value) / 100)
      : Math.min(coupon.value, program.price)
  const total = Math.max(0, program.price - discount)
  const createdOffset = -int(rand, 0, 62)
  return {
    id: `ord-${String(i + 1).padStart(4, '0')}`,
    code: `SO-${26000 + i * 13}`,
    learnerId: learner.id,
    customer: learner.name,
    email: learner.email,
    phone: learner.phone,
    programId: program.id,
    programTitle: program.title,
    quantity: 1,
    subtotal: program.price,
    couponCode: coupon ? coupon.code : null,
    discount,
    total,
    method: pick(rand, PAYMENT_METHODS).value,
    status,
    createdAt: shiftStamp(createdOffset, int(rand, 8, 22), int(rand, 0, 59)),
    paidAt: status === 'paid' || status === 'refunded'
      ? shiftStamp(createdOffset + (rand() < 0.6 ? 0 : 1), int(rand, 9, 23), int(rand, 0, 59))
      : null,
    enrolled: status === 'paid',
    note: status === 'pending'
      ? 'Khách nói sẽ chuyển khoản tối nay.'
      : status === 'refunded'
        ? 'Hoàn tiền theo yêu cầu trong 7 ngày đầu.'
        : '',
  }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const payments = orders
  .filter((o) => o.paidAt)
  .map((o, i) => ({
    id: `pay-${String(i + 1).padStart(4, '0')}`,
    orderId: o.id,
    orderCode: o.code,
    customer: o.customer,
    amount: o.status === 'refunded' ? -o.total : o.total,
    method: o.method,
    reference: o.method === 'transfer'
      ? `VCB.${String(int(rand, 100000, 999999))}`
      : o.method === 'vnpay'
        ? `VNP${String(int(rand, 10000000, 99999999))}`
        : o.method === 'momo'
          ? `MOMO${String(int(rand, 1000000, 9999999))}`
          : `CASH-${String(int(rand, 100, 999))}`,
    status: o.status === 'refunded' ? 'refunded' : 'settled',
    reconciled: rand() < 0.82,
    receivedAt: o.paidAt,
    note: o.method === 'transfer' && rand() < 0.3 ? 'Nội dung chuyển khoản thiếu mã đơn, đã đối chiếu tay.' : '',
  }))

/** Revenue by day for the last 30 days — feeds the dashboard sparkline. */
export const revenueTrend = Array.from({ length: 30 }, (_, i) => {
  const day = shiftDate(i - 29)
  const paidThatDay = payments.filter((p) => p.receivedAt.slice(0, 10) === day && p.amount > 0)
  const seeded = paidThatDay.reduce((s, p) => s + p.amount, 0)
  return {
    date: day,
    revenue: seeded || (rand() < 0.35 ? 0 : int(rand, 490, 4900) * 1000),
    orders: paidThatDay.length || (rand() < 0.4 ? 0 : int(rand, 1, 4)),
  }
})
