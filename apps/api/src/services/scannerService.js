const {
    EC2Client,
    DescribeVolumesCommand,
    DescribeAddressesCommand,
    DescribeInstancesCommand,
    DescribeSnapshotsCommand,
    DescribeNatGatewaysCommand,
    DescribeNetworkInterfacesCommand,
    DescribeSecurityGroupsCommand,
} = require('@aws-sdk/client-ec2');

const {
    ElasticLoadBalancingV2Client,
    DescribeLoadBalancersCommand,
    DescribeTargetGroupsCommand,
    DescribeTargetHealthCommand,
} = require('@aws-sdk/client-elastic-load-balancing-v2');

const {
    CloudWatchClient,
    GetMetricStatisticsCommand,
} = require('@aws-sdk/client-cloudwatch');

/**
 * Initializes the EC2 client using temporary credentials obtained from STS AssumeRole
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

const getELBv2Client = (credentials, region = 'us-east-1') => {
    return new ElasticLoadBalancingV2Client({
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    });
};

const getCloudWatchClient = (credentials, region = 'us-east-1') => {
    return new CloudWatchClient({
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
        },
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING SCANNERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans for EBS Volumes that are not attached to any EC2 instance (Status = 'available')
 */
const findUnattachedVolumes = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);
    try {
        const command = new DescribeVolumesCommand({
            Filters: [{ Name: 'status', Values: ['available'] }],
        });
        const response = await client.send(command);
        return response.Volumes.map(volume => ({
            resource_type: 'ebs_volume',
            external_id: volume.VolumeId,
            region,
            status: 'pending',
            estimated_monthly_cost: volume.Size * 0.10,
            detected_at: new Date().toISOString(),
            details: {
                size_gb: volume.Size,
                volume_type: volume.VolumeType,
                created: volume.CreateTime,
            },
        }));
    } catch (error) {
        console.error('[Scanner] Error finding unattached volumes:', error);
        throw error;
    }
};

/**
 * Scans for Elastic IPs that are not associated with any EC2 instance or Network Interface
 */
const findIdleIPs = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);
    try {
        const command = new DescribeAddressesCommand({});
        const response = await client.send(command);
        return response.Addresses
            .filter(ip => !ip.AssociationId)
            .map(ip => ({
                resource_type: 'elastic_ip',
                external_id: ip.AllocationId || ip.PublicIp,
                region,
                status: 'pending',
                estimated_monthly_cost: 3.60,
                detected_at: new Date().toISOString(),
                details: {
                    public_ip: ip.PublicIp,
                    allocation_id: ip.AllocationId,
                },
            }));
    } catch (error) {
        console.error('[Scanner] Error finding idle IPs:', error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW SCANNERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans for EC2 instances in a 'stopped' state.
 * Stopped instances still incur costs for attached EBS storage.
 */
const findStoppedInstances = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);
    try {
        const command = new DescribeInstancesCommand({
            Filters: [{ Name: 'instance-state-name', Values: ['stopped'] }],
        });
        const response = await client.send(command);
        const zombies = [];
        for (const reservation of response.Reservations) {
            for (const instance of reservation.Instances) {
                // Estimate: average 20GB root volume at $0.10/GB/month = $2/month base
                const storageCost = (instance.BlockDeviceMappings?.length || 1) * 20 * 0.10;
                const nameTag = instance.Tags?.find(t => t.Key === 'Name');
                zombies.push({
                    resource_type: 'ec2_instance',
                    external_id: instance.InstanceId,
                    region,
                    status: 'pending',
                    estimated_monthly_cost: storageCost,
                    detected_at: new Date().toISOString(),
                    details: {
                        name: nameTag?.Value || 'N/A',
                        instance_type: instance.InstanceType,
                        state: instance.State?.Name,
                        launch_time: instance.LaunchTime,
                        ebs_volumes: instance.BlockDeviceMappings?.length || 0,
                    },
                });
            }
        }
        return zombies;
    } catch (error) {
        console.error('[Scanner] Error finding stopped instances:', error);
        throw error;
    }
};

/**
 * Scans for EBS Snapshots older than 30 days.
 * Old forgotten snapshots accumulate costs at $0.05/GB/month.
 */
const findOldSnapshots = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);
    try {
        // Only look at snapshots owned by the account (not public AWS snapshots)
        const command = new DescribeSnapshotsCommand({ OwnerIds: ['self'] });
        const response = await client.send(command);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return response.Snapshots
            .filter(snap => new Date(snap.StartTime) < thirtyDaysAgo)
            .map(snap => ({
                resource_type: 'ebs_snapshot',
                external_id: snap.SnapshotId,
                region,
                status: 'pending',
                // $0.05 per GB per month
                estimated_monthly_cost: (snap.VolumeSize || 0) * 0.05,
                detected_at: new Date().toISOString(),
                details: {
                    volume_size_gb: snap.VolumeSize,
                    description: snap.Description || 'No description',
                    created: snap.StartTime,
                    volume_id: snap.VolumeId,
                },
            }));
    } catch (error) {
        console.error('[Scanner] Error finding old snapshots:', error);
        throw error;
    }
};

/**
 * Scans for Application/Network Load Balancers that have NO healthy targets.
 * An LB with no healthy targets still incurs the ~$16-22/month fixed fee.
 */
const findIdleLoadBalancers = async (credentials, region = 'us-east-1') => {
    const client = getELBv2Client(credentials, region);
    try {
        const lbResponse = await client.send(new DescribeLoadBalancersCommand({}));
        const zombies = [];

        for (const lb of lbResponse.LoadBalancers) {
            if (lb.State?.Code !== 'active') continue;

            // Get all target groups for this LB
            const tgResponse = await client.send(new DescribeTargetGroupsCommand({
                LoadBalancerArn: lb.LoadBalancerArn,
            }));

            let hasHealthyTarget = false;
            for (const tg of tgResponse.TargetGroups) {
                const healthResponse = await client.send(new DescribeTargetHealthCommand({
                    TargetGroupArn: tg.TargetGroupArn,
                }));
                const healthy = healthResponse.TargetHealthDescriptions.some(
                    t => t.TargetHealth?.State === 'healthy'
                );
                if (healthy) {
                    hasHealthyTarget = true;
                    break;
                }
            }

            if (!hasHealthyTarget) {
                zombies.push({
                    resource_type: 'load_balancer',
                    external_id: lb.LoadBalancerArn,
                    region,
                    status: 'pending',
                    // ALB fixed cost ~$16/month + LCU charges
                    estimated_monthly_cost: 16.00,
                    detected_at: new Date().toISOString(),
                    details: {
                        name: lb.LoadBalancerName,
                        type: lb.Type,
                        dns_name: lb.DNSName,
                        created: lb.CreatedTime,
                        target_groups: tgResponse.TargetGroups.length,
                    },
                });
            }
        }
        return zombies;
    } catch (error) {
        console.error('[Scanner] Error finding idle load balancers:', error);
        throw error;
    }
};

/**
 * Scans for NAT Gateways that processed ZERO bytes in the last 24 hours.
 * Idle NAT Gateways cost ~$32/month in fixed hourly charges.
 */
const findIdleNatGateways = async (credentials, region = 'us-east-1') => {
    const ec2Client = getEC2Client(credentials, region);
    const cwClient = getCloudWatchClient(credentials, region);
    try {
        const natResponse = await ec2Client.send(new DescribeNatGatewaysCommand({
            Filter: [{ Name: 'state', Values: ['available'] }],
        }));

        const zombies = [];
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const nat of natResponse.NatGateways) {
            const metricsResponse = await cwClient.send(new GetMetricStatisticsCommand({
                Namespace: 'AWS/NATGateway',
                MetricName: 'BytesOutToDestination',
                Dimensions: [{ Name: 'NatGatewayId', Value: nat.NatGatewayId }],
                StartTime: oneDayAgo,
                EndTime: now,
                Period: 86400, // 24 hours in seconds
                Statistics: ['Sum'],
            }));

            const totalBytes = metricsResponse.Datapoints.reduce((sum, dp) => sum + (dp.Sum || 0), 0);

            if (totalBytes === 0) {
                zombies.push({
                    resource_type: 'nat_gateway',
                    external_id: nat.NatGatewayId,
                    region,
                    status: 'pending',
                    // $0.045/hr fixed + data processing: ~$32/month
                    estimated_monthly_cost: 32.00,
                    detected_at: new Date().toISOString(),
                    details: {
                        subnet_id: nat.SubnetId,
                        vpc_id: nat.VpcId,
                        public_ip: nat.NatGatewayAddresses?.[0]?.PublicIp,
                        created: nat.CreateTime,
                        bytes_last_24h: totalBytes,
                    },
                });
            }
        }
        return zombies;
    } catch (error) {
        console.error('[Scanner] Error finding idle NAT gateways:', error);
        throw error;
    }
};

/**
 * Scans for Security Groups that are not attached to any network interface.
 * These are clutter — no direct cost but they can cause billing confusion and security risks.
 */
const findUnusedSecurityGroups = async (credentials, region = 'us-east-1') => {
    const client = getEC2Client(credentials, region);
    try {
        // Fetch all security groups (excluding the default SG which cannot be deleted)
        const sgResponse = await client.send(new DescribeSecurityGroupsCommand({}));
        const allSGs = sgResponse.SecurityGroups.filter(sg => sg.GroupName !== 'default');

        // Fetch all ENIs to see which SGs are actually in use
        const eniResponse = await client.send(new DescribeNetworkInterfacesCommand({}));
        const usedSGIds = new Set();
        for (const eni of eniResponse.NetworkInterfaces) {
            for (const group of (eni.Groups || [])) {
                usedSGIds.add(group.GroupId);
            }
        }

        return allSGs
            .filter(sg => !usedSGIds.has(sg.GroupId))
            .map(sg => ({
                resource_type: 'security_group',
                external_id: sg.GroupId,
                region,
                status: 'pending',
                estimated_monthly_cost: 0, // No direct cost, but important hygiene
                detected_at: new Date().toISOString(),
                details: {
                    name: sg.GroupName,
                    description: sg.Description,
                    vpc_id: sg.VpcId,
                    inbound_rules: sg.IpPermissions?.length || 0,
                    outbound_rules: sg.IpPermissionsEgress?.length || 0,
                },
            }));
    } catch (error) {
        console.error('[Scanner] Error finding unused security groups:', error);
        throw error;
    }
};

module.exports = {
    findUnattachedVolumes,
    findIdleIPs,
    findStoppedInstances,
    findOldSnapshots,
    findIdleLoadBalancers,
    findIdleNatGateways,
    findUnusedSecurityGroups,
};
