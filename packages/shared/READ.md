# Date Handling Strategy:

```ts
// For version 4.0.17, use this conversion pattern:
const input = { lastSynced: new Date().toISOString() };
const parsed = AccountSchema.parse(input);

// When writing to Prisma:
const prismaData = {
  ...parsed,
  lastSynced: new Date(parsed.lastSynced)  // Convert to Date object
};
```

# Handling Nulls:

```ts
// Use transform for nullable fields if needed:
taxRate: z.number().optional().nullable()
  .transform(val => val === null ? undefined : val)
```

# Integer Validation:

```ts
// For Prisma Int type:
z.number().int()  // Ensures whole numbers
```