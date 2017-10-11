import { Organization, IOrganization, IOrganizationDoc } from "../../models/index";
import { BaseRepository } from '../base/base.repository';
import { IBaseRepository } from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IOrganizationRepository } from "../index";

export class OrganizationRepository extends BaseRepository<IOrganizationDoc> implements IOrganizationRepository, IBaseRepository<IOrganizationDoc>{
    protected mongooseModelInstance: Model<IOrganizationDoc> = Organization;

    public constructor() {
        super();
    }

    public async getOrgByName(name: string): Promise<IOrganizationDoc>{
        let org = await Organization.findOne({ name: name });
        return org;
    }

    public async getGuestOrganization(): Promise<IOrganizationDoc> {
        return await this.getOrgByName('guest');
    }
    
    public async getSystemOrganization(): Promise<IOrganizationDoc> {
        return await this.getOrgByName('system');
    }
}