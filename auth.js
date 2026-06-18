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
  const [focusField, setFocusField] = React.useState("");

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
      background:"#0a0d12",
      backgroundImage:"radial-gradient(circle at 50% 10%, rgba(249, 168, 37, 0.08), transparent 45%), radial-gradient(circle at 10% 90%, rgba(66, 165, 245, 0.04), transparent 35%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Inter,sans-serif", padding: isMobile ? "16px" : "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative blurred background shapes */}
      <div style={{position:"absolute", top:"20%", left:"15%", width:200, height:200, borderRadius:"50%", background:"rgba(249, 168, 37, 0.025)", filter:"blur(80px)", pointerEvents:"none"}}/>
      <div style={{position:"absolute", bottom:"25%", right:"15%", width:220, height:220, borderRadius:"50%", background:"rgba(103, 162, 217, 0.02)", filter:"blur(90px)", pointerEvents:"none"}}/>

      <div style={{
        background:"rgba(26, 31, 39, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:"1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: isMobile ? 24 : 20,
        padding: isMobile ? "36px 20px 28px" : "48px 40px",
        width:"100%", maxWidth:390,
        boxShadow:"0 30px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        zIndex: 5,
        animation: "modalIn .35s cubic-bezier(.16,1,.3,1)"
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
        <div style={{marginBottom:18}}>
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
        <div style={{marginBottom:16}}>
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
        <div style={{marginTop:28, borderTop:"1px solid rgba(255, 255, 255, 0.06)", paddingTop:20}}>
          <div style={{fontSize:11, color:"#9ca3af", marginBottom:12, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600}}>
            Quick Demo Accounts
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            {AUTH_USERS.map(u => (
              <button key={u.username}
                onClick={()=>{setUsername(u.username); setPassword(u.password); setError("");}}
                style={{
                  padding:"10px 12px",
                  background:"rgba(255, 255, 255, 0.015)",
                  border:`1px solid ${u.color}20`,
                  borderRadius:10, cursor:"pointer", textAlign:"left",
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
                <div style={{fontSize:12, color:u.color, fontWeight:700}}>{u.role}</div>
                <div style={{fontSize:11, color:"#6b7280", marginTop:2, fontFamily:"'JetBrains Mono', monospace"}}>{u.username}</div>
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
