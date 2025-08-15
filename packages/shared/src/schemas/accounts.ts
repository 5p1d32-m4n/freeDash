import {z} from "zod";

const AccountTypeEnum = z.enum(["checking", "savings", "credit"]);

export const AccountSchema = z.object({
    id: z.uuid(),
    plaidItemId: z.string(),
    plaidAccountId: z.string(),
    name: z.string(),
    officialName: z.string().optional().nullable(),
    type: AccountTypeEnum,
    balance: z.number(),
    lastSynced: z.iso.datetime(),
    userId: z.uuid()
})