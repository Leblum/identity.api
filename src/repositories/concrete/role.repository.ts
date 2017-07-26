import { Role, IRole } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IRoleRepository } from "../index";

export class RoleRepository extends BaseRepository<IRole> implements IRoleRepository, IBaseRepository<IRole>{
    protected mongooseModelInstance: Model<IRole> = Role;

    public constructor(){
        super();
    }
}