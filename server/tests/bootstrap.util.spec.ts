import { Database } from '../config/database/database';
import { App, server } from '../server-entry';
import { Config } from '../config/config';
import { CONST } from "../constants";
import { AuthUtil } from "./authentication.util.spec";
import { Cleanup } from "./cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../config/database/database-bootstrap";

import * as supertest from 'supertest';
import * as chai from 'chai';

const api = supertest.agent(App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

@suite('Bootstrap Suite -> ')
class BootstrapTest {

    // First we need to get some users to work with from the identity service
    public static before(done) {
        console.log('Testing bootstrap');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // product this code is run by the user test.
        App.server.on('dbConnected', async () => {
            await Cleanup.clearDatabase();
            await DatabaseBootstrap.seed();
            await AuthUtil.seed();

            done();
        });
    }

    public static async after() {
        await Cleanup.clearDatabase();
    }

    @test('Just setting up a test for testing initialization')
    public async initialize() {
        expect(1).to.be.equal(1);
        return;
    }
}
