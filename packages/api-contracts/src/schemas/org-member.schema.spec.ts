import type { OrgMember as DomainOrgMember } from "@github-intelligence/github-client";

import type { OrgMember } from "../types/org-member.js";

import { orgMemberSchema, orgMembersSchema } from "./org-member.schema.js";

const validMember: OrgMember = {
  id: 1,
  login: "octocat",
  name: "Octo Cat",
  email: "octo@example.com",
  createdAt: "2020-01-01T00:00:00Z",
  talentId: "T-1",
  jobRole: "Engineer",
};

describe("orgMemberSchema", () => {
  it("parses a valid member unchanged, without stripping any field", () => {
    expect(orgMemberSchema.parse(validMember)).toEqual(validMember);
  });

  it("accepts null for the nullable fields", () => {
    const member = { ...validMember, name: null, email: null, talentId: null, jobRole: null };

    expect(orgMemberSchema.parse(member)).toEqual(member);
  });

  it("rejects a member with a wrong field type", () => {
    expect(orgMemberSchema.safeParse({ ...validMember, id: "1" }).success).toBe(false);
  });

  it("rejects a member with a missing field", () => {
    const incomplete: Partial<OrgMember> = { ...validMember };
    delete incomplete.login;

    expect(orgMemberSchema.safeParse(incomplete).success).toBe(false);
  });

  it("parses an array of members", () => {
    expect(orgMembersSchema.parse([validMember])).toEqual([validMember]);
  });

  it("covers every field of the domain OrgMember type", () => {
    const domainMember: DomainOrgMember = validMember;

    expect(Object.keys(orgMemberSchema.shape).sort()).toEqual(Object.keys(domainMember).sort());
  });
});
