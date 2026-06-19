<template>
  <main class="p-6 lg:p-8 bg-surface min-h-screen">
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-[#F37C20]/10 flex items-center justify-center shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 192 192" fill="none">
            <path d="M96 16C51.8 16 16 51.8 16 96s35.8 80 80 80 80-35.8 80-80S140.2 16 96 16z" fill="#F37C20" opacity=".15"/>
            <rect x="56" y="100" width="24" height="56" rx="4" fill="#34A853"/>
            <rect x="84" y="72" width="24" height="84" rx="4" fill="#4285F4"/>
            <rect x="112" y="44" width="24" height="112" rx="4" fill="#F37C20"/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-on-surface">Google Analytics</h1>
          <p class="text-sm text-on-surface-variant mt-0.5">Property ID: {{ store.overview?.period ? GA_PROPERTY_HINT : '—' }}</p>
        </div>
      </div>

      <!-- Period + Refresh -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-1 bg-surface-container rounded-full p-1">
          <button v-for="p in periods" :key="p.value" @click="store.changePeriod(p.value)"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            :class="store.period === p.value ? 'bg-[#F37C20] text-white shadow' : 'text-on-surface-variant hover:text-on-surface'">
            {{ p.label }}
          </button>
        </div>
        <button @click="store.loadAll()"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors">
          <span class="material-symbols-outlined text-base">refresh</span>Refresh
        </button>
      </div>
    </div>

    <!-- Not configured -->
    <div v-if="store.notConfigured" class="py-20 text-center">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant">key_off</span>
      <p class="font-semibold text-on-surface mt-4">Google Analytics not configured</p>
      <p class="text-sm text-on-surface-variant mt-1">Set GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY in backend .env</p>
    </div>

    <template v-else>
      <!-- Realtime pill -->
      <div class="flex items-center gap-2 mb-6">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span class="text-sm font-semibold text-green-600">{{ store.realtime.totalActive }} active users right now</span>
      </div>

      <!-- Overview KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div v-for="kpi in overviewKPIs" :key="kpi.label" :title="kpi.tip"
          class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 hover:shadow-md transition-shadow cursor-help">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-base" :style="{ color: kpi.color }">{{ kpi.icon }}</span>
            <p class="text-xs text-on-surface-variant font-medium truncate">{{ kpi.label }}</p>
            <span class="material-symbols-outlined text-sm text-on-surface-variant/40 ml-auto">info</span>
          </div>
          <p class="text-2xl font-extrabold text-on-surface">{{ kpi.value }}</p>
          <p v-if="kpi.sub" class="text-[11px] text-on-surface-variant mt-0.5">{{ kpi.sub }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-container rounded-xl p-1 mb-6 overflow-x-auto no-scrollbar">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :title="tab.tip"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
          :class="activeTab === tab.key ? 'bg-white shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'">
          <span class="material-symbols-outlined text-base">{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </div>

      <!-- ─── TAB: Trend ──────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'trend'">
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <h3 class="font-bold text-on-surface mb-6">Sessions & Users Trend</h3>
          <div v-if="store.loading.trend" class="h-32 flex items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined animate-spin">progress_activity</span>
          </div>
          <template v-else>
            <!-- Area chart bars -->
            <div class="flex items-end gap-0.5 h-40 mb-2">
              <div v-for="(d, i) in trendBars" :key="i"
                class="flex-1 flex flex-col justify-end gap-0.5 cursor-pointer group"
                :title="`${d.date}\nSessions: ${d.sessions}\nUsers: ${d.users}\nEngaged: ${d.engagedSessions}`">
                <div class="rounded-t transition-all" :style="{ height: d.engH + '%', background: '#34A853', opacity: 0.7 }"></div>
                <div class="rounded-t transition-all" :style="{ height: d.usrH + '%', background: '#4285F4', opacity: 0.7 }"></div>
                <div class="rounded-t transition-all" :style="{ height: d.sesH + '%', background: '#F37C20', opacity: 0.8 }"></div>
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-on-surface-variant mb-4">
              <span>{{ store.trend[0]?.date }}</span>
              <span>{{ store.trend[store.trend.length - 1]?.date }}</span>
            </div>
            <div class="flex gap-4 text-xs">
              <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#F37C20"></span>Sessions</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#4285F4"></span>Users</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#34A853"></span>Engaged</span>
            </div>
            <!-- Data table -->
            <div class="mt-6 overflow-x-auto">
              <table class="w-full text-xs">
                <thead><tr class="border-b border-outline-variant/30">
                  <th class="text-left py-2 text-on-surface-variant font-semibold">Date</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Sessions</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Users</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Engaged</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Conversions</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Page Views</th>
                </tr></thead>
                <tbody>
                  <tr v-for="d in store.trend" :key="d.date" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                    <td class="py-2 font-medium">{{ d.date }}</td>
                    <td class="py-2 text-right">{{ fmt(d.sessions) }}</td>
                    <td class="py-2 text-right">{{ fmt(d.users) }}</td>
                    <td class="py-2 text-right">{{ fmt(d.engagedSessions) }}</td>
                    <td class="py-2 text-right">{{ fmt(d.conversions) }}</td>
                    <td class="py-2 text-right">{{ fmt(d.pageViews) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>

      <!-- ─── TAB: Channels ───────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'channels'">
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <h3 class="font-bold text-on-surface mb-6">Traffic by Channel</h3>
          <div v-if="store.loading.channels" class="h-20 flex items-center justify-center">
            <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-3 text-on-surface-variant font-semibold">Channel</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Sessions</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Users</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Bounce Rate</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Engagement</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Conversions</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Avg Duration</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Share</th>
              </tr></thead>
              <tbody>
                <tr v-for="ch in store.channels" :key="ch.channel" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                  <td class="py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: channelColor(ch.channel) }"></div>
                      <span class="font-medium">{{ ch.channel }}</span>
                    </div>
                  </td>
                  <td class="py-3 text-right font-semibold">{{ fmt(ch.sessions) }}</td>
                  <td class="py-3 text-right">{{ fmt(ch.users) }}</td>
                  <td class="py-3 text-right">{{ ch.bounceRate }}%</td>
                  <td class="py-3 text-right">{{ ch.engagementRate }}%</td>
                  <td class="py-3 text-right">{{ fmt(ch.conversions) }}</td>
                  <td class="py-3 text-right">{{ fmtDur(ch.avgDuration) }}</td>
                  <td class="py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <div class="w-16 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div class="h-full rounded-full" :style="{ width: ch.percent + '%', background: channelColor(ch.channel) }"></div>
                      </div>
                      <span class="text-xs font-bold w-8 text-right">{{ ch.percent }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Social ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'social'">
        <div v-if="store.loading.social" class="py-10 text-center">
          <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
        </div>
        <template v-else>

          <!-- Platform Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div v-for="p in store.social.platforms" :key="p.source"
              class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 hover:shadow-md transition-shadow">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ background: socialColor(p.source) + '20' }">
                  <img v-if="socialIcon(p.source)" :src="socialIcon(p.source)" class="w-5 h-5 object-contain" :alt="p.source" />
                  <span v-else class="material-symbols-outlined text-sm" :style="{ color: socialColor(p.source) }">thumb_up</span>
                </div>
                <span class="text-sm font-bold text-on-surface capitalize truncate">{{ p.source }}</span>
              </div>
              <p class="text-2xl font-extrabold text-on-surface">{{ fmt(p.sessions) }}</p>
              <p class="text-[11px] text-on-surface-variant mt-0.5">sessions · {{ p.percent }}%</p>
              <div class="h-1 rounded-full bg-surface-container-high mt-2 overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="{ width: p.percent + '%', background: socialColor(p.source) }"></div>
              </div>
              <div class="mt-2 space-y-0.5 text-[11px] text-on-surface-variant">
                <div>{{ fmt(p.users) }} users · {{ fmt(p.newUsers) }} new</div>
                <div>Eng. {{ p.engagementRate }}% · Conv. {{ fmt(p.conversions) }}</div>
              </div>
            </div>
            <div v-if="!store.social.platforms.length"
              class="col-span-full py-10 text-center text-on-surface-variant text-sm">
              No social traffic found. Add UTM parameters to your social posts links to track them.
            </div>
          </div>

          <!-- Platform detail table -->
          <div class="bg-surface-container-lowest rounded-xl p-6 mb-6">
            <h3 class="font-bold text-on-surface mb-4">Platform Breakdown</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="border-b border-outline-variant/30">
                  <th class="text-left py-3 text-on-surface-variant font-semibold">Platform</th>
                  <th class="text-left py-3 text-on-surface-variant font-semibold">Medium</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Sessions</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Users</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">New Users</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Bounce</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Engagement</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Conversions</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Avg Dur.</th>
                  <th class="text-right py-3 text-on-surface-variant font-semibold">Share</th>
                </tr></thead>
                <tbody>
                  <tr v-for="p in store.social.platforms" :key="p.source + p.medium"
                    class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                    <td class="py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: socialColor(p.source) }"></div>
                        <span class="font-semibold capitalize">{{ p.source }}</span>
                      </div>
                    </td>
                    <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-surface-container text-[11px]">{{ p.medium || '(none)' }}</span></td>
                    <td class="py-3 text-right font-semibold">{{ fmt(p.sessions) }}</td>
                    <td class="py-3 text-right">{{ fmt(p.users) }}</td>
                    <td class="py-3 text-right">{{ fmt(p.newUsers) }}</td>
                    <td class="py-3 text-right" :class="p.bounceRate > 70 ? 'text-error' : ''">{{ p.bounceRate }}%</td>
                    <td class="py-3 text-right text-green-600">{{ p.engagementRate }}%</td>
                    <td class="py-3 text-right font-semibold">{{ fmt(p.conversions) }}</td>
                    <td class="py-3 text-right text-on-surface-variant">{{ fmtDur(p.avgDuration) }}</td>
                    <td class="py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <div class="w-16 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div class="h-full rounded-full" :style="{ width: p.percent + '%', background: socialColor(p.source) }"></div>
                        </div>
                        <span class="text-xs font-bold w-8 text-right">{{ p.percent }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Campaigns per platform -->
          <div class="bg-surface-container-lowest rounded-xl p-6 mb-6" v-if="store.social.campaigns.length">
            <h3 class="font-bold text-on-surface mb-4">Campaigns by Platform</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="border-b border-outline-variant/30">
                  <th class="text-left py-2.5 text-on-surface-variant font-semibold">Platform</th>
                  <th class="text-left py-2.5 text-on-surface-variant font-semibold">Campaign</th>
                  <th class="text-right py-2.5 text-on-surface-variant font-semibold">Sessions</th>
                  <th class="text-right py-2.5 text-on-surface-variant font-semibold">Conversions</th>
                </tr></thead>
                <tbody>
                  <tr v-for="(c, i) in store.social.campaigns" :key="i"
                    class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                    <td class="py-2.5">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full shrink-0" :style="{ background: socialColor(c.source) }"></div>
                        <span class="capitalize text-sm font-medium">{{ c.source }}</span>
                      </div>
                    </td>
                    <td class="py-2.5 font-mono text-xs text-on-surface-variant">{{ c.campaign }}</td>
                    <td class="py-2.5 text-right font-semibold">{{ fmt(c.sessions) }}</td>
                    <td class="py-2.5 text-right">{{ fmt(c.conversions) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- UTM Link Builder -->
          <div class="bg-surface-container-lowest rounded-xl p-6 border border-primary/20">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-lg">build</span>
              </div>
              <div>
                <h3 class="font-bold text-on-surface">UTM Link Builder</h3>
                <p class="text-xs text-on-surface-variant">Tạo link có UTM params để GA4 tracking nguồn traffic từ social media</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Website URL *</label>
                <input v-model="builder.url" placeholder="https://stretch.vn/booking"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Platform (utm_source) *</label>
                <select v-model="builder.source"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">-- Chọn platform --</option>
                  <option v-for="p in socialPlatforms" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Medium (utm_medium)</label>
                <select v-model="builder.medium"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="social">social (organic post)</option>
                  <option value="paid_social">paid_social (chạy ads)</option>
                  <option value="cpc">cpc (pay-per-click)</option>
                  <option value="story">story (story/reel)</option>
                  <option value="bio">bio (link in bio)</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Campaign (utm_campaign)</label>
                <input v-model="builder.campaign" placeholder="vd: summer_promo, grand_opening"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Content (utm_content) <span class="font-normal text-outline">— optional</span></label>
                <input v-model="builder.content" placeholder="vd: banner_v1, post_carousel"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label class="text-xs font-semibold text-on-surface-variant mb-1 block">Term (utm_term) <span class="font-normal text-outline">— optional</span></label>
                <input v-model="builder.term" placeholder="vd: massage, recovery, stretch"
                  class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            <!-- Generated link -->
            <div v-if="generatedLink" class="bg-surface-container rounded-lg p-4 mt-2">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-on-surface-variant font-semibold mb-1">Link đã tạo:</p>
                  <p class="text-sm font-mono text-primary break-all leading-relaxed">{{ generatedLink }}</p>
                </div>
                <button @click="copyLink"
                  class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                  :class="copied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/90'">
                  <span class="material-symbols-outlined text-base">{{ copied ? 'check' : 'content_copy' }}</span>
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-on-surface-variant mt-2 italic">Điền URL và Source để tạo link UTM.</p>

            <!-- Quick examples -->
            <div class="mt-5 border-t border-outline-variant/20 pt-4">
              <p class="text-xs font-bold text-on-surface-variant mb-3">Ví dụ link mẫu:</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button v-for="ex in quickExamples" :key="ex.label" @click="applyExample(ex)"
                  class="text-left px-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full shrink-0" :style="{ background: socialColor(ex.source) }"></div>
                    <span class="text-xs font-bold capitalize">{{ ex.label }}</span>
                  </div>
                  <p class="text-[11px] text-on-surface-variant leading-relaxed font-mono truncate">{{ ex.preview }}</p>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ─── TAB: UTM ────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'utm'">
        <!-- Filters -->
        <div class="bg-surface-container-lowest rounded-xl p-6 mb-4">
          <h3 class="font-bold text-on-surface mb-4">UTM Filters</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div v-for="f in utmFilterFields" :key="f.key">
              <label class="text-xs font-semibold text-on-surface-variant mb-1 block">{{ f.label }}</label>
              <select v-if="f.options" v-model="store.utmFilters[f.key]"
                class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary">
                <option value="">All</option>
                <option v-for="opt in f.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <input v-else v-model="store.utmFilters[f.key]" :placeholder="f.placeholder"
                class="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="store.applyUTMFilters()"
              class="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              Apply Filters
            </button>
            <button @click="store.resetUTMFilters()"
              class="px-5 py-2 rounded-full bg-surface-container text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors">
              Reset
            </button>
          </div>
        </div>

        <!-- UTM Table -->
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-on-surface">UTM Tracking Results <span class="text-on-surface-variant font-normal text-sm">({{ store.utm.length }} rows)</span></h3>
            <span v-if="store.loading.utm" class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-2.5 text-on-surface-variant font-semibold pr-4">Source</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold pr-4">Medium</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold pr-4">Campaign</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold pr-4">Content</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold pr-4">Term</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Sessions</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Users</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">New Users</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Bounce</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Engagement</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Conv.</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Avg Dur.</th>
              </tr></thead>
              <tbody>
                <tr v-for="(row, i) in store.utm" :key="i" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                  <td class="py-2 pr-4 font-semibold text-primary">{{ row.source }}</td>
                  <td class="py-2 pr-4"><span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">{{ row.medium }}</span></td>
                  <td class="py-2 pr-4 max-w-[140px] truncate">{{ row.campaign }}</td>
                  <td class="py-2 pr-4 max-w-[100px] truncate text-on-surface-variant">{{ row.content }}</td>
                  <td class="py-2 pr-4 max-w-[100px] truncate text-on-surface-variant">{{ row.term }}</td>
                  <td class="py-2 text-right font-semibold">{{ fmt(row.sessions) }}</td>
                  <td class="py-2 text-right">{{ fmt(row.users) }}</td>
                  <td class="py-2 text-right">{{ fmt(row.newUsers) }}</td>
                  <td class="py-2 text-right" :class="row.bounceRate > 70 ? 'text-error' : ''">{{ row.bounceRate }}%</td>
                  <td class="py-2 text-right text-green-600">{{ row.engagementRate }}%</td>
                  <td class="py-2 text-right font-semibold">{{ fmt(row.conversions) }}</td>
                  <td class="py-2 text-right text-on-surface-variant">{{ fmtDur(row.avgDuration) }}</td>
                </tr>
                <tr v-if="!store.utm.length && !store.loading.utm">
                  <td colspan="12" class="py-8 text-center text-on-surface-variant text-sm">No UTM data for selected filters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Devices ────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'devices'">
        <div v-if="store.loading.devices" class="py-10 text-center">
          <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
        </div>
        <div v-else-if="store.devices" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Device Category -->
          <div class="bg-surface-container-lowest rounded-xl p-6">
            <h3 class="font-bold text-on-surface mb-4">Device Category</h3>
            <div class="space-y-3">
              <div v-for="d in store.devices.devices" :key="d.category" class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl text-on-surface-variant shrink-0">
                  {{ d.category === 'mobile' ? 'smartphone' : d.category === 'tablet' ? 'tablet' : 'computer' }}
                </span>
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium capitalize">{{ d.category }}</span>
                    <span class="text-sm font-bold">{{ d.percent }}%</span>
                  </div>
                  <div class="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div class="h-full rounded-full bg-primary transition-all" :style="{ width: d.percent + '%' }"></div>
                  </div>
                  <div class="flex gap-4 mt-1 text-[11px] text-on-surface-variant">
                    <span>{{ fmt(d.sessions) }} sessions</span>
                    <span>{{ fmt(d.users) }} users</span>
                    <span>Bounce {{ d.bounceRate }}%</span>
                    <span>Conv. {{ fmt(d.conversions) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- OS + Browser -->
          <div class="space-y-6">
            <div class="bg-surface-container-lowest rounded-xl p-6">
              <h3 class="font-bold text-on-surface mb-4">Operating System</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead><tr class="border-b border-outline-variant/30">
                    <th class="text-left py-2 text-on-surface-variant font-semibold">OS</th>
                    <th class="text-right py-2 text-on-surface-variant font-semibold">Sessions</th>
                    <th class="text-right py-2 text-on-surface-variant font-semibold">Users</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="os in store.devices.os" :key="os.os" class="border-b border-outline-variant/10">
                      <td class="py-2 font-medium">{{ os.os }}</td>
                      <td class="py-2 text-right">{{ fmt(os.sessions) }}</td>
                      <td class="py-2 text-right">{{ fmt(os.users) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-6">
              <h3 class="font-bold text-on-surface mb-4">Browser</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead><tr class="border-b border-outline-variant/30">
                    <th class="text-left py-2 text-on-surface-variant font-semibold">Browser</th>
                    <th class="text-right py-2 text-on-surface-variant font-semibold">Sessions</th>
                    <th class="text-right py-2 text-on-surface-variant font-semibold">Users</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="br in store.devices.browsers" :key="br.browser" class="border-b border-outline-variant/10">
                      <td class="py-2 font-medium">{{ br.browser }}</td>
                      <td class="py-2 text-right">{{ fmt(br.sessions) }}</td>
                      <td class="py-2 text-right">{{ fmt(br.users) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Geo ─────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'geo'">
        <div v-if="store.loading.geo" class="py-10 text-center">
          <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
        </div>
        <div v-else-if="store.geo" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-surface-container-lowest rounded-xl p-6">
            <h3 class="font-bold text-on-surface mb-4">Countries</h3>
            <div class="space-y-2.5">
              <div v-for="c in store.geo.countries" :key="c.country">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium">{{ c.country }}</span>
                  <span class="text-xs text-on-surface-variant">{{ fmt(c.sessions) }} sessions · {{ c.percent }}%</span>
                </div>
                <div class="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div class="h-full rounded-full bg-[#4285F4] transition-all" :style="{ width: c.percent + '%' }"></div>
                </div>
                <div class="flex gap-3 mt-0.5 text-[11px] text-on-surface-variant">
                  <span>{{ fmt(c.users) }} users</span>
                  <span>Bounce {{ c.bounceRate }}%</span>
                  <span>Conv. {{ fmt(c.conversions) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-xl p-6">
            <h3 class="font-bold text-on-surface mb-4">Cities</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead><tr class="border-b border-outline-variant/30">
                  <th class="text-left py-2 text-on-surface-variant font-semibold">City</th>
                  <th class="text-left py-2 text-on-surface-variant font-semibold">Country</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Sessions</th>
                  <th class="text-right py-2 text-on-surface-variant font-semibold">Users</th>
                </tr></thead>
                <tbody>
                  <tr v-for="c in store.geo.cities" :key="c.city + c.country" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                    <td class="py-2 font-medium">{{ c.city }}</td>
                    <td class="py-2 text-on-surface-variant">{{ c.country }}</td>
                    <td class="py-2 text-right">{{ fmt(c.sessions) }}</td>
                    <td class="py-2 text-right">{{ fmt(c.users) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Events ─────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'events'">
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <h3 class="font-bold text-on-surface">GA4 Events</h3>
            <div class="flex gap-2 ml-auto flex-wrap">
              <input v-model="store.eventFilter" placeholder="Filter by event name…"
                class="bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary w-48" />
              <button @click="store.loadEvents()"
                class="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold">Apply</button>
              <button @click="store.eventFilter = ''; store.loadEvents()"
                class="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">Clear</button>
            </div>
          </div>
          <div v-if="store.loading.events" class="py-8 text-center">
            <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-3 text-on-surface-variant font-semibold">Event Name</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Count</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Users</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Count / User</th>
                <th class="text-right py-3 text-on-surface-variant font-semibold">Conversions</th>
              </tr></thead>
              <tbody>
                <tr v-for="ev in store.events" :key="ev.eventName" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                  <td class="py-2.5 font-mono text-sm">{{ ev.eventName }}</td>
                  <td class="py-2.5 text-right font-semibold">{{ fmt(ev.count) }}</td>
                  <td class="py-2.5 text-right">{{ fmt(ev.users) }}</td>
                  <td class="py-2.5 text-right text-on-surface-variant">{{ ev.countPerUser }}</td>
                  <td class="py-2.5 text-right">{{ fmt(ev.conversions) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Pages ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'pages'">
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <h3 class="font-bold text-on-surface mb-4">Top Pages</h3>
          <div v-if="store.loading.pages" class="py-8 text-center">
            <span class="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-2.5 text-on-surface-variant font-semibold w-6">#</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold">Path</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold">Title</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Views</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Users</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Avg Dur.</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Bounce</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Engagement</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Conv.</th>
              </tr></thead>
              <tbody>
                <tr v-for="(pg, i) in store.pages" :key="pg.path" class="border-b border-outline-variant/10 hover:bg-surface-container/50">
                  <td class="py-2 text-on-surface-variant font-bold">{{ i + 1 }}</td>
                  <td class="py-2 font-medium text-primary max-w-[180px] truncate">{{ pg.path }}</td>
                  <td class="py-2 text-on-surface-variant max-w-[200px] truncate">{{ pg.title }}</td>
                  <td class="py-2 text-right font-semibold">{{ fmt(pg.pageViews) }}</td>
                  <td class="py-2 text-right">{{ fmt(pg.users) }}</td>
                  <td class="py-2 text-right">{{ fmtDur(pg.avgDuration) }}</td>
                  <td class="py-2 text-right" :class="pg.bounceRate > 70 ? 'text-error' : ''">{{ pg.bounceRate }}%</td>
                  <td class="py-2 text-right text-green-600">{{ pg.engagementRate }}%</td>
                  <td class="py-2 text-right">{{ fmt(pg.conversions) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── TAB: Realtime ───────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'realtime'">
        <div class="bg-surface-container-lowest rounded-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h3 class="font-bold text-on-surface">Realtime Active Users</h3>
            </div>
            <button @click="store.loadRealtime()" class="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1">
              <span class="material-symbols-outlined text-base">refresh</span>Refresh
            </button>
          </div>

          <div class="text-5xl font-extrabold text-green-500 mb-8">{{ store.realtime.totalActive }}</div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-outline-variant/30">
                <th class="text-left py-2.5 text-on-surface-variant font-semibold">Country</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold">Page</th>
                <th class="text-left py-2.5 text-on-surface-variant font-semibold">Device</th>
                <th class="text-right py-2.5 text-on-surface-variant font-semibold">Active Users</th>
              </tr></thead>
              <tbody>
                <tr v-for="(row, i) in store.realtime.byPage" :key="i" class="border-b border-outline-variant/10">
                  <td class="py-2.5">{{ row.country }}</td>
                  <td class="py-2.5 font-mono text-xs max-w-[200px] truncate">{{ row.page }}</td>
                  <td class="py-2.5 capitalize text-on-surface-variant">{{ row.device }}</td>
                  <td class="py-2.5 text-right font-bold text-green-600">{{ row.activeUsers }}</td>
                </tr>
                <tr v-if="!store.realtime.byPage.length">
                  <td colspan="4" class="py-8 text-center text-on-surface-variant">No active users right now</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoogleAnalyticsStore } from '@/stores/googleAnalytics.js'

// ─── Social platform helpers ────────────────────────────────────────────────
const SOCIAL_COLORS = {
  facebook: '#1877F2', instagram: '#E1306C', tiktok: '#010101',
  youtube: '#FF0000', twitter: '#1DA1F2', x: '#000000',
  linkedin: '#0A66C2', pinterest: '#E60023', zalo: '#0068FF',
  threads: '#101010', snapchat: '#FFFC00',
}

function socialColor(source = '') {
  const k = source.toLowerCase()
  for (const [name, color] of Object.entries(SOCIAL_COLORS)) {
    if (k.includes(name)) return color
  }
  return '#78909C'
}

function socialIcon(source = '') {
  const k = source.toLowerCase()
  if (k.includes('facebook')) return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg'
  if (k.includes('instagram')) return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg'
  if (k.includes('tiktok')) return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg'
  if (k.includes('youtube')) return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg'
  if (k.includes('twitter') || k === 'x') return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg'
  if (k.includes('linkedin')) return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg'
  if (k.includes('zalo')) return null
  return null
}

const store = useGoogleAnalyticsStore()
const activeTab = ref('trend')

const GA_PROPERTY_HINT = '439675727'

const periods = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

const tabs = [
  { key: 'trend',    label: 'Trend',    icon: 'show_chart', tip: 'Biến động Sessions / Users / Engaged theo từng ngày.' },
  { key: 'channels', label: 'Channels', icon: 'pie_chart', tip: 'Nguồn traffic theo nhóm kênh: Organic, Direct, Social, Referral, Paid...' },
  { key: 'social',   label: 'Social',   icon: 'thumb_up', tip: 'Traffic từ các nền tảng mạng xã hội (Facebook, Instagram, TikTok, YouTube...).' },
  { key: 'utm',      label: 'UTM',      icon: 'link', tip: 'Phân tích theo tham số UTM (source / medium / campaign) gắn trong link chiến dịch.' },
  { key: 'devices',  label: 'Devices',  icon: 'devices', tip: 'Phân bổ theo thiết bị / hệ điều hành / trình duyệt.' },
  { key: 'geo',      label: 'Geo',      icon: 'public', tip: 'Phân bổ người dùng theo quốc gia & thành phố.' },
  { key: 'events',   label: 'Events',   icon: 'bolt', tip: 'Các sự kiện GA4 (click, scroll, form...) và số lần xảy ra.' },
  { key: 'pages',    label: 'Pages',    icon: 'article', tip: 'Các trang được xem nhiều nhất kèm chỉ số tương tác.' },
  { key: 'realtime', label: 'Realtime', icon: 'radio_button_checked', tip: 'Người dùng đang online ngay lúc này.' },
]

onMounted(() => store.loadAll())

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}

function fmtDur(secs) {
  if (!secs) return '0s'
  const m = Math.floor(secs / 60), s = Math.round(secs % 60)
  return m ? `${m}m ${s}s` : `${s}s`
}

// ─── Overview KPIs ──────────────────────────────────────────────────────────
const overviewKPIs = computed(() => {
  const ov = store.overview
  if (!ov) return []
  return [
    { label: 'Sessions',       value: fmt(ov.sessions),        icon: 'show_chart',    color: '#F37C20',
      tip: 'Phiên truy cập — một lượt người dùng vào và tương tác với web. Tự kết thúc sau 30 phút không hoạt động.' },
    { label: 'Total Users',    value: fmt(ov.totalUsers),       icon: 'group',         color: '#4285F4',
      tip: 'Tổng số người dùng khác nhau đã vào web trong kỳ.' },
    { label: 'New Users',      value: fmt(ov.newUsers),         icon: 'person_add',    color: '#34A853',
      tip: 'Số người LẦN ĐẦU vào web (chưa từng ghé trước đó).' },
    { label: 'Page Views',     value: fmt(ov.pageViews),        icon: 'visibility',    color: '#9C27B0',
      tip: 'Tổng số lượt xem trang. 1 người xem 3 trang = 3 page views.' },
    { label: 'Bounce Rate',    value: ov.bounceRate + '%',      icon: 'exit_to_app',   color: '#EA4335',
      tip: 'Tỷ lệ thoát — % phiên vào rồi rời đi mà không tương tác gì. Càng THẤP càng tốt.' },
    { label: 'Engagement',     value: ov.engagementRate + '%',  icon: 'thumb_up',      color: '#00BCD4',
      tip: 'Tỷ lệ tương tác — % phiên có tương tác thật (xem >10s, có sự kiện, hoặc xem nhiều trang). Càng CAO càng tốt.' },
    { label: 'Avg Duration',   value: fmtDur(ov.avgSessionDuration), icon: 'timer',   color: '#FF9800',
      tip: 'Thời lượng trung bình mỗi phiên truy cập.' },
    { label: 'Engaged Sess.',  value: fmt(ov.engagedSessions),  icon: 'check_circle',  color: '#34A853',
      tip: 'Số phiên có tương tác thật (engaged), ngược lại với phiên thoát ngay.' },
    { label: 'Pages/Session',  value: ov.pagesPerSession,       icon: 'book',          color: '#607D8B',
      tip: 'Trung bình số trang được xem trong mỗi phiên.' },
    { label: 'Events',         value: fmt(ov.eventCount),       icon: 'bolt',          color: '#E91E63',
      tip: 'Tổng số sự kiện được ghi nhận (click, scroll, xem video, submit form...).' },
    { label: 'Conversions',    value: fmt(ov.conversions),      icon: 'flag',          color: '#F37C20',
      tip: 'Số lượt chuyển đổi — hành động giá trị bạn đặt làm mục tiêu (vd đặt lịch, gửi form).' },
    { label: 'Active Now',     value: fmt(store.realtime.totalActive), icon: 'radio_button_checked', color: '#34A853',
      tip: 'Số người đang truy cập web ngay lúc này (realtime, ~30 phút gần nhất).' },
  ]
})

// ─── Trend chart bars ────────────────────────────────────────────────────────
const trendBars = computed(() => {
  if (!store.trend.length) return []
  const maxSes = Math.max(...store.trend.map(d => d.sessions), 1)
  const maxUsr = Math.max(...store.trend.map(d => d.users), 1)
  const maxEng = Math.max(...store.trend.map(d => d.engagedSessions), 1)
  return store.trend.map(d => ({
    date: d.date,
    sessions: d.sessions,
    users: d.users,
    engagedSessions: d.engagedSessions,
    sesH: Math.max(4, Math.round((d.sessions / maxSes) * 100)),
    usrH: Math.max(4, Math.round((d.users / maxUsr) * 80)),
    engH: Math.max(2, Math.round((d.engagedSessions / maxEng) * 60)),
  }))
})

// ─── Channel colors ──────────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  'Organic Search': '#34A853', 'Direct': '#4285F4', 'Organic Social': '#EA4335',
  'Paid Search': '#FBBC04', 'Email': '#9C27B0', 'Referral': '#00BCD4',
  'Affiliates': '#FF5722', 'Display': '#FF9800', 'Unassigned': '#9E9E9E',
}
function channelColor(name) { return CHANNEL_COLORS[name] || '#78909C' }

// ─── UTM Link Builder ───────────────────────────────────────────────────────
const builder = ref({ url: '', source: '', medium: 'social', campaign: '', content: '', term: '' })
const copied = ref(false)

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'threads', label: 'Threads' },
]

const generatedLink = computed(() => {
  const { url, source } = builder.value
  if (!url || !source) return ''
  const base = url.trim().replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('utm_source', source)
  params.set('utm_medium', builder.value.medium || 'social')
  if (builder.value.campaign) params.set('utm_campaign', builder.value.campaign)
  if (builder.value.content) params.set('utm_content', builder.value.content)
  if (builder.value.term) params.set('utm_term', builder.value.term)
  return `${base}?${params.toString()}`
})

async function copyLink() {
  if (!generatedLink.value) return
  await navigator.clipboard.writeText(generatedLink.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const quickExamples = [
  { label: 'Facebook post', source: 'facebook', medium: 'social', campaign: 'organic_post', content: '', term: '', preview: 'utm_source=facebook&utm_medium=social' },
  { label: 'Instagram Story', source: 'instagram', medium: 'story', campaign: 'link_in_bio', content: 'story_cta', term: '', preview: 'utm_source=instagram&utm_medium=story' },
  { label: 'TikTok Bio', source: 'tiktok', medium: 'bio', campaign: 'tiktok_promo', content: '', term: '', preview: 'utm_source=tiktok&utm_medium=bio' },
]

function applyExample(ex) {
  builder.value.source = ex.source
  builder.value.medium = ex.medium
  builder.value.campaign = ex.campaign
  builder.value.content = ex.content
  builder.value.term = ex.term
}

// ─── UTM filter fields ───────────────────────────────────────────────────────
const utmFilterFields = computed(() => [
  { key: 'source',   label: 'Source (utm_source)',       options: store.utmSources.sources,   placeholder: 'e.g. google' },
  { key: 'medium',   label: 'Medium (utm_medium)',       options: store.utmSources.mediums,   placeholder: 'e.g. cpc' },
  { key: 'campaign', label: 'Campaign (utm_campaign)',   options: store.utmSources.campaigns, placeholder: 'e.g. spring_sale' },
  { key: 'content',  label: 'Content (utm_content)',     options: null, placeholder: 'e.g. banner_v1' },
  { key: 'term',     label: 'Term (utm_term)',           options: null, placeholder: 'e.g. therapy' },
])
</script>
