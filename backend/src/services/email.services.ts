import { MailConfig, mailGenerator } from "../config/mail.config";
import { User } from "../model/user.model";
import nodeMailer from 'nodemailer';
const company_name = "Sancilo";
const domain = "http://localhost:3000";
export class EmailServices {

    static registerEmail(passcode: string, user: User) {
        let template = {
            body: {
                name: user.full_name,
                intro: `Welcome to ${company_name}. Your staff account has been successfully created, and we are pleased to have you join our organization.`,
                action: {
                    instructions: 'Here are your login credentials to access your staff portal:',
                    button: {
                        color: '#22BC66',
                        text: 'Go to Staff Portal',
                        link: `${domain}/login`
                    }
                },
                dictionary: {
                    'email': user.email,
                    'Password': passcode
                },
                outro: [
                    "Please keep your login credentials secure and do not share them with anyone.",
                    "We wish you success in your role and look forward to your contributions.",

                ]
            }

        }
        return mailSender(template, `Welcome to ${company_name}`, user.email);
    }
    static resetPasswordEmail(passcode: string, user: User) {
        let template = {
            body: {
                name: user.full_name,
                intro: `You have requested to reset your password. Please use the following code to reset your password:`,
                action: {
                    instructions: 'Here are your login credentials to access your staff portal:',
                    button: {
                        color: '#22BC66',
                        text: 'Go to Staff Portal',
                        link: `${domain}/login`
                    }
                },
                dictionary: {
                    'email': user.email,
                    'Password': passcode
                },
                outro: [
                    "Please keep your login credentials secure and do not share them with anyone.",
                    "We wish you success in your role and look forward to your contributions.",

                ]
            }

        }
        return mailSender(template, `Reset Password`, user.email);
    }


    static generateClientReplyEmail( customerName: string, responseDetails: string,subject:string,email:string ) {
        const emailBody = {
            body: {
                name: customerName,
                intro: "Thank you for contacting us! We’ve received your message and wanted to respond promptly.",
                table: {
                    data: [
                        {
                            item: "Our Response",
                            description: responseDetails
                        }
                    ],
                    columns: {
                        customWidth: {
                            item: "20%",
                            description: "80%"
                        },
                        customAlignment: {
                            item: "left",
                            description: "left"
                        }
                    }
                },
                outro: "If you have any additional questions or need further assistance, don’t hesitate to reach out again. We’re here to help!",
                action: {
                    instructions: "Visit our website for more resources or to contact us directly.",
                    button: {
                        color: "#22BC66",
                        text: "Visit "+company_name,
                        link: "https://youragency.com"
                    }
                }
            }
        };
        return mailSender(emailBody, subject, email);
        
    }


}


const mailSender = async (template: any, subject: string, email: string): Promise<Boolean> => {
    let transporter = nodeMailer.createTransport(MailConfig);
    const mail = mailGenerator.generate(template);
    let message = {
        from: `" ${company_name}" <infant0475@gmail.com>`,
        to: '<' + email + '>',
        subject: subject,
        html: mail,

    }

    try {
        await transporter.sendMail(message);
        console.log("Successfully sent to " + email);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
}
const mailSenderWithAttachment = async (template: any, subject: string, email: string, attachment: any): Promise<Boolean> => {
    let transporter = nodeMailer.createTransport(MailConfig);
    const mail = mailGenerator.generate(template);
    let message = {
        from: `" ${company_name}" <infant0475@gmail.com>`,
        to: '<' + email + '>',
        subject: subject,
        html: mail,
        attachments: [
            {
                filename: attachment.filename,
                content: Buffer.from(attachment.content, "utf-8"),
                contentType: attachment.contentType,
            },
        ],
    }

    try {
        await transporter.sendMail(message);
        console.log("Successfully sent to " + email);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
}