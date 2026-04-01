const {
    EC2Client,
    DeleteVolumeCommand,
    ReleaseAddressCommand,
    TerminateInstancesCommand,
    DeleteSnapshotCommand,
    DeleteNatGatewayCommand,
    DeleteSecurityGroupCommand,
} = require('@aws-sdk/client-ec2');

const {
    ElasticLoadBalancingV2Client,
    DeleteLoadBalancerCommand,
} = require('@aws-sdk/client-elastic-load-balancing-v2');

/**
 * Helper to initialize clients with temporary credentials
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

const getELBv2Client = (credentials, region) => {
    return new ElasticLoadBalancingV2Client({
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING REAPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently deletes an unattached EBS Volume from AWS.
 */
const deleteEbsVolume = async (credentials, region = 'us-east-1', volumeId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Deleting EBS Volume ${volumeId} in ${region}...`);
    const command = new DeleteVolumeCommand({ VolumeId: volumeId });
    await client.send(command);
    return true;
};

/**
 * Permanently releases an unassociated Elastic IP back to AWS.
 */
const releaseElasticIp = async (credentials, region = 'us-east-1', allocationId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Releasing Elastic IP ${allocationId} in ${region}...`);
    const command = new ReleaseAddressCommand({ AllocationId: allocationId });
    await client.send(command);
    return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW REAPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently TERMINATES a stopped EC2 instance.
 * WARNING: This is irreversible. The instance and its root EBS volume
 * (if DeleteOnTermination=true) will be permanently deleted.
 */
const terminateInstance = async (credentials, region = 'us-east-1', instanceId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Terminating EC2 instance ${instanceId} in ${region}...`);
    const command = new TerminateInstancesCommand({ InstanceIds: [instanceId] });
    await client.send(command);
    return true;
};

/**
 * Permanently deletes an EBS Snapshot.
 */
const deleteSnapshot = async (credentials, region = 'us-east-1', snapshotId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Deleting EBS Snapshot ${snapshotId} in ${region}...`);
    const command = new DeleteSnapshotCommand({ SnapshotId: snapshotId });
    await client.send(command);
    return true;
};

/**
 * Permanently deletes an Application or Network Load Balancer.
 * Note: This does not delete associated target groups — those would need separate cleanup.
 */
const deleteLoadBalancer = async (credentials, region = 'us-east-1', loadBalancerArn) => {
    const client = getELBv2Client(credentials, region);
    console.log(`[Reaper] Deleting Load Balancer ${loadBalancerArn} in ${region}...`);
    const command = new DeleteLoadBalancerCommand({ LoadBalancerArn: loadBalancerArn });
    await client.send(command);
    return true;
};

/**
 * Deletes an idle NAT Gateway and returns its Elastic IP back to your account.
 * The associated Elastic IP is NOT automatically released — it becomes unattached
 * and will be picked up by the Elastic IP scanner on the next scan.
 */
const deleteNatGateway = async (credentials, region = 'us-east-1', natGatewayId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Deleting NAT Gateway ${natGatewayId} in ${region}...`);
    const command = new DeleteNatGatewayCommand({ NatGatewayId: natGatewayId });
    await client.send(command);
    return true;
};

/**
 * Deletes an unused Security Group.
 * Will fail if the SG is still referenced by another SG rule — AWS enforces this.
 */
const deleteSecurityGroup = async (credentials, region = 'us-east-1', groupId) => {
    const client = getEC2Client(credentials, region);
    console.log(`[Reaper] Deleting Security Group ${groupId} in ${region}...`);
    const command = new DeleteSecurityGroupCommand({ GroupId: groupId });
    await client.send(command);
    return true;
};

module.exports = {
    deleteEbsVolume,
    releaseElasticIp,
    terminateInstance,
    deleteSnapshot,
    deleteLoadBalancer,
    deleteNatGateway,
    deleteSecurityGroup,
};
