const newRelic = require('newrelic');
import * as express from 'express';
import * as http from 'http';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as helmet from 'helmet';
import * as routers from './routers';

import { ObjectId } from 'bson';
import { join } from 'path';
import { json, urlencoded } from 'body-parser';
import { mongoose, Database } from './config/database/database';
import { DatabaseBootstrap } from './config/database/database-bootstrap';
import { CONST } from './constants';
import { Config } from './config/config';
import { Router } from 'express';
import { ApiErrorHandler } from './api-error-handler';

import methodOverride = require('method-override');
import log = require('winston');
import { authz } from "./controllers/authorization";


// Creates and configures an ExpressJS web server.
class Application {

  // ref to Express instance
  public express: express.Application;
  public currentDatabase: Database;
  public server: http.Server;

  private setupComplete: boolean = false;

  // Run configuration methods on the Express instance.
  constructor() {
    log.info('Starting up Express Server.');

    this.checkEnvironment();

    this.express = express();
    this.logging();      // Initialize logging 
    this.healthcheck();  // Router for the healthcheck
    this.loggingClientEndpoint();
    this.connectDatabase();     // Setup database connection
    this.secure();       // Turn on security measures
    this.swagger();      // Serve up swagger, this is before authentication, as swagger is open
    this.middleware();   // Setup the middleware
    this.routes();       // Setup routers for all the controllers
    this.handlers();     // Any additional handlers, home page, etc.

    this.server = this.express.listen(Config.active.get('port'));

    log.info(`Listening on http://localhost:${Config.active.get('port')}`);
  }

  // Here we're going to make sure that the environment is setup.  
  // We're also going to double check that nothing goofy is going on.
  private checkEnvironment() {
    if (!process.env.NODE_ENV) {
      throw JSON.stringify({
        error: 'You must have a node environment set: NODE_ENV',
        message: 'You can set a node environemnt using set NODE_ENV development. Be sure to close and reopen any active console windows',
      });
    }
    else {
      log.info(`Current Environment set via environment variables (NODE_ENV):${process.env.NODE_ENV}`);
    }
  }

  // We want to configure logging so that if we're outputting it to the console
  // it's nice and colorized, otherwise we remove that transport.
  private logging(): void {
    if (Config.active.get('isConsoleLoggingActive')) {
      log.remove(log.transports.Console);
      // When developing locally you can turn on the colorization, but if you leave
      // on, then the logs will be all kinds of messed up. 
      log.add(log.transports.Console, { colorize: false });
      this.express.use(morgan('dev')); //Using morgan middleware for logging all requests.  the 'dev' here is just a particular format.
    }
    else {
      log.remove(log.transports.Console);
    }
  }

  private healthcheck() {
    this.express.get('/healthcheck', (request: express.Request, response: express.Response) => {
      response.statusCode = this.setupComplete ? 200 : 500;
      response.json({
        ApplicationName: CONST.APPLICATION_NAME,
        StatusCode: this.setupComplete ? 200 : 500,
        SetupComplete: this.setupComplete,
      });
    });
  }

  private loggingClientEndpoint() {
    this.express.post('/clientlogs', (request: express.Request, response: express.Response) => {
      log.log(request.body.level, request.body.message);
    });
  }

  private async connectDatabase() {
    this.currentDatabase = new Database();
    let connected = await this.currentDatabase.connect();
    // Be very careful with this line.
    ///asd9f9as78df98sadjawait DatabaseBootstrap.teardown();
    await DatabaseBootstrap.seed();

    this.setupComplete = connected as boolean;
    log.info('Completed Setup, boostrapped database, database now online');
  }

  private secure() {
    //app.use(helmet()); //Protecting the app from a lot of vulnerabilities turn on when you want to use TLS.
  }

  // Configure Express middleware.
  private middleware(): void {
    log.info('Initializing Middleware');
    this.express.disable('x-powered-by');
    this.express.use(json());
    this.express.use(urlencoded({ extended: true }));
    this.express.use(methodOverride(function (req) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
    }));
    // compress all requests
    this.express.use(compression());
  }

  private routes(): void {
    log.info('Initializing Routers');
    // The authentication endpoint is 'Open', and should be added to the router pipeline before the other routers
    this.express.use(CONST.ep.AUTHENTICATION, new routers.AuthenticationRouter().getRouter());
    this.express.use(`${CONST.ep.V1}${CONST.ep.REGISTER}`, new routers.RegistrationRouter().getRouter());
    this.express.use('/api*', new routers.AuthenticationRouter().authMiddleware);

    //Basically the users can authenticate, and register, but much past that, and you're going to need an admin user to access our identity api.
    this.express.use(CONST.ep.API + CONST.ep.V1, authz.permit('admin'), new routers.OrganizationRouter().getRouter());
    this.express.use(CONST.ep.API + CONST.ep.V1, authz.permit('admin'), new routers.UserRouter().getRouter());
    this.express.use(CONST.ep.API + CONST.ep.V1, authz.permit('admin'), new routers.RoleRouter().getRouter());
    this.express.use(CONST.ep.API + CONST.ep.V1, authz.permit('admin'), new routers.PermissionRouter().getRouter());

    log.info('Instantiating Default Error Handler Route');
    this.express.use((error: Error & { status: number }, request: express.Request, response: express.Response, next: express.NextFunction): void => {
      ApiErrorHandler.HandleApiError(error, request, response, next);
    });
  }

  // We want to return a json response that will at least be helpful for 
  // the root route of our api.
  private handlers(): void {
    this.express.get('/', (request: express.Request, response: express.Response) => {
      response.json({
        name: CONST.APPLICATION_NAME,
        description: 'An identity api for the leblum services',
        DocumentationLocation: `${Config.active.get('publicURL')}:${Config.active.get('port')}/api-docs`,
        APILocation: `${Config.active.get('publicURL')}:${Config.active.get('port')}/api`,
        AuthenticationEndpoint: `${Config.active.get('publicURL')}:${Config.active.get('port')}/api/authenticate`,
      })
    });

    this.express.get('*', function (req, res, next) {
      next({ message: `No router was found for your request, page not found.  Requested Page: ${req.originalUrl}`, status: 404 });
    });
  }

  // This will allow us to serve the static homepage for our swagger definition
  // along with the swagger ui explorer.
  private swagger(): void {
    this.express.use(CONST.ep.API_DOCS, express.static(__dirname + '/swagger/swagger-ui'));
    this.express.use(CONST.ep.API_SWAGGER_DEF, express.static(__dirname + '/swagger/'));
  }
}
export default new Application();