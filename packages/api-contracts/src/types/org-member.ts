import type { z } from "zod";

import type { orgMemberSchema } from "../schemas/org-member.schema.js";

export type OrgMember = z.infer<typeof orgMemberSchema>;
