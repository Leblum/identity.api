import { IUserDoc, User, IUserUpgradeRequest, IOrganization, IUserUpgradeResponse, ITokenPayload, IUser } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IUserRepository, UserRepository, OrganizationRepository, IOrganizationRepository, RoleRepository } from "../repositories";
import { ApiErrorHandler } from '../api-error-handler';
import { OrganizationType, OwnershipType } from '../enumerations';
import { OrganizationController } from './index';
var bcrypt = require('bcrypt');

export class UserController extends BaseController {

  public isOwnershipRequired: boolean = true;
  public rolesRequiringOwnership: string[] = [CONST.GUEST_ROLE, CONST.PRODUCT_EDITOR_ROLE, CONST.SUPPLIER_EDITOR_ROLE];
  public addOwnerships(request: Request, response: Response, next: NextFunction, userDoc: IUserDoc): void {
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];
    // TODO Do we need to do something where we push users onto the organization as other owners?
    // Or is it only the first user who creates the organization?  Not sure.  IF we need to add users, then we need to do something different here,
    // and it needs to be called on update (right now this method is only called on create.Í)
    userDoc.ownerships = [{
      ownerId: currentToken.userId,
      ownershipType: OwnershipType.user
    }];
  }

  public isOwner(request: Request, response: Response, next: NextFunction, userDoc: IUserDoc): boolean {
    // We'll assume this is only for CRUD
    // Get the current token, so we can get the ownerId in this case organization id off of here.
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];

    // For now we're just going to check that the ownership is around organization.
    return super.isOwnerInOwnership(userDoc, currentToken.userId, OwnershipType.user);
  }

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

  public async updatePassword(request: Request, response: Response, next: NextFunction) {
    try {
      if (await this.isModificationAllowed(request, response, next)) {
        // The password change request should be shaped like a user
        let passwordChangeRequest: IUser = request.body as IUser;

        if (!request.body.password || request.body.password.length < 6) {
          ApiErrorHandler.sendError('Password must be supplied, and be at least 6 chars', 400, response, CONST.errorCodes.PASSWORD_FAILED_CHECKS);
          return;
        }

        // get the user from the repo
        let user = await this.repository.single(this.getId(request));

        // first up hash the password
        user.password = await bcrypt.hash(passwordChangeRequest.password, CONST.SALT_ROUNDS);

        await this.repository.save(user);

        // clear out the password, before we send it back.
        user.password = '';

        response.status(202).json(user);
      }
    } catch (error) { next(error) }
  }

  public async upgradeUser(request: Request, response: Response, next: NextFunction): Promise<any> {
    try {
      let upgradeRequest: IUserUpgradeRequest = request.body as IUserUpgradeRequest;

      // There are only specific roles we're going to allow for upgrade.  For instance, we don't want to allow 
      // the system to upgrade someone to a admin or system role. 
      if (upgradeRequest.roleName != CONST.SUPPLIER_EDITOR_ROLE) {
        ApiErrorHandler.sendError('You can only upgrade to specific roles.  This is not one of them', 400, response);
        return;
      }

      // First we have to check if the organziation name is unique
      if (await this.organizationRepository.getOrgByName(upgradeRequest.organizationName)) {
        ApiErrorHandler.sendError('An organization with that name already exists', 400, response, CONST.errorCodes.ORG_NAME_TAKEN);
        return;
      }

      // We also want to make sure this user even exists
      let user = await this.repository.single(upgradeRequest.userId);
      if (!user) {
        ApiErrorHandler.sendError('Could not find a user with that userID', 400, response);
        return;
      }

      // Also make sure the role exists.
      let role = await new RoleRepository().getRoleByName(upgradeRequest.roleName);
      if (!role) {
        ApiErrorHandler.sendError('Could not find a role with that name', 400, response);
        return;
      }

      // Now that we've checked the request, we're going to create a new organization, put the user in that organziation, and upgrade the users role.
      // First create the org.
      let org: IOrganization = {
        ownerships: [{
          ownershipType: OwnershipType.user,
          ownerId: user.id
        }],
        name: upgradeRequest.organizationName,
        isSystem: false,
        type: OrganizationType.supplier,
        users: [upgradeRequest.userId],
      };

      let orgDoc = await this.organizationRepository.create(this.organizationRepository.createFromBody(org));

      user.roles.push(role);
      user.organizationId = orgDoc._id;

      await this.repository.update(user._id, user);

      const userUpgradeResponse: IUserUpgradeResponse = {
        organizationId: orgDoc._id
      };

      response.status(202).json(userUpgradeResponse);
    }
    catch (err) { ApiErrorHandler.sendError('There was an error with the upgrade user request', 400, response, null, err); }
  }

  public async preUpdateHook(user: IUserDoc, request: Request, response: Response, next: NextFunction): Promise<IUserDoc> {
    try {

      // If they are trying to change email.
      if (user && user.email) {
        if (await this.repository.findUserByEmail(user.email)) {
          ApiErrorHandler.sendError('That email is already in use, you cant update to that email address ', 400, response, CONST.errorCodes.EMAIL_TAKEN);
          return null; // This is basically a message to the base controller to stop processing the update. 
        }
      }
    } catch (err) { 
      next(err); 
    }

    return user;
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
