import { IUser, User } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Constants } from '../constants';
import { IUserRepository, UserRepository } from "../repositories";
var bcrypt = require('bcrypt');

export class UserController extends BaseController {
  public defaultPopulationArgument =
  {
    path: 'roles',
    // Permissions for the roles
    populate: { path: 'permissions' }
  };

  protected repository: IUserRepository = new UserRepository();

  constructor() {
    super();
  }

  public async preCreateHook(user: IUser): Promise<IUser> {
    user.href = `${Constants.APIEndpoint}${Constants.UsersEndpoint}/${user._id}`;
    user.passwordHash = await bcrypt.hash(user.passwordHash, Constants.SaltRounds);
    return user;
  }

  public async preSendResponseHook(user: IUser): Promise<IUser> {
    user.passwordHash = '';
    return user;
  }
  
  public preUpdateHook(model: IUser): Promise<IUser>{
    model.href = `${Constants.APIEndpoint}${Constants.UsersEndpoint}/${model._id}`;
    return Promise.resolve(model);
  }
}
