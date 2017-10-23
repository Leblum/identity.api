import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { User, IUserDoc, Permission, Role, Organization, IUser, IUserUpgradeRequest, IRole, ITokenPayload, IOrganization } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as supertest from 'supertest';
import * as chai from 'chai';
import { OrganizationType } from '../../enumerations';

const api = supertest.agent(App.server);  
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

@suite('Organization test')
class OrganizationTest {


    public static async before() {
        console.log('organization');
        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();
        await AuthUtil.seed();
    }

    // public static before(done) {
    //     console.log('organization only');
    //     // This code should only be called if this test is run as a single test.  When run in the suite along with
    //     // product this code is run by the user test.
    //     App.server.on('dbConnected', async () => {
    //         await Cleanup.clearDatabase();
    //         await DatabaseBootstrap.seed();
    //         await AuthUtil.seed();
    //         done();
    //     });
    // }

    public static async after(){
        await Cleanup.clearDatabase();
    }

    @test('simple verify setup')
    public async verify() {
        expect(1).to.equal(1);
        return;
    }

    @test('create an organization')
    public async create() {
        let org: IOrganization = {
            name: 'Daves Test Org',
            type: OrganizationType.supplier,
            isSystem: false,
        };

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORGANIZATIONS}`)
            .set("x-access-token", AuthUtil.systemAuthToken)
            .send(org);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('name');
        expect(response.body.name).to.equal(org.name);
        return;
    }

    @test('A user should be able to change the name of the organization.')
    public async updateAnOrganization() {
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

        // Now we have upgraded the user, time for them to reauth, so their org is correct on their token.
        let authResponse = await api
        .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "test22345@test.com",
            "password": "test1234"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('decoded');

        // Now we're going to try and use this auth token which should have the correct organization, and role, to update the organization name.
        let orgNameChangeRequest:IOrganization = {
            name: 'New Organization Name',
            isSystem: false,
            type: OrganizationType.supplier
        }

        let orgNameChangeResponse = await api
        .patch(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORGANIZATIONS}${CONST.ep.RESTRICTED}/${upgradeResponse.body.organizationId}`)
        .set("x-access-token", authResponse.body.token)
        .send(orgNameChangeRequest);

        expect(orgNameChangeResponse.status).to.equal(202);
        expect(orgNameChangeResponse.body).to.be.an('object');
        expect(orgNameChangeResponse.body).to.have.property('_id');
        expect(orgNameChangeResponse.body.name).to.equal(orgNameChangeRequest.name);

        return;
    }

}
