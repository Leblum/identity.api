import { Permission, IPermission, IPermissionDoc } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { PermissionRepository, IPermissionRepository } from '../repositories'
import { Request, Response, NextFunction } from 'express';

export class PermissionController extends BaseController {
  public defaultPopulationArgument = null;

  public isOwnershipRequired: boolean = false;
  public rolesRequiringOwnership: string[] = [];
  public addOwnerships(request: Request, response: Response, next: NextFunction, modelDoc: IPermissionDoc): void {
  }

  public isOwner(request: Request, response: Response, next: NextFunction, modelDoc: IPermissionDoc): boolean {
       throw new Error("Permissions don't require an ownership check");
  }

  protected repository: IPermissionRepository = new PermissionRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IPermissionDoc): Promise<IPermissionDoc>{
    model.href = `${CONST.ep.API}${CONST.ep.PERMISSIONS}/${model._id}`;
    return Promise.resolve(model);
  }
}
