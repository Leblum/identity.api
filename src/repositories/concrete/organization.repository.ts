import { Organization, IOrganization } from "../../models/index";
import { BaseRepository } from '../base/base.repository';
import { IBaseRepository } from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IOrganizationRepository } from "../index";

export class OrganizationRepository extends BaseRepository<IOrganization> implements IOrganizationRepository, IBaseRepository<IOrganization>{
    protected mongooseModelInstance: Model<IOrganization> = Organization;

    public constructor() {
        super();
    }

    public async getGuestOrganization(): Promise<IOrganization> {
        let guestOrg = await Organization.findOne({ name: 'guest' });
        return guestOrg;
    }
    
    public async getSystemOrganizatoin(): Promise<IOrganization> {
        let systemOrg = await Organization.findOne({ name: 'system' });
        return systemOrg;
    }
}