import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Folder, 
  UserCheck, 
  LogOut,
  Menu,
  X,
  User,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Trees,
  ShieldAlert,
  Coins,
  FileCheck,
  Flame,
  UserPlus,
  LogIn
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

  return position ? (
    <Marker position={position}>
      <Popup>Selected MRV Site Coordinates</Popup>
    </Marker>
  ) : null;
}

export default function App() {
  // Authentication & Auth Mode State ('login' vs 'register')
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Current Active User
  const [currentUser, setCurrentUser] = useState({ email: '', role: 'user' });

  // Dynamic Profile State
  const [profile, setProfile] = useState({
    name: 'Pravalika',
    village: 'Kalyan',
    mandal: 'East Coastal Zone',
    previousCredits: '120.5'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  // Navigation State
  const [activeView, setActiveView] = useState('dashboard');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Registration & Login Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('user');
  
  const [regName, setRegName] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regMandal, setRegMandal] = useState('');

  // Submit Project State
  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState('Mangrove Forest');
  const [projLocation, setProjLocation] = useState('18.00° N, 78.00° E');
  const [pickedPosition, setPickedPosition] = useState([18.0, 78.0]);
  const [fileNameDisplay, setFileNameDisplay] = useState('📸 Click or drag site image to inspect category & duplicate detection');

  // Verification Flags & Preview Image
  const [photoInspected, setPhotoInspected] = useState(false);
  const [photoPassed, setPhotoPassed] = useState(false);
  const [isTreeCategoryVerified, setIsTreeCategoryVerified] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Master Systems Collections
  const [registeredLocations, setRegisteredLocations] = useState(["19.24, 73.13", "16.94, 82.23"]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Dynamic Projects List (Supports uploaded image previews)
  const [userProjects, setUserProjects] = useState([
    { 
      id: '#BC-892', 
      name: 'Kalyan Blue Canopy', 
      location: '19.24° N, 73.13° E', 
      status: 'Verified', 
      lat: 19.24, 
      lng: 73.13, 
      verifiedCategory: true, 
      creditsMinted: 120.5,
      imgUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150' 
    },
    { 
      id: '#BC-893', 
      name: 'Godavari Coastal Belt', 
      location: '16.94° N, 82.23° E', 
      status: 'Pending Audit', 
      lat: 16.94, 
      lng: 82.23, 
      verifiedCategory: true, 
      creditsMinted: 0,
      imgUrl: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?w=150' 
    }
  ]);

  const [govAudits, setGovAudits] = useState([
    { id: '#BC-893', developer: 'pravalika@gmail.com', ecosystem: 'Mangrove Forest', coords: '16.94° N, 82.23° E', riskCheck: 'Passed (0% AI Probability)', status: 'Pending Audit Sign-Off' }
  ]);

  const [creditLedger, setCreditLedger] = useState([
    { id: 'TX-9021', projId: '#BC-892', recipient: 'pravalika@gmail.com', amount: 120.5, status: 'Active', serializedHash: '0x8f2a...390b' },
    { id: 'TX-9020', projId: '#BC-880', recipient: 'coastal_trust@org.in', amount: 450.0, status: 'Retired', serializedHash: '0x1c4d...81ef' }
  ]);

  const [mintAmountInput, setMintAmountInput] = useState('');
  const [mintTargetProj, setMintTargetProj] = useState('#BC-893');

  // Master Access Control Menu Definition
  const allMenuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', roles: ['user'] },
    { id: 'Submit New Project', label: 'Submit New Project', icon: PlusSquare, view: 'submit', roles: ['user'] },
    { id: 'My Projects', label: 'My Projects', icon: Folder, view: 'projects', roles: ['user'] },
    { id: 'Auditor Reviews', label: 'Auditor Reviews & Sign-Off', icon: UserCheck, view: 'audits', roles: ['government'] },
    { id: 'National Ledger', label: 'National MRV Ledger', icon: FileCheck, view: 'country_ledger', roles: ['government'] },
    { id: 'Admin Control Center', label: 'Admin Control Center', icon: ShieldAlert, view: 'admin_overview', roles: ['admin'] },
    { id: 'Credit Minting & Management', label: 'Credit Minting & Ledger', icon: Coins, view: 'admin_credits', roles: ['admin'] },
    { id: 'My Profile', label: 'My Profile', icon: User, view: 'profile', roles: ['user', 'government', 'admin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  const showAlert = (type, message) => setAlert({ show: true, type, message });
  const hideAlert = () => setAlert({ show: false, type: '', message: '' });

  // ---------------- AUTHENTICATION HANDLERS ----------------
  const handleAuthSubmit = (e) => {
    e.preventDefault();

    if (authMode === 'register') {
      // Set Profile dynamically from Registration fields
      setProfile({
        name: regName || loginEmail.split('@')[0],
        village: regVillage,
        mandal: regMandal,
        previousCredits: '0.0'
      });
    } else {
      // Standard Sign In Fallback
      if (!profile.name || profile.name === 'Pravalika') {
        setProfile(prev => ({
          ...prev,
          name: loginEmail.split('@')[0]
        }));
      }
    }

    setCurrentUser({ email: loginEmail, role: loginRole });
    setIsAuthenticated(true);

    if (loginRole === 'government') {
      setActiveView('audits');
      setActiveMenu('Auditor Reviews');
    } else if (loginRole === 'admin') {
      setActiveView('admin_overview');
      setActiveMenu('Admin Control Center');
    } else {
      setActiveView('dashboard');
      setActiveMenu('Dashboard');
    }
    hideAlert();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ email: '', role: 'user' });
    setLoginEmail('');
    setLoginPassword('');
    setLoginRole('user');
    setRegName('');
    setRegVillage('');
    setRegMandal('');
    setActiveView('dashboard');
    setActiveMenu('Dashboard');
    setIsSidebarOpen(false);
    hideAlert();
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile(editedProfile);
    setIsEditingProfile(false);
    showAlert('success', 'Profile details updated successfully!');
  };

  // ---------------- MRV INSPECTION & SUBMISSION ----------------
  const inspectUploadedPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFileNameDisplay(`📁 File loaded: ${file.name}`);
    setPreviewImage(previewUrl);

    const fileNameLower = file.name.toLowerCase();
    const aiKeywords = ['ai', 'midjourney', 'dalle', 'dall-e', 'synth', 'generated', 'copilot', 'firefly'];
    const isAIGenerated = aiKeywords.some(keyword => fileNameLower.includes(keyword));

    const rawCoords = projLocation.trim();
    const isDuplicateLocation = registeredLocations.some(loc => rawCoords && rawCoords.includes(loc));

    const nonTreeKeywords = ['car', 'building', 'interior', 'city', 'urban', 'document'];
    const isNotTreeCategory = nonTreeKeywords.some(keyword => fileNameLower.includes(keyword));

    if (isAIGenerated) {
      showAlert('danger', '🛑 REJECTION ERROR: The uploaded photo was detected as AI-generated/Synthetic.');
      setPhotoInspected(true);
      setPhotoPassed(false);
      setIsTreeCategoryVerified(false);
      return;
    }

    if (isDuplicateLocation) {
      showAlert('danger', '📍 REJECTION ERROR: Site photo matches an existing registered site.');
      setPhotoInspected(true);
      setPhotoPassed(false);
      setIsTreeCategoryVerified(false);
      return;
    }

    if (isNotTreeCategory) {
      showAlert('danger', '❌ CATEGORY REJECTION: Photo does not belong to Trees / Coastal Vegetation Category.');
      setPhotoInspected(true);
      setPhotoPassed(false);
      setIsTreeCategoryVerified(false);
      return;
    }

    const randomLat = parseFloat((16 + Math.random() * 4).toFixed(4));
    const randomLng = parseFloat((73 + Math.random() * 9).toFixed(4));
    setPickedPosition([randomLat, randomLng]);
    setProjLocation(`${randomLat}° N, ${randomLng}° E`);

    showAlert('success', '✅ VERIFICATION PASSED: Site photo verified authentic & categorized under Trees / Coastal Ecosystem!');
    setPhotoInspected(true);
    setPhotoPassed(true);
    setIsTreeCategoryVerified(true);
  };

  const handleMRVSubmit = (e) => {
    e.preventDefault();

    if (!photoInspected || !photoPassed || !isTreeCategoryVerified) {
      showAlert('danger', 'Cannot submit: Ensure site photo is verified under trees category.');
      return;
    }

    const randomId = `#BC-${Math.floor(100 + Math.random() * 900)}`;
    const lat = pickedPosition ? pickedPosition[0] : 18.0;
    const lng = pickedPosition ? pickedPosition[1] : 78.0;

    const newProject = {
      id: randomId,
      name: projTitle,
      location: projLocation,
      status: 'Pending Audit',
      lat,
      lng,
      verifiedCategory: true,
      creditsMinted: 0,
      imgUrl: previewImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=150'
    };

    setUserProjects(prev => [newProject, ...prev]);
    setGovAudits(prev => [{ id: randomId, developer: currentUser.email, ecosystem: projType, coords: projLocation, riskCheck: 'Passed (0% AI Probability)', status: 'Pending Audit Sign-Off' }, ...prev]);
    setRegisteredLocations(prev => [...prev, projLocation]);

    setProjTitle('');
    setPreviewImage(null);
    setFileNameDisplay('📸 Click or drag site image to inspect category & duplicate detection');
    setPhotoInspected(false);
    setPhotoPassed(false);
    setIsTreeCategoryVerified(false);

    showAlert('success', 'Project submitted! It is now pending Regulatory Audit Sign-Off.');
  };

  // Government Auditor Handlers
  const approveGovAudit = (id) => {
    setGovAudits(prev => prev.map(item => item.id === id ? { ...item, status: 'Auditor Endorsed' } : item));
    setUserProjects(prev => prev.map(item => item.id === id ? { ...item, status: 'Auditor Endorsed (Awaiting Admin Mint)' } : item));
    showAlert('success', 'Audit Report endorsed and digitally signed! Ready for Admin Minting.');
  };

  const rejectGovAudit = (id) => {
    setGovAudits(prev => prev.filter(item => item.id !== id));
    setUserProjects(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected by Auditor' } : item));
    showAlert('danger', 'Audit rejected and returned to developer.');
  };

  // Admin Handlers
  const handleAdminMint = (e) => {
    e.preventDefault();
    if (!mintAmountInput || parseFloat(mintAmountInput) <= 0) {
      showAlert('danger', 'Please enter a valid amount of carbon credits to mint.');
      return;
    }

    const amount = parseFloat(mintAmountInput);
    const txHash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);

    setCreditLedger(prev => [{
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      projId: mintTargetProj,
      recipient: currentUser.email,
      amount,
      status: 'Active',
      serializedHash: txHash
    }, ...prev]);

    setUserProjects(prev => prev.map(item => item.id === mintTargetProj ? { ...item, status: 'Verified', creditsMinted: item.creditsMinted + amount } : item));
    setProfile(prev => ({ ...prev, previousCredits: (parseFloat(prev.previousCredits) + amount).toString() }));

    setMintAmountInput('');
    showAlert('success', `Successfully serialized and minted ${amount} tCO₂e credits on-chain!`);
  };

  const handleRetireCredits = (txId) => {
    setCreditLedger(prev => prev.map(item => item.id === txId ? { ...item, status: 'Retired' } : item));
    showAlert('success', `Credit Batch ${txId} has been permanently retired / locked on-chain.`);
  };

  // ====================================================================
  // SIGN-IN & REGISTER VIEW (TOGGLED CLEANLY)
  // ====================================================================
  if (!isAuthenticated) {
    return (
      <section id="auth-screen" className="auth-wrapper">
        <div className="auth-card">
          <div className="brand">
            <span className="logo-icon">🌊</span>
            <h1>BlueCarbonLedger</h1>
            <p>Blockchain Registry & AI-Assisted MRV Protocol</p>
          </div>

          {/* Mode Switching Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--card-bg-subtle)', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`btn btn-block ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`btn btn-block ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={15} /> Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Village Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Kalyan Village"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mandal Name</label>
                  <input
                    type="text"
                    placeholder="e.g., East Coastal Zone"
                    value={regMandal}
                    onChange={(e) => setRegMandal(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Access Role</label>
              <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} required>
                <option value="user">Project Developer (User)</option>
                <option value="government">Government / Regulatory Auditor</option>
                <option value="admin">Registry Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {authMode === 'register' ? 'Create Account & Proceed' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  // ====================================================================
  // MAIN DASHBOARD LAYOUT
  // ====================================================================
  return (
    <div id="app-screen" className="app-wrapper active">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
            <span className="logo-icon">🌊</span>
            <span>Blue Carbon Trust</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveMenu(item.id);
                  setActiveView(item.view);
                  setIsSidebarOpen(false);
                  hideAlert();
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-item"
            style={{ color: 'var(--danger)', width: '100%' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Navbar Header */}
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="button" className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={20} />
              <span>Menu</span>
            </button>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{activeMenu}</h2>
          </div>

          <div className="nav-controls">
            <button
              type="button"
              className="btn-profile-link"
              onClick={() => {
                setActiveMenu('My Profile');
                setActiveView('profile');
              }}
            >
              <User size={16} />
              <span>{profile.name || currentUser.email.split('@')[0]}</span>
            </button>

            <div className="user-profile">
              <span className={`badge ${currentUser.role === 'user' ? 'success' : currentUser.role === 'government' ? 'warning' : 'danger'}`}>
                {currentUser.role === 'user' ? 'Project Developer' : currentUser.role === 'government' ? 'Government Auditor' : 'Registry Admin'}
              </span>
              <button type="button" className="btn btn-outline-sm" onClick={handleLogout} title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="container">
          
          {/* Notification Banner */}
          {alert.show && (
            <div className={`alert-box ${alert.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>{alert.type === 'danger' ? '🛑' : '✅'}</span>
                <div>{alert.message}</div>
              </div>
              <button type="button" onClick={hideAlert} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button> 
            </div>
          )}

          {/* ================= ROLE 1: PROJECT DEVELOPER VIEWS ================= */}
          {currentUser.role === 'user' && (
            <>
              {activeView === 'dashboard' && (
                <section className="dashboard-view active">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total Registered Area</h3>
                      <p className="stat-value">43.5 ha</p>
                    </div>
                    <div className="stat-card">
                      <h3>Verified Carbon Credits</h3>
                      <p className="stat-value">{profile.previousCredits} tCO₂e</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pending Audits</h3>
                      <p className="stat-value">{userProjects.filter(p => p.status.includes('Pending')).length}</p>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid var(--border-color)' }}>
                          👤
                        </div>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{profile.name}</h2>
                          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            📍 Village: <strong>{profile.village || 'Not set'}</strong> | Mandal: <strong>{profile.mandal || 'Not set'}</strong>
                          </p>
                        </div>
                      </div>

                      <button type="button" onClick={() => { setEditedProfile({ ...profile }); setIsEditingProfile(true); setActiveView('profile'); setActiveMenu('My Profile'); }} className="btn btn-secondary">
                        <Edit2 size={18} />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {activeView === 'submit' && (
                <section className="dashboard-view active">
                  <div className="view-header">
                    <h1>🌱 Submit New Site MRV Data</h1>
                    <h3>Select location on the map and upload high-resolution site photography for MRV verification.</h3>
                  </div>

                  <div className="content-grid">
                    <div className="card">
                      <form onSubmit={handleMRVSubmit}>
                        <div className="form-group">
                          <label>Project Title</label>
                          <input type="text" placeholder="e.g., Sundarbans Coastal Restoration" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
                        </div>

                        <div className="form-group">
                          <label>Ecosystem Type</label>
                          <select value={projType} onChange={(e) => setProjType(e.target.value)} required>
                            <option value="Mangrove Forest">Mangrove Forest</option>
                            <option value="Seagrass Meadow">Seagrass Meadow</option>
                            <option value="Tidal Salt Marsh">Tidal Salt Marsh</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Site Latitude / Longitude (Click on Map or Upload Photo)</label>
                          <input type="text" placeholder="18.00° N, 78.00° E" value={projLocation} onChange={(e) => setProjLocation(e.target.value)} required />
                        </div>

                        <div className="form-group">
                          <label>Upload Verification Site Photo</label>
                          <div className="file-dropzone">
                            <input type="file" accept="image/*" required onChange={inspectUploadedPhoto} />
                            <p>{fileNameDisplay}</p>
                          </div>

                          {previewImage && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg-subtle)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <img src={previewImage} alt="Site preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category Inspection:</div>
                                {isTreeCategoryVerified ? (
                                  <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <Trees size={16} /> Verified Trees / Vegetation Category <CheckCircle2 size={16} />
                                  </div>
                                ) : (
                                  <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                                    <AlertCircle size={16} /> Unverified Category
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Submit Project</button>
                      </form>
                    </div>

                    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ marginTop: 0 }}>📍 Pick Location on Map</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Click anywhere on the map or upload an image to dynamically update coordinates.</p>
                      <div style={{ flex: 1, minHeight: '300px', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                        <MapContainer center={pickedPosition} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <LocationPickerMarker position={pickedPosition} setPosition={setPickedPosition} setProjLocation={setProjLocation} />
                        </MapContainer>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeView === 'projects' && (
                <section className="dashboard-view active">
                  <h2>📂 My Registered Projects</h2>
                  <div className="card">
                    <table className="data-table">
                      <thead>
                        <tr><th>Image</th><th>ID</th><th>Project Name</th><th>Location</th><th>Category</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {userProjects.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <img src={item.imgUrl} alt="site preview" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                            </td>
                            <td><code>{item.id}</code></td>
                            <td>{item.name}</td>
                            <td>{item.location}</td>
                            <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>Trees Category ✅</span></td>
                            <td><span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>{item.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ================= ROLE 2: GOVERNMENT AUDITOR VIEWS ================= */}
          {currentUser.role === 'government' && (
            <>
              {activeView === 'audits' && (
                <section className="dashboard-view active">
                  <div className="view-header">
                    <h1>🏛️ Government & Regulatory Audit Portal</h1>
                    <p>Review raw MRV site data, inspect compliance, and endorse project submissions.</p>
                  </div>

                  <div className="card">
                    <h2>Pending Verification Queue</h2>
                    <table className="data-table">
                      <thead>
                        <tr><th>ID</th><th>Developer</th><th>Ecosystem</th><th>Coordinates</th><th>Risk Check</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {govAudits.map((item, idx) => (
                          <tr key={idx}>
                            <td><code>{item.id}</code></td>
                            <td>{item.developer}</td>
                            <td>{item.ecosystem}</td>
                            <td>{item.coords}</td>
                            <td><span className="badge success">{item.riskCheck}</span></td>
                            <td>
                              {item.status === 'Pending Audit Sign-Off' ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button type="button" className="btn btn-sm btn-success" onClick={() => approveGovAudit(item.id)}>Sign Off</button>
                                  <button type="button" className="btn btn-sm btn-danger" onClick={() => rejectGovAudit(item.id)}>Reject</button>
                                </div>
                              ) : (
                                <span className="badge success">Endorsed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeView === 'country_ledger' && (
                <section className="dashboard-view active">
                  <div className="view-header">
                    <h1>🌐 National Carbon Ledger (Read-Only)</h1>
                    <p>Country-level monitoring of all carbon claims and audit statuses.</p>
                  </div>

                  <div className="card">
                    <table className="data-table">
                      <thead>
                        <tr><th>Image</th><th>Project ID</th><th>Developer</th><th>Location</th><th>Minted Credits</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {userProjects.map((p, i) => (
                          <tr key={i}>
                            <td>
                              <img src={p.imgUrl} alt="site" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                            </td>
                            <td><code>{p.id}</code></td>
                            <td>pravalika@gmail.com</td>
                            <td>{p.location}</td>
                            <td><strong>{p.creditsMinted} tCO₂e</strong></td>
                            <td><span className="badge success">{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ================= ROLE 3: REGISTRY ADMIN VIEWS ================= */}
          {currentUser.role === 'admin' && (
            <>
              {activeView === 'admin_overview' && (
                <section className="dashboard-view active">
                  <div className="view-header">
                    <h1>⚙️ Registry Administration Control Center</h1>
                    <p>Full administrative oversight, aggregated summaries, and protocol governance.</p>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total Protocol Credits</h3>
                      <p className="stat-value">570.5 tCO₂e</p>
                    </div>
                    <div className="stat-card">
                      <h3>Active Projects</h3>
                      <p className="stat-value">{userProjects.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Pending Mints</h3>
                      <p className="stat-value">{govAudits.filter(a => a.status === 'Auditor Endorsed').length}</p>
                    </div>
                  </div>

                  <div className="card">
                    <h2>Aggregated Read-Only Summary</h2>
                    <table className="data-table">
                      <thead>
                        <tr><th>Site Photo</th><th>Project ID</th><th>Ecosystem</th><th>Auditor Clearance</th><th>Minting Status</th></tr>
                      </thead>
                      <tbody>
                        {userProjects.map((proj, idx) => (
                          <tr key={idx}>
                            <td>
                              <img src={proj.imgUrl} alt="site" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                            </td>
                            <td><code>{proj.id}</code></td>
                            <td>Mangrove Forest</td>
                            <td><span className="badge success">Auditor Endorsed</span></td>
                            <td><span className="badge warning">{proj.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeView === 'admin_credits' && (
                <section className="dashboard-view active">
                  <div className="view-header">
                    <h1>🪙 Credit Minting & Ledger Control</h1>
                    <p>Serialize, mint, lock, and retire verified carbon credits on-chain.</p>
                  </div>

                  <div className="content-grid">
                    <div className="card">
                      <h2>Mint New Carbon Credits</h2>
                      <form onSubmit={handleAdminMint}>
                        <div className="form-group">
                          <label>Select Endorsed Project</label>
                          <select value={mintTargetProj} onChange={(e) => setMintTargetProj(e.target.value)}>
                            {userProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Volume to Mint (tCO₂e)</label>
                          <input type="number" step="0.1" placeholder="e.g., 250.0" value={mintAmountInput} onChange={(e) => setMintAmountInput(e.target.value)} required />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Serialize & Mint Credits</button>
                      </form>
                    </div>

                    <div className="card">
                      <h2>Protocol Ledger Controls</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Admin accounts possess full authority to lock or retire serialized credit tokens once transferred or consumed.
                      </p>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: '1.5rem' }}>
                    <h2>On-Chain Tokenized Credit Ledger</h2>
                    <table className="data-table">
                      <thead>
                        <tr><th>TX Hash ID</th><th>Project ID</th><th>Recipient</th><th>Credit Amount</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {creditLedger.map((tx, idx) => (
                          <tr key={idx}>
                            <td><code>{tx.serializedHash}</code></td>
                            <td>{tx.projId}</td>
                            <td>{tx.recipient}</td>
                            <td><strong>{tx.amount} tCO₂e</strong></td>
                            <td><span className={`badge ${tx.status === 'Active' ? 'success' : 'danger'}`}>{tx.status}</span></td>
                            <td>
                              {tx.status === 'Active' ? (
                                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRetireCredits(tx.id)}>
                                  <Flame size={14} style={{ marginRight: '4px' }} /> Retire / Lock
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked & Retired</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ================= UNIVERSAL MY PROFILE VIEW (DYNAMIC FOR ALL ROLES) ================= */}
          {activeView === 'profile' && (
            <section className="dashboard-view active">
              <div className="view-header">
                <h1>👤 Profile Dashboard</h1>
                <p>View active account details, assigned access role, and regional information.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                
                {/* Avatar Card */}
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--card-bg-subtle)', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '1px solid var(--border-color)' }}>
                    {currentUser.role === 'admin' ? '⚙️' : currentUser.role === 'government' ? '🏛️' : '👤'}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>
                    {profile.name || currentUser.email.split('@')[0]}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
                    {currentUser.role === 'user' ? 'Project Developer' : currentUser.role === 'government' ? 'Government Auditor' : 'Registry Admin'}
                  </p>
                  
                  <div style={{ padding: '1rem', background: 'var(--card-bg-subtle)', borderRadius: '8px', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Email</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                      {currentUser.email || 'developer@registry.org'}
                    </div>
                  </div>
                </div>

                {/* Account Information Card */}
                <div className="card">
                  {!isEditingProfile ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <h2 style={{ margin: 0 }}>Account Details</h2>
                        {currentUser.role === 'user' && (
                          <button 
                            type="button"
                            onClick={() => {
                              setEditedProfile({ ...profile });
                              setIsEditingProfile(true);
                            }} 
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <Edit2 size={16} />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</label>
                          <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>{profile.name || 'Not Set'}</div>
                        </div>

                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Access Role</label>
                          <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>
                            {currentUser.role === 'user' ? 'Project Developer' : currentUser.role === 'government' ? 'Government Auditor' : 'Registry Admin'}
                          </div>
                        </div>

                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Village Name</label>
                          <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>{profile.village || 'Not Set'}</div>
                        </div>

                        <div>
                          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mandal Name</label>
                          <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>{profile.mandal || 'Not Set'}</div>
                        </div>

                        {currentUser.role === 'user' && (
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Balance</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
                              {profile.previousCredits} tCO₂e
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileSave}>
                      <h2 style={{ marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        Edit Details
                      </h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            value={editedProfile.name} 
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label>Village</label>
                          <input 
                            type="text" 
                            value={editedProfile.village} 
                            onChange={(e) => setEditedProfile({ ...editedProfile, village: e.target.value })} 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label>Mandal</label>
                          <input 
                            type="text" 
                            value={editedProfile.mandal} 
                            onChange={(e) => setEditedProfile({ ...editedProfile, mandal: e.target.value })} 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label>Previous Credits (tCO₂e)</label>
                          <input 
                            type="text" 
                            value={editedProfile.previousCredits} 
                            onChange={(e) => setEditedProfile({ ...editedProfile, previousCredits: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
