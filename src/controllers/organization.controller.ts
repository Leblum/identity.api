import { Organization, IOrganization } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Constants } from '../constants';
import { OrganizationRepository, IOrganizationRepository } from '../repositories'

export class OrganizationController extends BaseController{
  public defaultPopulationArgument =
  {
    path: 'owner primaryContact businessAddress pickupAddress',
  }

  protected repository: IOrganizationRepository = new OrganizationRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IOrganization): Promise<IOrganization>{
    model.href = `${Constants.APIEndpoint}${Constants.OrganizationsEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IOrganization): Promise<IOrganization>{
    model.href = `${Constants.APIEndpoint}${Constants.OrganizationsEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }
}
