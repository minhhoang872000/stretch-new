/** DataTable column definition. Lives outside the SFC because `<script setup>` cannot export. */
export interface Column {
  key: string
  label: string
  /** Right-align and use the tabular face — for figures. */
  numeric?: boolean
  sortable?: boolean
  /** Tailwind width class, e.g. `w-40`. */
  width?: string
  /** Hide below `sm` — the low-value columns go first on a phone. */
  hideOnMobile?: boolean
}
