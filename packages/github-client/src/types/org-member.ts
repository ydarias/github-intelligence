export interface OrgMember {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  talentId: string | null;
  jobRole: string | null;
}
