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

    public constructor(){
        super();
        this.resource = CONST.ep.USERS;
    }

    public getRouter(): Router {
        return super.getRouter()
            .post(`${this.resource}${CONST.ep.UPGRADE}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.upgradeUser(request, response, next);
            })
    }
}