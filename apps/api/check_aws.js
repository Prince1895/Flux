require('dotenv').config();
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');

const stsClient = new STSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const getIdentity = async () => {
    try {
        const response = await stsClient.send(new GetCallerIdentityCommand({}));
        console.log("SUCCESS! Here is who your backend actually is:");
        console.log(`Account ID: ${response.Account}`);
        console.log(`User ARN: ${response.Arn}`);
    } catch (err) {
        console.error("FAILED to authenticate backend user:", err.message);
    }
};

getIdentity();
