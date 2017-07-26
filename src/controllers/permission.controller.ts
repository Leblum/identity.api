import { Permission, IPermission } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Constants } from '../constants';
import { PermissionRepository, IPermissionRepository } from '../repositories'

export class PermissionController extends BaseController {
  public defaultPopulationArgument = null;

  protected repository: IPermissionRepository = new PermissionRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IPermission): Promise<IPermission>{
    model.href = `${Constants.APIEndpoint}${Constants.PermissionsEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IPermission): Promise<IPermission>{
    model.href = `${Constants.APIEndpoint}${Constants.PermissionsEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }
}
