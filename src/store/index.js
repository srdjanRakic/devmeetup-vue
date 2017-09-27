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
    setLoadedMeetups(state, payload) {
      state.loadedMeetups = payload;
    },
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload);
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
    }
    /*eslint-enable */
  },
  actions: {
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
              });
            }
          });
          commit('setLoadedMeetups', meetups);
          commit('setLoading', false);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
          commit('setLoading', true);
        });
    },
    createMeetup({ commit }, payload) {
      const meetup = {
        title: payload.title,
        location: payload.location,
        imageUrl: payload.imageUrl,
        description: payload.description,
        date: payload.date.toISOString(),
      };
      firebase.database().ref('meetups').push(meetup)
        .then((data) => {
          const key = data.key;
          commit('createMeetup', {
            ...meetup,
            id: key,
          });
        },
      )
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      },
    );
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
          };
          commit('setUser', newUser);
        },
      )
      .catch(
        (error) => {
          commit('setLoading', false);
          commit('setError', error);
        },
      );
    },
    signUserIn({ commit }, payload) {
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
      .then(
        (user) => {
          commit('setLoading', false);
          commit('clearError');
          const newUser = {
            id: user.uid,
            registeredMeetups: [],
          };
          commit('setUser', newUser);
        },
      )
      .catch(
        (error) => {
          commit('setLoading', false);
          commit('setError', error);
        },
      );
    },
    autoSignIn({ commit }, payload) {
      commit('setUser', { id: payload.uid, registeredMeetups: [] });
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
