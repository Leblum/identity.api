import { User, IUserDoc } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Config } from '../config/config';
import { ITokenPayload, IBaseModelDoc } from '../models/';
import { UserRepository, IOrganizationRepository, OrganizationRepository, RoleRepository, IRoleRepository } from "../repositories";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { CONST } from "../constants";
import { IEmailVerification, EmailVerification } from "../models/email-verification";
import * as moment from 'moment';
import { ApiErrorHandler } from '../api-error-handler';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class AuthenticationController {

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';

    protected userRepository: IUserRepository = new UserRepository();
    protected organizationRepository: IOrganizationRepository = new OrganizationRepository();
    protected roleRepository: IRoleRepository = new RoleRepository();

    constructor() {
    }

    public async authenticate(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            const user = await this.userRepository.getUserForPasswordCheck(request.body.email);
            const passwordResult = await bcrypt.compare(request.body.password, user.password);
            if (passwordResult === false) {
                ApiErrorHandler.sendAuthFailure(response, 401, 'Password does not match');
                return;
            }

            // There's basically a soft expiration time on this token, which is set with moment,
            // and a hard expiration time set on this token with jwt sign.  
            const tokenPayload: ITokenPayload = {
                userId: user.id,
                organizationId: user.organizationId,
                // We're just going to put the name of the role on the token.
                roles: user.roles.map(role => { return role.name }),
                expiresAt: moment().add(moment.duration(1, 'day')).format(CONST.MOMENT_DATE_FORMAT)
            };

            const token = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                expiresIn: '25h'
            });

            // We're adding the decoded details because the jsonwebtoken library doesn't work on mobile. 
            // that's a problem, because we want to get the user id off the token, for update requests.
            response.json({
                authenticated: true,
                message: 'Successfully created jwt authentication token.',
                expiresAt: tokenPayload.expiresAt,
                token: token,
                decoded: tokenPayload
            });
        } catch (err) { ApiErrorHandler.sendAuthFailure(response, 401, err); }
    }

    /*
        1.  Issue JWT token with relatively short expiry, say 15min.    
        2.  Application checks token expiry date before any transaction requiring a token (token contains expiry date). If token has expired, then it first asks API to 'refresh' the token (this is done transparently to the UX).
        3.  API gets token refresh request, but first checks user database to see if a 'reauth' flag has been set against that user profile (token can contain user id). If the flag is present, then the token refresh is denied, otherwise a new token is issued.
    */
    public refreshToken(request: Request, response: Response, next: NextFunction): void {
        const token = request.body.token || request.query.token || request.headers['x-access-token'];
        // so you're going to get a request with a valid token, that hasn't expired yet
        // and you're going to return a new token with a new expiration date 
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decodedToken: ITokenPayload) => {
                if (err) {
                    ApiErrorHandler.sendAuthFailure(response, 401, 'Failed to authenticate token. The timer *may* have expired on this token.');
                } else {
                    //get the user from the database, and verify that they don't need to re login
                    this.userRepository.single(decodedToken.userId).then((user) => {
                        if (user.isTokenExpired) {
                            ApiErrorHandler.sendAuthFailure(response, 401, 'The user must login again to refresh their credentials');
                        }
                        else {

                            const tokenPayload: ITokenPayload = {
                                organizationId: user.organizationId,
                                userId: user.id,
                                roles: user.roles.map(role => { return role.name }),
                                expiresAt: moment().add(moment.duration(1, 'day')).format(CONST.MOMENT_DATE_FORMAT)
                            };

                            const newToken = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                                expiresIn: '25h'
                            });

                            response.json({
                                authenticated: true,
                                message: 'Successfully refreshed jwt authentication token.',
                                expiresAt: moment().add(moment.duration(1, 'day')).format(CONST.MOMENT_DATE_FORMAT),
                                token: newToken,
                                decoded: tokenPayload
                            });
                        }
                    }).catch((error) => { next(error) });
                }
            });
        }
        else {
            // If we don't have a token, return a failure
            ApiErrorHandler.sendAuthFailure(response, 403, 'No Authentication Token Provided');
        }
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response {
        try {
            const token = request.body.token || request.query.token || request.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                //Rewrite to use async or something 
                jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decoded) => {
                    if (err) { ApiErrorHandler.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`); }
                    else {
                        var token: ITokenPayload = decoded;
                        request[CONST.REQUEST_TOKEN_LOCATION] = token;
                        next();
                    }
                });
            } else {
                //No token, send auth failure
                return ApiErrorHandler.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
        } catch (err) {
            ApiErrorHandler.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }
}
