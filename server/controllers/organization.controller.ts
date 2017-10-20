import { Organization, IOrganization, IOrganizationDoc, IBaseModelDoc, ITokenPayload } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { OrganizationRepository, IOrganizationRepository } from '../repositories'
import { Request, Response, NextFunction } from 'express';
import { OwnershipType } from '../enumerations';

export class OrganizationController extends BaseController{
  public isOwnershipRequired: boolean = true;
  public rolesRequiringOwnership: string[] = [CONST.GUEST_ROLE,CONST.SUPPLIER_EDITOR_ROLE];

  public addOwnerships(request: Request, response: Response, next: NextFunction, organizationDocument: IOrganizationDoc): void {
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];
    // TODO Do we need to do something where we push users onto the organization as other owners?
    // Or is it only the first user who creates the organization?  Not sure.  IF we need to add users, then we need to do something different here,
    // and it needs to be called on update (right now this method is only called on create.Í)
    organizationDocument.ownerships = [{
      ownerId: currentToken.userId,
      ownershipType: OwnershipType.user
    }];
  }

  // For organization documents, we're going to 
  public isOwner(request: Request, response: Response, next: NextFunction, organizationDocument: IOrganizationDoc): boolean {
    // We'll assume this is only for CRUD
    // Get the current token, so we can get the ownerId in this case organization id off of here.
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];

    // For now we're just going to check that the ownership is around organization.
    return super.isOwnerInOwnership(organizationDocument, currentToken.userId, OwnershipType.user);
  }

  public defaultPopulationArgument =
  {
    path: '',
  }

  protected repository: IOrganizationRepository = new OrganizationRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IOrganizationDoc): Promise<IOrganizationDoc>{
    model.href = `${CONST.ep.API}${CONST.ep.ORGANIZATIONS}/${model._id}`;
    return Promise.resolve(model);
  }
}
