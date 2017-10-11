import { IUserDoc, User, IUserUpgradeRequest, IOrganization, IUserUpgradeResponse } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IUserRepository, UserRepository, OrganizationRepository, IOrganizationRepository, RoleRepository } from "../repositories";
import { ApiErrorHandler } from '../api-error-handler';
import { OrganizationType } from '../enumerations';
var bcrypt = require('bcrypt');

export class UserController extends BaseController {
  public defaultPopulationArgument =
  {
    path: 'roles',
    // Permissions for the roles
    populate: { path: 'permissions' }
  };

  protected repository: IUserRepository = new UserRepository();
  protected organizationRepository: IOrganizationRepository = new OrganizationRepository();

  constructor() {
    super();
  }

  public async upgradeUser(request: Request, response: Response, next: NextFunction): Promise<any> {
    try {
        let upgradeRequest: IUserUpgradeRequest = request.body as IUserUpgradeRequest;

        // There are only specific roles we're going to allow for upgrade.  For instance, we don't want to allow 
        // the system upgrade someone to a admin or system role. 
        if(upgradeRequest.roleName != CONST.SUPPLIER_EDITOR_ROLE){
          ApiErrorHandler.sendError('You can only upgrade to specific roles.  This isnt one of them', 400, response);
          return;
        }

        // First we have to check if the organziation name is unique
        if (await this.organizationRepository.getOrgByName(upgradeRequest.organizationName)) {
            ApiErrorHandler.sendError('An organization with that name already exists', 400, response, CONST.errorCodes.ORG_NAME_TAKEN);
            return;
        }

        // We also want to make sure this user even exists
        let user = await this.repository.single(upgradeRequest.userId);
        if(!user){
          ApiErrorHandler.sendError('Could not find a user with that userID', 400, response);
          return;
        }

        // Also make sure the role exists.
        let role = await new RoleRepository().getRoleByName(upgradeRequest.roleName);
        if(!role){
          ApiErrorHandler.sendError('Could not find a role with that name', 400, response);
          return;
        }

        // Now that we've checked the request, we're going to create a new organization, put the user in that organziation, and upgrade the users role.
        // First create the org.
        let org: IOrganization = {
            name: upgradeRequest.organizationName,
            isSystem: false,
            type: OrganizationType.supplier,
            users: [upgradeRequest.userId],
        };

        let orgDoc = await this.organizationRepository.create(this.organizationRepository.createFromBody(org));

        user.roles.push(role);
        user.organizationId = orgDoc._id;

        await this.repository.update(user._id,user);

        const userUpgradeResponse: IUserUpgradeResponse = {
          organizationId: orgDoc._id
        };

        response.status(202).json(userUpgradeResponse);
    }
    catch (err) { ApiErrorHandler.sendError('There was an error with the upgrade user request', 400, response, null, err); }
}

  public async preCreateHook(user: IUserDoc): Promise<IUserDoc> {
    user.href = `${CONST.ep.API}${CONST.ep.USERS}/${user._id}`;
    user.password = await bcrypt.hash(user.password, CONST.SALT_ROUNDS);
    return user;
  }

  public async preSendResponseHook(user: IUserDoc): Promise<IUserDoc> {
    user.password = '';
    return user;
  }
}
