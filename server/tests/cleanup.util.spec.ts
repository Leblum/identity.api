//During the test the env variable is set to test
import { Database } from '../config/database/database';
import { App, server } from '../server';
import { User, IUserDoc, Permission, Role, Organization, EmailVerification, PasswordResetToken } from '../models';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { CONST } from "../constants";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));
import { suite, test, context, } from "mocha-typescript";

export class Cleanup {
    public static async closeConnections() {
        // mongoose.models = {};
        // mongoose.modelSchemas = {};
        // await mongoose.connection.close();
        // await App.server.close();
    }

    public static async clearDatabase() {
        if (process.env.NODE_ENV === 'integration') {
            await Permission.remove({});
            await Role.remove({});
            await User.remove({});
            await Organization.remove({});
            await EmailVerification.remove({});
            await PasswordResetToken.remove({});
        }
    }
}