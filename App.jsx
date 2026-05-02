import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { Lock, LogOut, Trash2, ShieldCheck, Plus } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');
  const [vaultData, setVaultData] = useState([]);
  const [isLogin, setIsLogin] = useState(true);

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Data Sync (Only fetch user's private data)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "vault"), 
      where("uid", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVaultData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Handle Login/Signup
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Add Data to Vault
  const addEntry = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await addDoc(collection(db, "vault"), {
      text: note,
      uid: user.uid,
      createdAt: serverTimestamp()
    });
    setNote('');
  };

  // 5. Delete Data
  const deleteEntry = async (id) => {
    await deleteDoc(doc(db, "vault", id));
  };

  // --- UI: LOGIN PAGE ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
          <div className="flex justify-center mb-4 text-indigo-600">
            <Lock size={50} />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Ethara AI</h2>
          <p className="text-center text-gray-500 mb-8 font-medium">Secure Data Curation Vault</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              type="email" placeholder="Work Email" required
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              type="password" placeholder="Password" required
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-lg transition-all">
              {isLogin ? 'Sign In to Portal' : 'Create Secure Account'}
            </button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Need access?" : "Already have access?"} 
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-indigo-600 font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- UI: SECURE DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 font-bold text-2xl text-indigo-700">
            <ShieldCheck size={40} className="text-indigo-600" />
            <span>Ethara <span className="text-gray-400 font-light">Vault</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-gray-500 font-medium">{user.email}</span>
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-7 py-2 rounded-lg transition-all">
              <LogOut size={30} /> Logout
            </button>
          </div>
        </header>

        <form onSubmit={addEntry} className="mb-10 flex gap-3">
          <input 
            className="flex-1 p-5 rounded-2xl border-none shadow-md focus:ring-2 focus:ring-indigo-500 outline-none text-lg" 
            placeholder="Type sensitive record or AI note..." 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
          />
          <button className="bg-indigo-600 text-white px-8 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all">
            <Plus size={30} /> Save
          </button>
        </form>

        <div className="grid gap-4">
          <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Secure Records</h3>
          {vaultData.length === 0 && <p className="text-gray-400 italic">No records found. Your vault is empty.</p>}
          {vaultData.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-600 flex justify-between items-center group hover:shadow-md transition-all">
              <p className="text-gray-800 font-medium text-lg">{item.text}</p>
              <button 
                onClick={() => deleteEntry(item.id)} 
                className="text-gray-300 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={30} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}