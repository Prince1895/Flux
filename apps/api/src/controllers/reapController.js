const supabase = require('../config/supabaseClient');
const { assumeCustomerRole } = require('../services/awsService');
const { deleteEbsVolume, releaseElasticIp } = require('../services/reaperService');

exports.executeReap = async (req, res) => {
    try {
        const { zombieId } = req.params;
        const tenantId = req.user.user_metadata.tenant_id;
        const userId = req.user.id;

        console.log(`[Reaper] Initiating reap sequence for zombie: ${zombieId}`);

        // 1. Fetch the zombie resource and verify ownership
        const { data: zombie, error: zombieError } = await supabase
            .from('zombie_resources')
            .select('*, cloud_accounts(*)')
            .eq('id', zombieId)
            .eq('tenant_id', tenantId)
            .single();

        if (zombieError || !zombie) {
            return res.status(404).json({ error: 'Zombie resource not found or access denied.' });
        }

        if (zombie.status === 'reaped') {
            return res.status(400).json({ error: 'This resource has already been reaped.' });
        }

        // 2. Extract AWS credentials
        const account = zombie.cloud_accounts;
        const roleArn = account.credentials_json?.role_arn;

        if (!roleArn) {
            return res.status(400).json({ error: 'No IAM Role ARN found for this cloud account.' });
        }

        // 3. Assume Role
        console.log(`[Reaper] Assuming role ${roleArn}...`);
        const credentials = await assumeCustomerRole(roleArn);

        // 4. Execute the specific deletion command based on resource type
        const region = zombie.region || 'us-east-1';
        let actionMessage = '';

        console.log(`[Reaper] Terminating ${zombie.resource_type} -> ${zombie.external_id}`);

        if (zombie.resource_type === 'ebs_volume') {
            await deleteEbsVolume(credentials, region, zombie.external_id);
            actionMessage = `Deleted EBS Volume: ${zombie.external_id}`;
        } else if (zombie.resource_type === 'elastic_ip') {
            // Note: external_id for Elastic IPs in EC2 SDK usually needs the AllocationId.
            // Our scanner code preferred AllocationId.
            await releaseElasticIp(credentials, region, zombie.external_id);
            actionMessage = `Released Elastic IP: ${zombie.external_id}`;
        } else {
            return res.status(400).json({ error: `Unsupported resource type: ${zombie.resource_type}` });
        }

        // 5. Update the zombie status in Supabase
        const { error: updateError } = await supabase
            .from('zombie_resources')
            .update({
                status: 'reaped',
                reaped_at: new Date().toISOString()
            })
            .eq('id', zombieId);

        if (updateError) {
            console.error('Critical: Resource deleted in AWS but failed to update status in DB!', updateError);
            // We proceed to log it below anyway.
        }

        // 6. Generate the receipt log
        const { error: logError } = await supabase
            .from('reaping_logs')
            .insert([{
                tenant_id: tenantId,
                resource_id: zombieId,
                user_id: userId,
                action_taken: actionMessage,
                savings_achieved: zombie.estimated_monthly_cost
            }]);

        if (logError) {
            console.error('Failed to write reaping log:', logError);
        }

        console.log(`[Reaper] Successfully reaped ${zombieId}! Lost cost recovered.`);

        res.status(200).json({
            message: 'Resource permanently deleted from AWS!',
            action: actionMessage,
            savings_recovered_usd: zombie.estimated_monthly_cost
        });

    } catch (error) {
        console.error('[Reaper] Execution Error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during deletion.' });
    }
};
