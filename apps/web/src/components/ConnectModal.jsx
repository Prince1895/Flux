import { useState } from 'react';
import { X, HelpCircle, Terminal, Copy, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
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
        "AWS": "arn:aws:iam::699475935298:user/backendworker"
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
            onClose();
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to connect account.');
        } finally {
            setLoading(false);
        }
    };

    const subStep = (num, title, children) => (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
                flexShrink: 0,
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: '#f0fdf4',
                border: '2px solid #00d65b',
                color: '#00d65b',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{num}</div>
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 0.4rem 0', fontSize: '0.9rem' }}>{title}</p>
                {children}
            </div>
        </div>
    );

    const tip = (text) => (
        <p style={{
            fontSize: '0.8rem', color: '#6b7280',
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: '6px', padding: '0.5rem 0.75rem',
            margin: '0.4rem 0 0 0', lineHeight: '1.5'
        }}>💡 {text}</p>
    );

    const highlight = (text) => (
        <code style={{
            background: '#f3f4f6', color: '#111827',
            padding: '0 0.35rem', borderRadius: '4px',
            fontFamily: 'monospace', fontSize: '0.82rem',
            fontWeight: 600
        }}>{text}</code>
    );

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
                animation: 'slideUp 0.3s ease-out',
                maxHeight: '90vh'
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
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: `2px solid #f3f4f6`, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'not-allowed', opacity: 0.7, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <img src="/gcp-icon.png" alt="Google Cloud" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '12px', filter: 'grayscale(50%)' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Google Cloud</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 2rem 0' }}>GKE, BigQuery, App Engine</p>
                                <div style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Available soon</div>
                            </div>

                            {/* Azure Card */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: `2px solid #f3f4f6`, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'not-allowed', opacity: 0.7, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <img src="/azure-icon.png" alt="Microsoft Azure" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1.5rem', borderRadius: '12px', filter: 'grayscale(50%)' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>Microsoft Azure</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 2rem 0' }}>VMs, Blob Storage, Cosmos</p>
                                <div style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Available soon</div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem 2.5rem', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.15rem 0' }}>Connect AWS Account</h2>
                                    <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Follow the steps below — takes about 5 minutes</p>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '2rem 2.5rem', backgroundColor: '#fafafa', overflowY: 'auto', flex: 1 }}>

                            {/* ── PART 1: Create IAM Role ── */}
                            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <Terminal color="#00d65b" size={20} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Part 1 — Create an IAM Role in AWS</h3>
                                </div>

                                {subStep('A', 'Open the AWS IAM Console',
                                    <>
                                        <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 0.4rem 0', lineHeight: '1.6' }}>
                                            Go to{' '}
                                            <a href="https://console.aws.amazon.com/iam/home#/roles" target="_blank" rel="noopener noreferrer"
                                                style={{ color: '#00d65b', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                AWS IAM → Roles <ExternalLink size={12} />
                                            </a>
                                            {' '}and sign in if you haven't already.
                                        </p>
                                        {tip('Make sure you are signed in as the root user or an admin user who can create IAM roles.')}
                                    </>
                                )}

                                {subStep('B', 'Click "Create role"',
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                                        On the Roles page, click the blue <strong>"Create role"</strong> button in the top-right corner.
                                        On the next screen, under <strong>"Trusted entity type"</strong>, choose{' '}
                                        {highlight('AWS account')}, then select{' '}
                                        {highlight('Another AWS account')} and enter your own Account ID
                                        (you can find it in the top-right corner of your AWS console).
                                    </p>
                                )}

                                {subStep('C', 'Replace the Trust Policy',
                                    <>
                                        <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 0.75rem 0', lineHeight: '1.6' }}>
                                            After the role is created, click its name → go to the <strong>"Trust relationships"</strong> tab → click{' '}
                                            <strong>"Edit trust policy"</strong>. Delete everything and paste in the JSON below:
                                        </p>
                                        <div style={{ position: 'relative', background: '#111827', padding: '1.25rem', borderRadius: '8px' }}>
                                            <pre style={{ color: '#e2e8f0', fontSize: '0.78rem', overflowX: 'auto', margin: 0, fontFamily: 'monospace', lineHeight: '1.6' }}>
                                                <code>{trustPolicy}</code>
                                            </pre>
                                            <button
                                                onClick={copyToClipboard}
                                                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.4rem 0.7rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                                                {copied ? <><CheckCircle size={13} color="#00d65b" /> Copied!</> : <><Copy size={13} /> Copy</>}
                                            </button>
                                        </div>
                                        {tip('Click "Update policy" to save the trust policy.')}
                                    </>
                                )}

                                {subStep('D', 'Attach the required permission policies',
                                    <>
                                        <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 0.5rem 0', lineHeight: '1.6' }}>
                                            Go to the <strong>"Permissions"</strong> tab of your new role → click <strong>"Add permissions" → "Attach policies"</strong>.
                                            Search for and attach ALL of the following:
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {[
                                                ['AmazonEC2ReadOnlyAccess', 'Lets Flux see EC2 instances, EBS volumes, snapshots'],
                                                ['AmazonS3ReadOnlyAccess', 'Lets Flux detect unused S3 buckets'],
                                                ['AmazonRDSReadOnlyAccess', 'Lets Flux find idle RDS databases'],
                                                ['AmazonEC2FullAccess', 'Required to actually reap (delete) zombie resources'],
                                            ].map(([policy, desc]) => (
                                                <div key={policy} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                                                    <CheckCircle size={14} color="#00d65b" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                    <div>
                                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#111827' }}>{policy}</span>
                                                        <span style={{ color: '#6b7280', fontSize: '0.78rem', marginLeft: '0.5rem' }}>— {desc}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {tip('You only need AmazonEC2FullAccess if you want Flux to auto-delete zombies. For read-only monitoring, skip it.')}
                                    </>
                                )}

                                {subStep('E', 'Name your role and create it',
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                                        Scroll down to <strong>"Role name"</strong>, enter {highlight('FluxReaperRole')} (or any name you like),
                                        then click <strong>"Create role"</strong>. Once created, click the role name to open it and
                                        copy its <strong>ARN</strong> — it looks like{' '}
                                        {highlight('arn:aws:iam::123456789012:role/FluxReaperRole')}.
                                    </p>
                                )}
                            </div>

                            {/* ── PART 2: Connect the Role ── */}
                            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ background: '#00d65b', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>2</div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Part 2 — Connect the Role to Flux</h3>
                                </div>

                                <form id="aws-connect-form" onSubmit={handleConnect}>
                                    {error && (
                                        <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                            {error}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                                            Account Nickname
                                        </label>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>A friendly name so you can recognise this account in the dashboard.</p>
                                        <input
                                            type="text"
                                            placeholder="e.g. My Production AWS"
                                            value={accountAlias}
                                            onChange={(e) => setAccountAlias(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                            onFocus={(e) => e.target.style.borderColor = '#00d65b'}
                                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                                            IAM Role ARN
                                        </label>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                                            Paste the ARN you copied in Step E above. It starts with {highlight('arn:aws:iam::')}.
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="arn:aws:iam::123456789012:role/FluxReaperRole"
                                            value={roleArn}
                                            onChange={(e) => setRoleArn(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                            onFocus={(e) => e.target.style.borderColor = '#00d65b'}
                                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1.25rem 2.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px', flexShrink: 0 }}>
                            <a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html" target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none' }}>
                                <HelpCircle size={15} /> AWS IAM Docs <ExternalLink size={12} />
                            </a>
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
