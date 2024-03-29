import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';

export class UserRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new UserController();
    public resource: string;

    public constructor() {
        super();
        this.resource = CONST.ep.USERS;
    }

    public getRestrictedRouter(): Router {
        return this.router
            // Get Single Operation
            .get(`${this.resource}${CONST.ep.RESTRICTED}/:id`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.single(request, response, next);
            })
            // Updates a single resource
            .put(`${this.resource}${CONST.ep.RESTRICTED}${CONST.ep.UPDATE_PASSWORD}/:id`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.updatePassword(request, response, next);
            })
            .patch(`${this.resource}${CONST.ep.RESTRICTED}/:id`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.updatePartial(request, response, next);
            })
    }

    public getRouter(): Router {
        return super.getRouter()
            .post(`${this.resource}${CONST.ep.UPGRADE}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.upgradeUser(request, response, next);
            })
    }
}