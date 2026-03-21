/**
 * Admin Panel - Pivnice U Tygra
 * Firebase-ready admin interface for managing photos, events, and food menu.
 * Currently uses localStorage as fallback until Firebase is configured.
 *
 * Firebase setup: Add your config to window.FIREBASE_CONFIG before this script loads,
 * or configure in zola.toml [extra.firebase_*] fields.
 */

const STORAGE_PREFIX = 'utygra_admin_';

function adminApp() {
  return {
    // Auth state
    authUser: null,
    firebaseConnected: false,

    // Navigation
    activeTab: 'photos',
    tabs: [
      { id: 'photos', label: 'Fotografie' },
      { id: 'events', label: 'Akce' },
      { id: 'food', label: 'Jidelni listek' },
      { id: 'settings', label: 'Nastaveni' },
    ],

    // Photos
    photos: [],
    uploading: false,
    photoCategoryFilter: 'all',
    photoCategories: [
      { id: 'all', label: 'Vše' },
      { id: 'interior', label: 'Interiér' },
      { id: 'beer', label: 'Pivo' },
      { id: 'food', label: 'Jídlo' },
      { id: 'events', label: 'Akce' },
      { id: 'salonek', label: 'Salónek' },
    ],

    // Events
    events: [],
    showEventForm: false,
    editingEvent: null,
    eventForm: { title: '', date: '', time: '', category: 'jine', description: '' },

    // Food
    foodItems: [],
    showFoodForm: false,
    editingFood: null,
    foodForm: { name: '', price: '', weight: '', category: 'cold', desc: '' },

    get filteredPhotos() {
      if (this.photoCategoryFilter === 'all') return this.photos;
      return this.photos.filter(p => p.category === this.photoCategoryFilter);
    },

    init() {
      this._initFirebase();
      this._loadLocalData();
    },

    // === Auth ===

    async signIn() {
      if (this.firebaseConnected && window._firebaseAuth) {
        const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(window._firebaseAuth, provider);
          this.authUser = { email: result.user.email, uid: result.user.uid };
          this._saveLocal('auth', this.authUser);
        } catch (e) {
          console.error('Firebase auth error:', e);
          this._fallbackAuth();
        }
      } else {
        this._fallbackAuth();
      }
    },

    _fallbackAuth() {
      // Local-only auth for development
      this.authUser = { email: 'local@admin', uid: 'local' };
      this._saveLocal('auth', this.authUser);
    },

    signOut() {
      this.authUser = null;
      localStorage.removeItem(STORAGE_PREFIX + 'auth');
      if (window._firebaseAuth) {
        window._firebaseAuth.signOut();
      }
    },

    // === Firebase Init ===

    async _initFirebase() {
      const config = window.FIREBASE_CONFIG;
      if (!config) {
        console.log('Firebase not configured — using localStorage fallback');
        // Auto-login from saved session
        const saved = this._loadLocal('auth');
        if (saved) this.authUser = saved;
        return;
      }

      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');

        const app = initializeApp(config);
        window._firebaseAuth = getAuth(app);
        window._firebaseDb = getFirestore(app);
        window._firebaseStorage = getStorage(app);
        this.firebaseConnected = true;

        onAuthStateChanged(window._firebaseAuth, (user) => {
          if (user) {
            this.authUser = { email: user.email, uid: user.uid };
          } else {
            this.authUser = null;
          }
        });
      } catch (e) {
        console.error('Firebase init failed:', e);
        const saved = this._loadLocal('auth');
        if (saved) this.authUser = saved;
      }
    },

    // === Photos ===

    async handlePhotoUpload(event) {
      const files = event.target.files;
      if (!files.length) return;

      this.uploading = true;

      for (const file of files) {
        try {
          if (this.firebaseConnected && window._firebaseStorage) {
            // Firebase Storage upload
            const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
            const storageRef = ref(window._firebaseStorage, `photos/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            this.photos.push({
              id: Date.now().toString(),
              url: url,
              alt: file.name.replace(/\.[^.]+$/, ''),
              category: 'interior',
              createdAt: new Date().toISOString(),
            });
          } else {
            // Local fallback — convert to data URL
            const url = await this._fileToDataUrl(file);
            this.photos.push({
              id: Date.now().toString(),
              url: url,
              alt: file.name.replace(/\.[^.]+$/, ''),
              category: 'interior',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Photo upload error:', e);
        }
      }

      this._saveLocal('photos', this.photos);
      this.uploading = false;
      event.target.value = '';
    },

    _fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    editPhoto(photo) {
      const newCategory = prompt('Kategorie (interior, beer, food, events, salonek):', photo.category);
      if (newCategory && this.photoCategories.some(c => c.id === newCategory)) {
        photo.category = newCategory;
        this._saveLocal('photos', this.photos);
      }
    },

    deletePhoto(photo) {
      if (confirm('Opravdu smazat tuto fotku?')) {
        this.photos = this.photos.filter(p => p.id !== photo.id);
        this._saveLocal('photos', this.photos);
      }
    },

    // === Events ===

    saveEvent() {
      if (!this.eventForm.title || !this.eventForm.date) return;

      if (this.editingEvent) {
        Object.assign(this.editingEvent, this.eventForm);
      } else {
        this.events.push({ ...this.eventForm, id: Date.now().toString() });
      }

      this._saveLocal('events', this.events);
      this.cancelEventForm();
    },

    editEvent(event) {
      this.editingEvent = event;
      this.eventForm = { ...event };
      this.showEventForm = true;
    },

    deleteEvent(event) {
      if (confirm('Opravdu smazat tuto akci?')) {
        this.events = this.events.filter(e => e.id !== event.id);
        this._saveLocal('events', this.events);
      }
    },

    cancelEventForm() {
      this.showEventForm = false;
      this.editingEvent = null;
      this.eventForm = { title: '', date: '', time: '', category: 'jine', description: '' };
    },

    // === Food ===

    saveFood() {
      if (!this.foodForm.name || !this.foodForm.price) return;

      if (this.editingFood) {
        Object.assign(this.editingFood, this.foodForm);
      } else {
        this.foodItems.push({ ...this.foodForm, id: Date.now().toString(), price: parseInt(this.foodForm.price, 10) });
      }

      this._saveLocal('food', this.foodItems);
      this.cancelFoodForm();
    },

    editFoodItem(item) {
      this.editingFood = item;
      this.foodForm = { ...item };
      this.showFoodForm = true;
    },

    deleteFoodItem(item) {
      if (confirm('Opravdu smazat tuto polozku?')) {
        this.foodItems = this.foodItems.filter(f => f.id !== (item.id || item.name));
        this._saveLocal('food', this.foodItems);
      }
    },

    cancelFoodForm() {
      this.showFoodForm = false;
      this.editingFood = null;
      this.foodForm = { name: '', price: '', weight: '', category: 'cold', desc: '' };
    },

    // === Local Storage ===

    _saveLocal(key, data) {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      } catch (e) {
        console.error('localStorage save error:', e);
      }
    },

    _loadLocal(key) {
      try {
        const data = localStorage.getItem(STORAGE_PREFIX + key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },

    _loadLocalData() {
      this.photos = this._loadLocal('photos') || [];
      this.events = this._loadLocal('events') || [];

      // Load food from localStorage or use defaults from main app
      const savedFood = this._loadLocal('food');
      if (savedFood && savedFood.length > 0) {
        this.foodItems = savedFood;
      } else {
        // Default food items matching app.js
        this.foodItems = [
          { id: '1', name: 'Utopenci', desc: 'Domaci, pikantni', weight: '150g', price: 89, category: 'cold' },
          { id: '2', name: 'Tlacenka s cibuli', desc: 'S octem a chlebem', weight: '200g', price: 79, category: 'cold' },
          { id: '3', name: 'Chlebicky', desc: 'Mix 3ks', weight: '250g', price: 99, category: 'cold' },
          { id: '4', name: 'Nakládaný hermelín', desc: 'V oleji s kořením', weight: '150g', price: 89, category: 'cold' },
          { id: '5', name: 'Pivní sýr', desc: 'Olomoucké tvarůžky', weight: '100g', price: 69, category: 'cold' },
          { id: '6', name: 'Studená mísa', desc: 'Mix šunky, sýru, zeleniny', weight: '300g', price: 159, category: 'cold' },
          { id: '7', name: 'Smažený sýr', desc: 'S hranolkami a tatarkou', weight: '150g', price: 139, category: 'warm' },
          { id: '8', name: 'Klobása', desc: 'Grilovana s hořčicí a chlebem', weight: '200g', price: 109, category: 'warm' },
          { id: '9', name: 'Topinky', desc: 'S česnekem nebo pomazánkou', weight: '200g', price: 79, category: 'warm' },
          { id: '10', name: 'Bramborák', desc: 'Domácí, křupavý', weight: '200g', price: 89, category: 'warm' },
          { id: '11', name: 'Párek v rohlíku', desc: 'Klasika s hořčicí', weight: '150g', price: 59, category: 'warm' },
          { id: '12', name: 'Hovězí guláš', desc: 'S houskovým knedlíkem', weight: '300g', price: 149, category: 'warm' },
        ];
      }
    },
  };
}
