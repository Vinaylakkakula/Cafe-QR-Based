// ============================================================
// AUTH SYSTEM — Login screen, session management, role perms
// ============================================================

const AUTH_KEY = "vinay_pos_auth";

const AUTH_USERS = [
  { username: "admin",   password: "admin123",  role: "Admin",   name: "Admin User", color: "#f9a825" },
  { username: "manager", password: "mgr2024",   role: "Manager", name: "Manager",    color: "#42a5f5" },
  { username: "cashier", password: "cash2024",  role: "Cashier", name: "Cashier",    color: "#66bb6a" },
  { username: "waiter",  password: "wait2024",  role: "Waiter",  name: "Waiter",     color: "#ab47bc" },
  { username: "kitchen", password: "kit2024",   role: "Kitchen", name: "Kitchen",    color: "#67a2d9" },
];

const ROLE_PERMS = {
  Admin:   { floor:true, reservations:true,  customers:true,  history:true, summary:true, admin:true,  settings:true,  kitchen:true,  staff:true  },
  Manager: { floor:true, reservations:true,  customers:true,  history:true, summary:true, admin:false, settings:true,  kitchen:true,  staff:true  },
  Cashier: { floor:true, reservations:false, customers:true,  history:true, summary:false,admin:false, settings:false, kitchen:false, staff:false },
  Waiter:  { floor:true, reservations:true,  customers:false, history:false,summary:false,admin:false, settings:false, kitchen:false, staff:false },
  Kitchen: { floor:false,reservations:false, customers:false, history:false,summary:false,admin:false, settings:false, kitchen:true,  staff:false },
};

async function loadStoredUsersFromSupabase() {
  let staff = [];
  try {
    if (window.supabaseClient) {
      const staffRes = await window.supabaseClient.from("pos_settings").select("data").eq("id", "staff").single();
      if (staffRes.data && staffRes.data.data) {
        staff = staffRes.data.data;
      }
    } else {
      const stored = localStorage.getItem("ember_pos_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.staff) staff = parsed.staff;
      }
    }
  } catch (e) {}

  let customPasswords = [];
  try {
    if (window.supabaseClient) {
      const { data } = await window.supabaseClient.from("pos_settings").select("data").eq("id", "passwords").single();
      if (data && data.data) {
        customPasswords = data.data;
      }
    } else {
      const raw = localStorage.getItem("vinay_pos_passwords");
      if (raw) customPasswords = JSON.parse(raw);
    }
  } catch (e) {}

  const users = [...AUTH_USERS];

  staff.forEach(s => {
    if (!s.name) return;
    const username = s.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const exists = users.find(u => u.username === username);
    if (!exists && username) {
      let role = "Waiter";
      let color = "#ab47bc";
      if (s.role === "Manager") { role = "Manager"; color = "#42a5f5"; }
      else if (s.role === "Chef" || s.role === "Kitchen Helper") { role = "Kitchen"; color = "#67a2d9"; }
      else if (s.role === "Cashier") { role = "Cashier"; color = "#66bb6a"; }
      else if (s.role === "Waitstaff") { role = "Waiter"; color = "#ab47bc"; }

      users.push({
        username,
        password: `${username}123`,
        role,
        name: s.name,
        color
      });
    }
  });

  return users.map(u => {
    const match = customPasswords.find(p => p.username === u.username);
    return match ? { ...u, password: match.password } : u;
  });
}

async function updateStoredPasswordInSupabase(username, newPassword) {
  const currentAuth = loadAuth();
  if (currentAuth && currentAuth.username === username) {
    currentAuth.password = newPassword;
    saveAuth(currentAuth);
  }

  let customPasswords = [];
  try {
    if (window.supabaseClient) {
      const { data } = await window.supabaseClient.from("pos_settings").select("data").eq("id", "passwords").single();
      if (data && data.data) customPasswords = data.data;
    } else {
      const raw = localStorage.getItem("vinay_pos_passwords");
      if (raw) customPasswords = JSON.parse(raw);
    }
  } catch (e) {}

  const idx = customPasswords.findIndex(p => p.username === username);
  if (idx >= 0) {
    customPasswords[idx].password = newPassword;
  } else {
    customPasswords.push({ username, password: newPassword });
  }

  if (!window.supabaseClient) {
    localStorage.setItem("vinay_pos_passwords", JSON.stringify(customPasswords));
    return;
  }

  try {
    await window.supabaseClient
      .from("pos_settings")
      .upsert([{ id: "passwords", data: customPasswords }]);
  } catch (e) {
    console.error("Failed to update password in Supabase:", e);
  }
}

function loadAuth() {
  try { const r = sessionStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveAuth(user) { try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch {} }
function clearAuth()    { try { sessionStorage.removeItem(AUTH_KEY); } catch {} }

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw,   setShowPw]   = React.useState(false);
  const [error,    setError]    = React.useState("");
  const [loading,  setLoading]  = React.useState(false);
  const [focusField, setFocusField] = React.useState("");

  React.useEffect(() => {
    const root = document.getElementById("root");
    const prev = root.style.cssText;
    root.style.cssText = "display:block!important; height:100vh; overflow:auto;";

    // Inject animated styles
    let styleEl = document.getElementById("login-animations");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "login-animations";
      styleEl.innerHTML = `
        @keyframes loginCardEntrance {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.25; transform: scale(1) translate(0, 0); }
          50% { opacity: 0.45; transform: scale(1.15) translate(15px, -15px); }
        }
        @keyframes floatIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-card {
          animation: loginCardEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-glow-1 {
          animation: glowPulse 10s infinite alternate ease-in-out;
        }
        .animate-glow-2 {
          animation: glowPulse 12s infinite alternate-reverse ease-in-out;
        }
        .animate-field-1 {
          animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }
        .animate-field-2 {
          animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
        }
        .animate-btn {
          animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .animate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249, 168, 37, 0.45) !important;
          filter: brightness(1.08);
        }
        .animate-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .animate-demo {
          animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.42s both;
        }
        .demo-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .demo-btn:hover {
          transform: translateY(-2px) scale(1.025);
          box-shadow: 0 4px 12px rgba(255,255,255,0.05);
        }
      `;
      document.head.appendChild(styleEl);
    }

    return () => {
      root.style.cssText = prev;
      if (styleEl) styleEl.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) return;
    setError(""); setLoading(true);
    try {
      const storedUsers = await loadStoredUsersFromSupabase();
      const u = storedUsers.find(u =>
        u.username === username.trim().toLowerCase() && u.password === password
      );
      if (u) { saveAuth(u); onLogin(u); }
      else { setError("Invalid username or password."); setLoading(false); }
    } catch (e) {
      setError("Database connection error.");
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  // responsive: on mobile use full-width card
  const isMobile = window.innerWidth <= 480;

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0a0d12",
      backgroundImage:"radial-gradient(circle at 50% 10%, rgba(249, 168, 37, 0.08), transparent 45%), radial-gradient(circle at 10% 90%, rgba(66, 165, 245, 0.04), transparent 35%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Inter,sans-serif", padding: isMobile ? "16px" : "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative blurred background shapes with pulse animations */}
      <div className="animate-glow-1" style={{position:"absolute", top:"20%", left:"15%", width:200, height:200, borderRadius:"50%", background:"rgba(249, 168, 37, 0.025)", filter:"blur(80px)", pointerEvents:"none"}}/>
      <div className="animate-glow-2" style={{position:"absolute", bottom:"25%", right:"15%", width:220, height:220, borderRadius:"50%", background:"rgba(103, 162, 217, 0.02)", filter:"blur(90px)", pointerEvents:"none"}}/>

      <div className="animate-card" style={{
        background:"rgba(26, 31, 39, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:"1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: isMobile ? 24 : 20,
        padding: isMobile ? "36px 20px 28px" : "48px 40px",
        width:"100%", maxWidth:390,
        boxShadow:"0 30px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        zIndex: 5
      }}>

        {/* Brand */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:"linear-gradient(135deg,#f9a825,#ff6f00)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, margin:"0 auto 16px",
            boxShadow:"0 8px 24px rgba(249,168,37,.35), inset 0 1px 0 rgba(255,255,255,0.2)"
          }}>🍽️</div>
          <div style={{fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-0.02em"}}>Vinay Cafe</div>
          <div style={{fontSize:12, color:"#9ca3af", marginTop:6, fontWeight:500}}>Point of Sale — Staff Access</div>
        </div>

        {/* Username */}
        <div className="animate-field-1" style={{marginBottom:18}}>
          <label style={{fontSize:11, color:"#9ca3af", display:"block", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Username
          </label>
          <input
            value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={handleKey}
            autoCapitalize="none" autoCorrect="off" spellCheck="false"
            placeholder="Enter username"
            onFocus={() => setFocusField("username")}
            onBlur={() => setFocusField("")}
            style={{
              width:"100%", padding:"13px 16px",
              background:"rgba(15, 19, 24, 0.7)",
              border: focusField === "username" ? "1px solid #f9a825" : "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: focusField === "username" ? "0 0 12px rgba(249, 168, 37, 0.2)" : "none",
              borderRadius:12, color:"#fff", fontSize:15, outline:"none",
              boxSizing:"border-box", fontFamily:"inherit", transition:"all 0.25s ease"
            }}
          />
        </div>

        {/* Password */}
        <div className="animate-field-2" style={{marginBottom:16}}>
          <label style={{fontSize:11, color:"#9ca3af", display:"block", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em"}}>
            Password
          </label>
          <div style={{position:"relative"}}>
            <input
              type={showPw?"text":"password"}
              value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder="Enter password"
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField("")}
              style={{
                width:"100%", padding:"13px 46px 13px 16px",
                background:"rgba(15, 19, 24, 0.7)",
                border: focusField === "password" ? "1px solid #f9a825" : "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: focusField === "password" ? "0 0 12px rgba(249, 168, 37, 0.2)" : "none",
                borderRadius:12, color:"#fff", fontSize:15, outline:"none",
                boxSizing:"border-box", fontFamily:"inherit", transition:"all 0.25s ease"
              }}
            />
            <button
              onClick={()=>setShowPw(p=>!p)}
              style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:"#9ca3af", fontSize:16, padding:4, lineHeight:1,
                opacity: 0.7, transition: "opacity 0.2s"
              }}
              onMouseEnter={e=>e.target.style.opacity=1}
              onMouseLeave={e=>e.target.style.opacity=0.7}
            >{showPw ? "🙈" : "👁"}</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            color:"#fca5a5", fontSize:12, marginBottom:16,
            padding:"10px 14px", background:"rgba(239, 68, 68, 0.08)",
            border:"1px solid rgba(239, 68, 68, 0.18)", borderRadius:10,
            animation: "shake 0.3s ease-in-out"
          }}>{error}</div>
        )}

        {/* Sign In button */}
        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          className="animate-btn"
          style={{
            width:"100%", padding:"14px",
            background:(!username||!password||loading)
              ? "rgba(255, 255, 255, 0.03)"
              : "linear-gradient(135deg,#f9a825,#ff8f00)",
            border:"none", borderRadius:12,
            color:(!username||!password||loading) ? "rgba(255, 255, 255, 0.15)" : "#1a0800",
            fontSize:15, fontWeight:700,
            cursor:(!username||!password||loading) ? "not-allowed" : "pointer",
            marginTop:8, transition:"all 0.25s ease", letterSpacing:"-0.01em",
            boxShadow:(!username||!password||loading)
              ? "none"
              : "0 6px 20px rgba(249,168,37,0.3)"
          }}
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        {/* Demo accounts */}
        <div className="animate-demo" style={{marginTop:28, borderTop:"1px solid rgba(255, 255, 255, 0.06)", paddingTop:20}}>
          <div style={{fontSize:11, color:"#9ca3af", marginBottom:12, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>
            Quick Demo Accounts
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center"}}>
            {AUTH_USERS.map(u => (
              <button key={u.username}
                onClick={()=>{setUsername(u.username); setPassword(u.password); setError("");}}
                className="demo-btn"
                style={{
                  padding:"8px 10px",
                  background:"rgba(255, 255, 255, 0.015)",
                  border:`1px solid ${u.color}20`,
                  borderRadius:8, cursor:"pointer", textAlign:"center",
                  flex: "1 1 calc(33.33% - 6px)", minWidth: 90,
                  transition:"all 0.2s ease", WebkitTapHighlightColor:"transparent"
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.borderColor=u.color+"60";
                  e.currentTarget.style.background="rgba(255, 255, 255, 0.035)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.borderColor=u.color+"20";
                  e.currentTarget.style.background="rgba(255, 255, 255, 0.015)";
                }}
              >
                <div style={{fontSize:11, color:u.color, fontWeight:700}}>{u.role}</div>
                <div style={{fontSize:9, color:"#6b7280", marginTop:2, fontFamily:"'JetBrains Mono', monospace"}}>{u.username}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const UserBadge = ({ user, onLogout, onChangePassword }) => (
  <div style={{display:"flex", alignItems:"center", gap:8}}>
    <div style={{
      width:28, height:28, borderRadius:"50%", background:user.color,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:12, fontWeight:700, color:"#1a0800", flexShrink:0
    }}>{user.name[0]}</div>
    <div style={{lineHeight:1.3}}>
      <div style={{fontSize:12, color:"var(--text)", fontWeight:600}}>{user.name}</div>
      <div style={{fontSize:10, color:"var(--text-dim)"}}>{user.role}</div>
    </div>
    {onChangePassword && (
      <button onClick={onChangePassword} style={{
        marginLeft:8, background:"none",
        border:"1px solid var(--line)", borderRadius:6,
        padding:"3px 8px", cursor:"pointer",
        color:"var(--text-dim)", fontSize:11, fontWeight:500,
        transition:"all .15s"
      }} title="Change Password">🔑 Pass</button>
    )}
    <button onClick={onLogout} style={{
      marginLeft:4, background:"none",
      border:"1px solid var(--line)", borderRadius:6,
      padding:"3px 10px", cursor:"pointer",
      color:"var(--text-dim)", fontSize:11, fontWeight:500,
      transition:"all .15s"
    }}>Logout</button>
  </div>
);

const Portal = ({ children }) => {
  const el = React.useRef(document.createElement("div"));
  React.useEffect(() => {
    document.body.appendChild(el.current);
    return () => { document.body.removeChild(el.current); };
  }, []);
  return ReactDOM.createPortal(children, el.current);
};

function ChangePasswordModal({ authUser, onClose, showToast }) {
  const [oldPw, setOldPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSave = async () => {
    try {
      const storedUsers = await loadStoredUsersFromSupabase();
      const currentRealUser = storedUsers.find(u => u.username === authUser.username);
      if (!currentRealUser || currentRealUser.password !== oldPw) {
        setError("Incorrect current password.");
        return;
      }
      if (newPw.length < 4) {
        setError("New password must be at least 4 characters.");
        return;
      }
      if (newPw !== confirmPw) {
        setError("Passwords do not match.");
        return;
      }

      await updateStoredPasswordInSupabase(authUser.username, newPw);
      showToast("Password updated successfully!");
      onClose();
    } catch (e) {
      setError("Database connection error.");
    }
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal animate-card" style={{ width: 340 }} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">Change Password</div>
              <div className="modal-sub">Update password for {authUser.name}</div>
            </div>
            <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
          </div>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontWeight: 600 }}>Current Password</label>
              <input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, color: "#fff", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontWeight: 600 }}>New Password</label>
              <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, color: "#fff", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", display: "block", marginBottom: 6, fontWeight: 600 }}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, color: "#fff", outline: "none" }} />
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ background: "var(--amber)", color: "#000" }}>Save Password</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// Store globally so App can use it
window._authUtils = { loadAuth, saveAuth, clearAuth, AUTH_USERS, ROLE_PERMS, LoginScreen, UserBadge, ChangePasswordModal };
