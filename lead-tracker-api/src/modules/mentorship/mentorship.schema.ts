import { z } from 'zod'

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * The learner's identity is NOT in here on purpose.
 *
 * The site's server route reads it from the Google session and attaches it
 * before forwarding, so a caller holding the service token still cannot book
 * as somebody else. See `site/server/api/mentorship/index.post.ts`.
 */
export const createMentorshipSchema = z.object({
  program_slug: z.string().max(200).optional(),
  lesson_key: z.string().max(20).optional(),
  lesson_title: z.string().max(300).optional(),
  learner_name: z.string().min(1, 'Learner name is required').max(200),
  learner_email: z.string().email('Learner email is invalid').max(200),
  learner_avatar: z.string().max(500).optional().or(z.literal('')),
  topic: z.string().max(2000).optional(),
  date: z.string().regex(DATE, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(TIME, 'Time must be HH:mm'),
})

/**
 * A meeting link may be supplied by hand — that is the fallback when the
 * service account cannot mint a Google Meet link itself.
 */
export const acceptMentorshipSchema = z.object({
  meet_url: z.string().url('Meeting link is invalid').max(500).optional().or(z.literal('')),
})

export const declineMentorshipSchema = z.object({
  reason: z.string().max(1000).optional(),
})

export const updateHoursSchema = z.object({
  hours: z
    .array(
      z
        .object({
          weekday: z.number().int().min(0).max(6),
          start_time: z.string().regex(TIME, 'Start time must be HH:mm'),
          end_time: z.string().regex(TIME, 'End time must be HH:mm'),
          active: z.boolean(),
        })
        .refine((h) => h.end_time > h.start_time, {
          message: 'End time must be after start time',
          path: ['end_time'],
        })
    )
    .max(7, 'At most one window per weekday'),
})

export type CreateMentorshipInput = z.infer<typeof createMentorshipSchema>
export type AcceptMentorshipInput = z.infer<typeof acceptMentorshipSchema>
export type DeclineMentorshipInput = z.infer<typeof declineMentorshipSchema>
export type UpdateHoursInput = z.infer<typeof updateHoursSchema>
