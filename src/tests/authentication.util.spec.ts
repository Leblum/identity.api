//During the test the env variable is set to test
import { Database } from '../config/database/database';
import { App, server } from '../server';
import { User, IUser, Organization, IOrganization } from '../models';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { Constants } from "../constants";
import { OrganizationRepository } from "../repositories/index";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));
var bcrypt = require('bcrypt');

export class AuthenticationUtil {

    public static async generateUserAuthToken() {

        // This will make sure we can call this method as much as we want, and 
        // we'll only create a new user if we need to. 
        let user = await User.findOne({ email: "integrationTestLeblum@leblum.com" });
        let guestOrg = await AuthenticationUtil.findGuestOrganization();
        if (!user) {
            let newUser = new User({
                firstName: "Dave",
                lastName: "Brown",
                email: "integrationTestLeblum@leblum.com",
                password: "test1234",
                isTokenExpired: false,
                organizationId: guestOrg.id,
                isEmailVerified: true,
            });
            newUser.password = await bcrypt.hash(newUser.password, Constants.SALT_ROUNDS);
            newUser = await newUser.save();
        }

        let res = await chai.request(App.express)
            .post(`/authenticate`)
            .send({
                "email": "integrationTestLeblum@leblum.com",
                "password": "test1234"
            });

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        return res.body.token;
    }

    public static async generateSystemAuthToken() {

        // This will make sure we can call this method as much as we want, and 
        // we'll only create a new user if we need to. 
        let user = await User.findOne({ email: "system@leblum.com" });

        let res = await chai.request(App.express)
            .post(`/authenticate`)
            .send({
                "email": "system@leblum.com",
                "password": Config.active.get('systemUserPassword')
            });

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        return res.body.token;
    }

    public static async findGuestOrganization(): Promise<IOrganization> {
        return await new OrganizationRepository().getGuestOrganization();
    }
}