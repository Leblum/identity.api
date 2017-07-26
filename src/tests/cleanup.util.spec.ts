//During the test the env variable is set to test
import { Database } from '../config/database/database';
import { App, server } from '../server';
import { User, IUser, Permission, Role, Organization } from '../models';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { CONST } from "../constants";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));


export class Cleanup {
    public static async  closeConnections() {
        mongoose.models = {};
        mongoose.modelSchemas = {};
        await mongoose.connection.close();
        await App.server.close();
    }

    public static async clearDatabase() {
        await Permission.remove({});
        await Role.remove({});
        await User.remove({});
        await Organization.remove({});
    }
}