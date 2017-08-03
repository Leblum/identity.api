import mongoose = require('mongoose');
import { ConnectionOptions } from 'mongoose';
import { Config } from '../config';
import log = require('winston');

export class Database {
    public connect(): Promise<boolean | void> {
        const connectionOptions: any = {
            useMongoClient: true,
        }
        mongoose.Promise = require('bluebird');

        return mongoose.connect(Config.active.get('database.mongoConnectionString'), connectionOptions).then(() => {
            log.info(`Connected To Mongo Database: ${mongoose.connection.db.databaseName}`);
            return true;
        }).catch(function (err) {
            log.info('error while trying to connect with mongodb', err);
        });
    }
}

export { mongoose };