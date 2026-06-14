import { describe, it, expect } from 'vitest'
import { imagesService, collectPostImageUrls } from '../src/modules/images/images.service'

const BASE = 'https://cdn.test.example'

describe('imagesService.isOwnedUrl', () => {
  it('recognizes URLs under the configured public base', () => {
    expect(imagesService.isOwnedUrl(`${BASE}/blog/a.png`)).toBe(true)
  })
  it('rejects foreign URLs', () => {
    expect(imagesService.isOwnedUrl('https://example.com/x.png')).toBe(false)
    expect(imagesService.isOwnedUrl('')).toBe(false)
  })
})

describe('collectPostImageUrls', () => {
  it('collects cover + inline + section image, deduped', () => {
    const urls = collectPostImageUrls({
      coverImage: `${BASE}/blog/cover.webp`,
      contentEn: [
        { id: 'a', type: 'text', text: `<p>x <img src="${BASE}/blog/inline1.webp"> y ${BASE}/blog/cover.webp</p>` },
        { id: 'b', type: 'image', image: `${BASE}/blog/section.webp` },
      ],
      contentVi: [],
    })
    expect(urls).toContain(`${BASE}/blog/cover.webp`)
    expect(urls).toContain(`${BASE}/blog/inline1.webp`)
    expect(urls).toContain(`${BASE}/blog/section.webp`)
  })

  it('returns empty when there are no images', () => {
    expect(collectPostImageUrls({ coverImage: null, contentEn: [], contentVi: [] })).toEqual([])
  })
})
