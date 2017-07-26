import { Organization, IOrganization } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
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
    model.href = `${CONST.ep.API}${CONST.ep.ORGANIZATIONS}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IOrganization): Promise<IOrganization>{
    model.href = `${CONST.ep.API}${CONST.ep.ORGANIZATIONS}/${model._id}`;
    return Promise.resolve(model);
  }
}
