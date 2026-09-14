#!/usr/bin/env node
/**
 * Nén video bài giảng trước khi tải lên R2.
 *
 * Cách dùng:
 *   node scripts/compress-video.mjs <file-hoặc-thư-mục> [--height 720] [--crf 23] [--replace]
 *
 * Ví dụ:
 *   node scripts/compress-video.mjs D:\bai-giang            # nén cả thư mục
 *   node scripts/compress-video.mjs bai-1.mov --height 1080 # giữ 1080p
 *
 * Ba tuỳ chọn quan trọng và lý do:
 *
 *   -movflags +faststart   Đẩy moov atom lên đầu file. THIẾU CÁI NÀY thì trình
 *                          duyệt phải tải gần hết file mới phát được — nghĩa là
 *                          học viên bấm play rồi ngồi chờ. Bắt buộc với video
 *                          phát trực tiếp từ R2.
 *   -crf 23                Chất lượng không đổi, tự chọn bitrate theo độ phức
 *                          tạp khung hình. Bài giảng nói + demo động tác thì
 *                          23 là ngưỡng "không thấy khác bản gốc".
 *   -pix_fmt yuv420p       Safari/iOS không phát yuv444 hay 10-bit. Máy quay
 *                          hoặc OBS đôi khi xuất ra những định dạng đó.
 *
 * File gốc KHÔNG bị xoá (trừ khi truyền --replace) — nén là thao tác một chiều.
 */

import { spawn, spawnSync } from 'node:child_process'
import { readdirSync, statSync, existsSync, unlinkSync } from 'node:fs'
import { join, extname, basename, dirname } from 'node:path'

const VIDEO_EXT = new Set(['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.mts'])
const R2_USD_PER_GB_MONTH = 0.015

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const has = (name) => args.includes(`--${name}`)

const height = Number(flag('height', 720))
const crf = Number(flag('crf', 23))
const audioKbps = Number(flag('audio', 128))
const replace = has('replace')

if (!target) {
  console.error('Thiếu đường dẫn. Ví dụ: node scripts/compress-video.mjs D:\\bai-giang')
  process.exit(1)
}

// ── ffmpeg có sẵn chưa? ───────────────────────────────────────────────
const probe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' })
if (probe.error) {
  console.error('Chưa có ffmpeg. Cài bằng một lệnh rồi mở lại terminal:')
  console.error('  winget install Gyan.FFmpeg          (Windows)')
  console.error('  brew install ffmpeg                 (macOS)')
  console.error('  sudo apt install ffmpeg             (Ubuntu)')
  process.exit(1)
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'
const gb = (bytes) => bytes / 1024 / 1024 / 1024

/** Thời lượng (giây) — dùng để tính bitrate thực tế sau khi nén. */
function duration(file) {
  const res = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
    { encoding: 'utf8' },
  )
  const value = Number(String(res.stdout || '').trim())
  return Number.isFinite(value) ? value : 0
}

function outputPath(file) {
  const ext = extname(file)
  return join(dirname(file), `${basename(file, ext)}-${height}p.mp4`)
}

function compress(file) {
  const out = outputPath(file)
  if (existsSync(out)) {
    console.log(`· bỏ qua ${basename(file)} — đã có ${basename(out)}`)
    return null
  }

  const before = statSync(file).size
  const seconds = duration(file)

  return new Promise((resolve) => {
    const ff = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-stats',
      '-i', file,
      // -2 giữ đúng tỉ lệ và làm tròn về số chẵn (x264 yêu cầu chiều chia hết cho 2).
      '-vf', `scale=-2:${height}:flags=lanczos`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', `${audioKbps}k`, '-ac', '2',
      '-movflags', '+faststart',
      out,
    ], { stdio: ['ignore', 'inherit', 'inherit'] })

    ff.on('close', (code) => {
      if (code !== 0 || !existsSync(out)) {
        console.log(`✗ ${basename(file)} — ffmpeg lỗi (code ${code})`)
        resolve(null)
        return
      }
      const after = statSync(out).size
      const saved = before - after
      const bitrate = seconds ? (after * 8) / seconds / 1_000_000 : 0

      console.log(
        `✓ ${basename(file)}\n` +
        `    ${mb(before)} → ${mb(after)}  (giảm ${Math.round((saved / before) * 100)}%` +
        `${bitrate ? `, ~${bitrate.toFixed(2).replace('.', ',')} Mbps` : ''})`,
      )

      if (replace && after < before) {
        unlinkSync(file)
        console.log(`    đã xoá bản gốc theo --replace`)
      }
      resolve({ before, after })
    })
  })
}

// ── Chạy ──────────────────────────────────────────────────────────────
const stat = statSync(target)
const files = stat.isDirectory()
  ? readdirSync(target)
      .filter((n) => VIDEO_EXT.has(extname(n).toLowerCase()) && !n.includes(`-${height}p.`))
      .map((n) => join(target, n))
  : [target]

if (!files.length) {
  console.log('Không tìm thấy file video nào trong thư mục đó.')
  process.exit(0)
}

console.log(`Nén ${files.length} file → ${height}p, CRF ${crf}, audio ${audioKbps}k\n`)

let totalBefore = 0
let totalAfter = 0
for (const file of files) {
  const result = await compress(file)
  if (result) {
    totalBefore += result.before
    totalAfter += result.after
  }
}

if (totalBefore) {
  const savedGb = gb(totalBefore - totalAfter)
  console.log(
    `\nTổng: ${mb(totalBefore)} → ${mb(totalAfter)}\n` +
    `Tiết kiệm ${savedGb.toFixed(2).replace('.', ',')} GB ` +
    `≈ $${(savedGb * R2_USD_PER_GB_MONTH).toFixed(2)}/tháng tiền lưu trữ R2 ` +
    `(và ${gb(totalAfter).toFixed(2).replace('.', ',')} GB nằm trong 10 GB miễn phí).`,
  )
}
