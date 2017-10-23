import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import {Request, Response, NextFunction} from 'express';

export class OrganizationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new OrganizationController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.ORGANIZATIONS;
    }

    public getRestrictedRouter(): Router {
        return this.router // Updates a single resource
        // Get Single Operation - Used by the mobile application to show organization name.
        .get(`${this.resource}${CONST.ep.RESTRICTED}/:id`, async (request: Request, response: Response, next: NextFunction) => {
            await this.controller.single(request, response, next);
        })
        // Will only update the name for the organization.  Won't change other details about the organization, for instance isSystem.
        .patch(`${this.resource}${CONST.ep.RESTRICTED}/:id`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.updateName(request, response, next);
        })
    }
}