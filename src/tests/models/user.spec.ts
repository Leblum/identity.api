//During the test the env variable is set to test
import { Database } from '../../config/database';
import { App, server } from '../../server';
import { User, IUser } from '../../models';
import { Config } from '../../config/config';
import { Constants } from "../../constants";
import { AuthenticationUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";

import * as supertest from 'supertest';
import * as chai from 'chai';
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

const api = supertest(`http://localhost:${Config.active.get('port')}`);

let AuthToken: string;
//Our parent block
describe('Users', () => {

    before(async () => {
        //First we clear the users table.  Start with a clean slate.
        await User.remove({});

        AuthToken = await AuthenticationUtil.generateUserAndAuthToken();
    });

    // Testing the list method.
    it('should list all the users', async () => {
        let response = await api
            .get(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}`)
            .set("x-access-token", AuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.equal(1); // It's going to be 1, because we have our seed user that we're using for authentication
    });

    it('should create a user', async () => {
        let user = {
            firstName: "Dave",
            lastName: "Brown",
            username: "testUser2",
            email: "test2@test.com",
            passwordHash: "test1234",
            isTokenExpired: false
        };
        let response = await api
            .post(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}`)
            .set("x-access-token", AuthToken)
            .send(user);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('username');
        expect(response.body.model.username).to.equal(user.username);
        expect(response.body.model.passwordHash).should.not.equal(user.passwordHash);
    });

    it('should create the user in the db and make sure get by id works', async () => {
        let user = new User({
            username: "test2435",
            email: "test2345@test.com",
            passwordHash: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown"
        });

        user = await user.save();
        let response = await api
            .get(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}/${user.id}`)
            .set("x-access-token", AuthToken)

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('username');
        expect(response.body.username).to.equal(user.username);
    });

    it('it should update a user', async () => {
        let user = new User({
            username: "test2435466",
            email: "test234665@test.com",
            passwordHash: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown"
        });

        user = await user.save();

        let iuser = {
            _id: `${user.id}`,
            firstName: "Don",
            lastName: "Jaun",
        };

        let response = await api
            .put(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}/${user.id}`)
            .set("x-access-token", AuthToken)
            .send(iuser);

        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('firstName');
        expect(response.body.model.firstName).to.equal(iuser.firstName);
    });

    it('it should delete a user', async () => {
        let user= new User({
            firstName: "Dave",
            lastName: "Brown",
            username: "testUser552",
            email: "tes55t2@test.com",
            passwordHash: "test1234",
            isTokenExpired: false
        });

        let createResponse = await api
            .post(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}`)
            .set("x-access-token", AuthToken)
            .send(user);
        
        let response = await api
            .delete(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}/${user.id}`)
            .set("x-access-token", AuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('ItemRemoved');
        expect(response.body).to.have.property('ItemRemovedId');
        expect(response.body.ItemRemovedId).to.be.equal(user.id);
        expect(response.body.ItemRemoved.username).to.be.equal(user.username);
    });

    it('should return a 404 on delete when the ID isnt there', async () => {

        let response = await api
            .delete(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", AuthToken);

        expect(response.status).to.equal(404);
    });

    it('should return a 404 on update when the ID isnt there', async () => {

        let response = await api
            .put(`${Constants.APIEndpoint}${Constants.APIVersion1}/${Constants.UsersEndpoint}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", AuthToken);

        expect(response.status).to.equal(404);
    });

    after(async () => {
        await Cleanup.cleanup();
    });

});
