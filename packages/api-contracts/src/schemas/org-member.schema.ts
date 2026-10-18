import { z } from "zod";

// Must list every field of the `OrgMember` domain type: z.object strips unknown keys.
export const orgMemberSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.string(),
  talentId: z.string().nullable(),
  jobRole: z.string().nullable(),
});

export const orgMembersSchema = z.array(orgMemberSchema);
