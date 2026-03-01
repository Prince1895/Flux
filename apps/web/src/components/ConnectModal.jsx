import { useState } from 'react';
import { X, HelpCircle, Terminal, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

const ConnectModal = ({ onClose }) => {
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [step, setStep] = useState(1);

    // AWS Form State
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
            const accountRes = await api.addAccount({
                name: accountAlias,
                provider: 'aws',
                credentials_json: { role_arn: roleArn }
            });
            const accountId = accountRes.account.id;
            await api.runScan(accountId);
            // Refresh dashboard by closing modal and reloading
            onClose();
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to connect account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '850px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out'
            }}>

                {step === 1 ? (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Connect your infrastructure</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>Select a cloud provider to begin importing your resources.</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - Provider Cards */}
                        <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', backgroundColor: '#fafafa' }}>

                            {/* AWS Card */}
                            <div
                                onClick={() => setSelectedProvider('aws')}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    border: `2px solid ${selectedProvider === 'aws' ? '#00d65b' : '#f3f4f6'}`,
                                    padding: '2rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: selectedProvider === 'aws' ? '0 10px 15px -3px rgba(0, 214, 91, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <img src="/aws-icon.png" alt="AWS" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '12px' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Amazon Web Services</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 2rem 0' }}>EC2, S3, RDS & more</p>

                                <div style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', backgroundColor: selectedProvider === 'aws' ? '#e0f2e9' : '#f9fafb', color: selectedProvider === 'aws' ? '#00d65b' : '#4b5563', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>
                                    {selectedProvider === 'aws' ? 'Selected' : 'Select AWS'}
                                </div>
                            </div>

                            {/* GCP Card */}
                            <div
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    border: `2px solid #f3f4f6`,
                                    padding: '2rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    cursor: 'not-allowed',
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <img src="/gcp-icon.png" alt="Google Cloud" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '12px', filter: 'grayscale(50%)' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Google Cloud</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 2rem 0' }}>GKE, BigQuery, App Engine</p>

                                <div style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Available soon
                                </div>
                            </div>

                            {/* Azure Card */}
                            <div
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    border: `2px solid #f3f4f6`,
                                    padding: '2rem 1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    cursor: 'not-allowed',
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <img src="/azure-icon.png" alt="Microsoft Azure" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '12px', filter: 'grayscale(50%)' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Microsoft Azure</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 2rem 0' }}>VMs, Blob Storage, Cosmos</p>

                                <div style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Available soon
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
                            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#00d65b', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                                <HelpCircle size={16} /> Documentation
                            </a>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={onClose} style={{ background: 'none', border: 'none', fontWeight: 600, color: '#4b5563', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                                    Cancel
                                </button>
                                <button
                                    disabled={!selectedProvider}
                                    onClick={() => setStep(2)}
                                    style={{
                                        backgroundColor: '#111827',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '0.6rem 2rem',
                                        borderRadius: '40px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: selectedProvider ? 'pointer' : 'not-allowed',
                                        opacity: selectedProvider ? 1 : 0.5,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Step 2: AWS configuration 
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem 2.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.15rem 0' }}>{selectedProvider === 'aws' ? 'Connect AWS Account' : 'Connect Account'}</h2>
                                    <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Configure cross-account access</p>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - AWS Form */}
                        <div style={{ padding: '2rem 2.5rem', backgroundColor: '#fafafa', flex: 1, overflowY: 'auto', maxHeight: '60vh' }}>
                            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Terminal color="#00d65b" size={20} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Step 1: Create an IAM Role in AWS</h3>
                                </div>
                                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    Create a new IAM Role in your AWS Console. Attach the <code>AWSEC2FullAccess</code> policy. Then use the following Trust Policy to allow our backend to assume the role.
                                </p>

                                <div style={{ position: 'relative', background: '#111827', padding: '1.25rem', borderRadius: '8px' }}>
                                    <pre style={{ color: '#e2e8f0', fontSize: '0.8rem', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
                                        <code>{trustPolicy}</code>
                                    </pre>
                                    <button
                                        onClick={copyToClipboard}
                                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.4rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {copied ? <CheckCircle size={14} color="#00d65b" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#00d65b', color: '#ffffff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>2</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Step 2: Connect the Role</h3>
                            </div>

                            <form id="aws-connect-form" onSubmit={handleConnect}>
                                {error && (
                                    <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Account Alias</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Production AWS"
                                        value={accountAlias}
                                        onChange={(e) => setAccountAlias(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#00d65b'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>IAM Role ARN</label>
                                    <input
                                        type="text"
                                        placeholder="arn:aws:iam::123456789012:role/Flux_reaper"
                                        value={roleArn}
                                        onChange={(e) => setRoleArn(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#00d65b'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.25rem 2.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setStep(1)} type="button" style={{ background: 'none', border: 'none', fontWeight: 600, color: '#4b5563', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    form="aws-connect-form"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#00d65b',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '0.6rem 2rem',
                                        borderRadius: '40px',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        boxShadow: '0 4px 12px rgba(0, 214, 91, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {loading ? 'Connecting...' : 'Connect & Scan'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConnectModal;
