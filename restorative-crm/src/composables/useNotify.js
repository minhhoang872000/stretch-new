import { useToast } from 'primevue/usetoast'

const MESSAGES = {
  'toast.success': 'Thành công',
  'toast.error': 'Lỗi',
  'toast.info': 'Thông tin',
  'toast.warn': 'Cảnh báo',
  'toast.genericError': 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  'toast.blogCreated': 'Đã tạo bài viết thành công.',
  'toast.blogUpdated': 'Đã cập nhật bài viết thành công.',
  'toast.blogDeleted': 'Đã xoá bài viết.',
  'toast.postPublished': 'Đã xuất bản bài viết.',
  'toast.postUnpublished': 'Đã chuyển bài viết về bản nháp.',
  'toast.categoryCreated': 'Đã tạo danh mục thành công.',
  'toast.categoryUpdated': 'Đã cập nhật danh mục thành công.',
  'toast.categoryDeleted': 'Đã xoá danh mục.',
  'toast.bookingCreated': 'Đã tạo lịch hẹn thành công.',
  'toast.bookingUpdated': 'Đã cập nhật trạng thái lịch hẹn.',
  'toast.bookingDeleted': 'Đã xoá lịch hẹn.',
  'toast.imageUploaded': 'Đã tải ảnh lên thành công.',
  'toast.imageUploadError': 'Tải ảnh lên thất bại.',
  'toast.imageDeleted': 'Đã xoá ảnh.',
  'toast.imageDeleteError': 'Xoá ảnh thất bại.',
  'toast.urlCopied': 'Đã sao chép đường dẫn ảnh.',
}

const SEVERITY_LABELS = {
  success: 'Thành công',
  error: 'Lỗi',
  info: 'Thông tin',
  warn: 'Cảnh báo',
}

export function useNotify() {
  const toast = useToast()

  const tr = (msg) => MESSAGES[msg] ?? msg

  const show = (severity, message, life) =>
    toast.add({
      severity,
      summary: SEVERITY_LABELS[severity],
      detail: tr(message),
      life,
    })

  return {
    success: (message) => show('success', message, 3000),
    error: (message) => show('error', message || 'toast.genericError', 5000),
    info: (message) => show('info', message, 3000),
    warn: (message) => show('warn', message, 4000),
  }
}
