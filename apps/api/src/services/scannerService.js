const { EC2Client, DescribeVolumesCommand, DescribeAddressesCommand } = require('@aws-sdk/client-ec2');

/**
 * Initializes the EC2 client using temporary credentials obtained from STS AssumeRole
 * @param {Object} credentials - The temporary credentials (accessKeyId, secretAccessKey, sessionToken)
 * @param {string} region - The AWS region to scan (default: us-east-1)
 * @returns {EC2Client}
 */
const getEC2Client = (credentials, region = 'us-east-1') => {
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
 * Scans for EBS Volumes that are not attached to any EC2 instance (Status = 'available')
 * @param {Object} credentials - Temporary AWS credentials
 * @param {string} region - The AWS region to scan
 * @returns {Promise<Array>} List of unattached zombie volumes
 */
const findUnattachedVolumes = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);

    try {
        // We ask AWS a specific question: Show us only the volumes where the status is "available"
        // "available" in AWS terms means the volume exists but is not plugged into any computer.
        const command = new DescribeVolumesCommand({
            Filters: [
                {
                    Name: 'status',
                    Values: ['available'],
                },
            ],
        });

        const response = await client.send(command);

        // Format the response so it's easier to read and save in our database later
        const zombieVolumes = response.Volumes.map(volume => ({
            resource_type: 'ebs_volume',
            external_id: volume.VolumeId,
            region: region,
            status: 'pending',
            // Rough estimate: standard gp2/gp3 volumes cost roughly $0.08 - $0.10 per GB per month
            estimated_monthly_cost: volume.Size * 0.10,
            detected_at: new Date().toISOString()
        }));

        return zombieVolumes;
    } catch (error) {
        console.error('Error finding unattached volumes:', error);
        throw error;
    }
};

/**
 * Scans for Elastic IPs that are not associated with any EC2 instance or Network Interface
 * @param {Object} credentials - Temporary AWS credentials
 * @param {string} region - The AWS region to scan
 * @returns {Promise<Array>} List of idle zombie IP addresses
 */
const findIdleIPs = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);

    try {
        const command = new DescribeAddressesCommand({});
        const response = await client.send(command);

        // Filter IPs that do NOT have an AssociationId (meaning they are just sitting idle)
        const zombieIPs = response.Addresses
            .filter(ip => !ip.AssociationId)
            .map(ip => ({
                resource_type: 'elastic_ip',
                external_id: ip.AllocationId || ip.PublicIp,
                region: region,
                status: 'pending',
                // AWS charges roughly $0.005 per hour for idle IPs (~$3.60 per month)
                estimated_monthly_cost: 3.60,
                detected_at: new Date().toISOString()
            }));

        return zombieIPs;
    } catch (error) {
        console.error('Error finding idle IPs:', error);
        throw error;
    }
};

module.exports = {
    findUnattachedVolumes,
    findIdleIPs,
};
