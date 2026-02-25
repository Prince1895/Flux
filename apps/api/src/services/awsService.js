const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
// STSClient -main tool talk with the AWS
// AssumeRoleCommand -command to assume the role

/**
 * Assumes an IAM role in a customer's AWS account to get temporary credentials.
 * @param {string} roleArn - The ARN of the IAM role to assume (e.g., arn:aws:iam::123456789012:role/ReaperRole)
 * @param {string} sessionName - A name for the assumed role session (e.g., 'FluxSession')
 * @returns {Promise<Object>} Temporary AWS credentials (accessKeyId, secretAccessKey, sessionToken)
 */
const assumeCustomerRole = async (roleArn, sessionName = 'FluxSession') => {
    // Initialize the STS Client using our own backend's base credentials
    // (These base credentials will eventually be set via env variables in Railway)
    const stsClient = new STSClient({ region: process.env.AWS_REGION || 'us-east-1' });

    try {
        const command = new AssumeRoleCommand({
            RoleArn: roleArn,
            RoleSessionName: sessionName,
            // Optional: DurationSeconds - How long the credentials last (default is 1 hour)
        });

        const response = await stsClient.send(command);

        // Return the temporary credentials needed to initialize other AWS clients (like EC2)
        return {
            accessKeyId: response.Credentials.AccessKeyId,
            secretAccessKey: response.Credentials.SecretAccessKey,
            sessionToken: response.Credentials.SessionToken,
        };
    } catch (error) {
        console.error(`Error assuming role ${roleArn}:`, error);
        throw new Error('Failed to assume AWS role. Check permissions and trust relationships.');
    }
};

module.exports = {
    assumeCustomerRole,
};
