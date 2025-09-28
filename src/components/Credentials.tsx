"use client";

import { useState, useEffect, useCallback } from "react";
import { Credential, CredentialFormData } from "@/types/credential";
import { CredentialsService } from "@/lib/credentials";
import { useAuth } from "@/context/AuthContext";
import AddCredential from "./AddCredential";

export default function Credentials() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<{ id: string; data: CredentialFormData } | undefined>(undefined);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const categories = ["All", "Social Media", "Work", "Banking", "Shopping", "Entertainment", "Education", "Other"];

  const loadCredentials = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await CredentialsService.getCredentials(user.uid);
      setCredentials(data);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user, loadCredentials]);

  const filterCredentials = useCallback(() => {
    let filtered = credentials;

    if (searchTerm) {
      filtered = filtered.filter(cred => 
        cred.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cred.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(cred => cred.category === selectedCategory);
    }

    setFilteredCredentials(filtered);
  }, [credentials, searchTerm, selectedCategory]);

  useEffect(() => {
    filterCredentials();
  }, [filterCredentials]);


  const handleDelete = async (credentialId: string) => {
    if (!user) return;
    
    if (confirm("Are you sure you want to delete this credential?")) {
      try {
        await CredentialsService.deleteCredential(user.uid, credentialId);
        await loadCredentials();
      } catch (error) {
        console.error("Failed to delete credential:", error);
      }
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential({
      id: credential.id!,
      data: {
        site: credential.site,
        username: credential.username,
        password: credential.password,
        category: credential.category || "Other",
        notes: credential.notes || ""
      }
    });
    setShowAddForm(true);
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleCredentialAdded = () => {
    setShowAddForm(false);
    setEditingCredential(undefined);
    loadCredentials();
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCredential(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Password Vault</h1>
            <p className="text-gray-600">Manage your credentials securely</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            + Add Credential
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Credentials Grid */}
      {filteredCredentials.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== "All" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first credential"}
          </p>
          {!searchTerm && selectedCategory === "All" && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Add Your First Credential
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map((credential) => (
            <div
              key={credential.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Site Name and Category */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{credential.site}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      {credential.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(credential)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(credential.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">{credential.username}</span>
                    <button
                      onClick={() => copyToClipboard(credential.username)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Copy username"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900">
                      {showPassword[credential.id!] ? credential.password : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(credential.id!)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title={showPassword[credential.id!] ? "Hide password" : "Show password"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword[credential.id!] ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(credential.password)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Copy password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {credential.notes && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                    <p className="text-gray-700 text-sm">{credential.notes}</p>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Added {new Date(credential.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Credential Modal */}
      {showAddForm && (
        <AddCredential
          onCredentialAdded={handleCredentialAdded}
          onCancel={handleCancel}
          editingCredential={editingCredential}
        />
      )}
    </div>
  );
}
