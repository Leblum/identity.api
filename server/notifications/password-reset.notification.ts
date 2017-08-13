import * as request from "superagent";
import { Config } from "../config/config";
import log = require('winston');

export class PasswordResetNotification {
    public static async sendPasswordResetEmail(emailAddress: string, id: string): Promise<void> {
        try{

        let mandrillResponse = await request
            .post('https://mandrillapp.com/api/1.0/messages/send-template.json')
            .send({
                "key": `${Config.active.get('mandrillApiKey')}`,
                "template_name": "reset-your-password",
                "template_content": [],
                "message": {
                    "from_email": "no-reply@leblum.com",
                    "to": [
                        {
                            "email": `${emailAddress}`
                        }
                    ],
                    "headers": {
                        "Reply-To": "no-reply@leblum.com"
                    },
                    "global_merge_vars": [
                        {
                            "name": "PASSWORD_RESET_LINK",
                            "content": `https://leblum.io/reset-password?id=${id}`
                        }
                    ],
                    "merge_vars": []
                },
                "tracking_domain": "leblum.com",
                "signing_domain": "leblum.com",
                "return_path_domain": "leblum.com",
                "merge": true,
                "merge_language": "mailchimp",
                "async": false
            });
        }
        catch(err){
            log.error('There was a problem sending a password reset email to mandrill', {
                mandrillResponse: err && err.response && err.response.body ? err.response.body: err
            });
            throw ({
                message: 'There was a problem sending the password reset email',
                mandrillResponse: err && err.response && err.response.body ? err.response.body: err
            })
        }

        return;
    }
}