import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, CheckCircle, Copy, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connect = () => {
    const navigate = useNavigate();
    const [accountAlias, setAccountAlias] = useState('');
    const [roleArn, setRoleArn] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const trustPolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:user/reaper-backend-worker"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(trustPolicy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Save the Cloud Account in the Backend
            const accountRes = await api.addAccount({
                name: accountAlias,
                provider: 'aws',
                credentials_json: { role_arn: roleArn }
            });

            const accountId = accountRes.account.id;

            // 2. Trigger an immediate active scan of this new account
            await api.runScan(accountId);

            // 3. Return to central dashboard to see the new zombies
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to connect account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Connect AWS Account</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                    Grant GreenOps Reaper secure, cross-account access to scan and delete your cloud zombies.
                </p>

                {/* Instructions Block */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '2rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Terminal color="var(--primary-neon)" size={20} />
                        <h3 style={{ fontSize: '1.1rem' }}>Step 1: Create an IAM Role in AWS</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Create a new IAM Role in your AWS Console. Attach the <code>AWSEC2FullAccess</code> policy (or a custom policy granting <code>ec2:DeleteVolume</code> and <code>ec2:ReleaseAddress</code>). Then use the following Trust Policy to allow our backend to assume the role.
                    </p>

                    <div style={{ position: 'relative', background: '#0a0f1d', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <pre style={{ color: '#a78bfa', fontSize: '0.85rem', overflowX: 'auto', margin: 0 }}>
                            <code>{trustPolicy}</code>
                        </pre>
                        <button
                            onClick={copyToClipboard}
                            className="btn btn-outline"
                            style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', background: 'var(--bg-dark)' }}>
                            {copied ? <CheckCircle size={14} color="var(--primary-neon)" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* Connection Form */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--primary-neon)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>2</div>
                    <h3 style={{ fontSize: '1.1rem' }}>Step 2: Connect the Role</h3>
                </div>

                <form onSubmit={handleConnect}>
                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Account Alias (e.g. Production AWS)</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Production AWS"
                            value={accountAlias}
                            onChange={(e) => setAccountAlias(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label>IAM Role ARN</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="arn:aws:iam::123456789012:role/Flux_reaper"
                            value={roleArn}
                            onChange={(e) => setRoleArn(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem' }}>
                        {loading ? 'Authenticating & Scanning Account...' : 'Connect & Scan AWS Account'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Connect;
