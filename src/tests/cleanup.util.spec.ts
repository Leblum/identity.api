//During the test the env variable is set to test
import { Database } from '../config/database';
import { App, server } from '../server';
import { User, IUser } from '../models';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { Constants } from "../constants";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));


export class Cleanup {
    public static async  cleanup() {
        mongoose.models = {};
        mongoose.modelSchemas = {};
        await mongoose.connection.close();
        await App.server.close();
    }
}