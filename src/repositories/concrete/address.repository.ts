import { Address, IAddress } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IAddressRepository } from "../index";

export class AddressRepository extends BaseRepository<IAddress> implements IAddressRepository, IBaseRepository<IAddress>{
    protected mongooseModelInstance: Model<IAddress> = Address;

    public constructor(){
        super();
    }
}