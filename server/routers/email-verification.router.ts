import { Router } from 'express';
import { EmailVerificationController } from '../controllers/';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class EmailVerificationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new EmailVerificationController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.EMAILVERIFICATION;
    }
}