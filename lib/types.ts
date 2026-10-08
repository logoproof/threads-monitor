// ============================================================
// TypeScript Types — Threads Family Monitor
// Berdasarkan struktur spreadsheet Threads Keluarga (4 sheets)
// ============================================================

// ── Sheet 1: Live Content ─────────────────────────────────
export type PostStatus = 'draft' | 'approved' | 'processing' | 'published';

export interface ThreadsPost {
  id: string;                       // TK-001, TK-002, ...
  ttema: string;                    // Judul/tema konten
  tnaskah: string;                  // Isi konten lengkap (multi-paragraf)
  tcatatan_editor: string;          // Catatan dari Gemini Sparks
  tstatus: PostStatus;              // Status di pipeline
  tscheduled_at: string | null;     // ISO datetime string atau null
  tformat_publish: string;          // "reply_chain"
  tthreads_post_id: string | null;  // ID reply pertama di Threads
  terror: string | null;            // Error dari Apps Script (null jika OK)
}

// ── Sheet 2: PARTS ────────────────────────────────────────
export type PartStatus = 'formatted' | 'needs_review' | 'published';

export interface ThreadsPart {
  content_id: string;               // FK ke ThreadsPost.id
  tpart_no: number;                 // Nomor urut paragraf (1–8)
  tteks: string;                    // Teks paragraf tunggal
  tjumlah_karakter: number;         // Panjang karakter
  tstatus: PartStatus;
  tthreads_post_id: string | null;  // ID reply individu di Threads
  terror: string | null;
}

// ── Sheet 3: METRICS ──────────────────────────────────────
export interface ThreadsMetric {
  checked_at: string;               // ISO datetime snapshot
  content_id: string;               // FK ke ThreadsPost.id
  part_no: number;
  threads_post_id: string;
  views: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  total_interactions: number;
  error: string | null;
}

// Agregat metrics per konten (untuk tampilan di dashboard/analytics)
export interface ContentMetricsSummary {
  content_id: string;
  ttema: string;
  total_views: number;
  total_likes: number;
  total_replies: number;
  total_reposts: number;
  total_quotes: number;
  total_interactions: number;
  checked_at: string;               // Waktu snapshot terbaru
}

// ── Sheet 4: HEALTH_LOG ───────────────────────────────────
export type HealthStatus = 'ok' | 'warning' | 'error' | 'unknown';

export interface HealthLogEntry {
  checked_at: string;
  component: string;
  status: HealthStatus;
  message: string;
}

// ── Dashboard Stats ───────────────────────────────────────
export interface DashboardStats {
  total: number;
  byStatus: Record<PostStatus, number>;
  publishedToday: number;
  errorsCount: number;
  partsWithErrors: number;
  lastPublishedAt: string | null;
  topPost: ContentMetricsSummary | null;
}

// ── API Response wrappers ─────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
  cached_at?: string;
}
