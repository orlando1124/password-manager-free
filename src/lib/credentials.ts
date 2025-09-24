import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Credential, CredentialFormData } from '@/types/credential';

export class CredentialsService {
  private static getCredentialsCollection(userId: string) {
    return collection(db, 'users', userId, 'credentials');
  }

  static async addCredential(userId: string, credentialData: CredentialFormData): Promise<string> {
    try {
      const docRef = await addDoc(this.getCredentialsCollection(userId), {
        ...credentialData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding credential:', error);
      throw new Error('Failed to add credential');
    }
  }

  static async updateCredential(userId: string, credentialId: string, credentialData: Partial<CredentialFormData>): Promise<void> {
    try {
      const credentialRef = doc(db, 'users', userId, 'credentials', credentialId);
      await updateDoc(credentialRef, {
        ...credentialData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating credential:', error);
      throw new Error('Failed to update credential');
    }
  }

  static async deleteCredential(userId: string, credentialId: string): Promise<void> {
    try {
      const credentialRef = doc(db, 'users', userId, 'credentials', credentialId);
      await deleteDoc(credentialRef);
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw new Error('Failed to delete credential');
    }
  }

  static async getCredentials(userId: string): Promise<Credential[]> {
    try {
      const credentialsQuery = query(
        this.getCredentialsCollection(userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(credentialsQuery);
      const credentials: Credential[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        credentials.push({
          id: doc.id,
          site: data.site,
          username: data.username,
          password: data.password,
          category: data.category || 'Other',
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      return credentials;
    } catch (error) {
      console.error('Error fetching credentials:', error);
      throw new Error('Failed to fetch credentials');
    }
  }

  static async searchCredentials(userId: string, searchTerm: string): Promise<Credential[]> {
    try {
      const credentialsQuery = query(
        this.getCredentialsCollection(userId),
        orderBy('site'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(credentialsQuery);
      const credentials: Credential[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const credential: Credential = {
          id: doc.id,
          site: data.site,
          username: data.username,
          password: data.password,
          category: data.category || 'Other',
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        
        // Client-side filtering for search
        if (searchTerm === '' || 
            credential.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
            credential.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            credential.category?.toLowerCase().includes(searchTerm.toLowerCase())) {
          credentials.push(credential);
        }
      });
      
      return credentials;
    } catch (error) {
      console.error('Error searching credentials:', error);
      throw new Error('Failed to search credentials');
    }
  }
}
