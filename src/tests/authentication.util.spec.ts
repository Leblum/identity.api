//During the test the env variable is set to test
import { Database } from '../config/database/database';
import { App, server } from '../server';
import { User, IUser, Organization, IOrganization } from '../models';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { Constants } from "../constants";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));
var bcrypt = require('bcrypt');

export class AuthenticationUtil {

    public static async generateUserAndAuthToken() {

        // This will make sure we can call this method as much as we want, and 
        // we'll only create a new user if we need to. 
        let user = await User.findOne({ email: "test@test.com" });
        let guestOrg = await AuthenticationUtil.findGuestOrganization();
        if (!user) {
            let newUser = new User({
                firstName: "Dave",
                lastName: "Brown",
                email: "test@test.com",
                passwordHash: "test1234",
                isTokenExpired: false,
                organizationId: guestOrg.id,
            });
            user.password = await bcrypt.hash(user.password, Constants.SALT_ROUNDS);
            user = await user.save();
        }

        let res = await chai.request(App.express)
            .post(`/authenticate`)
            .send({
                "email": "test@test.com",
                "passwordHash": "test1234"
            });

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        return res.body.token;
    }

    public static async findGuestOrganization(): Promise<IOrganization>{
        return await Organization.findOne({name:'guest'});
    }
}