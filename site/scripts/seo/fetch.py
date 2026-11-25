import json, re, sys, urllib.request, html
sys.stdout.reconfigure(encoding='utf-8')
out = sys.argv[1]
API = 'https://stretch-new.onrender.com/api/v1/blog'
lst = json.load(urllib.request.urlopen(API + '?limit=100&published=true&summary=true', timeout=90))['data']['posts']
posts = {}
for p in lst:
    full = json.load(urllib.request.urlopen(API + '/' + p['slug'], timeout=90))['data']['post']
    posts[p['slug']] = full
json.dump(posts, open(out + '/posts.full.json', 'w', encoding='utf-8'), ensure_ascii=False)


def text(sections):
    h = ' '.join(s.get('text') or '' for s in sections or [])
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h))).strip()


for slug, p in posts.items():
    hv = ' '.join(s.get('text') or '' for s in p['contentVi'])
    he = ' '.join(s.get('text') or '' for s in p['contentEn'] or [])
    links = re.findall(r'<a\s[^>]*href="([^"]+)"', hv)
    print('##', slug, '| tags:', p.get('tags'), '| cat:', p.get('category'))
    print('   VI words %d, EN words %d, sections %d, links in VI: %d' % (len(text(p['contentVi']).split()), len(text(p['contentEn']).split()), len(p['contentVi']), len(links)))
    for l in links[:12]:
        print('     ->', l[:110])
