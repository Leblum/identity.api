import { IPermission, Permission, Role, IRole, User, IUser, IOrganization, Organization, IUserDoc, IOrganizationDoc } from "../../models";
import { Config } from "../config";
import { CONST } from "../../constants";
import { OrganizationType } from "../../enumerations";
var bcrypt = require('bcrypt');
import log = require('winston');

export  class DatabaseBootstrap {

    // This teardown would be for testing only.  Careful with this guy.
    // public static async teardown(){
    //     let count = await Organization.count({});
    //     await Permission.remove({});
    //     await Role.remove({});
    //     await User.remove({});
    //     await Organization.remove({});
    // }
    
    public static async seed() {
        if (await Organization.count({}) === 0) {
            if(await Organization.count({}) === 0){
log.info('About to bootstrap the database.  This will insert a system org, and system user, along with default roles, and permissions');
            // For now all roles have all permissionss.  We're going to do our security on roles for now. 
            // Later we can modify these permissions to be just what we need.
            let permissions = await this.createAllPermissions();

            // We create the system organization first.
            let systemOrg: IOrganization = {
                name: 'system',
                isSystem: true,
                type: OrganizationType.system,
            };

            let savedSystemOrg: IOrganizationDoc = await new Organization(systemOrg).save();

            // Then we create a system user.
            let systemUser: IUser = {
                firstName: 'system',
                lastName: 'system',
                email: 'system@leblum.com',
                password: await bcrypt.hash(Config.active.get('systemUserPassword'), CONST.SALT_ROUNDS),
                roles: [await this.createSingleRole('admin', 'amdministrator', permissions)],
                isTokenExpired: false,
                organizationId: savedSystemOrg.id,
                isEmailVerified: true,
            };

            let savedSystemUser: IUserDoc = await new User(systemUser).save();

            //Now we need to link the system user back up to the database.
            savedSystemOrg.users = [savedSystemUser];
            savedSystemOrg.save();

            // Next we need to create a guest organization.  This will act as a holding place
            // for accounts that haven't been email verified, or in the middle of the signup process before an org has been created.
            let guestOrg: IOrganization = {
                name: 'guest',
                isSystem: false,
                type: OrganizationType.guest,
            };

            let guestOrgDoc = await new Organization(guestOrg).save();

            //now we create all the remaining roles
            await this.createSingleRole('guest', 'guest', permissions);
            await this.createSingleRole('impersonator', 'impersonator', permissions);
            await this.createSingleRole('supplier:owner', 'supplier owner access to sensitive info', permissions);
            await this.createSingleRole('supplier:user', 'supplier employee no access to sensitive info', permissions);
            }
        }
    }

    private static async createSingleRole(name: string, description: string, permissions: Array<IPermission>): Promise<IRole> {
        let role = new Role({
            name: name,
            description: description,
            permissions: permissions,
        });
        await role.save();
        return role;
    }

    private static async createAllPermissions(): Promise<Array<IPermission>> {
        let permissions: Array<IPermission> = new Array<IPermission>();
        permissions.push(await this.createSinglePermission('query', 'query', 'ability to query'));
        permissions.push(await this.createSinglePermission('delete', 'delete', 'ability to delete'));
        permissions.push(await this.createSinglePermission('blank', 'blank', 'ability to blank'));
        permissions.push(await this.createSinglePermission('utility', 'utility', 'ability to utility'));
        permissions.push(await this.createSinglePermission('count', 'count', 'ability to count'));
        permissions.push(await this.createSinglePermission('clear', 'clear', 'ability to clear'));
        permissions.push(await this.createSinglePermission('single', 'single', 'ability to single'));
        permissions.push(await this.createSinglePermission('create', 'create', 'ability to create'));
        permissions.push(await this.createSinglePermission('update', 'update', 'ability to update'));
        return permissions;
    }

    private static async createSinglePermission(name: string, value: string, description: string): Promise<IPermission> {
        let permission = new Permission({
            name: name,
            description: description,
            value: value,
        })
        await permission.save();
        return permission;
    }
}