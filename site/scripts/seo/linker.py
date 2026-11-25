"""Internal linking for the Sharing Hub posts.

For every post and both languages:
  1. clean links: unwrap google.com/url redirects, strip utm_source=chatgpt.com, and in the
     English body point /vi/... site links at their English twins;
  2. contextual links: wrap the first occurrence of another post's anchor phrase (text that is
     already in the article) in a link to that post — related posts first, at most MAX per post,
     one link per target, never inside an existing link or a heading, never to itself;
  3. a "Đọc thêm" / "Further reading" block (related posts with keyword anchors + one service page),
     placed before the references; an existing plain-text related section is replaced by it;
     skipped when the post already links three or more posts;
  4. tags from the keyword map.
Dry run by default (writes report + payloads); --apply <envfile> backs up and PATCHes.
"""
import json, re, sys, html, urllib.request, urllib.parse

sys.stdout.reconfigure(encoding='utf-8')
D = sys.argv[1]
APPLY = sys.argv[sys.argv.index('--apply') + 1] if '--apply' in sys.argv else None
SITE = 'https://stretch.vn'
MAX = 5
M = json.load(open(D + '/map.json', encoding='utf-8'))
P = json.load(open(D + '/posts.full.json', encoding='utf-8'))
POSTS, SERV = M['posts'], M['services']
assert set(POSTS) == set(P), set(P) ^ set(POSTS)

SKIP_TAGS = {'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption', 'script', 'style', 'button'}
REL_HEAD = re.compile(r'tham khảo thêm|liên kết nội bộ|bài viết liên quan|further reading|suggested internal|related (?:posts|articles|reading)', re.I)
REF_HEAD = re.compile(r'tài liệu tham khảo|^\s*tham khảo\s*$|^\s*references?\s*$|^\s*sources?\s*$', re.I)


def url(slug, lang):
    return '%s%s/sharing-hub/%s' % (SITE, '/vi' if lang == 'vi' else '', slug)


def clean_links(h, lang):
    def unwrap(m):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(m.group(1))).query)
        return 'href="%s"' % html.escape(q['url'][0], quote=True) if q.get('url') else m.group(0)
    h = re.sub(r'href="(https://www\.google\.com/url\?[^"]+)"', unwrap, h)
    h = re.sub(r'([?&]|&amp;)utm_source=chatgpt\.com', lambda m: '?' if m.group(1) == '?' else '', h).replace('?"', '"')
    if lang == 'en':
        h = h.replace(SITE + '/vi/', SITE + '/').replace('href="/vi/', 'href="/')
    return h


def linked_targets(h, lang):
    out = set()
    for href in re.findall(r'href="([^"]+)"', h):
        m = re.search(r'/sharing-hub/([a-z0-9-]+)', href)
        if m and href.startswith((SITE, '/')):
            out.add(m.group(1))
    return out


def contextual(h, slug, lang, added):
    """Wrap first matches of other posts' anchors in text nodes outside SKIP_TAGS."""
    have = linked_targets(h, lang)
    order = POSTS[slug]['related'] + [s for s in POSTS if s not in POSTS[slug]['related']]
    for target in order:
        if len(added) >= MAX:
            break
        if target == slug or target in have:
            continue
        pats = POSTS[target]['anchors_' + lang]
        rx = re.compile(r'(?<![\w&])(?:%s)(?![\w])' % '|'.join(pats), re.I)
        # walk tokens, tracking open skip tags; nothing is linked from the references on
        tokens = re.split(r'(<[^>]+>)', h)
        depth = 0
        stop = len(tokens)
        for k in range(len(tokens) - 2):
            if re.match(r'<h[1-6][\s>]', tokens[k]) and REF_HEAD.search(html.unescape(re.sub(r'<[^>]+>', '', ''.join(tokens[k + 1:k + 6]).split('</h')[0])).strip()):
                stop = k
                break
        for i, tok in enumerate(tokens[:stop]):
            if tok.startswith('<'):
                m = re.match(r'<(/?)([a-zA-Z0-9]+)', tok)
                if m and m.group(2).lower() in SKIP_TAGS and not tok.endswith('/>'):
                    depth += -1 if m.group(1) else 1
                    depth = max(depth, 0)
                continue
            if depth or not tok.strip():
                continue
            mm = rx.search(tok)
            if mm:
                tokens[i] = tok[:mm.start()] + '<a href="%s">%s</a>' % (url(target, lang), mm.group(0)) + tok[mm.end():]
                h = ''.join(tokens)
                added.append((target, mm.group(0)))
                have.add(target)
                break
    return h


def block(slug, lang, exclude, keep=()):
    # targets an existing related section already pointed at, then posts not yet linked from the
    # body, then the rest of the related list; three at least, five at most, no repeats
    keep = [s for s in dict.fromkeys(keep) if s in POSTS and s != slug]
    fresh = keep + [s for s in POSTS[slug]['related'] if s != slug and s not in exclude and s not in keep]
    rest = [s for s in POSTS[slug]['related'] if s != slug and s not in fresh]
    rel = list(dict.fromkeys(fresh + rest))[:max(3, min(5, len(fresh)))]
    head = 'Đọc thêm' if lang == 'vi' else 'Further reading'
    items = ''.join('<li><a href="%s">%s</a></li>' % (url(s, lang), html.escape(POSTS[s]['link_' + lang], quote=False)) for s in rel)
    path, anchor = SERV[POSTS[slug]['service']][lang]
    lead = 'Cần được đánh giá và hỗ trợ trực tiếp? Tìm hiểu ' if lang == 'vi' else 'Want an assessment and hands-on help? See our '
    tail = '.'
    return '<h2>%s</h2><ul>%s</ul><p>%s<a href="%s%s">%s</a>%s</p>' % (head, items, lead, SITE, path, html.escape(anchor, quote=False), tail), rel


def place_block(h, slug, lang, exclude):
    """Returns (html, where, block_html, related, removed_text)."""
    heads = list(re.finditer(r'<h([1-6])[^>]*>(.*?)</h\1>', h, re.S))
    text = lambda s: html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
    for i, m in enumerate(heads):           # an existing related section is replaced, its real targets kept
        if REL_HEAD.search(text(m.group(2))):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(h)
            keep = re.findall(r'/sharing-hub/([a-z0-9-]+)', h[m.end():end])
            blk, rel = block(slug, lang, exclude, keep)
            return h[:m.start()] + blk + h[end:], 'replaced "%s"' % text(m.group(2))[:40], blk, rel, h[m.start():end]
    blk, rel = block(slug, lang, exclude)
    for m in heads:                         # else before the references heading
        if REF_HEAD.search(text(m.group(2))):
            return h[:m.start()] + blk + h[m.start():], 'before references heading', blk, rel, ''
    # a closing disclaimer/references paragraph, only when it sits in the last fifth of the post
    # (a quote mid-article is not the end of the article)
    m = None
    for c in re.finditer(r'<blockquote|<p[^>]*>\s*(?:<[^>]+>\s*)*(?:Tham khảo|References?|Sources?|Lưu ý|Note)\s*:', h):
        if c.start() > 0.8 * len(h):
            m = c
            break
    if m and not re.search(r'<h[1-6][\s>]', h[m.start():]):
        return h[:m.start()] + blk + h[m.start():], 'before disclaimer/references', blk, rel, ''
    return h + blk, 'appended at end', blk, rel, ''


report, payloads = [], {}
for slug, post in P.items():
    patch = {'tags': POSTS[slug]['tags']}
    for lang, field in (('vi', 'contentVi'), ('en', 'contentEn')):
        secs = [dict(s) for s in (post.get(field) or [])]
        if not secs:
            continue
        joined = ''.join(s.get('text') or '' for s in secs)
        added = []
        new = []
        for s in secs:
            t = clean_links(s.get('text') or '', lang)
            t = contextual(t, slug, lang, added)
            new.append(dict(s, text=t))
        whole = ''.join(s['text'] for s in new)
        existing = linked_targets(joined if lang == 'vi' else clean_links(joined, 'en'), lang) - {slug}
        where, rel, blk, removed = 'skipped (already links %d posts)' % len(existing), [], '', ''
        if len(existing) < 3:
            # the block goes into the section holding the related/references heading, else the last one
            idx = next((k for k, s in enumerate(new) if REL_HEAD.search(re.sub(r'<[^>]+>', '', s['text'])) or REF_HEAD.search(re.sub(r'<[^>]+>', ' ', s['text']))), len(new) - 1)
            t2, where, blk, rel, removed = place_block(new[idx]['text'], slug, lang, {t for t, _ in added} | existing)
            new[idx] = dict(new[idx], text=t2)
        out = ''.join(s['text'] for s in new)
        # integrity: balanced anchors, no nested anchors, nothing else lost
        assert out.count('<a ') + out.count('<a>') == out.count('</a>'), (slug, lang, 'unbalanced a')
        assert not re.search(r'<a [^>]*>(?:(?!</a>).)*<a ', out, re.S), (slug, lang, 'nested a')
        strip = lambda x: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', x))
        # everything but the block (and, when replaced, the old related section) is the original text
        base = strip(joined).replace(' ', '')
        if removed:
            gone = strip(removed).replace(' ', '')
            assert gone in base, (slug, lang, 'replaced section not found')
            base = base.replace(gone, '', 1)
        assert strip(out.replace(blk, '')).replace(' ', '') == base, (slug, lang, 'text changed')
        patch[field] = new
        report.append((slug, lang, added, where, rel))
    payloads[post['id']] = {'slug': slug, 'patch': patch, 'old': {k: post.get(k) for k in ('tags', 'contentVi', 'contentEn')}}

inbound = {s: 0 for s in P}
for slug, lang, added, where, rel in report:
    if lang == 'vi':
        for t, _ in added: inbound[t] += 1
        for t in rel: inbound[t] += 1
for slug, lang, added, where, rel in report:
    print('%-44s %s  +%d in-text: %s' % (slug[:44], lang, len(added), '; '.join('"%s"→%s' % (a, t[:22]) for t, a in added)))
    print('%-44s     block: %s %s' % ('', where, ('→ ' + ', '.join(r[:20] for r in rel)) if rel else ''))
print('\nINBOUND internal links per post (VI, new only):', json.dumps(inbound, ensure_ascii=False))
json.dump({k: v['patch'] for k, v in payloads.items()}, open(D + '/payloads.json', 'w', encoding='utf-8'), ensure_ascii=False)
if not APPLY:
    print('\nDRY RUN OK'); sys.exit()

import os
if not os.path.exists(D + '/cms-backup-links.json'):
    json.dump({k: v['old'] for k, v in payloads.items()}, open(D + '/cms-backup-links.json', 'w', encoding='utf-8'), ensure_ascii=False)
env = dict(re.findall(r'^(ADMIN_EMAIL|ADMIN_PASSWORD)=(.*)$', open(APPLY, encoding='utf-8').read(), re.M))
API = 'https://stretch-new.onrender.com/api/v1'


def req(method, path, body=None, tok=None):
    r = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, method=method,
                               headers={'Content-Type': 'application/json', **({'Authorization': 'Bearer ' + tok} if tok else {})})
    return json.load(urllib.request.urlopen(r, timeout=120))


tok = req('POST', '/auth/login', {'email': env['ADMIN_EMAIL'].strip(), 'password': env['ADMIN_PASSWORD'].strip()})['data']
tok = tok.get('token') or tok.get('accessToken')
SKIP = set(sys.argv[sys.argv.index('--skip') + 1].split(',')) if '--skip' in sys.argv else set()
for pid, v in payloads.items():
    if v['slug'] in SKIP:
        print('SKIPPED', v['slug']); continue
    # one field per request: the API caps a JSON body near 100 KB, and a long post's two bodies exceed it
    for f in ('tags', 'contentVi', 'contentEn'):
        if f in v['patch']:
            r = req('PATCH', '/blog/' + pid, {f: v['patch'][f]}, tok)
    p = r['data'].get('post', r['data'])
    ok = p.get('tags') == v['patch']['tags'] and all(''.join(s.get('text') or '' for s in p.get(f) or []) == ''.join(s['text'] for s in v['patch'][f]) for f in ('contentVi', 'contentEn') if f in v['patch'])
    print('APPLIED' if ok else 'MISMATCH', v['slug'])
