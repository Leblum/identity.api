import { IOrganization } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";

export interface IOrganizationRepository extends IBaseRepository<IOrganization>{
}