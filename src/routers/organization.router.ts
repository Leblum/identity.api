import { Router } from 'express';
import { OrganizationController } from '../controllers/Organization.controller';
import { BaseRouter } from './base/base.router';
import { Constants } from '../constants';

export class OrganizationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new OrganizationController();
    public resource: string;

    public constructor(){
        super();
        this.resource = Constants.OrganizationsEndpoint;
    }
}