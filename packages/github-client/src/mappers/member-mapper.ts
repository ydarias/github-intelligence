import {OrgMember} from "../types/org-member.js";
import {OctokitUserData} from "../types/octokit-user-data.js";

export const memberMapper = {
  toOrgMember(data: OctokitUserData): OrgMember {
    return {
      id: data.id,
      login: data.login,
      name: data.name ?? null,
      email: data.email ?? null,
      createdAt: data.created_at,
      talentId: null,
      jobRole: null,
    };
  },
};
