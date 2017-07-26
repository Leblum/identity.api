import { Address, IAddress } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Constants } from '../constants';
import { AddressRepository, IAddressRepository } from '../repositories'

export class AddressController extends BaseController{
  public defaultPopulationArgument =
  {
    path: 'owner primaryContact businessAddress pickupAddress',
  }

  protected repository: IAddressRepository = new AddressRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IAddress): Promise<IAddress>{
    model.href = `${Constants.APIEndpoint}${Constants.AddressesEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IAddress): Promise<IAddress>{
    model.href = `${Constants.APIEndpoint}${Constants.AddressesEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }
}
