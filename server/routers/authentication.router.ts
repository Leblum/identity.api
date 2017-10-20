import { Router } from 'express';
import { AuthenticationController } from '../controllers/authentication.controller';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';

export class AuthenticationRouter  {
    public router: Router = Router();
    public controller = new AuthenticationController();
    public resource: string = '';

    public constructor() {
    }

    public getRouter(): Router {
        return this.router
            .post(`${this.resource}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.authenticate(request, response, next);
            })
            .post(`${this.resource}/refresh`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.refreshToken(request, response, next);
            });
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response{
        return new AuthenticationController().authMiddleware(request,response,next);
    }
}