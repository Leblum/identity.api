//During the test the env variable is set to test
import { Database } from '../../config/database/database';
import { App, server } from '../../server';
import { User, IUserDoc, Permission, Role, Organization, IUser } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";

import * as supertest from 'supertest';
import * as chai from 'chai';
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

const api = supertest(`http://localhost:${Config.active.get('port')}`);

let userAuthToken: string;
let systemAuthToken: string;
let guestOrgId: string;
//Our parent block
describe('Users', () => {

    before(async () => {

        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();

        userAuthToken = await AuthenticationUtil.generateUserAuthToken();
        systemAuthToken = await AuthenticationUtil.generateSystemAuthToken();
        guestOrgId = (await AuthenticationUtil.findGuestOrganization()).id;
    });

    it('allow a user to register', async () => {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser@leblum.com",
            "password":"test354435",
            "isTokenExpired": false
        }

        let response = await api
            .post(`${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.equal(user.email);
        expect(response.body.password.length).to.be.equal(0);
    })

    // Testing the list method.
    it('should list all the users', async () => {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0); // we have a seed user, and a new temp user.
    });

    it('should NOT list all the users for a regular user', async () => {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", userAuthToken);

        expect(response.status).to.equal(403);
        expect(response.body).to.be.an('object');
    });

    it('should NOT Allow delete with a regular user', async () => {

        let user: IUser = {
            email: "6788765768@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };
        //By calling this I'll generate an id
         let userDoc = new User(user)

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);
        
        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", userAuthToken);

        expect(response.status).to.equal(403);
        expect(response.body).to.be.an('object');
    });

    it('should create a user', async () => {
        let user: IUser = {
            firstName: "Dave",
            lastName: "Brown",
            email: "test2@test.com",
            password: "test1234",
            isTokenExpired: false,
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('email');
        expect(response.body.model.email).to.equal(user.email);
        expect(response.body.model.password).should.not.equal(user.password);
    });

    it('should create the user in the db and make sure get by id works', async () => {

        let user: IUser = {
            email: "test2345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let userDoc = await new User(user).save();

        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", systemAuthToken)

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('email');
        expect(response.body.email).to.equal(user.email);
    });

    it('it should update a user', async () => {
        let user: IUser = {
            email: "qwerqwer@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let userDoc = await new User(user).save();

        let userUpdate = {
            _id: `${userDoc.id}`,
            firstName: "Don",
            lastName: "Jaun",
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", systemAuthToken)
            .send(userUpdate);

        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('firstName');
        expect(response.body.model.firstName).to.equal(userUpdate.firstName);
    });

    it('it should delete a user', async () => {
        let user: IUser = {
            email: "24352345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);
        
        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${createResponse.body.model._id}`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('ItemRemoved');
        expect(response.body).to.have.property('ItemRemovedId');
        expect(response.body.ItemRemovedId).to.be.equal(createResponse.body.model._id);
        expect(response.body.ItemRemoved.email).to.be.equal(user.email);
    });

    it('should return a 404 on delete when the ID isnt there', async () => {

        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(404);
    });

    it('should return a 404 on update when the ID isnt there', async () => {

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(404);
    });

    after(async () => {
        await Cleanup.closeConnections();
    });

});
