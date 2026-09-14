/** Chart row shapes. Kept out of the .vue files: `<script setup>` cannot export. */

export interface BarRow {
  label: string
  /** Second line under the label — context, not another encoding. */
  sub?: string
  value: number
  /** Overrides the printed value, e.g. "62% · dừng ở 7:41". */
  valueText?: string
}

export interface SparkPoint {
  label: string
  value: number
}
