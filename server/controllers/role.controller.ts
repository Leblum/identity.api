import { Role, IRole, IRoleDoc, IPermissionDoc } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { RoleRepository, IRoleRepository } from '../repositories'
import { Request, Response, NextFunction } from 'express';

export class RoleController extends BaseController{

  public isOwnershipRequired: boolean = false;
  public rolesRequiringOwnership: string[] = [];
  public addOwnerships(request: Request, response: Response, next: NextFunction, modelDoc: IRoleDoc): void {
  }

  public isOwner(request: Request, response: Response, next: NextFunction, modelDoc: IRoleDoc): boolean {
       throw new Error("Roles don't require an ownership check");
  }


  public defaultPopulationArgument =
  {
    path: 'permissions'
  }

  protected repository: IRoleRepository = new RoleRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IRoleDoc): Promise<IRoleDoc>{
    model.href = `${CONST.ep.API}${CONST.ep.ROLES}/${model._id}`;
    return Promise.resolve(model);
  }
}
