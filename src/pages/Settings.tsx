import { useState, useEffect, useRef } from 'react';
import { useConfigStore, defaultPrompts } from '../store/configStore';
import { useAuthStore } from '../store/authStore';
import { generateId } from '../lib/utils';
import { anythingLLMApi } from '../lib/api';
import { Plus, Trash2, Edit2, Save, X, RefreshCw } from 'lucide-react';
import type { Product, DiscoveryQuestion, UserRole, User } from '../types';

export default function Settings() {
  const {
    config,
    isLoading,
    loadConfig,
    addCategoryMapping,
    removeCategoryMapping,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePrompts,
  } = useConfigStore();
  const {
    currentUser,
    createUser,
    adminResetPassword,
    changePassword,
    getAllUsers,
    deleteUser,
  } = useAuthStore((state) => ({
    currentUser: state.currentUser,
    createUser: state.createUser,
    adminResetPassword: state.adminResetPassword,
    changePassword: state.changePassword,
    getAllUsers: state.getAllUsers,
    deleteUser: state.deleteUser,
  }));
  
  const [activeTab, setActiveTab] = useState<'users' | 'mappings' | 'products' | 'prompts'>('users');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newMapping, setNewMapping] = useState({ category: '', workspaceName: '' });
  const [newProduct, setNewProduct] = useState({ name: '', questions: [] as Omit<DiscoveryQuestion, 'answer'>[] });
  
  // Workspace fetching state
  const [workspaces, setWorkspaces] = useState<Array<{ slug: string; name: string }>>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string>('');
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // Question dialog state
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', category: '' });

  // Prompt editing state
  const [promptDrafts, setPromptDrafts] = useState(defaultPrompts);
  const [isPromptDirty, setIsPromptDirty] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Password management
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // User creation
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
  });
  const [userFormMessage, setUserFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Load config and users on mount
  useEffect(() => {
    loadConfig();
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [loadConfig, currentUser]);

  // Update prompt drafts when config loads
  useEffect(() => {
    if (config?.prompts) {
      setPromptDrafts(config.prompts);
      setIsPromptDirty(false);
    }
  }, [config?.prompts]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
        setShowWorkspaceDropdown(false);
      }
    };

    if (showWorkspaceDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkspaceDropdown]);

  const handleAddMapping = async () => {
    if (newMapping.category && newMapping.workspaceName) {
      try {
        await addCategoryMapping(newMapping);
        setNewMapping({ category: '', workspaceName: '' });
        setShowWorkspaceDropdown(false);
        setWorkspaceError('');
      } catch (error) {
        console.error('Failed to add mapping:', error);
        alert(error instanceof Error ? error.message : 'Failed to add mapping');
      }
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.questions.length > 0) {
      try {
        const product: Product = {
          id: generateId(),
          name: newProduct.name,
          questions: newProduct.questions.map((q) => ({
            ...q,
            answer: undefined,
          })),
        };
        await addProduct(product);
        setNewProduct({ name: '', questions: [] });
      } catch (error) {
        console.error('Failed to add product:', error);
        alert(error instanceof Error ? error.message : 'Failed to add product');
      }
    }
  };

  const handleAddQuestionToNewProduct = () => {
    setNewQuestion({ question: '', category: '' });
    setShowQuestionDialog(true);
  };

  const handleSaveQuestion = async () => {
    if (newQuestion.question.trim() && newQuestion.category) {
      const previousQuestions = [...newProduct.questions];
      const updatedQuestions = [
        ...newProduct.questions,
        { id: generateId(), question: newQuestion.question.trim(), category: newQuestion.category },
      ];
      
      // Update local state first
      setNewProduct({
        ...newProduct,
        questions: updatedQuestions,
      });
      setShowQuestionDialog(false);
      setNewQuestion({ question: '', category: '' });
      
      // If editing an existing product, save immediately to backend
      if (editingProduct) {
        try {
          await updateProduct(editingProduct.id, {
            ...editingProduct,
            name: newProduct.name,
            questions: updatedQuestions,
          });
        } catch (error) {
          console.error('Failed to save question:', error);
          alert(error instanceof Error ? error.message : 'Failed to save question. Please try again.');
          // Revert local state on error
          setNewProduct({
            ...newProduct,
            questions: previousQuestions,
          });
        }
      }
    }
  };

  const handleCancelQuestion = () => {
    setShowQuestionDialog(false);
    setNewQuestion({ question: '', category: '' });
  };

  // Get available categories from mappings
  const availableCategories = config?.categoryMappings.map(m => m.category) || [];

  const handlePromptChange = (key: keyof typeof promptDrafts, value: string) => {
    setPromptDrafts((prev) => {
      const next = { ...prev, [key]: value };
      setIsPromptDirty(
        config?.prompts ? (
          next.general !== config.prompts.general ||
          next.sizing !== config.prompts.sizing ||
          next.matrix !== config.prompts.matrix
        ) : true
      );
      return next;
    });
  };

  const handleSavePrompts = async () => {
    try {
      await updatePrompts({ ...promptDrafts });
      setIsPromptDirty(false);
    } catch (error) {
      console.error('Failed to save prompts:', error);
      alert(error instanceof Error ? error.message : 'Failed to save prompts');
    }
  };

  const handleResetPrompts = () => {
    setPromptDrafts({ ...defaultPrompts });
    setIsPromptDirty(
      config?.prompts ? (
        defaultPrompts.general !== config.prompts.general ||
        defaultPrompts.sizing !== config.prompts.sizing ||
        defaultPrompts.matrix !== config.prompts.matrix
      ) : false
    );
  };

  const handlePasswordFormChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (!currentUser) return;

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please complete all password fields.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password.';
      setPasswordMessage({ type: 'error', text: message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUserFormMessage(null);

    if (!newUserForm.username.trim() || !newUserForm.password || !newUserForm.confirmPassword) {
      setUserFormMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      setUserFormMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setIsCreatingUser(true);
      await createUser(newUserForm.username.trim(), newUserForm.password, newUserForm.role);
      setUserFormMessage({ type: 'success', text: 'User created successfully.' });
      setNewUserForm({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user',
      });
      await loadUsers(); // Reload users list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user.';
      setUserFormMessage({ type: 'error', text: message });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleResetUserPassword = async (userId: string, username: string) => {
    const newPassword = window.prompt(`Enter a new password for user "${username}":`);
    if (!newPassword) return;
    if (newPassword.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }

    try {
      await adminResetPassword(userId, newPassword);
      alert(`Password for "${username}" has been updated.`);
      await loadUsers(); // Reload users list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password.';
      alert(message);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      alert(`User "${username}" has been deleted.`);
      await loadUsers(); // Reload users list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user.';
      alert(message);
    }
  };

  const handleDeleteQuestionFromNewProduct = async (index: number) => {
    const previousQuestions = [...newProduct.questions];
    const updatedQuestions = newProduct.questions.filter((_, i) => i !== index);
    
    // Update local state first
    setNewProduct({
      ...newProduct,
      questions: updatedQuestions,
    });
    
    // If editing an existing product, save immediately to backend
    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, {
          ...editingProduct,
          name: newProduct.name,
          questions: updatedQuestions,
        });
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete question. Please try again.');
        // Revert local state on error
        setNewProduct({
          ...newProduct,
          questions: previousQuestions,
        });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      questions: product.questions,
    });
  };

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, {
          ...editingProduct,
          name: newProduct.name,
          questions: newProduct.questions,
        });
        setEditingProduct(null);
        setNewProduct({ name: '', questions: [] });
      } catch (error) {
        console.error('Failed to update product:', error);
        alert(error instanceof Error ? error.message : 'Failed to update product');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', questions: [] });
  };

  const handleFetchWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    setWorkspaceError('');
    try {
      const fetchedWorkspaces = await anythingLLMApi.getWorkspaces();
      if (fetchedWorkspaces.length === 0) {
        setWorkspaceError('No workspaces found. Please ensure AnythingLLM is running and has workspaces configured.');
      } else {
        setWorkspaces(fetchedWorkspaces);
        setShowWorkspaceDropdown(true);
      }
    } catch (error: any) {
      setWorkspaceError(`Failed to fetch workspaces: ${error.message || 'Unknown error'}`);
      console.error('Error fetching workspaces:', error);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleSelectWorkspace = (slug: string) => {
    setNewMapping({ ...newMapping, workspaceName: slug });
    setShowWorkspaceDropdown(false);
  };

  const handleRemoveCategoryMapping = async (category: string) => {
    try {
      await removeCategoryMapping(category);
    } catch (error) {
      console.error('Failed to remove mapping:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove mapping');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  if (isLoading || !config) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Settings
            </button>
            <button
              onClick={() => setActiveTab('mappings')}
              className={`${
                activeTab === 'mappings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Question Category Mappings
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Product Discovery Lists
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`${
                activeTab === 'prompts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Prompt Settings
            </button>
          </nav>
        </div>
      </div>

      {/* User Settings Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Password Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
                {passwordMessage && (
                  <span
                    className={`text-sm ${
                      passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {passwordMessage.text}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* User Management (Admin only) */}
          {currentUser?.role === 'admin' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">User Management (Admin)</h3>
                  <p className="text-sm text-gray-600">
                    Create new users or reset passwords for existing accounts. Default admin user is &quot;admin&quot;.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3">Create New User</h4>
                  <form className="space-y-3" onSubmit={handleCreateUser}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm((prev) => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={newUserForm.confirmPassword}
                          onChange={(e) =>
                            setNewUserForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isCreatingUser}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingUser ? 'Creating...' : 'Create User'}
                      </button>
                      {userFormMessage && (
                        <span
                          className={`text-sm ${
                            userFormMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {userFormMessage.text}
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3">Existing Users</h4>
                  {isLoadingUsers ? (
                    <div className="text-sm text-gray-500">Loading users...</div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-auto pr-1">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="border border-gray-200 rounded-lg px-3 py-2 flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                              {user.role === 'admin' && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(user.created_at).toLocaleString()}
                            </div>
                            {user.updated_at && (
                              <div className="text-xs text-gray-500">
                                Updated: {new Date(user.updated_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {currentUser?.id !== user.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResetUserPassword(user.id, user.username)}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                  Reset Password
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="text-sm text-gray-500">No users found.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Mappings Tab */}
      {activeTab === 'mappings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Question Category Mapping</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Category
                </label>
                <input
                  type="text"
                  value={newMapping.category}
                  onChange={(e) => setNewMapping({ ...newMapping, category: e.target.value })}
                  placeholder="e.g., Cloud General, Azure General"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name (Slug)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative" ref={workspaceDropdownRef}>
                    <input
                      type="text"
                      value={newMapping.workspaceName}
                      onChange={(e) => setNewMapping({ ...newMapping, workspaceName: e.target.value })}
                      onFocus={() => {
                        if (workspaces.length > 0) {
                          setShowWorkspaceDropdown(true);
                        }
                      }}
                      placeholder="AnythingLLM workspace slug"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {showWorkspaceDropdown && workspaces.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {workspaces.map((workspace) => (
                          <button
                            key={workspace.slug}
                            type="button"
                            onClick={() => handleSelectWorkspace(workspace.slug)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{workspace.name}</div>
                            <div className="text-sm text-gray-500">Slug: {workspace.slug}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchWorkspaces}
                    disabled={isLoadingWorkspaces}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    title="Fetch workspaces from AnythingLLM"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingWorkspaces ? 'animate-spin' : ''}`} />
                    {isLoadingWorkspaces ? 'Loading...' : 'Fetch'}
                  </button>
                </div>
                {workspaceError && (
                  <p className="mt-1 text-sm text-red-600">{workspaceError}</p>
                )}
                {!workspaceError && workspaces.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Found {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}. Click a workspace to select its slug.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleAddMapping}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Mapping
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Mappings</h3>
            <div className="space-y-2">
              {config?.categoryMappings.map((mapping) => (
                <div
                  key={mapping.category}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{mapping.category}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-gray-600">{mapping.workspaceName}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCategoryMapping(mapping.category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {!editingProduct && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Create Product Discovery List</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., Azure Compute, AWS Storage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discovery Questions
                  </label>
                  <button
                    onClick={handleAddQuestionToNewProduct}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-2">
                  {newProduct.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{q.question}</div>
                        <div className="text-sm text-gray-500">Category: {q.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestionFromNewProduct(idx)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name || newProduct.questions.length === 0}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Product
              </button>
            </div>
          )}

          {editingProduct && (
            <div className="bg-white rounded-lg shadow-sm border-2 border-primary-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Product</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discovery Questions
                  </label>
                  <button
                    onClick={handleAddQuestionToNewProduct}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
                <div className="space-y-2">
                  {newProduct.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{q.question}</div>
                        <div className="text-sm text-gray-500">Category: {q.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestionFromNewProduct(idx)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Products</h3>
            <div className="space-y-3">
              {config?.products.map((product) => (
                <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg">{product.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.questions.length} question{product.questions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prompt Settings Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Prompt Settings</h3>
                <p className="text-sm text-gray-600">
                  Define the base prompt used when querying the knowledge base from Customer Discovery. Prompts are selected based on the question category.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPrompts}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSavePrompts}
                  disabled={!isPromptDirty}
                  className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Save Prompts
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Prompt
                </label>
                <textarea
                  value={promptDrafts.general}
                  onChange={(e) => handlePromptChange('general', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for all question categories except Sizing and Matrix categories.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizing Prompt
                </label>
                <textarea
                  value={promptDrafts.sizing}
                  onChange={(e) => handlePromptChange('sizing', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Applied to question categories that include the keyword &quot;Sizing&quot;.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Prompt
                </label>
                <textarea
                  value={promptDrafts.matrix}
                  onChange={(e) => handlePromptChange('matrix', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Applied to question categories that include the keyword &quot;Matrix&quot;.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Dialog */}
      {showQuestionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Discovery Question</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter your discovery question..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Category
              </label>
              {availableCategories.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No categories available. Please add category mappings first in the "Question Category Mappings" tab.
                  </p>
                </div>
              ) : (
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelQuestion}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={!newQuestion.question.trim() || !newQuestion.category}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

