// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user, apiBase } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiBase}/auth/me`);
        setProfile(res.data.user);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    fetchProfile();
  }, [user, apiBase]);

  if (!user) return <div>Login to see your dashboard.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Dashboard</h2>
      <div>
        <strong>Logged in as:</strong> {user.email} ({profile?.role})
      </div>

      {profile?.role === 'institution' && (
        <div style={{ marginTop: 12 }}>
          <a href="/dashboard/institution">Go to Institution Dashboard</a>
        </div>
      )}
    </div>
  );
}
