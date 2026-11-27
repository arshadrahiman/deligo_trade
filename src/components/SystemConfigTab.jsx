import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  Settings,
  Key,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Check,
  X,
  FileText,
  Building,
  CreditCard,
  Layers,
  Sparkles,
  Tag,
  Clock,
  Save,
} from 'lucide-react';
import { useApp, sanitizeInput } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';

export default function SystemConfigTab() {
  const {
    currentRole,
    currentAdminUser,
    ROLES,
    roleDefinitions,
    accounts,
    createAccount,
    updateAccount,
    deleteAccount,
    updateRolePermission,
    updateRoleInfo,
    resetRolesToDefault,
    systemConfig,
    updateSystemConfig,
    resetSystemConfig,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('accounts'); // 'accounts' | 'roles' | 'config'
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleKey, setSelectedRoleKey] = useState(ROLES.SALES_AGENT);

  // Modals state
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form state for creating account
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES.SALES_AGENT);
  const [newStatus, setNewStatus] = useState('active');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form state for editing role
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingRoleBadge, setEditingRoleBadge] = useState('');
  const [editingRoleDesc, setEditingRoleDesc] = useState('');

  // Form state for editing account
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState(ROLES.SALES_AGENT);
  const [editStatus, setEditStatus] = useState('active');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Config form state
  const [cfgSessionHours, setCfgSessionHours] = useState(systemConfig?.sessionTimeoutHours || 4);
  const [cfgMaxAttempts, setCfgMaxAttempts] = useState(systemConfig?.maxFailedAttempts || 5);
  const [cfgLockoutSecs, setCfgLockoutSecs] = useState(systemConfig?.lockoutDurationSeconds || 300);
  const [cfgQuotePrefix, setCfgQuotePrefix] = useState(systemConfig?.quotationPrefix || 'QT-2026-');
  const [cfgInvoicePrefix, setCfgInvoicePrefix] = useState(systemConfig?.invoicePrefix || 'INV-2026-');
  const [cfgVatRate, setCfgVatRate] = useState(systemConfig?.vatRatePercentage || 5);
  const [cfgCurrency, setCfgCurrency] = useState(systemConfig?.currencySymbol || 'AED');
  const [cfgSavedBanner, setCfgSavedBanner] = useState(false);

  // Check if current user is Super Admin
  if (currentRole !== ROLES.SUPER_ADMIN) {
    return (
      <div className="p-8 rounded-2xl bg-surface border border-red-500/30 text-center space-y-3">
        <Lock className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider">
          Access Restricted: Super Admin Authority Required
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Account creation, RBAC permission matrices, and system configurations are restricted to the Super Admin developer team.
        </p>
      </div>
    );
  }

  // Filtered accounts list
  const filteredAccounts = (accounts || []).filter((acc) => {
    const q = userSearch.toLowerCase().trim();
    return (
      !q ||
      acc.username.toLowerCase().includes(q) ||
      acc.name.toLowerCase().includes(q) ||
      (acc.role && acc.role.toLowerCase().includes(q))
    );
  });

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setNewRole(ROLES.SALES_AGENT);
    setNewStatus('active');
    setShowNewPassword(false);
    setFormError('');
    setIsCreateAccountOpen(true);
  };

  // Handle submit create account
  const handleCreateAccountSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const res = createAccount({
      username: newUsername,
      name: newName,
      password: newPassword,
      role: newRole,
      status: newStatus,
    });
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setFormSuccess(`Account "@${newUsername}" created successfully with role ${roleDefinitions[newRole]?.name}!`);
    setIsCreateAccountOpen(false);
    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Handle open edit account modal
  const handleOpenEditModal = (acc) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditPassword('');
    setEditRole(acc.role);
    setEditStatus(acc.status || 'active');
    setShowEditPassword(false);
    setFormError('');
  };

  // Handle submit edit account
  const handleEditAccountSubmit = (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    setFormError('');
    const updateData = {
      name: editName,
      role: editRole,
      status: editStatus,
    };
    if (editPassword.trim()) {
      updateData.password = editPassword.trim();
    }
    const res = updateAccount(editingAccount.id || editingAccount.username, updateData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setEditingAccount(null);
    setFormSuccess(`Account "@${editingAccount.username}" updated successfully!`);
    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Handle quick toggle account status
  const handleToggleStatus = (acc) => {
    const nextStatus = acc.status === 'suspended' ? 'active' : 'suspended';
    updateAccount(acc.id || acc.username, { status: nextStatus });
  };

  // Handle delete account
  const handleDeleteAccount = (acc) => {
    if (window.confirm(`Are you sure you want to delete agent account "@${acc.username}"? This action cannot be undone.`)) {
      const res = deleteAccount(acc.id || acc.username);
      if (!res.success) {
        alert(res.message);
      } else {
        setFormSuccess(`Account "@${acc.username}" has been removed from the system.`);
        setTimeout(() => setFormSuccess(''), 4000);
      }
    }
  };

  // Current selected role definition
  const currentSelectedRole = roleDefinitions[selectedRoleKey] || roleDefinitions[ROLES.SALES_AGENT];

  // Handle save role info
  const handleSaveRoleInfo = (e) => {
    e.preventDefault();
    updateRoleInfo(selectedRoleKey, {
      name: editingRoleName || currentSelectedRole.name,
      badge: editingRoleBadge || currentSelectedRole.badge,
      description: editingRoleDesc || currentSelectedRole.description,
    });
    setFormSuccess(`Role details for "${currentSelectedRole.name}" updated successfully!`);
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // Handle save system config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateSystemConfig({
      sessionTimeoutHours: Number(cfgSessionHours) || 4,
      maxFailedAttempts: Number(cfgMaxAttempts) || 5,
      lockoutDurationSeconds: Number(cfgLockoutSecs) || 300,
      quotationPrefix: sanitizeInput(cfgQuotePrefix) || 'QT-2026-',
      invoicePrefix: sanitizeInput(cfgInvoicePrefix) || 'INV-2026-',
      vatRatePercentage: Number(cfgVatRate) || 5,
      currencySymbol: sanitizeInput(cfgCurrency) || 'AED',
    });
    setCfgSavedBanner(true);
    setTimeout(() => setCfgSavedBanner(false), 3000);
  };

  // Available permissions list with friendly descriptions
  const PERMISSION_CONFIG_ITEMS = [
    {
      key: 'quotationCreation',
      title: 'Quotation Creation',
      desc: 'Allows agent to select catalog machinery and draft commercial equipment quotations.',
      badge: 'Sales & Invoicing',
    },
    {
      key: 'productListing',
      title: 'Product Catalog Listing',
      desc: 'Allows agent to view the warehouse stock catalog, categories, specifications & rates.',
      badge: 'Catalog View',
    },
    {
      key: 'quotationReview',
      title: 'Quotation Review Mode',
      desc: 'Allows officer to open pending quotations and inspect draft equipment lines and terms.',
      badge: 'Review Stage',
    },
    {
      key: 'quotationModification',
      title: 'Quotation Modification',
      desc: 'Allows modification of quantities, line items, and custom charges during the review stage.',
      badge: 'Finance / Admin',
    },
    {
      key: 'unitPriceModification',
      title: 'Unit Price Modification',
      desc: 'Allows adjusting unit prices and commercial discount offers prior to approval.',
      badge: 'Pricing Control',
    },
    {
      key: 'purchaseAmountModification',
      title: 'Purchase Rate Modification',
      desc: 'Allows viewing and modifying wholesale factory acquisition costs for margin analysis.',
      badge: 'Admin Only',
    },
    {
      key: 'productionCrud',
      title: 'Production & Inventory CRUD',
      desc: 'Allows adding new equipment, modifying stock quantities, and editing model specifications.',
      badge: 'Operations Admin',
    },
    {
      key: 'quotationApproval',
      title: 'Quotation Approval',
      desc: 'Authorizes officer to formally approve pending quotations and lock them against alterations.',
      badge: 'Approval Authority',
    },
    {
      key: 'salesConversion',
      title: 'Sales Conversion & Invoicing',
      desc: 'Authorizes converting approved quotations into official VAT Tax Invoices.',
      badge: 'Finance Officer',
    },
    {
      key: 'dashboardDatas',
      title: 'Executive Dashboard Metrics',
      desc: 'Grants access to executive summary metrics, pipeline values, and invoiced sales totals.',
      badge: 'Executive',
    },
    {
      key: 'dashboardGraph',
      title: 'Financial Profit Graphs',
      desc: 'Grants access to interactive gross profit graphs, profit margins, and revenue analytics.',
      badge: 'Analytics',
    },
    {
      key: 'brandingManagement',
      title: 'Logo & Branding Management',
      desc: 'Allows updating company legal name, TRN, address, contacts, and custom invoice header logos.',
      badge: 'Company Settings',
    },
    {
      key: 'bankManagement',
      title: 'Bank Accounts Management',
      desc: 'Allows adding, editing, and selecting bank payment details displayed on invoices.',
      badge: 'Banking',
    },
    {
      key: 'systemConfig',
      title: 'System & Access Configuration',
      desc: 'Root administrative authority to manage user accounts, RBAC permissions, and system controls.',
      badge: 'Root Super Admin',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-600/10 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0 shadow-lg shadow-red-500/10">
            <Sliders className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                SUPER ADMIN ROOT CONTROL • SYSTEM & ACCESS CONFIG
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30 font-bold">
                Root Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage enterprise agent accounts, configure RBAC permissions for all 4 roles, and adjust system operational parameters.
            </p>
          </div>
        </div>

        {/* Super Admin Identity Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070A12] border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Authenticated:</span>
          <span className="text-red-400 font-bold">@{currentAdminUser?.username || 'superadmin'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-semibold">{currentAdminUser?.name || 'Enterprise Admin'}</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
          <button onClick={() => setFormSuccess('')} className="text-emerald-400 hover:text-white font-mono">
            ✕
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
            activeSubTab === 'accounts'
              ? 'bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-black shadow-md shadow-red-500/20'
              : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agent Accounts ({(accounts || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
            activeSubTab === 'roles'
              ? 'bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-black shadow-md shadow-red-500/20'
              : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Roles & RBAC Permissions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
            activeSubTab === 'config'
              ? 'bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-black shadow-md shadow-red-500/20'
              : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Parameters & Security</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: AGENT ACCOUNTS MANAGEMENT (CRUD)               */}
      {/* ========================================================= */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search accounts by username, display name, or role..."
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-bold uppercase text-xs flex items-center justify-center gap-1.5 hover:brightness-110 whitespace-nowrap shadow-md shadow-red-500/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Agent Account</span>
            </button>
          </div>

          {/* Accounts List Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#070A12]/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Officer / Account</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAccounts.map((acc) => {
                  const roleDef = roleDefinitions[acc.role] || roleDefinitions[ROLES.SALES_AGENT];
                  const isCurrent = acc.username.toLowerCase() === currentAdminUser?.username?.toLowerCase();
                  const isSuspended = acc.status === 'suspended';

                  return (
                    <tr key={acc.id || acc.username} className="hover:bg-white/[0.02] transition-colors">
                      {/* Officer & Username */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                              roleDef.borderColor || 'border-white/20'
                            } ${roleDef.bgColor || 'bg-white/5'} ${roleDef.textColor || 'text-white'}`}
                          >
                            {(acc.name || acc.username || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">{acc.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                              @{acc.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            roleDef.borderColor || 'border-white/20'
                          } ${roleDef.bgColor || 'bg-white/5'} ${roleDef.textColor || 'text-white'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{roleDef.name}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <Lock className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {acc.createdAt || '2026-01-01'}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Suspended */}
                          <button
                            onClick={() => handleToggleStatus(acc)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isSuspended
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            } ${isCurrent ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={
                              isCurrent
                                ? 'Cannot suspend your own active session'
                                : isSuspended
                                ? 'Activate Account'
                                : 'Suspend Account'
                            }
                          >
                            {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Account */}
                          <button
                            onClick={() => handleOpenEditModal(acc)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Account Credentials & Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteAccount(acc)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border text-red-400 transition-colors ${
                              isCurrent
                                ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/5'
                                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                            }`}
                            title={isCurrent ? 'Cannot delete your own active session' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: ROLES & RBAC ACCESS PERMISSIONS                */}
      {/* ========================================================= */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[ROLES.SALES_AGENT, ROLES.FINANCE_AGENT, ROLES.ADMIN_AGENT, ROLES.SUPER_ADMIN].map((rKey) => {
              const rDef = roleDefinitions[rKey];
              const isSelected = selectedRoleKey === rKey;

              return (
                <button
                  key={rKey}
                  onClick={() => {
                    setSelectedRoleKey(rKey);
                    setEditingRoleName(rDef.name);
                    setEditingRoleBadge(rDef.badge);
                    setEditingRoleDesc(rDef.description);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-surface ${rDef.borderColor} ring-1 ring-white/20 shadow-lg`
                      : 'bg-surface/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase ${rDef.textColor}`}>
                      {rDef.badge}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white">{rDef.name}</h4>
                  {rDef.description && (
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {rDef.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Role Configuration Panel */}
          <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
            {/* Role Header & Description Editor */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-bold uppercase tracking-tight ${currentSelectedRole.textColor}`}>
                    {currentSelectedRole.name} • Access Matrix
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${currentSelectedRole.borderColor} ${currentSelectedRole.bgColor} ${currentSelectedRole.textColor} font-bold`}>
                    {currentSelectedRole.badge}
                  </span>
                </div>
                {currentSelectedRole.description && (
                  <p className="text-xs text-amber-400/90 font-mono mt-1">
                    Product Scope: {currentSelectedRole.description}
                  </p>
                )}
              </div>

              <button
                onClick={resetRolesToDefault}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Restore all 4 roles to factory RBAC defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Roles to Default</span>
              </button>
            </div>

            {/* Permissions Toggles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PERMISSION_CONFIG_ITEMS.map((perm) => {
                const isEnabled = Boolean(currentSelectedRole.permissions?.[perm.key]);

                return (
                  <div
                    key={perm.key}
                    onClick={() => updateRolePermission(selectedRoleKey, perm.key, !isEnabled)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isEnabled
                        ? 'bg-white/[0.03] border-emerald-500/40 hover:border-emerald-500/60 shadow-sm'
                        : 'bg-[#070A12] border-white/5 hover:border-white/10 opacity-70'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{perm.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                          {perm.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{perm.desc}</p>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-800 border border-white/10'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        } flex items-center justify-center`}
                      >
                        {isEnabled ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <X className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: SYSTEM PARAMETERS & SECURITY CONFIG            */}
      {/* ========================================================= */}
      {activeSubTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
            {cfgSavedBanner && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>System configuration parameters updated and persisted to storage.</span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Security & Authentication Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure login rate limits, brute-force lockout duration, and session timeout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Session Maximum Lifetime (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={cfgSessionHours}
                  onChange={(e) => setCfgSessionHours(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Active sessions expire automatically after this duration.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Max Failed Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={cfgMaxAttempts}
                  onChange={(e) => setCfgMaxAttempts(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Triggers security lockout after consecutive invalid logins.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Security Lockout Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="1800"
                  value={cfgLockoutSecs}
                  onChange={(e) => setCfgLockoutSecs(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Terminal lockout duration before login is re-enabled.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Commercial Document Sequence & Valuation Standards
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set quotation reference code prefixes, invoice prefixes, and statutory UAE VAT rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Quotation Prefix</label>
                <input
                  type="text"
                  value={cfgQuotePrefix}
                  onChange={(e) => setCfgQuotePrefix(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Tax Invoice Prefix</label>
                <input
                  type="text"
                  value={cfgInvoicePrefix}
                  onChange={(e) => setCfgInvoicePrefix(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">UAE VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={cfgVatRate}
                  onChange={(e) => setCfgVatRate(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Currency Code</label>
                <input
                  type="text"
                  value={cfgCurrency}
                  onChange={(e) => setCfgCurrency(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
              </div>
            </div>

            {/* UI Theme & Appearance Mode */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#070A12] border border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Terminal Appearance & Theme Mode
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select Light, Dark, or System mode. System setting is the default and dynamically follows your device OS theme.
                  </p>
                </div>
                <div>
                  <ThemeToggle variant="header" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={resetSystemConfig}
                className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-bold font-mono uppercase text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-red-500/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save System Parameters</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW AGENT ACCOUNT                           */}
      {/* ========================================================= */}
      {isCreateAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Create New Agent Account
                </h3>
              </div>
              <button onClick={() => setIsCreateAccountOpen(false)} className="text-slate-400 hover:text-white font-mono">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Login Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. sales2, dubai_admin, finance_lead"
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500/60"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Lowercase letters, numbers, hyphens, and underscores only.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Officer Full Name / Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Heavy Machinery Sales Specialist"
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Login Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter agent authentication password..."
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 pr-9 text-white font-mono focus:outline-none focus:border-red-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                  >
                    <option value={ROLES.SALES_AGENT}>Sales Agent</option>
                    <option value={ROLES.FINANCE_AGENT}>Finance Agent</option>
                    <option value={ROLES.ADMIN_AGENT}>Admin Agent</option>
                    <option value={ROLES.SUPER_ADMIN}>Super Admin Agent</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Account Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAccountOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-bold uppercase font-mono shadow-md hover:brightness-110"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT AGENT ACCOUNT                                 */}
      {/* ========================================================= */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Edit Account: @{editingAccount.username}
                </h3>
              </div>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-white font-mono">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditAccountSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Officer Full Name / Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Change Password (Leave blank to keep existing)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password if changing..."
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 pr-9 text-white font-mono focus:outline-none focus:border-red-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                  >
                    <option value={ROLES.SALES_AGENT}>Sales Agent</option>
                    <option value={ROLES.FINANCE_AGENT}>Finance Agent</option>
                    <option value={ROLES.ADMIN_AGENT}>Admin Agent</option>
                    <option value={ROLES.SUPER_ADMIN}>Super Admin Agent</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/60"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-bold uppercase font-mono shadow-md hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
