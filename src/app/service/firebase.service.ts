import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  // AUTENTICAÇÃO
  async registrarUsuario(email: string, password: string, nome: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    const userRef = doc(this.db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      nome: nome,
      email: email,
      dataCriacao: new Date()
    });

    return userCredential;
  }

  async loginUsuario(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // CORRIGIDO: obterDadosUsuario
  async obterDadosUsuario(uid: string): Promise<any> {
    try {
      const userRef = doc(this.db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  getUsuarioAtual() {
    return this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // MÚSICAS
  async adicionarMusica(musica: any): Promise<void> {
    const musicasRef = collection(this.db, 'musicas');
    await addDoc(musicasRef, musica);
  }

  async obterMusicasPorUsuario(userId: string): Promise<any[]> {
    try {
      const musicasRef = collection(this.db, 'musicas');
      const q = query(musicasRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const musicas: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        musicas.push({
          id: doc.id,
          artista: data['artista'],
          nome: data['nome'],
          duracao: data['duracao'],
          album: data['album'],
          genero: data['genero'],
          userId: data['userId'],
          dataCriacao: data['dataCriacao']?.toDate?.() || data['dataCriacao'] || new Date()
        });
      });
      
      return musicas.sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      return [];
    }
  }

  async obterMusicaPorId(musicaId: string, userId: string): Promise<any> {
    const musicas = await this.obterMusicasPorUsuario(userId);
    return musicas.find(m => m.id === musicaId);
  }

  // ATUALIZAR MÚSICA - CORRIGIDO
async atualizarMusica(musicaId: string, musicaAtualizada: any): Promise<void> {
  try {
    console.log('Atualizando música ID:', musicaId, 'Dados:', musicaAtualizada);
    
    const musicaRef = doc(this.db, 'musicas', musicaId);
    await updateDoc(musicaRef, musicaAtualizada);
    
    console.log('Música atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar música:', error);
    throw error;
  }
}

// EXCLUIR MÚSICA - CORRIGIDO  
async excluirMusica(musicaId: string): Promise<void> {
  try {
    console.log('Excluindo música ID:', musicaId);
    
    const musicaRef = doc(this.db, 'musicas', musicaId);
    await deleteDoc(musicaRef);
    
    console.log('Música excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir música:', error);
    throw error;
  }
}
}