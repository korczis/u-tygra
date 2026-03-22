/**
 * Admin Panel - Pivnice U Tygra
 * Firebase-powered admin interface for managing photos, events,
 * announcements, and settings. Falls back to localStorage when Firebase
 * is not available.
 */

const STORAGE_PREFIX = 'utygra_admin_';

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

    setTab(tabId) {
      this.activeTab = tabId;
      window.location.hash = tabId;
    },

    // === Toast Notifications ===

    showToast(message, type) {
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

    _fallbackAuth() {
      this.authUser = { email: 'local@admin', uid: 'local' };
      this._saveLocal('auth', this.authUser);
      this._loadLocalData();
      this.showToast('Lokální režim — data v prohlížeči', 'info');
    },

    signOut() {
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
        this.firebaseConnected = true;
        console.log('Firebase connected successfully');

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

    _fileToDataUrl(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    editPhotoInline(photo) {
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
        this.showToast('Akce smazána');
      }
    },

    cancelEventForm() {
      this.showEventForm = false;
      this.editingEvent = null;
      this.eventForm = { title: '', date: '', time: '', category: 'jine', description: '', image: '' };
    },

    // === Announcement ===

    async saveAnnouncement() {
      var saved = await this._firestoreSave('settings', 'announcement', { text: this.announcementText });
      this._saveLocal('announcement', this.announcementText);
      this.showToast(saved ? 'Oznámení uloženo' : 'Oznámení uloženo lokálně', saved ? 'success' : 'info');
    },

    // === Data Export ===

    exportData() {
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
        console.error('Failed to load local data for "' + key + '":', e.message);
        return null;
      }
    },

    _loadLocalData() {
      this.photos = this._loadLocal('photos') || [];
      this.events = this._loadLocal('events') || [];
      this.announcementText = this._loadLocal('announcement') || '';
    },
  };
}
