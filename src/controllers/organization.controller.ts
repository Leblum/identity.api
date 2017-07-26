import { Organization, IOrganization } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Constants } from '../constants';
import { OrganizationRepository, IOrganizationRepository } from '../repositories'

export class OrganizationController extends BaseController{
  public defaultPopulationArgument =
  {
    path: '',
  }

  protected userRepository: IOrganizationRepository = new OrganizationRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IOrganization): Promise<IOrganization>{
    model.href = `${Constants.API_ENDPOINT}${Constants.ORGANIZATION_ENDPOINT}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IOrganization): Promise<IOrganization>{
    model.href = `${Constants.API_ENDPOINT}${Constants.ORGANIZATION_ENDPOINT}/${model._id}`;
    return Promise.resolve(model);
  }
}
