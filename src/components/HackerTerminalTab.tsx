import React, { useState, useEffect } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface HackerTerminalTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

export const HackerTerminalTab: React.FC<HackerTerminalTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  const [terminalLog, setTerminalLog] = useState<string[]>([
    'root@powerball-matrix:~# sys_init --force',
    '[*] CYBER HACKNET & DARKNET VAULT ONLINE',
    '[*] Bypassing 256-bit AES satellite encryptions...',
    '[*] Connected to Sovereign Core Bank Ingress (IP: 192.168.100.254)'
  ]);

  const [targetIP, setTargetIP] = useState<string>('10.0.4.88');
  const [crackingProgress, setCrackingProgress] = useState<number>(0);
  const [isCracking, setIsCracking] = useState<boolean>(false);
  const [terminalInput, setTerminalInput] = useState<string>('');

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    setTerminalLog(prev => [`root@powerball-matrix:~# ${cmd}`, ...prev]);
    setTerminalInput('');

    if (cmd === 'help') {
      setTerminalLog(prev => [
        'Available Commands: money, hack_bank, ddos, nuke_taxes, scan_nodes, clear',
        ...prev
      ]);
    } else if (cmd === 'money' || cmd === 'cash') {
      onUpdateBalance(prev => prev + 10000000000);
      if (soundEnabled) playJackpotSound(soundEnabled);
      setTerminalLog(prev => ['[+] COMMAND EXECUTED: Added +$10,000,000,000 to wallet!', ...prev]);
    } else if (cmd === 'hack_bank') {
      handleHackBank();
    } else if (cmd === 'clear') {
      setTerminalLog(['root@powerball-matrix:~# terminal_cleared']);
    } else {
      setTerminalLog(prev => [`[-] Unknown command: '${cmd}'. Type 'help' for commands list.`, ...prev]);
    }
  };

  const handleHackBank = () => {
    if (isCracking) return;
    setIsCracking(true);
    setCrackingProgress(0);
    if (soundEnabled) playTickSound(soundEnabled);
    setTerminalLog(prev => [`[!] BRUTEFORCE ATTACK INITIATED on Target ${targetIP}...`, ...prev]);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setCrackingProgress(prog);
      if (soundEnabled) playTickSound(soundEnabled);

      if (prog >= 100) {
        clearInterval(interval);
        setIsCracking(false);
        const reward = 500000000000; // $500 Billion
        onUpdateBalance(prev => prev + reward);
        if (soundEnabled) playJackpotSound(soundEnabled);
        setTerminalLog(prev => [
          `✅ FIREWALL CRACKED! Vault breached! Siphoned +$500,000,000,000 directly to ${username}'s account!`,
          ...prev
        ]);
      }
    }, 400);
  };

  const handleDDoSNode = () => {
    const loot = 50000000000;
    onUpdateBalance(prev => prev + loot);
    if (soundEnabled) playCoinSound(soundEnabled);
    setTerminalLog(prev => [`💥 DDoS OVERLOAD: Overwhelmed exchange server node! Extorted +$50,000,000,000 bounty!`, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-mono">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 flex items-center justify-center text-3xl shadow-lg border border-emerald-300">
            💻
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                CYBER HACKNET & DARKNET VAULT
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
                ROOT SYSTEM PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 pt-1">
              Operator: <span className="font-bold text-white">{username}</span> • Execute brute-force bank exploits, DDoS node overloads, and darknet siphons.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleHackBank}
            disabled={isCracking}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition-all hover:scale-105"
          >
            {isCracking ? `⚡ CRACKING (${crackingProgress}%)` : '🔓 HACK NATIONAL BANK ($500B)'}
          </button>
        </div>
      </div>

      {/* MAIN TERMINAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TERMINAL CONSOLE */}
        <div className="lg:col-span-2 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-2xl flex flex-col justify-between h-[480px]">
          <div className="flex justify-between items-center border-b border-emerald-900/60 pb-2 mb-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-emerald-400 font-bold ml-2">powerball_matrix_shell_v9.2</span>
            </div>
            <span className="text-[10px] text-emerald-300/70">PORT 8080 • ENCRYPTED</span>
          </div>

          {/* CRACKING PROGRESS BAR */}
          {isCracking && (
            <div className="mb-3 space-y-1 bg-slate-900 border border-emerald-500/40 p-2.5 rounded-xl">
              <div className="flex justify-between text-xs text-emerald-300 font-bold">
                <span>BRUTEFORCING BANK SATELLITE ENCRYPTION...</span>
                <span>{crackingProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-emerald-500/30">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${crackingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* LOGS OUTPUT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 text-xs text-emerald-400 p-2 bg-black/60 rounded-xl border border-emerald-900/40">
            {terminalLog.map((log, i) => (
              <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
            ))}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleRunCommand} className="mt-3 flex gap-2">
            <span className="text-emerald-400 font-bold text-sm self-center">root#</span>
            <input
              type="text"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              placeholder="Type command (e.g. 'money', 'hack_bank', 'help')..."
              className="flex-1 bg-slate-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl"
            >
              EXECUTE
            </button>
          </form>
        </div>

        {/* QUICK EXPLOITS SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="font-black text-xs text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              ⚡ ONE-CLICK DARKNET EXPLOITS
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleDDoSNode}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-emerald-500/40 p-3 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-emerald-300 group-hover:text-emerald-200">💥 DDoS OVERLOAD NODE</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Crash global servers for +$50B ransom payout.</div>
              </button>

              <button
                onClick={() => {
                  onUpdateBalance(prev => prev + 100000000000);
                  if (soundEnabled) playJackpotSound(soundEnabled);
                  setTerminalLog(prev => ['[+] EXPLOIT: Hijacked Central Bank Printing Presses! +$100B Cash!', ...prev]);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-amber-500/40 p-3 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-amber-300 group-hover:text-amber-200">🖨️ HIJACK CENTRAL PRINTING</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Force print +$100,000,000,000 legal tender.</div>
              </button>

              <button
                onClick={() => {
                  onUpdateBalance(prev => prev + 250000000000);
                  if (soundEnabled) playJackpotSound(soundEnabled);
                  setTerminalLog(prev => ['[+] EXPLOIT: Quantum Crypto Mining Rig Farm deployed! +$250B Cash!', ...prev]);
                }}
                className="w-full bg-slate-950 hover:bg-slate-850 border border-cyan-500/40 p-3 rounded-xl text-left transition-all group"
              >
                <div className="font-bold text-xs text-cyan-300 group-hover:text-cyan-200">⛏️ QUANTUM MINING RIG FARM</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Instant block reward payout +$250B Cash.</div>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 font-mono">
            💡 <span className="text-emerald-400 font-bold">PRO-TIP:</span> You can type <code className="text-amber-300 font-bold">money</code> in the terminal console anytime for instant cash!
          </div>
        </div>

      </div>
    </div>
  );
};
