import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { BaseRouter } from './base/base.router';
import { Constants } from '../constants';

export class UserRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new UserController();
    public resource: string;

    public constructor(){
        super();
        this.resource = Constants.UsersEndpoint;
    }
}