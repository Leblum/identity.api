import mongoose = require('mongoose');
import { ConnectionOptions } from 'mongoose';
import { Config } from './config';
import log = require('winston');

/*  Add this retry logic to the database connection
function wait (timeout) {  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

async function requestWithRetry (url) {  
  const MAX_RETRIES = 10
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      return await request(url)
    } catch (err) {
      const timeout = Math.pow(2, i)
      console.log('Waiting', timeout, 'ms')
      await wait(timeout)
      console.log('Retrying', err.message, i)
    }
  }
}
*/

export class Database{

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