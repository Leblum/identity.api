import { Database } from '../config/database/database';
import { App, server } from '../server';
import { User, IUserDoc, Permission, Role, Organization, IUser, PasswordResetToken } from '../models';
import { Config } from '../config/config';
import { CONST } from "../constants";
import { AuthenticationUtil } from "./authentication.util.spec";
import { Cleanup } from "./cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import * as moment from 'moment';

import * as supertest from 'supertest';
import * as chai from 'chai';
import { DatabaseBootstrap } from "../config/database/database-bootstrap";
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
const api = supertest(`http://localhost:${Config.active.get('port')}`);
const bcrypt = require('bcrypt');

let userAuthToken: string;
let systemAuthToken: string;
let guestOrgId: string;

@suite('Reset Password Workflow')
class EmailVerificationTest {

    public static async before() {
        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();

        userAuthToken = await AuthenticationUtil.generateUserAuthToken();
        systemAuthToken = await AuthenticationUtil.generateSystemAuthToken();
        guestOrgId = (await AuthenticationUtil.findGuestOrganization()).id;
        return;
    }

    @test('register -> request password reset -> reset password')
    public async register() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser@leblum.com",
            "password": "test354435",
            "isTokenExpired": false
        }

        let userResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(userResponse.status).to.equal(201);
        expect(userResponse.body).to.be.an('object');
        expect(userResponse.body.email).to.be.equal(user.email);
        expect(userResponse.body.password.length).to.be.equal(0);
        expect(userResponse.body.isEmailVerified).to.be.false;

        //I also want to find this new user in the database. so I can compare the hashes. 

        // First we request a password reset.  This would be done by the user hitting the forgot password button
        // { email: email }
        let passwordResetRequest = {
            email: 'registeredUser@leblum.com'
        }

        let passwordResetTokenResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET_REQUEST}`)
            .send(passwordResetRequest);
        expect(userResponse.status).to.equal(200);
        expect(userResponse.body).to.be.an('object');
        expect(userResponse.body.message.length).to.be.greaterThan(0);

        // Now we should have a password reset request in the database for that user.
        // let's go find it, and make sure it created one.
        let passwordResetTokenDoc = await PasswordResetToken.findOne({userId: userResponse.body._id});
        expect(passwordResetTokenDoc).to.not.be.null;


        // Now we craft up a request that the client would send after setting a new password.
        let newPasswordRequest = { 
            passwordResetTokenId: passwordResetTokenDoc.id, 
            password: 'newPassword' 
        }

        // We post this new password to the api.
        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET}`).send(newPasswordRequest);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');

        // Now let's grab the user from the database, and see if the new password passes for bcrypt compare. 
        let updatedUserDoc = await User.findById(userResponse.body._id);
        const passwordResult = await bcrypt.compare(newPasswordRequest.password, updatedUserDoc.password);
        
        // We should see that the password has been properly updated, and now passes our hash comparison.
        expect(passwordResult).to.be.true;

        // Now let's double check by authenticating this user, with his new password.
        let authResponse = await api.post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "registeredUser@leblum.com",
            "password": "newPassword"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('token');

        return;
    }

    // TODO Add the test for trying to reset a password after the token has expired.  Making sure we're checking token expiration.

    public static async after() {
        await Cleanup.closeConnections();
        return;
    }
}
