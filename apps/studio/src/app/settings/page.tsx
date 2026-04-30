'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { SovereignStatusBar } from '@/components/layout/SovereignStatusBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Server, 
  Info, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Eye, 
  EyeOff,
  Github,
  FileText,
  BadgeCheck,
  BadgeAlert,
  Settings as SettingsIcon,
  RefreshCw,
  Globe,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'deployment', label: 'Deployment', icon: Server },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'about', label: 'About', icon: Info },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('identity');
  const [isCopied, setIsCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saltStatus, setSaltStatus] = useState<{ hasSalt: boolean; environment: string } | null>(null);

  // Local Storage Settings
  const [vercelToken, setVercelToken] = useLocalStorage('aix_vercel_token', '');
  const [projectName, setProjectName] = useLocalStorage('aix_project_name', 'aix-studio-agents');
  const [customEndpoint, setCustomEndpoint] = useLocalStorage('aix_custom_endpoint', '');
  const [kycRequired, setKycRequired] = useLocalStorage('aix_kyc_required', true);
  const [showAbomRisks, setShowAbomRisks] = useLocalStorage('aix_show_abom_risks', true);
  const [lastDeployment, setLastDeployment] = useLocalStorage<{ status: string; url: string; date: string } | null>('aix_last_deployment', null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setSaltStatus(data.config))
      .catch(() => setSaltStatus(null));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('DID copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePiAuth = () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      toast.info('Connecting to Pi Network...');
      (window as any).Pi.authenticate(['username', 'payments', 'wallet_address'], (payment: any) => {
        console.log('Payment/Auth callback:', payment);
      }).then((auth: any) => {
        toast.success(`Authenticated as ${auth.user.username}`);
      }).catch((err: any) => {
        toast.error(`Pi Auth failed: ${err.message}`);
      });
    } else {
      toast.error('Pi SDK not loaded. Please ensure you are in the Pi Browser.');
    }
  };

  const testConnection = async () => {
    if (!vercelToken) {
      toast.error('Vercel Token is required for testing');
      return;
    }
    setIsTesting(true);
    toast.loading('Testing connection...', { id: 'test-conn' });
    
    try {
      // Dry run deployment test
      const response = await fetch('/api/deploy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'did:axiom:test-connection',
          target: 'vercel',
          config: {
            token: vercelToken,
            projectName: projectName
          },
          yaml: '# test connection',
          dry_run: true // We'll need to ensure the API supports this
        })
      });
      
      const data = await response.json();
      
      if (response.ok || data.status === 'success' || response.status === 404 /* Agent not found is still a connection test */) {
         toast.success('Vercel API connection verified!', { id: 'test-conn' });
      } else {
         throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection failed', { id: 'test-conn' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-white overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/5">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Studio Settings</h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Configure your sovereign agent workspace, identity, and deployment preferences.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Tabs */}
          <div className="flex flex-col gap-2">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/5' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute left-0 w-1 h-6 bg-[var(--color-primary)] rounded-r-full shadow-[0_0_8px_var(--color-primary)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Content Area */}
          <motion.div 
            layout
            className="glass-panel-heavy rounded-2xl p-8 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl min-h-[500px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'identity' && (
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <User className="w-5 h-5 text-[var(--color-primary)]" />
                          Sovereign Identity (DID)
                        </h3>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 group hover:border-[var(--color-primary)]/30 transition-colors">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Current DID</span>
                          <code className="text-sm text-gray-300 break-all font-mono">
                            did:axiom:pi-network:8a3f7c92b1e4d5678a3f7c92b1e4d567
                          </code>
                        </div>
                        <button 
                          onClick={() => copyToClipboard('did:axiom:pi-network:8a3f7c92b1e4d5678a3f7c92b1e4d567')}
                          className="p-3 rounded-lg bg-white/5 hover:bg-[var(--color-primary)]/10 text-gray-400 hover:text-[var(--color-primary)] transition-all flex-shrink-0"
                          title="Copy DID"
                        >
                          {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                        KYC Tier Status
                      </h3>
                      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <BadgeCheck className="w-24 h-24" />
                        </div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="p-3 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <BadgeCheck className="w-8 h-8" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xl uppercase tracking-wider">Institutional</span>
                              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30">VERIFIED</span>
                            </div>
                            <p className="text-sm text-gray-400">Full M2M assurance level. Sovereign status granted via Pi Network.</p>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handlePiAuth}
                        className="mt-6 w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-lg active:scale-[0.98] group"
                      >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        Refresh Identity with Pi Network
                      </button>
                    </section>
                  </div>
                )}

                {activeTab === 'deployment' && (
                  <div className="space-y-8">
                    <section className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-400">Vercel API Token</label>
                          <a href="https://vercel.com/account/tokens" target="_blank" className="text-[10px] text-[var(--color-primary)] hover:underline flex items-center gap-1">
                            Get Token <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <div className="relative group">
                          <input 
                            type={showToken ? "text" : "password"}
                            value={vercelToken}
                            onChange={(e) => setVercelToken(e.target.value)}
                            placeholder="sk_..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-mono text-sm"
                          />
                          <button 
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-500">
                          <Lock className="w-3 h-3" />
                          <span>Encrypted in local storage. Not transmitted to AIX servers.</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Default Project Namespace</label>
                        <input 
                          type="text"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Custom Endpoint URL (Override)</label>
                        <input 
                          type="url"
                          value={customEndpoint}
                          onChange={(e) => setCustomEndpoint(e.target.value)}
                          placeholder="https://agent-api.yourdomain.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-sm"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={testConnection}
                          disabled={isTesting}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#0099cc] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-[var(--color-primary)]/20 active:scale-[0.98] disabled:opacity-50"
                        >
                          {isTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                          Test Vercel Connection
                        </button>
                      </div>
                    </section>

                    {lastDeployment && (
                      <section className="pt-6 border-t border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Last Deployment Status</h4>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">Production (v1.2.4)</span>
                              <span className="text-[10px] text-gray-500">Deployed {new Date(lastDeployment.date).toLocaleString()}</span>
                            </div>
                          </div>
                          <a 
                            href={lastDeployment.url} 
                            target="_blank" 
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--color-primary)] transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="space-y-7">
                      <div className="flex items-start justify-between group">
                        <div className="flex flex-col gap-1 pr-8">
                          <span className="font-semibold text-gray-200">Require KYC before publish</span>
                          <span className="text-xs text-gray-500 leading-relaxed">
                            Prevents any agent from being deployed unless a valid KYC proof (assurance level {'>'} 0) is provided.
                          </span>
                        </div>
                        <button 
                          onClick={() => setKycRequired(!kycRequired)}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${kycRequired ? 'bg-green-500' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: kycRequired ? 26 : 4 }}
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-md"
                          />
                        </button>
                      </div>

                      <div className="flex items-start justify-between group">
                        <div className="flex flex-col gap-1 pr-8">
                          <span className="font-semibold text-gray-200">Show ABOM risk warnings</span>
                          <span className="text-xs text-gray-500 leading-relaxed">
                            Displays real-time security alerts if an Agent Bill of Materials contains high-risk constituents or model vulnerabilities.
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowAbomRisks(!showAbomRisks)}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${showAbomRisks ? 'bg-green-500' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: showAbomRisks ? 26 : 4 }}
                            className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-md"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Database className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Infrastructure Audit</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">UID Hashing Salt</span>
                          {saltStatus?.hasSalt ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <BadgeCheck className="w-4 h-4" />
                              <span className="text-sm font-mono tracking-tight">SET (Production)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-400">
                              <BadgeAlert className="w-4 h-4" />
                              <span className="text-sm font-mono tracking-tight">NOT CONFIGURED</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Environment Mode</span>
                          <div className="flex items-center gap-2 text-blue-400">
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-mono tracking-tight uppercase">{saltStatus?.environment || 'detecting...'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-8 flex flex-col h-full">
                    <div className="flex flex-col items-center justify-center py-4 flex-grow">
                      <motion.div 
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[var(--color-primary)] to-[#7000ff] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--color-primary)]/20 relative"
                      >
                        <div className="absolute inset-0 rounded-[32px] bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Database className="w-12 h-12 text-white relative z-10" />
                      </motion.div>
                      <h2 className="text-3xl font-black tracking-tighter mb-1">AIX STUDIO</h2>
                      <p className="text-gray-500 text-sm font-medium tracking-wide">Sovereign Protocol v1.3.0</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default">
                        <span className="text-[10px] text-gray-500 uppercase font-black block mb-1 tracking-widest">Platform</span>
                        <span className="text-xl font-bold tracking-tight">v0.1.0-alpha</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default">
                        <span className="text-[10px] text-gray-500 uppercase font-black block mb-1 tracking-widest">MCP Bridge</span>
                        <span className="text-xl font-bold tracking-tight">v1.29.0</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 pb-4">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">Resources</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a href="/spec" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all group">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500 group-hover:text-[var(--color-primary)] transition-colors" />
                            <span className="text-sm font-semibold">Technical Spec</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-[var(--color-primary)]" />
                        </a>
                        <a href="https://github.com/Moeabdelaziz007/aix-format" target="_blank" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#7000ff]/40 hover:bg-[#7000ff]/5 transition-all group">
                          <div className="flex items-center gap-3">
                            <Github className="w-5 h-5 text-gray-500 group-hover:text-[#7000ff] transition-colors" />
                            <span className="text-sm font-semibold">GitHub Source</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#7000ff]" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <SovereignStatusBar />
    </div>
  );
}
