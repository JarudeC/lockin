'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { useAppState, useAppActions } from '../../context/AppContext';
import { useNotifications } from '../../components/NotificationSystem';
import UserDashboard from '../../components/UserDashboard';
import WalletConnect from '../../components/WalletConnect';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { formatAddress, validateEmail, copyToClipboard } from '../../utils/helpers';

export default function ProfilePage() {
  const router = useRouter();
  const { account, isMetaMaskInstalled } = useWallet();
  const { user } = useAppState();
  const { setUser } = useAppActions();
  const notifications = useNotifications();
  const ADMIN_ADDRESS = "0xb05542907644713d95004f9e5984fcb706165937";
  
  useEffect(() => {
    // Only redirect if the user is an admin and explicitly navigated to /profile
    if (account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase() && window.location.pathname === '/profile') {
      router.push('/admin');
    }
  }, [account, router]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    twitter: user?.twitter || '',
    github: user?.github || '',
    website: user?.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [userEvents, setUserEvents] = useState([]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        twitter: user.twitter || '',
        github: user.github || '',
        website: user.website || ''
      });
    }
  }, [user]);

  // Fetch user's RSVPed events when account changes
  useEffect(() => {
    if (account) {
      const state = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('appState') || '{}') 
        : {};
      
      const allEvents = state.events || [];
      const userRsvpedEvents = allEvents.filter(event => 
        event.attendees?.some(attendee => 
          attendee.address?.toLowerCase() === account?.toLowerCase()
        )
      );
      
      setUserEvents(userRsvpedEvents);
    }
  }, [account]);

  const handleSaveProfile = async () => {
    if (!editForm.email.trim()) {
      notifications.error('Email Required', 'Please enter your email address');
      return;
    }

    if (!validateEmail(editForm.email)) {
      notifications.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = {
        ...user,
        address: account,
        ...editForm,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      setShowEditModal(false);
      notifications.success('Profile Updated', 'Your profile has been saved successfully');
    } catch (error) {
      notifications.error('Save Failed', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAddress = async () => {
    if (await copyToClipboard(account)) {
      notifications.success('Copied!', 'Wallet address copied to clipboard');
    } else {
      notifications.error('Copy Failed', 'Failed to copy address to clipboard');
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">User Profile</h1>
              <p className="text-gray-600">Please connect your wallet to access your profile.</p>
            </div>
            
            <WalletConnect variant="card" />
            
            {!isMetaMaskInstalled && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">MetaMask Required</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Install MetaMask browser extension to connect your wallet and access your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account and view your event activity</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back to Events
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowEditModal(true)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : formatAddress(account).slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || 'Anonymous User'}</h2>
                  <p className="text-indigo-200">
                    {formatAddress(account)}
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 text-indigo-200 hover:text-white transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </p>
                  {user?.email && (
                    <p className="text-indigo-200 text-sm">{user.email}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-indigo-200">Member since</div>
                <div className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  }) : 'Recently'}
                </div>
              </div>
            </div>
            
            {user?.bio && (
              <div className="mt-4">
                <p className="text-indigo-100">{user.bio}</p>
              </div>
            )}
            
            {/* Social Links */}
            {(user?.twitter || user?.github || user?.website) && (
              <div className="mt-4 flex space-x-4">
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-200 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-200 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-200 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Dashboard */}
        <UserDashboard />

        {/* Edit Profile Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Profile"
          size="lg"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                loading={isSaving}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Your name"
              />
              <Input
                label="Email Address"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Twitter Handle"
                value={editForm.twitter}
                onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value.replace('@', '') })}
                placeholder="username"
                leftIcon={<span className="text-gray-400">@</span>}
              />
              <Input
                label="GitHub Username"
                value={editForm.github}
                onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                placeholder="username"
              />
              <Input
                label="Website"
                type="url"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://yoursite.com"
              />
            </div>

            {/* Wallet Info (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Wallet Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <span className="font-mono">{account}</span>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  This is your connected wallet address and cannot be changed.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}