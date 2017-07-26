import { IAddress } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";

export interface IAddressRepository extends IBaseRepository<IAddress>{
}