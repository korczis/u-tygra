/**
 * Admin Panel - Pivnice U Tygra
 * Firebase-powered admin interface for managing photos, events,
 * announcements, and settings. Falls back to localStorage when Firebase
 * is not available.
 */

var STORAGE_PREFIX = 'utygra_admin_';

var CZECH_DAYS = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
var CZECH_MONTHS = [
  'led', 'úno', 'bře', 'dub', 'kvě', 'čvn',
  'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'
];

function adminApp() {
  return {
    // Auth state
    authUser: null,
    firebaseConnected: false,

    // Toast notifications
    toasts: [],
    _toastId: 0,

    // Navigation (hash-routed)
    activeTab: (function() {
      var hash = window.location.hash.replace('#', '');
      var valid = ['photos', 'events', 'settings'];
      return valid.indexOf(hash) !== -1 ? hash : 'events';
    })(),
    tabs: [
      { id: 'events', label: 'Akce' },
      { id: 'photos', label: 'Fotografie' },
      { id: 'settings', label: 'Nastavení' },
    ],

    // Photos
    photos: [],
    uploading: false,
    photoCategoryFilter: 'all',
    editingPhoto: null,
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
    eventForm: { title: '', date: '', time: '', category: 'jine', description: '', image: '' },
    eventImageDragOver: false,
    eventImageUploading: false,
    eventImageProgress: 0,

    // Event categories with styles and icons
    eventCategories: [
      { id: 'hudba', label: 'Hudba', icon: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>', activeClass: 'border-purple-500 bg-purple-500/15 text-purple-400' },
      { id: 'sport', label: 'Sport', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>', activeClass: 'border-red-500 bg-red-500/15 text-red-400' },
      { id: 'zapas', label: 'Zápas', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', activeClass: 'border-red-500 bg-red-500/15 text-red-400' },
      { id: 'degustace', label: 'Degustace', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>', activeClass: 'border-amber-500 bg-amber-500/15 text-amber-400' },
      { id: 'kviz', label: 'Kvíz', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', activeClass: 'border-blue-500 bg-blue-500/15 text-blue-400' },
      { id: 'akce', label: 'Speciální', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', activeClass: 'border-tiger-500 bg-tiger-500/15 text-tiger-400' },
      { id: 'turnaj', label: 'Turnaj', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>', activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-400' },
      { id: 'tema', label: 'Tématický', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>', activeClass: 'border-pink-500 bg-pink-500/15 text-pink-400' },
      { id: 'jine', label: 'Jiné', icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>', activeClass: 'border-brew-500 bg-brew-700/30 text-brew-300' },
    ],

    // Settings
    announcementText: '',

    get filteredPhotos() {
      if (this.photoCategoryFilter === 'all') return this.photos;
      return this.photos.filter(function(p) { return p.category === this.photoCategoryFilter; }.bind(this));
    },

    async init() {
      await this._initFirebase();

      // Hash routing: sync tab with URL
      var self = this;
      window.addEventListener('hashchange', function() {
        var hash = window.location.hash.replace('#', '');
        var valid = ['photos', 'events', 'settings'];
        if (valid.indexOf(hash) !== -1) {
          self.activeTab = hash;
        }
      });
    },

    setTab: function(tabId) {
      this.activeTab = tabId;
      window.location.hash = tabId;
    },

    // === Toast Notifications ===

    showToast: function(message, type) {
      type = type || 'success';
      var id = ++this._toastId;
      var toast = { id: id, message: message, type: type, visible: true };
      this.toasts.push(toast);
      var self = this;
      setTimeout(function() {
        toast.visible = false;
        setTimeout(function() {
          self.toasts = self.toasts.filter(function(t) { return t.id !== id; });
        }, 300);
      }, 3000);
    },

    // === Date Helpers ===

    formatCzechDate: function(dateStr) {
      if (!dateStr) return '';
      var parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (isNaN(d.getTime())) return dateStr;
      var dayName = CZECH_DAYS[d.getDay()];
      var monthName = CZECH_MONTHS[d.getMonth()];
      return dayName + ' ' + d.getDate() + '. ' + monthName + ' ' + d.getFullYear();
    },

    isToday: function(dateStr) {
      if (!dateStr) return false;
      var today = new Date();
      var y = today.getFullYear();
      var m = String(today.getMonth() + 1).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      return dateStr === y + '-' + m + '-' + dd;
    },

    isTomorrow: function(dateStr) {
      if (!dateStr) return false;
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var y = tomorrow.getFullYear();
      var m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      var dd = String(tomorrow.getDate()).padStart(2, '0');
      return dateStr === y + '-' + m + '-' + dd;
    },

    // === Category Helpers ===

    getCategoryLabel: function(cat) {
      var labels = {
        hudba: 'Hudba', sport: 'Sport', zapas: 'Zápas',
        degustace: 'Degustace', kviz: 'Kvíz', akce: 'Speciální',
        turnaj: 'Turnaj', tema: 'Tématický', jine: 'Jiné'
      };
      return labels[cat] || cat || 'Jiné';
    },

    getCategoryBadgeClass: function(cat) {
      var styles = {
        hudba: 'bg-purple-500/15 text-purple-400',
        sport: 'bg-red-500/15 text-red-400',
        zapas: 'bg-red-500/15 text-red-400',
        degustace: 'bg-amber-500/15 text-amber-400',
        kviz: 'bg-blue-500/15 text-blue-400',
        akce: 'bg-tiger-500/15 text-tiger-400',
        turnaj: 'bg-emerald-500/15 text-emerald-400',
        tema: 'bg-pink-500/15 text-pink-400'
      };
      return styles[cat] || 'bg-brew-700/30 text-brew-300';
    },

    getCategoryIconSmall: function(cat) {
      var icons = {
        hudba: '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
        sport: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
        zapas: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        degustace: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        kviz: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        akce: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        turnaj: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        tema: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>'
      };
      return icons[cat] || '';
    },

    photoCategoryLabel: function(catId) {
      var found = this.photoCategories.filter(function(c) { return c.id === catId; });
      return found.length ? found[0].label : catId;
    },

    // === Auth ===

    async signIn() {
      if (!this.firebaseConnected) {
        await this._initFirebase();
      }

      if (this.firebaseConnected && window._firebaseAuth) {
        var { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        var provider = new GoogleAuthProvider();
        try {
          var result = await signInWithPopup(window._firebaseAuth, provider);
          this.authUser = { email: result.user.email, uid: result.user.uid };
          this._saveLocal('auth', this.authUser);
          await this._loadFirestoreData();
          this.showToast('Přihlášení úspěšné');
        } catch (e) {
          console.error('Firebase auth error:', e);
          this._fallbackAuth();
        }
      } else {
        console.warn('Firebase not available, using local fallback');
        this._fallbackAuth();
      }
    },

    _fallbackAuth: function() {
      this.authUser = { email: 'local@admin', uid: 'local' };
      this._saveLocal('auth', this.authUser);
      this._loadLocalData();
      this.showToast('Lokální režim — data v prohlížeči', 'info');
    },

    signOut: function() {
      this.authUser = null;
      this.photos = [];
      this.events = [];
      localStorage.removeItem(STORAGE_PREFIX + 'auth');
      localStorage.removeItem(STORAGE_PREFIX + 'photos');
      localStorage.removeItem(STORAGE_PREFIX + 'events');
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

        var app = initializeApp(config);
        window._firebaseAuth = getAuth(app);
        window._firebaseDb = getFirestore(app);
        window._firebaseApp = app;
        this.firebaseConnected = true;
        console.log('Firebase connected successfully');

        // Init Firebase Storage
        try {
          var { getStorage } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
          window._firebaseStorage = getStorage(app);
          console.log('Firebase Storage initialized');
        } catch (e) {
          console.warn('Firebase Storage init failed:', e);
        }

        var self = this;
        onAuthStateChanged(window._firebaseAuth, async function(user) {
          if (user) {
            console.log('Firebase auth:', user.email);
            self.authUser = { email: user.email, uid: user.uid };
            self._saveLocal('auth', self.authUser);
            await self._loadFirestoreData();
          } else {
            console.log('Firebase: not signed in');
            self.authUser = null;
          }
        });
      } catch (e) {
        console.error('Firebase init failed:', e);
        var saved = this._loadLocal('auth');
        if (saved && saved.email !== 'local@admin') {
          this.authUser = saved;
          this._loadLocalData();
        }
      }
    },

    // === Firebase Storage Upload ===

    uploadEventImage: async function(file) {
      if (!window._firebaseStorage) {
        // Fallback: convert to data URL
        return this._fileToDataUrl(file);
      }

      var self = this;
      self.eventImageUploading = true;
      self.eventImageProgress = 0;

      try {
        var { ref, uploadBytesResumable, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
        var eventId = self.editingEvent ? self.editingEvent.id : Date.now().toString();
        var storageRef = ref(window._firebaseStorage, 'events/' + eventId + '/' + file.name);
        var uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise(function(resolve, reject) {
          uploadTask.on('state_changed',
            function(snapshot) {
              var progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              self.eventImageProgress = progress;
            },
            function(error) {
              console.error('Upload error:', error);
              self.eventImageUploading = false;
              self.eventImageProgress = 0;
              reject(error);
            },
            async function() {
              var url = await getDownloadURL(uploadTask.snapshot.ref);
              self.eventImageUploading = false;
              self.eventImageProgress = 0;
              resolve(url);
            }
          );
        });
      } catch (e) {
        console.error('Storage upload failed, falling back to data URL:', e);
        self.eventImageUploading = false;
        self.eventImageProgress = 0;
        return self._fileToDataUrl(file);
      }
    },

    handleEventImageDrop: async function(event) {
      this.eventImageDragOver = false;
      var files = event.dataTransfer && event.dataTransfer.files;
      if (!files || !files.length) return;
      var file = files[0];
      if (!file.type.match(/^image\//)) {
        this.showToast('Vyberte prosím obrázek', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Obrázek je příliš velký (max 5 MB)', 'error');
        return;
      }
      try {
        var url = await this.uploadEventImage(file);
        this.eventForm.image = url;
      } catch (e) {
        this.showToast('Nahrávání selhalo', 'error');
      }
    },

    handleEventImageSelect: async function(event) {
      var files = event.target.files;
      if (!files || !files.length) return;
      var file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Obrázek je příliš velký (max 5 MB)', 'error');
        return;
      }
      try {
        var url = await this.uploadEventImage(file);
        this.eventForm.image = url;
      } catch (e) {
        this.showToast('Nahrávání selhalo', 'error');
      }
      event.target.value = '';
    },

    removeEventImage: function() {
      this.eventForm.image = '';
    },

    // === Firestore CRUD ===

    async _loadFirestoreData() {
      if (!this.firebaseConnected || !window._firebaseDb) {
        this._loadLocalData();
        return;
      }

      try {
        var { collection, getDocs, orderBy, query, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var db = window._firebaseDb;

        // Load photos
        var photosSnap = await getDocs(query(collection(db, 'photos'), orderBy('createdAt', 'desc')));
        this.photos = photosSnap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });

        // Load events
        var eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
        this.events = eventsSnap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });

        // Load announcement
        try {
          var announcementDoc = await getDoc(doc(db, 'settings', 'announcement'));
          if (announcementDoc.exists()) {
            this.announcementText = announcementDoc.data().text || '';
          }
        } catch (e) {
          // Settings may not exist yet
        }

        // Sync to localStorage as backup
        this._saveLocal('photos', this.photos);
        this._saveLocal('events', this.events);
      } catch (e) {
        console.error('Firestore load failed, using localStorage:', e);
        this._loadLocalData();
      }
    },

    async _firestoreSave(collectionName, id, data) {
      if (!this.firebaseConnected || !window._firebaseDb) return false;

      try {
        var { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await setDoc(doc(window._firebaseDb, collectionName, id), data);
        return true;
      } catch (e) {
        console.error('Firestore save error:', e);
        this.showToast('Chyba při ukládání do Firebase', 'error');
        return false;
      }
    },

    async _firestoreDelete(collectionName, id) {
      if (!this.firebaseConnected || !window._firebaseDb) return false;

      try {
        var { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        await deleteDoc(doc(window._firebaseDb, collectionName, id));
        return true;
      } catch (e) {
        console.error('Firestore delete error:', e);
        this.showToast('Chyba při mazání z Firebase', 'error');
        return false;
      }
    },

    // === Photos ===

    async handlePhotoUpload(event) {
      var files = event.target.files;
      if (!files.length) return;

      this.uploading = true;
      var successCount = 0;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        try {
          var photo = {
            id: Date.now().toString() + '_' + i,
            alt: file.name.replace(/\.[^.]+$/, ''),
            category: 'interior',
            createdAt: new Date().toISOString(),
          };

          photo.url = await this._fileToDataUrl(file);
          this.photos.unshift(photo);
          await this._firestoreSave('photos', photo.id, photo);
          successCount++;
        } catch (e) {
          console.error('Photo upload error:', e);
        }
      }

      this._saveLocal('photos', this.photos);
      this.uploading = false;
      event.target.value = '';
      this.showToast('Nahráno ' + successCount + ' z ' + files.length + ' fotek');
    },

    _fileToDataUrl: function(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    editPhotoInline: function(photo) {
      this.editingPhoto = Object.assign({}, photo);
    },

    async savePhotoEdit() {
      if (!this.editingPhoto) return;
      var photo = this.photos.find(function(p) { return p.id === this.editingPhoto.id; }.bind(this));
      if (photo) {
        photo.alt = this.editingPhoto.alt;
        photo.category = this.editingPhoto.category;
        this._saveLocal('photos', this.photos);
        await this._firestoreSave('photos', photo.id, photo);
        this.showToast('Fotka aktualizována');
      }
      this.editingPhoto = null;
    },

    async deletePhoto(photo) {
      if (confirm('Opravdu smazat tuto fotku?')) {
        this.photos = this.photos.filter(function(p) { return p.id !== photo.id; });
        this._saveLocal('photos', this.photos);
        await this._firestoreDelete('photos', photo.id);
        this.showToast('Fotka smazána');
      }
    },

    // === Events ===

    openNewEventForm: function() {
      this.editingEvent = null;
      this.eventForm = { title: '', date: '', time: '', category: 'jine', description: '', image: '' };
      this.showEventForm = true;
    },

    async saveEvent() {
      if (!this.eventForm.title || !this.eventForm.date) {
        this.showToast('Vyplňte název a datum', 'error');
        return;
      }

      if (this.editingEvent) {
        Object.assign(this.editingEvent, this.eventForm);
        await this._firestoreSave('events', this.editingEvent.id, this.editingEvent);
        this.showToast('Akce aktualizována');
      } else {
        var newEvent = Object.assign({}, this.eventForm, { id: Date.now().toString() });
        this.events.push(newEvent);
        await this._firestoreSave('events', newEvent.id, newEvent);
        this.showToast('Akce přidána');
      }

      this._saveLocal('events', this.events);
      this.cancelEventForm();
    },

    editEvent: function(event) {
      this.editingEvent = event;
      this.eventForm = Object.assign({}, event);
      this.showEventForm = true;
    },

    async deleteEvent(event) {
      if (confirm('Opravdu smazat tuto akci?')) {
        this.events = this.events.filter(function(e) { return e.id !== event.id; });
        this._saveLocal('events', this.events);
        await this._firestoreDelete('events', event.id);
        this.showToast('Akce smazána');
      }
    },

    cancelEventForm: function() {
      this.showEventForm = false;
      this.editingEvent = null;
      this.eventForm = { title: '', date: '', time: '', category: 'jine', description: '', image: '' };
      this.eventImageDragOver = false;
      this.eventImageUploading = false;
      this.eventImageProgress = 0;
    },

    // === Announcement ===

    async saveAnnouncement() {
      var saved = await this._firestoreSave('settings', 'announcement', { text: this.announcementText });
      this._saveLocal('announcement', this.announcementText);
      this.showToast(saved ? 'Oznámení uloženo' : 'Oznámení uloženo lokálně', saved ? 'success' : 'info');
    },

    // === Data Export ===

    exportData: function() {
      var data = {
        exportDate: new Date().toISOString(),
        events: this.events,
        photos: this.photos.map(function(p) { return { id: p.id, alt: p.alt, category: p.category, createdAt: p.createdAt }; }),
        announcement: this.announcementText,
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'u-tygra-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Záloha stažena');
    },

    // === Local Storage ===

    _saveLocal: function(key, data) {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      } catch (e) {
        console.error('localStorage save error:', e);
      }
    },

    _loadLocal: function(key) {
      try {
        var data = localStorage.getItem(STORAGE_PREFIX + key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.error('Failed to load local data for "' + key + '":', e.message);
        return null;
      }
    },

    _loadLocalData: function() {
      this.photos = this._loadLocal('photos') || [];
      this.events = this._loadLocal('events') || [];
      this.announcementText = this._loadLocal('announcement') || '';
    },
  };
}
