// 🔥 SINGLETON AUTH MANAGER - Fuera de React
class AuthManager {
  private static instance: AuthManager | null = null;
  private user: any = null;
  private loading: boolean = true;
  private listeners: Set<() => void> = new Set();
  private tokens: any = null;
  
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      console.log('✅ Creando ÚNICA instancia de AuthManager');
      AuthManager.instance = new AuthManager();
    } else {
      console.log('♻️ Reutilizando AuthManager singleton');
    }
    return AuthManager.instance;
  }
  
  private constructor() {
    this.init();
  }
  
  private async init() {
    // Lógica de inicialización aquí
    console.log('🔄 AuthManager: Inicializando...');
    this.loading = false;
    this.notifyListeners();
  }
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
  
  getState() {
    return {
      user: this.user,
      loading: this.loading,
      isAuthenticated: !!this.user
    };
  }
  
  async login(email: string, password: string) {
    // Lógica de login aquí
    console.log('🔐 AuthManager: Login...');
  }
  
  async signOut() {
    this.user = null;
    this.tokens = null;
    this.notifyListeners();
  }
}

export default AuthManager;