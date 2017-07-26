import { Organization, IOrganization } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IOrganizationRepository } from "../index";

export class OrganizationRepository extends BaseRepository<IOrganization> implements IOrganizationRepository, IBaseRepository<IOrganization>{
    protected mongooseModelInstance: Model<IOrganization> = Organization;

    public constructor(){
        super();
    }
}