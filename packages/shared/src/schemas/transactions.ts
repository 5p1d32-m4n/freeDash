import {z} from "zod";

const TransactionStatusEnum = z.enum(["pending", "posted"]);
const TransactionTypeEnum = z.enum(["income", "expense", "transfer"]);

export const TransactionSchema = z.object({
    id: z.uuid(),
    plaidTransactionId: z.string(),
    amount: z.number(),
    currency: z.string(),
    date: z.iso.datetime(),
    merchant: z.string().optional(),
    plaidCategory: z.string().array(),
    customCategory: z.string().optional(),
    status: TransactionStatusEnum,
    type: TransactionTypeEnum,
    userId: z.uuid(),
    accountId: z.uuid()
})