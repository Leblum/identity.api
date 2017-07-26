import { Permission, IPermission } from "../../models/index";
import { IPermissionRepository, } from "../interfaces/permission.repository.interface";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';
import { Model } from "mongoose";

export class PermissionRepository extends BaseRepository<IPermission> implements IPermissionRepository, IBaseRepository<IPermission>{
    protected mongooseModelInstance: Model<IPermission> = Permission;

    public constructor(){
        super();
    }
}