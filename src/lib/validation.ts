import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse').min(3).max(255),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein').max(100),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(255),
  role: z.enum(['ADMIN', 'COACH'], {
    errorMap: () => ({ message: 'Rolle muss ADMIN oder COACH sein' })
  }),
  coachId: z.string().optional().nullable()
})

export const updateUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse').min(3).max(255).optional(),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein').max(100).optional(),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(255).optional(),
  role: z.enum(['ADMIN', 'COACH']).optional(),
  coachId: z.string().optional().nullable()
})

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich')
})

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError?.message || 'Validierung fehlgeschlagen'
      }
    }
    return { success: false, error: 'Validierung fehlgeschlagen' }
  }
}
