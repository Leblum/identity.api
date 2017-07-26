import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { BaseRouter } from './base/base.router';
import { Constants } from '../constants';

export class AddressRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new AddressController();
    public resource: string;

    public constructor(){
        super();
        this.resource = Constants.AddressesEndpoint;
    }
}