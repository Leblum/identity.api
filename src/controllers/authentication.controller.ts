import { User, IUser } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Config } from '../config/config';
import { ITokenPayload } from '../models/';
import { UserRepository } from "../repositories";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class AuthenticationController extends BaseController {

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';
    public defaultPopulationArgument = null;

    protected repository: IUserRepository = new UserRepository();

    constructor() {
        super();
    }

    public async authenticate(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            let user = await this.repository.getUserForPasswordCheck(request.body.username);
            let passwordResult = await bcrypt.compare(request.body.passwordHash, user.passwordHash);
            if (passwordResult === false) {
                this.sendAuthFailure(response, 401, 'Password does not match');
                return;
            }

            let tokenPayload: ITokenPayload = {
                userId: user.id,
                // We're just going to put the name of the role on the token.  
                roles: user.roles.map(role => { return role.name}),
                // TODO: We really need to get an organizationId on the token.  I think we're going to need it later.
                expiration: this.tokenExpiration
            };

            let token = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                expiresIn: tokenPayload.expiration
            });

            response.json({
                authenticated: true,
                message: 'Successfully created jwt authentication token.',
                expiresIn: tokenPayload.expiration,
                token: token,
            });
        } catch (err) { this.sendAuthFailure(response, 401, err); }
    }

    /*
        1.  Issue JWT token with relatively short expiry, say 15min.    
        2.  Application checks token expiry date before any transaction requiring a token (token contains expiry date). If token has expired, then it first asks API to 'refresh' the token (this is done transparently to the UX).
        3.  API gets token refresh request, but first checks user database to see if a 'reauth' flag has been set against that user profile (token can contain user id). If the flag is present, then the token refresh is denied, otherwise a new token is issued.
    */
    public refreshToken(request: Request, response: Response, next: NextFunction): void {
        let token = request.body.token || request.query.token || request.headers['x-access-token'];
        // so you're going to get a request with a valid token, that hasn't expired yet
        // and you're going to return a new token with a new expiration date 
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decodedToken: ITokenPayload) => {
                if (err) {
                    this.sendAuthFailure(response, 401, 'Failed to authenticate token. The timer *may* have expired on this token.');
                } else {
                     //get the user from the database, and verify that they don't need to re login
                    this.repository.single(decodedToken.userId).then( (user) => {
                        if (user.isTokenExpired) {
                            this.sendAuthFailure(response, 401, 'The user must login again to refresh their credentials');
                        }
                        else {

                            let tokenPayload: ITokenPayload = {
                                userId: user._id,
                                roles: user.roles.map(role => { return role.name}),
                                expiration: this.tokenExpiration
                            };

                            let newToken = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                                expiresIn: tokenPayload.expiration
                            });

                            response.json({
                                authenticated: true,
                                message: 'Successfully refreshed jwt authentication token.',
                                expiresIn: tokenPayload.expiration,
                                token: newToken,
                            });
                        }
                    }).catch((error) => { next(error) });
                }
            });
        }
        else {
            // If we don't have a token, return a failure
            this.sendAuthFailure(response, 403, 'No Authentication Token Provided');
        }
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response {
        try {
            let token = request.body.token || request.query.token || request.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decoded)=>{
                    if(err) { this.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`); }
                    else{
                        request['decodedToken'] = decoded;
                    }
                });
            } else {
                //No token, send auth failure
                return this.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
            next();
        } catch (err) {
            this.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }

    public sendAuthFailure(response: Response, status: number, description: string): Response {
        return response.status(status).json({
            message: 'Authentication Failed',
            description: description
        });
    }
}
