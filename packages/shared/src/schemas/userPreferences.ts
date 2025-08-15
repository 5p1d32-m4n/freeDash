import { z } from 'zod';

export const UserPreferencesSchema = z.object({

    id: z.uuid(),
    weeklyReport: z.boolean(),
    taxRate: z.number().optional().nullable(),
    businessHours: z.array(z.number().int()),
    userId: z.uuid()
})