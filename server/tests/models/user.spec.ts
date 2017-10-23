import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { User, IUserDoc, Permission, Role, Organization, IUser, IUserUpgradeRequest, IRole, ITokenPayload } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as supertest from 'supertest';
import * as chai from 'chai';

const api = supertest.agent(App.server);  
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

@suite('User Test')
class UserTest {

    // There's a hack here.  The user test is the first one that's run,
    // so that's the test that waits for the 'dbConnected' event to be fired.  None of the other tests do this, but 
    // I couldn't seem to figure out another way around the race conditions that are created by the server starting up.
    public static async before() {
        console.log('Testing user test');
        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();

        await AuthUtil.seed();
    }

    public static async after(){
        //await Cleanup.clearDatabase();
    }

    @test('allow a user to register')
    public async register() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser@leblum.com",
            "password": "test354435",
            "isTokenExpired": false
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.equal(user.email);
        expect(response.body.password.length).to.be.equal(0);
        return;
    }

    @test('should list all the users')
    public async userList() {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0); // we have a seed user, and a new temp user.
        return;
    }

    @test('should NOT list all the users for a regular user')
    public async failUserListForAuthentication() {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0); // we have a seed user, and a new temp user.
        return;
    }

    @test('should NOT Allow delete with a regular user')
    public async noDeleteAllowed() {
        let user: IUser = {
            email: "6788765768@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };
        //By calling this I'll generate an id
        let userDoc = new User(user)

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(user);

        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", AuthUtil.userAuthToken);

        expect(response.status).to.equal(403);
        expect(response.body).to.be.an('object');
        return;
    }

    @test('should upgrade a user')
    public async upgdrade() {
        let user: IUser = {
            firstName: "Dave",
            lastName: "Brown",
            email: "test22345@test.com",
            password: "test1234",
            isTokenExpired: false,
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };

        let role: IRole = {
            name: CONST.SUPPLIER_EDITOR_ROLE,
            description: 'Testing supplier editor upgrade',
            permissions: [],
            href: ''
        }

        // Create the supplier editor role
        let roleResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ROLES}`)
        .set("x-access-token", AuthUtil.systemAuthToken)
        .send(role);

        // First we're going to create a user
        let userResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(user);

        let upgradeRequest: IUserUpgradeRequest = {
            organizationName:'DavesFlowers',
            roleName: CONST.SUPPLIER_EDITOR_ROLE,
            userId: userResponse.body._id
        };

        let upgradeResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.UPGRADE}`)
        .set("x-access-token", AuthUtil.systemAuthToken)
        .send(upgradeRequest);

        expect(upgradeResponse.status).to.equal(202);
        expect(upgradeResponse.body).to.be.an('object');
        expect(upgradeResponse.body).to.have.property('organizationId');
        return;
    }

    @test('should create a user')
    public async create() {
        let user: IUser = {
            firstName: "Dave",
            lastName: "Brown",
            email: "test2@test.com",
            password: "test1234",
            isTokenExpired: false,
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(user);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('email');
        expect(response.body.email).to.equal(user.email);
        expect(response.body.password).should.not.equal(user.password);
        return;
    }


    @test('should create the user in the db and make sure get by id works')
    public async getByIdWorking() {
        let user: IUser = {
            email: "test2345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };

        let userDoc = await new User(user).save();

        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", AuthUtil.systemAuthToken)

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('email');
        expect(response.body.email).to.equal(user.email);
        return;
    }

    @test('it should update a user')
    public async updateAUser() {
        let user: IUser = {
            email: "qwerqwer@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };

        let userDoc = await new User(user).save();

        let userUpdate = {
            _id: `${userDoc.id}`,
            firstName: "Don",
            lastName: "Jaun",
            email: 'ThisisaNewemail@leblum.com'
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(userUpdate);

        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('firstName');
        expect(response.body.firstName).to.equal(userUpdate.firstName);
        return;
    }

    @test('A user should be able to update their own details.')
    public async updateAUserBySelf() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "12345@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let registerResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);


        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "12345@leblum.com",
            "password": "test12345"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        let decodedToken: ITokenPayload = authResponse.body.decoded;

        let userUpdate = {
            _id: `${decodedToken.userId}`,
            firstName: "Don",
            lastName: "Jaun",
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.RESTRICTED}/${registerResponse.body._id}`)
            .set("x-access-token", authResponse.body.token)
            .send(userUpdate);

        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('firstName');
        expect(response.body.firstName).to.equal(userUpdate.firstName);
        return;
    }

    @test('A user not be able to change their email to one thats already in use')
    public async updateToTakenEmail() {

        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "asdf987asdf7@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let user2 = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "TAKENEMAIL@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let registerResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);

        let register2Response = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
        .send(user2);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);

        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "asdf987asdf7@leblum.com",
            "password": "test12345"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        let decodedToken: ITokenPayload = authResponse.body.decoded;

        let userUpdate = {
            email: 'TAKENEMAIL@leblum.com'
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.RESTRICTED}/${registerResponse.body._id}`)
            .set("x-access-token", authResponse.body.token)
            .send(userUpdate);
        console.log('Update Response: ', response.body);

        expect(response.status).to.equal(400);
        return;
    }

    @test('A user should NOT be able to update someone elses information')
    public async updateUserBySomeoneelse() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "1234546574567@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let user2 = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "secondUserForUpdate@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let registerResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);

        let register2Response = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
        .send(user2);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);

        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "secondUserForUpdate@leblum.com",
            "password": "test12345"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        let decodedToken: ITokenPayload = authResponse.body.decoded;

        let userUpdate = {
            firstName: "Don",
            lastName: "Jaun",
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.RESTRICTED}/${registerResponse.body._id}`)
            .set("x-access-token", authResponse.body.token)
            .send(userUpdate);
        console.log('Update Response: ', response.body);

        expect(response.status).to.equal(403);
        return;
    }

    @test('A user should be able to update their password.')
    public async updateUserPassword() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "12345239785239875@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let registerResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(registerResponse.status).to.equal(201);
        expect(registerResponse.body).to.be.an('object');
        expect(registerResponse.body.email).to.be.equal(user.email);
        expect(registerResponse.body.password.length).to.be.equal(0);


        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "12345239785239875@leblum.com",
            "password": "test12345"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        let decodedToken: ITokenPayload = authResponse.body.decoded;

        let userUpdate = {
            _id: `${decodedToken.userId}`,
            password: 'thisIsANewTestPassword'
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.RESTRICTED}${CONST.ep.UPDATE_PASSWORD}/${registerResponse.body._id}`)
            .set("x-access-token", authResponse.body.token)
            .send(userUpdate);

        expect(response.status).to.equal(202);

        // Now we try and re auth with that password.

        authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "12345239785239875@leblum.com",
            "password": "thisIsANewTestPassword"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        return;
    }

    @test('A user cant update another users password.')
    public async updateSomeElsesPassword() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "adsd9fg79sdfg@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let User1registerResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(User1registerResponse.status).to.equal(201);

        let user2 = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "attacker12344@leblum.com",
            "password": "test12345",
            "isTokenExpired": false
        }

        let AttackerregisterResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user2);
        expect(AttackerregisterResponse.status).to.equal(201);

        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "attacker12344@leblum.com",
            "password": "test12345"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        let decodedToken: ITokenPayload = authResponse.body.decoded;

        let userUpdate = {
            _id: `${User1registerResponse.body._id}`,
            password: 'thisIsANewTestPassword'
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}${CONST.ep.RESTRICTED}${CONST.ep.UPDATE_PASSWORD}/${User1registerResponse.body._id}`)
            .set("x-access-token", authResponse.body.token)
            .send(userUpdate);

        expect(response.status).to.equal(403);

        return;
    }

    @test('it should delete a user')
    public async deleteAUser() {
        let user: IUser = {
            email: "24352345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: AuthUtil.guestOrgId,
            isEmailVerified: false,
            isActive: true,
        };

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(user);

        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${createResponse.body._id}`)
            .set("x-access-token", AuthUtil.systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('ItemRemoved');
        expect(response.body).to.have.property('ItemRemovedId');
        expect(response.body.ItemRemovedId).to.be.equal(createResponse.body._id);
        expect(response.body.ItemRemoved.email).to.be.equal(user.email);
        return;
    }

    @test('should return a 404 on delete when the ID isnt there')
    public async onDeleteWithoutUserID404() {
        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", AuthUtil.systemAuthToken);

        expect(response.status).to.equal(404);
        return;
    }

    @test('should return a 404 on update when the ID isnt there')
    public async onUpdateWithoutUserID404() {
        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", AuthUtil.systemAuthToken);

        expect(response.status).to.equal(404);
        return;
    }
}
