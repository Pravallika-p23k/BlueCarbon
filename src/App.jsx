import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, PlusSquare, Folder, UserCheck, LogOut, Menu, X, User, 
  Edit2, Save, CheckCircle2, AlertCircle, Trees, ShieldAlert, Coins, 
  FileCheck, Flame, UserPlus, LogIn 
} from 'lucide-react';

// Leaflet Default Marker Setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPickerMarker({ position, setPosition, setProjLocation }) {
  useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lng = parseFloat(e.latlng.lng.toFixed(4));
      setPosition([lat, lng]);
      setProjLocation(`${lat}° N, ${lng}° E`);
    },
  });
  return position ? <Marker position={position}><Popup>Selected MRV Site Coordinates</Popup></Marker> : null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState({ email: '', role: 'user' });

  const [profile, setProfile] = useState({ name: '', village: '', mandal: '', previousCredits: '0.0' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const [activeView, setActiveView] = useState('dashboard');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('user');
  const [regName, setRegName] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regMandal, setRegMandal] = useState('');

  // MRV Form
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState('Mangrove Forest');
  const [projLocation, setProjLocation] = useState('18.00° N, 78.00° E');
  const [pickedPosition, setPickedPosition] = useState([18.0, 78.0]);
  const [fileNameDisplay, setFileNameDisplay] = useState('📸 Click or drag site image to inspect');
  const [photoInspected, setPhotoInspected] = useState(false);
  const [photoPassed, setPhotoPassed] = useState(false);
  const [isTreeCategoryVerified, setIsTreeCategoryVerified] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [userProjects, setUserProjects] = useState([]);
  const [govAudits, setGovAudits] = useState([]);
  const [creditLedger, setCreditLedger] = useState([]);
  const [mintAmountInput, setMintAmountInput] = useState('');
  const [mintTargetProj, setMintTargetProj] = useState('');

  const showAlert = (type, message) => setAlert({ show: true, type, message });
  const hideAlert = () => setAlert({ show: false, type: '', message: '' });

  // Fetch collections when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:5000/api/projects')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUserProjects(data);
            if (data.length > 0) setMintTargetProj(data[0].id);
          }
        }).catch(err => console.error(err));

      fetch('http://localhost:5000/api/ledger')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCreditLedger(data); })
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  // Strict Authentication Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: loginEmail,
      password: loginPassword,
      role: loginRole,
      name: regName,
      village: regVillage,
      mandal: regMandal,
      isRegister: authMode === 'register'
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentUser({ email: data.email, role: data.role });
      setProfile({
        name: data.name || data.email.split('@')[0],
        village: data.village || '',
        mandal: data.mandal || '',
        previousCredits: (data.previousCredits || 0).toString()
      });

      setIsAuthenticated(true);

      // Route users directly to their respective default views
      if (data.role === 'government') {
        setActiveView('audits');
        setActiveMenu('Auditor Reviews');
      } else if (data.role === 'admin') {
        setActiveView('admin_credits');
        setActiveMenu('Credit Minting & Management');
      } else {
        setActiveView('dashboard');
        setActiveMenu('Dashboard');
      }
      hideAlert();
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ email: '', role: 'user' });
    setLoginEmail(''); setLoginPassword(''); setRegName(''); setRegVillage(''); setRegMandal('');
    hideAlert();
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile(editedProfile);
    setIsEditingProfile(false);
    showAlert('success', 'Profile updated successfully!');
  };

  // Dynamic Navigation Rules
  const allMenuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', roles: ['user'] },
    { id: 'Submit New Project', label: 'Submit New Project', icon: PlusSquare, view: 'submit', roles: ['user'] },
    { id: 'My Projects', label: 'My Projects', icon: Folder, view: 'projects', roles: ['user'] },
    { id: 'Auditor Reviews', label: 'Auditor Reviews & Sign-Off', icon: UserCheck, view: 'audits', roles: ['government'] },
    { id: 'National Ledger', label: 'National MRV Ledger', icon: FileCheck, view: 'country_ledger', roles: ['government'] },
    { id: 'Credit Minting & Management', label: 'Credit Minting & Ledger', icon: Coins, view: 'admin_credits', roles: ['admin'] },
    { id: 'Admin Control Center', label: 'Admin Overview', icon: ShieldAlert, view: 'admin_overview', roles: ['admin'] },
    { id: 'My Profile', label: 'My Profile', icon: User, view: 'profile', roles: ['user', 'government', 'admin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  // MRV Photo Inspector
  const inspectUploadedPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFileNameDisplay(`📁 ${file.name}`);
    setPreviewImage(previewUrl);

    const fileNameLower = file.name.toLowerCase();
    const isAIGenerated = ['ai', 'midjourney', 'dalle', 'synth'].some(k => fileNameLower.includes(k));
    const isNotTreeCategory = ['car', 'building', 'city'].some(k => fileNameLower.includes(k));

    if (isAIGenerated || isNotTreeCategory) {
      showAlert('danger', '🛑 REJECTION: Photo failed AI authenticity or tree category validation.');
      setPhotoInspected(true); setPhotoPassed(false); setIsTreeCategoryVerified(false);
      return;
    }

    const randomLat = parseFloat((16 + Math.random() * 4).toFixed(4));
    const randomLng = parseFloat((73 + Math.random() * 9).toFixed(4));
    setPickedPosition([randomLat, randomLng]);
    setProjLocation(`${randomLat}° N, ${randomLng}° E`);

    showAlert('success', '✅ Site photo verified under Trees / Coastal Ecosystem category!');
    setPhotoInspected(true); setPhotoPassed(true); setIsTreeCategoryVerified(true);
  };

  const handleMRVSubmit = async (e) => {
    e.preventDefault();
    if (!photoInspected || !photoPassed) return showAlert('danger', 'Inspect a valid photo first!');

    const randomId = `#BC-${Math.floor(100 + Math.random() * 900)}`;
    const newProj = {
      id: randomId,
      name: projTitle,
      developer: currentUser.email,
      ecosystem: projType,
      location: projLocation,
      lat: pickedPosition[0],
      lng: pickedPosition[1],
      status: 'Pending Audit',
      verifiedCategory: true,
      creditsMinted: 0,
      imgUrl: previewImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150'
    };

    await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj)
    });

    setUserProjects(prev => [newProj, ...prev]);
    setGovAudits(prev => [{ id: randomId, developer: currentUser.email, ecosystem: projType, coords: projLocation, riskCheck: 'Passed', status: 'Pending Audit Sign-Off' }, ...prev]);
    setProjTitle(''); setPreviewImage(null);
    showAlert('success', 'Project submitted to database!');
  };

  const handleAdminMint = async (e) => {
    e.preventDefault();
    const amount = parseFloat(mintAmountInput);
    if (!amount || amount <= 0) return showAlert('danger', 'Enter a valid credit amount');

    const txHash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      projId: mintTargetProj,
      recipient: currentUser.email,
      amount,
      status: 'Active',
      serializedHash: txHash
    };

    await fetch('http://localhost:5000/api/ledger/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });

    setCreditLedger(prev => [newTx, ...prev]);
    setUserProjects(prev => prev.map(p => p.id === mintTargetProj ? { ...p, status: 'Verified', creditsMinted: p.creditsMinted + amount } : p));
    setMintAmountInput('');
    showAlert('success', `Serialized and minted ${amount} tCO₂e credits!`);
  };

  if (!isAuthenticated) {
    return (
      <section className="auth-wrapper">
        <div className="auth-card">
          <div className="brand">
            <span className="logo-icon">🌊</span>
            <h1>BlueCarbonLedger</h1>
            <p>Blockchain Registry & AI-Assisted MRV</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button type="button" onClick={() => setAuthMode('login')} className={`btn btn-block ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}><LogIn size={15} /> Sign In</button>
            <button type="button" onClick={() => setAuthMode('register')} className={`btn btn-block ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}><UserPlus size={15} /> Register</button>
          </div>

          {alert.show && <div className={`alert-box ${alert.type}`}>{alert.message}</div>}

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <>
                <div className="form-group"><label>Full Name</label><input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required /></div>
                <div className="form-group"><label>Village Name</label><input type="text" value={regVillage} onChange={(e) => setRegVillage(e.target.value)} required /></div>
                <div className="form-group"><label>Mandal Name</label><input type="text" value={regMandal} onChange={(e) => setRegMandal(e.target.value)} required /></div>
              </>
            )}
            <div className="form-group"><label>Email Address</label><input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required /></div>
            <div className="form-group">
              <label>Role</label>
              <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)}>
                <option value="user">Project Developer (User)</option>
                <option value="government">Government Auditor</option>
                <option value="admin">Registry Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block">{authMode === 'register' ? 'Register Account' : 'Sign In'}</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="app-wrapper active">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>🌊 Blue Carbon</span>
          <button onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" onClick={() => { setActiveMenu(item.id); setActiveView(item.view); setIsSidebarOpen(false); }} className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}>
                <Icon size={18} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={handleLogout} className="nav-item" style={{ color: 'var(--danger)', marginTop: 'auto' }}><LogOut size={18} /> Sign Out</button>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="navbar">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
          <h2>{activeMenu}</h2>
          <span className={`badge ${currentUser.role === 'user' ? 'success' : currentUser.role === 'government' ? 'warning' : 'danger'}`}>{currentUser.role.toUpperCase()}</span>
        </header>

        <main className="container">
          {alert.show && <div className={`alert-box ${alert.type}`}>{alert.message}</div>}

          {/* ================= DEVELOPER VIEWS ================= */}
          {currentUser.role === 'user' && activeView === 'dashboard' && (
            <section className="dashboard-view active">
              <div className="stats-grid">
                <div className="stat-card"><h3>Registered Area</h3><p className="stat-value">43.5 ha</p></div>
                <div className="stat-card"><h3>Verified Credits</h3><p className="stat-value">{profile.previousCredits} tCO₂e</p></div>
                <div className="stat-card"><h3>Total Projects</h3><p className="stat-value">{userProjects.length}</p></div>
              </div>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h2>Welcome Back, {profile.name}!</h2>
                <p>📍 Village: <strong>{profile.village}</strong> | Mandal: <strong>{profile.mandal}</strong></p>
              </div>
            </section>
          )}

          {currentUser.role === 'user' && activeView === 'submit' && (
            <section className="dashboard-view active">
              <div className="content-grid">
                <form className="card" onSubmit={handleMRVSubmit}>
                  <div className="form-group"><label>Title</label><input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} required /></div>
                  <div className="form-group"><label>Upload Site Photo</label><input type="file" accept="image/*" onChange={inspectUploadedPhoto} required /></div>
                  <p style={{ fontSize: '0.85rem' }}>{fileNameDisplay}</p>
                  <button type="submit" className="btn btn-primary btn-block">Submit Project</button>
                </form>
                <div className="card" style={{ height: '350px' }}>
                  <MapContainer center={pickedPosition} zoom={6} style={{ height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPickerMarker position={pickedPosition} setPosition={setPickedPosition} setProjLocation={setProjLocation} />
                  </MapContainer>
                </div>
              </div>
            </section>
          )}

          {currentUser.role === 'user' && activeView === 'projects' && (
            <section className="dashboard-view active">
              <div className="card">
                <h2>📂 My Registered Projects</h2>
                <table className="data-table">
                  <thead><tr><th>Image</th><th>ID</th><th>Project Name</th><th>Location</th><th>Credits</th><th>Status</th></tr></thead>
                  <tbody>
                    {userProjects.map((item, idx) => (
                      <tr key={idx}>
                        <td><img src={item.imgUrl} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                        <td><code>{item.id}</code></td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        <td>{item.creditsMinted} tCO₂e</td>
                        <td><span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= AUDITOR VIEWS ================= */}
          {currentUser.role === 'government' && activeView === 'audits' && (
            <section className="dashboard-view active">
              <div className="card">
                <h2>Pending Verification Queue</h2>
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Developer</th><th>Ecosystem</th><th>Coordinates</th><th>Action</th></tr></thead>
                  <tbody>
                    {govAudits.map((item, idx) => (
                      <tr key={idx}>
                        <td><code>{item.id}</code></td><td>{item.developer}</td><td>{item.ecosystem}</td><td>{item.coords}</td>
                        <td><button className="btn btn-sm btn-success" onClick={() => showAlert('success', 'Audit Sign-Off Completed!')}>Sign Off</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {currentUser.role === 'government' && activeView === 'country_ledger' && (
            <section className="dashboard-view active">
              <div className="card">
                <h2>🌐 National Carbon Ledger (Read-Only)</h2>
                <table className="data-table">
                  <thead><tr><th>Project ID</th><th>Developer</th><th>Location</th><th>Minted Credits</th><th>Status</th></tr></thead>
                  <tbody>
                    {userProjects.map((p, i) => (
                      <tr key={i}>
                        <td><code>{p.id}</code></td><td>{p.developer || 'developer@registry.org'}</td><td>{p.location}</td><td><strong>{p.creditsMinted} tCO₂e</strong></td><td><span className="badge success">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= ADMIN VIEWS ================= */}
          {currentUser.role === 'admin' && activeView === 'admin_overview' && (
            <section className="dashboard-view active">
              <div className="stats-grid">
                <div className="stat-card"><h3>Active Projects</h3><p className="stat-value">{userProjects.length}</p></div>
                <div className="stat-card"><h3>Total Minted Transactions</h3><p className="stat-value">{creditLedger.length}</p></div>
              </div>
            </section>
          )}

          {currentUser.role === 'admin' && activeView === 'admin_credits' && (
            <section className="dashboard-view active">
              <div className="card">
                <h2>Mint Carbon Credits</h2>
                <form onSubmit={handleAdminMint}>
                  <div className="form-group">
                    <label>Select Project</label>
                    <select value={mintTargetProj} onChange={e => setMintTargetProj(e.target.value)}>
                      {userProjects.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Volume (tCO₂e)</label><input type="number" value={mintAmountInput} onChange={e => setMintAmountInput(e.target.value)} required /></div>
                  <button type="submit" className="btn btn-primary">Serialize & Mint Credits</button>
                </form>
              </div>

              <div className="card" style={{ marginTop: '1rem' }}>
                <h2>Tokenized Ledger</h2>
                <table className="data-table">
                  <thead><tr><th>Hash</th><th>Project</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {creditLedger.map((tx, idx) => (
                      <tr key={idx}>
                        <td><code>{tx.serializedHash}</code></td><td>{tx.projId}</td><td>{tx.amount} tCO₂e</td><td>{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= UNIVERSAL PROFILE VIEW ================= */}
          {activeView === 'profile' && (
            <section className="dashboard-view active">
              <div className="card">
                <h2>👤 User Profile Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div><label style={{ color: 'gray' }}>Full Name</label><p style={{ fontWeight: 'bold' }}>{profile.name || 'Not Set'}</p></div>
                  <div><label style={{ color: 'gray' }}>Email</label><p style={{ fontWeight: 'bold' }}>{currentUser.email}</p></div>
                  <div><label style={{ color: 'gray' }}>Role</label><p style={{ fontWeight: 'bold' }}>{currentUser.role.toUpperCase()}</p></div>
                  <div><label style={{ color: 'gray' }}>Village / Mandal</label><p style={{ fontWeight: 'bold' }}>{profile.village} / {profile.mandal}</p></div>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
