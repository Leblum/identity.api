import { Role, IRole } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { RoleRepository, IRoleRepository } from '../repositories'

export class RoleController extends BaseController{
  public defaultPopulationArgument =
  {
    path: 'permissions'
  }

  protected userRepository: IRoleRepository = new RoleRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IRole): Promise<IRole>{
    model.href = `${CONST.ep.API}${CONST.ep.ROLES}/${model._id}`;
    return Promise.resolve(model);
  }

  public preUpdateHook(model: IRole): Promise<IRole>{
    model.href = `${CONST.ep.API}${CONST.ep.ROLES}/${model._id}`;
    return Promise.resolve(model);
  }
}
