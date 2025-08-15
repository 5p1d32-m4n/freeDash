import { z } from "zod";

const OnboardingStatus = z.enum(["incomplete", "complete"])

export const UserSchema = z.object({
    id: z.uuid(),
    auth0Id: z.string(),
    email: z.string().email(),
    name: z.string().optional().nullable(),
    onboardingStatus: OnboardingStatus,
    defaultCurrency: z.string().optional(),
    timezone: z.string().optional().nullable()
})