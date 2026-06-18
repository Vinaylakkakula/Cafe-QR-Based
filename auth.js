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
  Admin:   { floor:true, reservations:true,  customers:true,  history:true, summary:true, admin:true,  settings:true,  kitchen:true  },
  Manager: { floor:true, reservations:true,  customers:true,  history:true, summary:true, admin:false, settings:true,  kitchen:true  },
  Cashier: { floor:true, reservations:false, customers:true,  history:true, summary:false,admin:false, settings:false, kitchen:false },
  Waiter:  { floor:true, reservations:true,  customers:false, history:false,summary:false,admin:false, settings:false, kitchen:false },
  Kitchen: { floor:false,reservations:false, customers:false, history:false,summary:false,admin:false, settings:false, kitchen:true  },
};

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

  React.useEffect(() => {
    const root = document.getElementById("root");
    const prev = root.style.cssText;
    root.style.cssText = "display:block!important; height:100vh; overflow:auto;";
    return () => { root.style.cssText = prev; };
  }, []);

  const handleLogin = () => {
    if (!username || !password) return;
    setError(""); setLoading(true);
    setTimeout(() => {
      const u = AUTH_USERS.find(u =>
        u.username === username.trim().toLowerCase() && u.password === password
      );
      if (u) { saveAuth(u); onLogin(u); }
      else { setError("Invalid username or password."); setLoading(false); }
    }, 380);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  // responsive: on mobile use full-width card
  const isMobile = window.innerWidth <= 480;

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d1117 0%,#13171c 50%,#0d1117 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Inter,sans-serif", padding: isMobile ? "16px" : "24px"
    }}>
      <div style={{
        background:"#1a1f27",
        border:"1px solid #2a2f3a",
        borderRadius: isMobile ? 20 : 18,
        padding: isMobile ? "32px 20px 28px" : "40px 36px",
        width:"100%", maxWidth:380,
        boxShadow:"0 24px 64px rgba(0,0,0,0.55)"
      }}>

        {/* Brand */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{
            width:60, height:60, borderRadius:16,
            background:"linear-gradient(135deg,#f9a825,#ff6f00)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:30, margin:"0 auto 14px", boxShadow:"0 8px 24px rgba(249,168,37,.3)"
          }}>🍽️</div>
          <div style={{fontSize:22, fontWeight:700, color:"#fff", letterSpacing:"-0.02em"}}>Vinay Cafe</div>
          <div style={{fontSize:12, color:"#6b7280", marginTop:4}}>Point of Sale — Staff Login</div>
        </div>

        {/* Username */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11, color:"#9ca3af", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em"}}>
            Username
          </label>
          <input
            value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={handleKey}
            autoCapitalize="none" autoCorrect="off" spellCheck="false"
            placeholder="Enter your username"
            style={{
              width:"100%", padding:"13px 14px",
              background:"#0f1318", border:"1px solid #2e3440",
              borderRadius:10, color:"#fff", fontSize:16, outline:"none",
              boxSizing:"border-box", fontFamily:"inherit", transition:"border .2s"
            }}
            onFocus={e=>e.target.style.borderColor="#f9a825"}
            onBlur={e=>e.target.style.borderColor="#2e3440"}
          />
        </div>

        {/* Password */}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11, color:"#9ca3af", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em"}}>
            Password
          </label>
          <div style={{position:"relative"}}>
            <input
              type={showPw?"text":"password"}
              value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder="Enter your password"
              style={{
                width:"100%", padding:"13px 44px 13px 14px",
                background:"#0f1318", border:"1px solid #2e3440",
                borderRadius:10, color:"#fff", fontSize:16, outline:"none",
                boxSizing:"border-box", fontFamily:"inherit", transition:"border .2s"
              }}
              onFocus={e=>e.target.style.borderColor="#f9a825"}
              onBlur={e=>e.target.style.borderColor="#2e3440"}
            />
            <button
              onClick={()=>setShowPw(p=>!p)}
              style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:"#6b7280", fontSize:16, padding:4, lineHeight:1
              }}
            >{showPw ? "🙈" : "👁"}</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            color:"#f87171", fontSize:12, marginBottom:12,
            padding:"9px 12px", background:"rgba(248,113,113,0.08)",
            border:"1px solid rgba(248,113,113,0.2)", borderRadius:8
          }}>{error}</div>
        )}

        {/* Sign In button */}
        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          style={{
            width:"100%", padding:"14px",
            background:(!username||!password||loading)
              ? "#1f2430"
              : "linear-gradient(135deg,#f9a825,#ff8f00)",
            border:"none", borderRadius:10,
            color:(!username||!password||loading) ? "#4b5563" : "#1a0800",
            fontSize:15, fontWeight:700,
            cursor:(!username||!password||loading) ? "not-allowed" : "pointer",
            marginTop:4, transition:"all .2s", letterSpacing:"-0.01em",
            boxShadow:(!username||!password||loading)
              ? "none"
              : "0 4px 16px rgba(249,168,37,.25)"
          }}
        >
          {loading ? "Signing in…" : "Sign In →"}
        </button>

        {/* Demo accounts */}
        <div style={{marginTop:22, borderTop:"1px solid #1f2430", paddingTop:18}}>
          <div style={{fontSize:11, color:"#374151", marginBottom:10, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>
            Demo Accounts
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
            {AUTH_USERS.map(u => (
              <button key={u.username}
                onClick={()=>{setUsername(u.username); setPassword(u.password); setError("");}}
                style={{
                  padding:"8px 10px",
                  background:"#0f1318",
                  border:`1px solid ${u.color}33`,
                  borderRadius:8, cursor:"pointer", textAlign:"left",
                  transition:"all .15s", WebkitTapHighlightColor:"transparent"
                }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=u.color+"88"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=u.color+"33"}
              >
                <div style={{fontSize:12, color:u.color, fontWeight:700}}>{u.role}</div>
                <div style={{fontSize:11, color:"#4b5563", marginTop:1}}>{u.username}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const UserBadge = ({ user, onLogout }) => (
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
    <button onClick={onLogout} style={{
      marginLeft:4, background:"none",
      border:"1px solid var(--line)", borderRadius:6,
      padding:"3px 10px", cursor:"pointer",
      color:"var(--text-dim)", fontSize:11, fontWeight:500,
      transition:"all .15s"
    }}>Logout</button>
  </div>
);

// Store globally so App can use it
window._authUtils = { loadAuth, saveAuth, clearAuth, AUTH_USERS, ROLE_PERMS, LoginScreen, UserBadge };
