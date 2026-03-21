/**
 * Admin Panel - Pivnice U Tygra
 * Firebase-powered admin interface for managing photos, events, and food menu.
 * Falls back to localStorage when Firebase is not available.
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
      { id: 'food', label: 'Jídelní lístek' },
      { id: 'settings', label: 'Nastavení' },
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
      return this.photos.filter(function(p) { return p.category === this.photoCategoryFilter; }.bind(this));
    },

    init() {
      this._initFirebase();
    },

    // === Auth ===

    async signIn() {
      if (this.firebaseConnected && window._firebaseAuth) {
        var { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        var provider = new GoogleAuthProvider();
        try {
          var result = await signInWithPopup(window._firebaseAuth, provider);
          this.authUser = { email: result.user.email, uid: result.user.uid };
          this._saveLocal('auth', this.authUser);
          await this._loadFirestoreData();
        } catch (e) {
          console.error('Firebase auth error:', e);
          this._fallbackAuth();
        }
      } else {
        this._fallbackAuth();
      }
    },

    _fallbackAuth() {
      this.authUser = { email: 'local@admin', uid: 'local' };
      this._saveLocal('auth', this.authUser);
      this._loadLocalData();
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
      var config = window.FIREBASE_CONFIG;
      if (!config) {
        console.log('Firebase not configured — using localStorage fallback');
        var saved = this._loadLocal('auth');
        if (saved) {
          this.authUser = saved;
          this._loadLocalData();
        }
        return;
      }

      try {
        var { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        var { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        var { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var { getStorage } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');

        var app = initializeApp(config);
        window._firebaseAuth = getAuth(app);
        window._firebaseDb = getFirestore(app);
        window._firebaseStorage = getStorage(app);
        this.firebaseConnected = true;

        onAuthStateChanged(window._firebaseAuth, async (user) => {
          if (user) {
            this.authUser = { email: user.email, uid: user.uid };
            this._saveLocal('auth', this.authUser);
            await this._loadFirestoreData();
          } else {
            this.authUser = null;
          }
        });
      } catch (e) {
        console.error('Firebase init failed:', e);
        var saved = this._loadLocal('auth');
        if (saved) {
          this.authUser = saved;
          this._loadLocalData();
        }
      }
    },

    // === Firestore CRUD ===

    async _loadFirestoreData() {
      if (!this.firebaseConnected || !window._firebaseDb) {
        this._loadLocalData();
        return;
      }

      try {
        var { collection, getDocs, orderBy, query } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var db = window._firebaseDb;

        // Load photos
        var photosSnap = await getDocs(query(collection(db, 'photos'), orderBy('createdAt', 'desc')));
        this.photos = photosSnap.docs.map(function(doc) { return Object.assign({ id: doc.id }, doc.data()); });

        // Load events
        var eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
        this.events = eventsSnap.docs.map(function(doc) { return Object.assign({ id: doc.id }, doc.data()); });

        // Load food
        var foodSnap = await getDocs(collection(db, 'food'));
        var foodData = foodSnap.docs.map(function(doc) { return Object.assign({ id: doc.id }, doc.data()); });
        this.foodItems = foodData.length > 0 ? foodData : this._defaultFood();

        // Sync to localStorage as backup
        this._saveLocal('photos', this.photos);
        this._saveLocal('events', this.events);
        this._saveLocal('food', this.foodItems);
      } catch (e) {
        console.warn('Firestore load failed, using localStorage:', e);
        this._loadLocalData();
      }
    },

    async _firestoreSave(collectionName, id, data) {
      if (!this.firebaseConnected || !window._firebaseDb) return;

      try {
        var { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(window._firebaseDb, collectionName, id), data);
      } catch (e) {
        console.error('Firestore save error:', e);
      }
    },

    async _firestoreDelete(collectionName, id) {
      if (!this.firebaseConnected || !window._firebaseDb) return;

      try {
        var { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await deleteDoc(doc(window._firebaseDb, collectionName, id));
      } catch (e) {
        console.error('Firestore delete error:', e);
      }
    },

    // === Photos ===

    async handlePhotoUpload(event) {
      var files = event.target.files;
      if (!files.length) return;

      this.uploading = true;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        try {
          var photo = {
            id: Date.now().toString() + '_' + i,
            alt: file.name.replace(/\.[^.]+$/, ''),
            category: 'interior',
            createdAt: new Date().toISOString(),
          };

          if (this.firebaseConnected && window._firebaseStorage) {
            var { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
            var storageRef = ref(window._firebaseStorage, 'photos/' + photo.id + '_' + file.name);
            var snapshot = await uploadBytes(storageRef, file);
            photo.url = await getDownloadURL(snapshot.ref);
          } else {
            photo.url = await this._fileToDataUrl(file);
          }

          this.photos.unshift(photo);
          await this._firestoreSave('photos', photo.id, photo);
        } catch (e) {
          console.error('Photo upload error:', e);
        }
      }

      this._saveLocal('photos', this.photos);
      this.uploading = false;
      event.target.value = '';
    },

    _fileToDataUrl(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    async editPhoto(photo) {
      var newCategory = prompt('Kategorie (interior, beer, food, events, salonek):', photo.category);
      if (newCategory && this.photoCategories.some(function(c) { return c.id === newCategory; })) {
        photo.category = newCategory;
        this._saveLocal('photos', this.photos);
        await this._firestoreSave('photos', photo.id, photo);
      }
    },

    async deletePhoto(photo) {
      if (confirm('Opravdu smazat tuto fotku?')) {
        this.photos = this.photos.filter(function(p) { return p.id !== photo.id; });
        this._saveLocal('photos', this.photos);
        await this._firestoreDelete('photos', photo.id);

        // Delete from Storage
        if (this.firebaseConnected && window._firebaseStorage && photo.url && photo.url.includes('firebase')) {
          try {
            var { ref, deleteObject } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
            var storageRef = ref(window._firebaseStorage, 'photos/' + photo.id);
            await deleteObject(storageRef);
          } catch (e) {
            console.warn('Storage delete failed:', e);
          }
        }
      }
    },

    // === Events ===

    async saveEvent() {
      if (!this.eventForm.title || !this.eventForm.date) return;

      if (this.editingEvent) {
        Object.assign(this.editingEvent, this.eventForm);
        await this._firestoreSave('events', this.editingEvent.id, this.editingEvent);
      } else {
        var newEvent = Object.assign({}, this.eventForm, { id: Date.now().toString() });
        this.events.push(newEvent);
        await this._firestoreSave('events', newEvent.id, newEvent);
      }

      this._saveLocal('events', this.events);
      this.cancelEventForm();
    },

    editEvent(event) {
      this.editingEvent = event;
      this.eventForm = Object.assign({}, event);
      this.showEventForm = true;
    },

    async deleteEvent(event) {
      if (confirm('Opravdu smazat tuto akci?')) {
        this.events = this.events.filter(function(e) { return e.id !== event.id; });
        this._saveLocal('events', this.events);
        await this._firestoreDelete('events', event.id);
      }
    },

    cancelEventForm() {
      this.showEventForm = false;
      this.editingEvent = null;
      this.eventForm = { title: '', date: '', time: '', category: 'jine', description: '' };
    },

    // === Food ===

    async saveFood() {
      if (!this.foodForm.name || !this.foodForm.price) return;

      if (this.editingFood) {
        Object.assign(this.editingFood, this.foodForm);
        this.editingFood.price = parseInt(this.editingFood.price, 10);
        await this._firestoreSave('food', this.editingFood.id, this.editingFood);
      } else {
        var newItem = Object.assign({}, this.foodForm, {
          id: Date.now().toString(),
          price: parseInt(this.foodForm.price, 10),
        });
        this.foodItems.push(newItem);
        await this._firestoreSave('food', newItem.id, newItem);
      }

      this._saveLocal('food', this.foodItems);
      this.cancelFoodForm();
    },

    editFoodItem(item) {
      this.editingFood = item;
      this.foodForm = Object.assign({}, item);
      this.showFoodForm = true;
    },

    async deleteFoodItem(item) {
      if (confirm('Opravdu smazat tuto položku?')) {
        var itemId = item.id || item.name;
        this.foodItems = this.foodItems.filter(function(f) { return f.id !== itemId; });
        this._saveLocal('food', this.foodItems);
        await this._firestoreDelete('food', itemId);
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
        var data = localStorage.getItem(STORAGE_PREFIX + key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },

    _loadLocalData() {
      this.photos = this._loadLocal('photos') || [];
      this.events = this._loadLocal('events') || [];
      var savedFood = this._loadLocal('food');
      this.foodItems = (savedFood && savedFood.length > 0) ? savedFood : this._defaultFood();
    },

    _defaultFood() {
      return [
        { id: '1', name: 'Utopenci', desc: 'Domácí, pikantní', weight: '150g', price: 89, category: 'cold' },
        { id: '2', name: 'Tlačenka s cibulí', desc: 'S octem a chlebem', weight: '200g', price: 79, category: 'cold' },
        { id: '3', name: 'Chlebíčky', desc: 'Mix 3ks', weight: '250g', price: 99, category: 'cold' },
        { id: '4', name: 'Nakládaný hermelín', desc: 'V oleji s kořením', weight: '150g', price: 89, category: 'cold' },
        { id: '5', name: 'Pivní sýr', desc: 'Olomoucké tvarůžky', weight: '100g', price: 69, category: 'cold' },
        { id: '6', name: 'Studená mísa', desc: 'Mix šunky, sýru, zeleniny', weight: '300g', price: 159, category: 'cold' },
        { id: '7', name: 'Smažený sýr', desc: 'S hranolkami a tatarkou', weight: '150g', price: 139, category: 'warm' },
        { id: '8', name: 'Klobása', desc: 'Grilovaná s hořčicí a chlebem', weight: '200g', price: 109, category: 'warm' },
        { id: '9', name: 'Topinky', desc: 'S česnekem nebo pomazánkou', weight: '200g', price: 79, category: 'warm' },
        { id: '10', name: 'Bramborák', desc: 'Domácí, křupavý', weight: '200g', price: 89, category: 'warm' },
        { id: '11', name: 'Párek v rohlíku', desc: 'Klasika s hořčicí', weight: '150g', price: 59, category: 'warm' },
        { id: '12', name: 'Hovězí guláš', desc: 'S houskovým knedlíkem', weight: '300g', price: 149, category: 'warm' },
      ];
    },
  };
}
