import { PasswordGeneratorOptions } from '@/types/credential';

export class PasswordGenerator {
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly NUMBERS = '0123456789';
  private static readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  static generatePassword(options: PasswordGeneratorOptions): string {
    let charset = '';
    
    if (options.includeLowercase) charset += this.LOWERCASE;
    if (options.includeUppercase) charset += this.UPPERCASE;
    if (options.includeNumbers) charset += this.NUMBERS;
    if (options.includeSymbols) charset += this.SYMBOLS;
    
    if (charset === '') {
      throw new Error('At least one character type must be selected');
    }
    
    let password = '';
    for (let i = 0; i < options.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  static calculateStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Determine strength level
    if (score <= 2) {
      return { score, label: 'Weak', color: 'text-red-500' };
    } else if (score <= 4) {
      return { score, label: 'Fair', color: 'text-yellow-500' };
    } else if (score <= 6) {
      return { score, label: 'Good', color: 'text-blue-500' };
    } else {
      return { score, label: 'Strong', color: 'text-green-500' };
    }
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
