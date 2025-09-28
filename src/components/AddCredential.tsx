"use client";

import { useState } from "react";
import { CredentialFormData, CREDENTIAL_CATEGORIES, PasswordGeneratorOptions, DEFAULT_PASSWORD_OPTIONS } from "@/types/credential";
import { PasswordGenerator } from "@/lib/passwordGenerator";
import { CredentialsService } from "@/lib/credentials";
import { useAuth } from "@/context/AuthContext";

interface AddCredentialProps {
  onCredentialAdded: () => void;
  onCancel: () => void;
  editingCredential?: {
    id: string;
    data: CredentialFormData;
  };
}

export default function AddCredential({ onCredentialAdded, onCancel, editingCredential }: AddCredentialProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CredentialFormData>(
    editingCredential?.data || {
      site: '',
      username: '',
      password: '',
      category: 'Other',
      notes: ''
    }
  );
  const [passwordOptions, setPasswordOptions] = useState<PasswordGeneratorOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof CredentialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const generatePassword = () => {
    try {
      const newPassword = PasswordGenerator.generatePassword(passwordOptions);
      setFormData(prev => ({ ...prev, password: newPassword }));
      setShowPasswordGenerator(false);
    } catch {
      setError('Failed to generate password');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      if (editingCredential) {
        await CredentialsService.updateCredential(user.uid, editingCredential.id, formData);
      } else {
        await CredentialsService.addCredential(user.uid, formData);
      }
      onCredentialAdded();
    } catch {
      setError('Failed to save credential');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = PasswordGenerator.calculateStrength(formData.password);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {editingCredential ? 'Edit Credential' : 'Add New Credential'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website/App Name *
            </label>
            <input
              type="text"
              value={formData.site}
              onChange={(e) => handleInputChange('site', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200"
              placeholder="e.g., Gmail, Facebook"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username/Email *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200"
              placeholder="username@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(formData.password)}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                title="Copy password"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-600">Strength:</span>
                <span className={`text-sm font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              {showPasswordGenerator ? 'Hide' : 'Generate'} Password
            </button>

            {showPasswordGenerator && (
              <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <h4 className="font-semibold mb-3 text-gray-900">Password Generator</h4>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Length: {passwordOptions.length}</label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={passwordOptions.length}
                      onChange={(e) => setPasswordOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeUppercase}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Uppercase (A-Z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeLowercase}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Lowercase (a-z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeNumbers}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Numbers (0-9)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={passwordOptions.includeSymbols}
                        onChange={(e) => setPasswordOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Symbols (!@#$)</span>
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors duration-200"
                  >
                    Generate Password
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200"
            >
              {CREDENTIAL_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200 resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors duration-200"
            >
              {isLoading ? 'Saving...' : (editingCredential ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
