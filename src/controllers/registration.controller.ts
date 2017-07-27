import { User, IUserDoc } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Config } from '../config/config';
import { ITokenPayload } from '../models/';
import { UserRepository, IOrganizationRepository, OrganizationRepository, RoleRepository, IRoleRepository } from "../repositories";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { CONST } from "../constants";
import { IEmailVerification, EmailVerification } from "../models/email-verification";
import { ApiErrorHandler } from "../api-error-handler";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class RegistrationController extends BaseController {

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';
    public defaultPopulationArgument = null;

    protected repository: IUserRepository = new UserRepository();
    protected organizationRepository: IOrganizationRepository = new OrganizationRepository();
    protected roleRepository: IRoleRepository = new RoleRepository();

    constructor() {
        super();
    }

    public async register(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            // First we have to check if the email address is unique
            if (await this.repository.findUserByEmail(request.body.email)) {
                ApiErrorHandler.sendError('That user email already exists',400, CONST.ErrorCodes.EMAIL_TAKEN, response);
            }
            if(!request.body.password || request.body.password.length < 6){
                ApiErrorHandler.sendError('Password must be supplied, and be at least 6 chars',400, CONST.ErrorCodes.PASSWORD_FAILED_CHECKS, response);
            }
            else {
                const guestOrg = await this.organizationRepository.getGuestOrganization();
                const guestRole = await this.roleRepository.getRoleByName('guest');

                let user: IUserDoc = this.repository.createFromBody(request.body);

                // now we need to do a few things to this user.
                // first up hash the password
                user.password = await bcrypt.hash(user.password, CONST.SALT_ROUNDS);

                // Add the organizationId to the user.  We will change this when we 'upgrade' the user.
                user.organizationId = guestOrg.id;

                // Next we need to add this user to the guest role.  Basically no permissions.
                user.roles.push(guestRole);
                user.isEmailVerified = false;

                user = await user.save();

                //Now we create an email verification record
                let emailVerification: IEmailVerification = {
                    isVerified: false,
                    userId: user.id,
                    validityLength: '1week'
                }

                await new EmailVerification(emailVerification).save();

                // TODO: Send the email verification

                //Clean up the user before we return it to the register call;
                user.password = '';
                response.status(201).json(user);
            }
        }
        catch (err) { this.sendAuthFailure(response, 401, err); }
    }

    public sendAuthFailure(response: Response, status: number, description: string): Response {
        return response.status(status).json({
            message: 'Authentication Failed',
            description: description
        });
    }
}
