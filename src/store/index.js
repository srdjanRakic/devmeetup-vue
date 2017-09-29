import Vue from 'vue';
import Vuex from 'vuex';
import * as firebase from 'firebase';

Vue.use(Vuex);
// eslint-disable-next-line
export const store = new Vuex.Store({
  state: {
    loadedMeetups: [
      {
        imageUrl: 'https://i0.wp.com/www.thesweetestway.com/wp-content/uploads/2015/09/Skopje-7.jpg?resize=1024%2C683',
        id: 'afajfjadfaadfa323',
        title: 'Vue.js Meetup',
        date: new Date(),
        location: 'Skopje',
        description: 'Introduction to Vue.js.',
      },
      {
        imageUrl: 'http://kongres-magazine.eu/wp-content/uploads/2016/10/Ohrid-3-1024x627.jpg',
        id: 'aadsfhbkhlk1241',
        title: 'Angular Meetup',
        date: new Date(),
        location: 'Ohrid',
        description: 'Introduction to Angular.',
      },
    ],
    user: null,
    loading: false,
    error: null,
  },
  mutations: {
    /*eslint-disable */
    registerUserForMeetup(state, payload) {
      const id = payload.id;
      if (state.user.registeredMeetups.findIndex(meetup => meetup.id === id) >= 0) {
        return;
      }
      state.user.registeredMeetups.push(id);
      state.user.firebaseKeys[id] = payload.firebaseKey;
    },
    unregisterUserFromMeetup(state, payload) {
      const registeredMeetups = state.user.registeredMeetups;
      registeredMeetups.splice(registeredMeetups.findIndex(meetup => meetup.id === payload), 1);
      Reflect.deleteProperty(state.user.firebaseKeys, payload);
    },
    setLoadedMeetups(state, payload) {
      state.loadedMeetups = payload;
    },
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload);
    },
    updateMeetupData(state, payload) {
      const meetup = state.loadedMeetups.find(meetup => meetup.id === payload.id);
      if (payload.title) {
        meetup.title = payload.title;
      }
      if (payload.description) {
        meetup.description = payload.description;
      }
      if (payload.date) {
        meetup.date = payload.date;
      }
    },
    setUser(state, payload) {
      state.user = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = null;
    },
    /*eslint-enable */
  },
  actions: {
    registerUserForMeetup({ commit, getters }, payload) {
      commit('setLoading', true);
      const user = getters.user;
      firebase.database().ref(`/users/${user.id}`).child('/registrations/')
              .push(payload)
              .then((data) => {
                commit('setLoading', false);
                commit('registerUserForMeetup', { id: payload, firebaseKey: data.key });
              })
              .catch((error) => {
                // eslint-disable-next-line
                console.log(error);
                commit('setLoading', false);
              });
    },
    unregisterUserFromMeetup({ commit, getters }, payload) {
      commit('setLoading', true);
      const user = getters.user;
      if (!user.firebaseKeys) {
        return;
      }
      const firebaseKey = user.firebaseKeys[payload];
      firebase.database().ref(`/users/${user.id}`).child('/registrations/').child(firebaseKey)
              .remove()
              .then(() => {
                commit('setLoading', false);
                commit('unregisterUserFromMeetup', payload);
              })
              .catch((error) => {
                // eslint-disable-next-line
                console.log(error);
                commit('setLoading', false);
              },
            );
    },
    loadMeetups({ commit }) {
      commit('setLoading', true);
      firebase.database().ref('meetups').once('value')
        .then((data) => {
          const meetups = [];
          const obj = data.val();
          Object.keys(obj).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              meetups.push({
                id: key,
                title: obj[key].title,
                description: obj[key].description,
                imageUrl: obj[key].imageUrl,
                date: obj[key].date,
                location: obj[key].location,
                creatorId: obj[key].creatorId,
              });
            }
          });
          commit('setLoadedMeetups', meetups);
          commit('setLoading', false);
        })
        .catch(
          (error) => {
            // eslint-disable-next-line
            console.log(error);
            commit('setLoading', false);
          },
        );
    },
    createMeetup({ commit, getters }, payload) {
      const meetup = {
        title: payload.title,
        location: payload.location,
        description: payload.description,
        date: payload.date.toISOString(),
        creatorId: getters.user.id,
      };
      let imageUrl;
      let key;
      firebase.database().ref('meetups').push(meetup)
        .then((data) => {
          key = data.key;
          return key;
        })
        .then(() => {
          const fileName = payload.image.name;
          const ext = fileName.slice(fileName.lastIndexOf('.'));
          return firebase.storage().ref(`meetups/${key}.${ext}`).put(payload.image);
        })
        .then((fileData) => {
          imageUrl = fileData.metadata.downloadURLs[0];
          return firebase.database().ref('meetups').child(key).update({ imageUrl });
        })
        .then(() => {
          commit('createMeetup', {
            ...meetup,
            imageUrl,
            id: key,
          });
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
        });
    },
    signUserUp({ commit }, payload) {
      commit('setLoading', true);
      commit('clearError');
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          (user) => {
            commit('setLoading', false);
            const newUser = {
              id: user.uid,
              registeredMeetups: [],
              firebaseKeys: {},
            };
            commit('setUser', newUser);
          },
        )
        .catch(
          (error) => {
            commit('setLoading', false);
            commit('setError', error);
            // eslint-disable-next-line
            console.log(error);
          },
        );
    },
    updateMeetupData({ commit }, payload) {
      commit('setLoading', true);
      const updateObj = {};
      if (payload.title) {
        updateObj.title = payload.title;
      }
      if (payload.description) {
        updateObj.description = payload.description;
      }
      if (payload.date) {
        updateObj.date = payload.date;
      }
      firebase.database().ref('meetups').child(payload.id).update(updateObj)
        .then(() => {
          commit('setLoading', false);
          commit('updateMeetupData', payload);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
          commit('setLoading', false);
        });
    },
    signUserIn({ commit }, payload) {
      commit('setLoading', true);
      commit('clearError');
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          (user) => {
            commit('setLoading', false);
            const newUser = {
              id: user.uid,
              registeredMeetups: [],
              firebaseKeys: {},
            };
            commit('setUser', newUser);
          },
        )
        .catch(
          (error) => {
            commit('setLoading', false);
            commit('setError', error);
            // eslint-disable-next-line
            console.log(error);
          },
        );
    },
    autoSignIn({ commit }, payload) {
      commit('setUser', {
        id: payload.uid,
        registeredMeetups: [],
        firebaseKeys: {},
      });
    },
    fetchUserData({ commit, getters }) {
      commit('setLoading', true);
      firebase.database().ref(`/users/${getters.user.id}/registrations/`)
              .once('value')
              .then((data) => {
                const dataPairs = data.val();
                const registeredMeetups = [];
                const swappedPairs = {};

                Object.keys(dataPairs).forEach((key) => {
                  if (Object.prototype.hasOwnProperty.call(dataPairs, key)) {
                    registeredMeetups.push(key);
                    swappedPairs[key] = key;
                  }
                });

                const updatedUser = {
                  id: getters.user.id,
                  registeredMeetups,
                  firebaseKeys: swappedPairs,
                };

                commit('setLoading', false);
                commit('setUser', updatedUser);
              })
              .catch((error) => {
                // eslint-disable-next-line
                console.log(error);
                commit('setLoading', false);
              });
    },
    logout({ commit }) {
      firebase.auth().signOut();
      commit('setUser', null);
    },
    clearError({ commit }) {
      commit('clearError');
    },
  },
  getters: {
    loadedMeetups(state) {
      return state.loadedMeetups.sort((meetupA, meetupB) => meetupA.date > meetupB.date);
    },
    featuredMeetups(state, getters) {
      return getters.loadedMeetups.slice(0, 5);
    },
    loadedMeetup(state) {
      return meetupId => state.loadedMeetups.find(meetup => meetup.id === meetupId);
    },
    user(state) {
      return state.user;
    },
    loading(state) {
      return state.loading;
    },
    error(state) {
      return state.error;
    },
  },
});
