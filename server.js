import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import User from './models/User.js';
import Project from './models/Project.js';
import Ledger from './models/Ledger.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => res.send('🌊 BlueCarbon API Active'));

// --- STRICT AUTHENTICATION API ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role, name, village, mandal, isRegister } = req.body;

  try {
    let user = await User.findOne({ email });

    if (isRegister) {
      if (user) return res.status(400).json({ error: 'Email already registered! Please sign in.' });
      
      user = new User({ email, password, role, name, village, mandal });
      await user.save();
      return res.status(201).json(user);
    } 

    // Login checks
    if (!user) {
      return res.status(404).json({ error: 'User not registered! Please create an account first.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password!' });
    }

    // Role Enforcement Check
    if (user.role !== role) {
      return res.status(403).json({ 
        error: `Access Denied: Account registered as "${user.role}", cannot sign in as "${role}".` 
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATA ROUTES ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/ledger', async (req, res) => {
  try {
    const ledger = await Ledger.find().sort({ createdAt: -1 });
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ledger/mint', async (req, res) => {
  try {
    const newTx = new Ledger(req.body);
    await newTx.save();
    
    // Update project state in DB
    await Project.findOneAndUpdate(
      { id: req.body.projId }, 
      { $inc: { creditsMinted: req.body.amount }, status: 'Verified' }
    );
    
    res.status(201).json(newTx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));