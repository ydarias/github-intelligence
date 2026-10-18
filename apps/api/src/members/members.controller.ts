import { orgMemberSchema, type OrgMember } from "@github-intelligence/api-contracts";
import { FlatCacheMembersRepository } from "@github-intelligence/members";
import { Controller, Get, SerializeOptions } from "@nestjs/common";

@Controller("members")
export class MembersController {
  constructor(private readonly membersRepository: FlatCacheMembersRepository) {}

  @Get()
  // The serializer validates array responses element by element, so it takes the item schema.
  @SerializeOptions({ schema: orgMemberSchema })
  list(): OrgMember[] {
    return this.membersRepository.loadAll();
  }
}
