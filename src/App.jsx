import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Folder, 
  UserCheck, 
  FileText, 
  Store, 
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Edit2,
  Save
} from 'lucide-react';

// Fix Leaflet Default Marker Icon Issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to handle map click events for location picking
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
      <Popup>Selected Submission Site Location</Popup>
    </Marker>
  ) : null;
}

export default function App() {
  // ---------------- STATE MANAGEMENT ----------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ email: '', role: 'user' });
  
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Pravalika ',
    village: '',
    mandal: '',
    previousCredits: '0'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const [activeView, setActiveView] = useState('dashboard'); 
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('user');

  const [projTitle, setProjTitle] = useState('');
  const [projType, setProjType] = useState('Mangrove Forest');
  const [projLocation, setProjLocation] = useState('18.00° N, 78.00° E');
  const [pickedPosition, setPickedPosition] = useState([18.0, 78.0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNameDisplay, setFileNameDisplay] = useState('📸 Click or drag image to test AI & Duplicate detection');

  // Verification Flags
  const [photoInspected, setPhotoInspected] = useState(false);
  const [photoPassed, setPhotoPassed] = useState(false);

  // System Data Collections
  const [registeredLocations, setRegisteredLocations] = useState(["19.24, 73.13", "16.94, 82.23"]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [userProjects, setUserProjects] = useState([
    { id: '#BC-892', name: 'Kalyan Blue Canopy', location: '19.24° N, 73.13° E', status: 'Verified', lat: 19.24, lng: 73.13 },
    { id: '#BC-893', name: 'Godavari Coastal Belt', location: '16.94° N, 82.23° E', status: 'Pending Audit', lat: 16.94, lng: 82.23 }
  ]);

  const [govAudits, setGovAudits] = useState([
    {
      id: '#BC-893',
      developer: 'pravalika@gmail.com',
      ecosystem: 'Mangrove Forest',
      coords: '16.94° N, 82.23° E',
      riskCheck: 'Passed (0% AI Probability)',
      status: 'Pending'
    }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { time: '12 mins ago', title: 'Flagged Attempt', details: 'AI-generated photo detected from IP 182.74.x.x (Filename: dalle_mangrove.png)' },
    { time: '1 hour ago', title: 'Duplicate Rejection', details: 'Photo matching GPS (19.24° N, 73.13° E) blocked due to existing registered claim.' }
  ]);

  // Menu items list
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { id: 'Submit New Project', label: 'Submit New Project', icon: PlusSquare, view: 'submit' },
    { id: 'My Projects', label: 'My Projects', icon: Folder, view: 'projects' },
    { id: 'My Profile', label: 'My Profile', icon: User, view: 'profile' },
  ];

  // ---------------- HANDLERS ----------------
  const showAlert = (type, message) => setAlert({ show: true, type, message });
  const hideAlert = () => setAlert({ show: false, type: '', message: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    setCurrentUser({ email: loginEmail, role: loginRole });
    setIsAuthenticated(true);
    if (loginRole === 'government') {
      setActiveView('audits');
      setActiveMenu('Auditor Reviews');
    } else if (loginRole === 'admin') {
      setActiveView('admin');
      setActiveMenu('Admin Controls');
    } else {
      setActiveView('dashboard');
      setActiveMenu('Dashboard');
    }
    hideAlert();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ email: '', role: 'user' });
    hideAlert();
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile(editedProfile);
    setIsEditingProfile(false);
    showAlert('success', 'Profile information updated successfully!');
  };

  const inspectUploadedPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFileNameDisplay(`📁 File loaded: ${file.name}`);

    const fileNameLower = file.name.toLowerCase();
    const aiKeywords = ['ai', 'midjourney', 'dalle', 'dall-e', 'synth', 'generated', 'copilot', 'firefly'];
    const isAIGenerated = aiKeywords.some(keyword => fileNameLower.includes(keyword));

    const rawCoords = projLocation.trim();
    const isDuplicateLocation = registeredLocations.some(loc => rawCoords && rawCoords.includes(loc));

    if (isAIGenerated) {
      showAlert('danger', '🛑 REJECTION ERROR: The uploaded photo was detected as AI-generated/Synthetic.');
      setPhotoInspected(true);
      setPhotoPassed(false);
      logAdminFlag(`AI-generated image blocked: ${file.name}`);
      return;
    }

    if (isDuplicateLocation) {
      showAlert('danger', '📍 REJECTION ERROR: Site photo matches an existing location claim.');
      setPhotoInspected(true);
      setPhotoPassed(false);
      logAdminFlag(`Duplicate location attempt blocked: ${rawCoords}`);
      return;
    }

    showAlert('success', '✅ VERIFICATION PASSED: Site photo verified authentic.');
    setPhotoInspected(true);
    setPhotoPassed(true);
  };

  const handleMRVSubmit = (e) => {
    e.preventDefault();

    if (!photoInspected || !photoPassed) {
      showAlert('danger', 'Cannot submit project: Please upload a valid, non-AI photo from a unique location.');
      return;
    }

    const randomId = `#BC-${Math.floor(100 + Math.random() * 900)}`;
    const lat = pickedPosition ? pickedPosition[0] : 18.0;
    const lng = pickedPosition ? pickedPosition[1] : 78.0;

    setUserProjects(prev => [{ id: randomId, name: projTitle, location: projLocation, status: 'Pending Audit', lat, lng }, ...prev]);

    setGovAudits(prev => [{
      id: randomId,
      developer: currentUser.email,
      ecosystem: projType,
      coords: projLocation,
      riskCheck: 'Passed (0% AI Probability)',
      status: 'Pending'
    }, ...prev]);

    setRegisteredLocations(prev => [...prev, projLocation]);
    logAdminFlag(`New submission from ${currentUser.email}: Project ${randomId} at ${projLocation}`);

    setProjTitle('');
    setSelectedFile(null);
    setFileNameDisplay('📸 Click or drag image to test AI & Duplicate detection');
    setPhotoInspected(false);
    setPhotoPassed(false);

    showAlert('success', 'Project successfully submitted and routed to the Auditor queue!');
  };

  const approveGovAudit = (id) => {
    setGovAudits(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
    setUserProjects(prev => prev.map(item => item.id === id ? { ...item, status: 'Verified' } : item));
    showAlert('success', 'Government sign-off complete. Carbon credits minted on-chain.');
  };

  const rejectGovAudit = (id) => {
    setGovAudits(prev => prev.filter(item => item.id !== id));
    showAlert('danger', 'Project audit rejected by regulator.');
  };

  const logAdminFlag = (details) => {
    setActivityLogs(prev => [{ time: 'Just now', title: 'System Event', details }, ...prev]);
  };

  // ---------------- RENDER UI ----------------

  if (!isAuthenticated) {
    return (
      <section id="auth-screen" className="auth-wrapper active">
        <div className="auth-card">
          <div className="brand">
            <span className="logo-icon">🌊</span>
            <h1>BlueCarbonLedger</h1>
            <p>Blockchain Registry & AI-Assisted MRV Protocol</p>
          </div>

          <form id="loginForm" onSubmit={handleLogin}>
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

            <button type="submit" className="btn btn-primary btn-block">Sign In to Dashboard</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div id="app-screen" className="app-wrapper active" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
      {/* OVERLAY FOR SIDEBAR */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} 
        />
      )}

      {/* ================= TOGGLEABLE LEFT SIDEBAR MENU ================= */}
      <aside 
        className="sidebar" 
        style={{ 
          width: '250px', 
          backgroundColor: 'var(--card-bg)', 
          borderRight: '1px solid var(--border-color)', 
          padding: '1.25rem 1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isSidebarOpen ? '0' : '-270px',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000,
          boxShadow: isSidebarOpen ? '4px 0 12px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span className="logo-icon">🌊</span>
            <span>Blue Carbon Trust</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setActiveView(item.view);
                  setIsSidebarOpen(false);
                  hideAlert();
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Top Navbar */}
        <header className="navbar" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}
            >
              <Menu size={20} />
              <span>Menu</span>
            </button>
            <h2 style={{ margin: 0 }}>{activeMenu}</h2>
          </div>

          <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => {
                setActiveMenu('My Profile');
                setActiveView('profile');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <User size={16} />
              <span>{profile.name}</span>
            </button>

            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge ${currentUser.role === 'user' ? 'success' : 'warning'}`}>
                {currentUser.role === 'user' ? 'Project Developer' : 'Auditor'}
              </span>
              <button className="btn btn-outline-sm" onClick={handleLogout} title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        <main className="container" style={{ padding: '2rem', flex: 1 }}>
          
          {/* ALERT BANNER */}
          {alert.show && (
            <div className={`alert-box ${alert.type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>{alert.type === 'danger' ? '🛑' : '✅'}</span>
                <div>{alert.message}</div>
              </div>
              <button onClick={hideAlert} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>✕</button> 
            </div>
          )}

          {/* ================= PAGE VIEW 1: DASHBOARD ================= */}
    {activeView === 'dashboard' && (
  <section className="dashboard-view active">
      {/* Stats Grid */}
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <div className="stat-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3>Total Registered Area</h3>
        <p className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0' }}>43.5 ha</p>
      </div>
      <div className="stat-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3>Verified Carbon Credits</h3>
        <p className="stat-value" style={{ fontSize: '1.8rem', fontWeight :700, margin: '0.5rem 0' }}>{profile.previousCredits} tCO₂e</p>
      </div>
      <div className="stat-card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3>Pending Audits</h3>
        <p className="stat-value" style={{ fontSize: '1.8rem', fontWeight :700, margin: '0.5rem 0' }}>{userProjects.filter(p => p.status === 'Pending Audit').length}</p>
      </div>
    </div>
    {/* Editable Profile Overview Card */}
    <div 
      className="card" 
      style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        marginBottom: '2rem' 
      }}
    >
      {!isEditingProfile ? (
        /* READ-ONLY PROFILE DISPLAY */
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              👤
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '4.3rem' }}>{profile.name}</h2>
              <p style={{ margin: '2.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                📍 Village: <strong>{profile.village}</strong> | Mandal: <strong>{profile.mandal}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous Carbon Credits</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{profile.previousCredits} tCO₂e</div>
            </div>

            <button 
              onClick={() => {
                setEditedProfile({ ...profile });
                setIsEditingProfile(true);
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem' }}
            >
              <Edit2 size={25} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
        
      ) : (
        /* INLINE PROFILE EDIT FORM */
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}> Edit Profile Details</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update your developer information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem' }}>Full Name</label>
              <input 
                type="text" 
                value={editedProfile.name} 
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem' }}>Village</label>
              <input 
                type="text" 
                value={editedProfile.village} 
                onChange={(e) => setEditedProfile({ ...editedProfile, village: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem' }}>Mandal</label>
              <input 
                type="text" 
                value={editedProfile.mandal} 
                onChange={(e) => setEditedProfile({ ...editedProfile, mandal: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.85rem' }}>Previous Credits (tCO₂e)</label>
              <input 
                type="text" 
                value={editedProfile.previousCredits} 
                onChange={(e) => setEditedProfile({ ...editedProfile, previousCredits: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
  
  </section>
)}
          {/* ================= PAGE VIEW 2: SUBMIT NEW PROJECT (WITH MAP PICKER) ================= */}
          {activeView === 'submit' && (
            <section className="dashboard-view active">
              <div className="view-header" style={{ marginBottom: '1.5rem' }}>
                <h1>🌱 Submit New Site MRV Data</h1>
                <p>Select location on the map and upload high-resolution site photography for MRV verification.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Form */}
                <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <form onSubmit={handleMRVSubmit}>
                    <div className="form-group">
                      <label>Project Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Sundarbans Coastal Restoration"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        required
                      />
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
                      <label>Site Latitude / Longitude (Click on Map to Auto-Fill)</label>
                      <input
                        type="text"
                        placeholder="18.00° N, 78.00° E"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Upload Verification Site Photo</label>
                      <div className="file-dropzone" style={{ border: '2px dashed var(--border-color)', padding: '1rem', textAlign: 'center', borderRadius: '8px' }}>
                        <input type="file" accept="image/*" required onChange={inspectUploadedPhoto} />
                        <p>{fileNameDisplay}</p>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Submit Project</button>
                  </form>
                </div>

                {/* Map Location Picker */}
                <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginTop: 0 }}>📍 Pick Location on Map</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Click anywhere on the map to set the project coordinates automatically.</p>
                  <div style={{ flex: 1, minHeight: '300px', borderRadius: '8px', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                    <MapContainer 
                      center={[18.0, 78.0]} 
                      zoom={5} 
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPickerMarker 
                        position={pickedPosition} 
                        setPosition={setPickedPosition} 
                        setProjLocation={setProjLocation} 
                      />
                    </MapContainer>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= PAGE VIEW: USER PROFILE (EDITABLE) ================= */}
          {activeView === 'profile' && (
            <section className="dashboard-view active">
              <div className="view-header" style={{ marginBottom: '1.5rem' }}>
                <h1>👤 User Profile Settings</h1>
                <p>View and modify your developer account and regional information.</p>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                {!isEditingProfile ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ margin: 0 }}>Account Information</h2>
                      <button 
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
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.name}</div>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Village Name</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.village}</div>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mandal Name</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.mandal}</div>
                      </div>

                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Previous Carbon Credits Issued</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>{profile.previousCredits} tCO₂e</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave}>
                    <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Edit Profile Information</h2>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editedProfile.name} 
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Village Name</label>
                      <input 
                        type="text" 
                        value={editedProfile.village} 
                        onChange={(e) => setEditedProfile({ ...editedProfile, village: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Mandal Name</label>
                      <input 
                        type="text" 
                        value={editedProfile.mandal} 
                        onChange={(e) => setEditedProfile({ ...editedProfile, mandal: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label>Previous Carbon Credits (tCO₂e)</label>
                      <input 
                        type="text" 
                        value={editedProfile.previousCredits} 
                        onChange={(e) => setEditedProfile({ ...editedProfile, previousCredits: e.target.value })} 
                        required 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* ================= OTHER VIEWS (Projects, Audits, Certificates, Marketplace, Analytics) ================= */}
          {activeView === 'projects' && (
            <section className="dashboard-view active">
              <h2>📂 My Registered Projects</h2>
              <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><th>ID</th><th>Project Name</th><th>Location</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {userProjects.map((item, idx) => (
                      <tr key={idx}>
                        <td><code>{item.id}</code></td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        <td><span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'audits' && (
            <section className="dashboard-view active">
              <h2>🏛️ Government Auditor Portal</h2>
              <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><th>ID</th><th>Developer</th><th>Ecosystem</th><th>Coordinates</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {govAudits.map((item, idx) => (
                      <tr key={idx}>
                        <td><code>{item.id}</code></td>
                        <td>{item.developer}</td>
                        <td>{item.ecosystem}</td>
                        <td>{item.coords}</td>
                        <td>
                          {item.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-sm btn-success" onClick={() => approveGovAudit(item.id)}>Approve</button>
                              <button className="btn btn-sm btn-danger" onClick={() => rejectGovAudit(item.id)}>Reject</button>
                            </div>
                          ) : (
                            <span className="badge success">Approved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
