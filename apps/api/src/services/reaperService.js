const { EC2Client, DeleteVolumeCommand, ReleaseAddressCommand } = require('@aws-sdk/client-ec2');

/**
 * Helper to initialize the EC2 client with temporary credentials
 */
const getEC2Client = (credentials, region) => {
    return new EC2Client({
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    });
};

/**
 * Permanently deletes an unattached EBS Volume from AWS.
 */
const deleteEbsVolume = async (credentials, region = 'us-east-1', volumeId) => {
    const client = getEC2Client(credentials, region);
    console.log(`Executing deletion of Volume ${volumeId} in ${region}...`);
    try {
        const command = new DeleteVolumeCommand({ VolumeId: volumeId });
        await client.send(command);
        return true;
    } catch (error) {
        console.error(`Error deleting volume ${volumeId}:`, error);
        throw error;
    }
};

/**
 * Permanently releases an unassociated Elastic IP back to AWS.
 */
const releaseElasticIp = async (credentials, region = 'us-east-1', allocationId) => {
    const client = getEC2Client(credentials, region);
    console.log(`Executing release of Elastic IP Allocation ${allocationId} in ${region}...`);
    try {
        const command = new ReleaseAddressCommand({ AllocationId: allocationId });
        await client.send(command);
        return true;
    } catch (error) {
        console.error(`Error releasing Elastic IP ${allocationId}:`, error);
        throw error;
    }
};

module.exports = {
    deleteEbsVolume,
    releaseElasticIp
};
