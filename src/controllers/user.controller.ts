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

  protected userRepository: IUserRepository = new UserRepository();

  constructor() {
    super();
  }

  public async preCreateHook(user: IUser): Promise<IUser> {
    user.href = `${Constants.API_ENDPOINT}${Constants.USERs_ENDPOINT}/${user._id}`;
    user.password = await bcrypt.hash(user.password, Constants.SALT_ROUNDS);
    return user;
  }

  public async preSendResponseHook(user: IUser): Promise<IUser> {
    user.password = '';
    return user;
  }
  
  public preUpdateHook(model: IUser): Promise<IUser>{
    model.href = `${Constants.API_ENDPOINT}${Constants.USERs_ENDPOINT}/${model._id}`;
    return Promise.resolve(model);
  }
}
