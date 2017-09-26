import Vue from 'vue';
import Vuex from 'vuex';
import * as firebase from 'firebase';

Vue.use(Vuex);
/*eslint-disable */
export const store = new Vuex.Store({
/*eslint-enable */
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
  },
  mutations: {
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload);
    },
    setUser(state, payload) {
      // eslint-disable-next-line
      state.user = payload;
    },
  },
  actions: {
    createMeetup({ commit }, payload) {
      const meetup = {
        title: payload.title,
        location: payload.location,
        imageUrl: payload.imageUrl,
        description: payload.description,
        date: payload.date,
        id: '223423',
      };
      // Reach out to firebase and store it
      commit('createMeetup', meetup);
    },
    signUserUp({ commit }, payload) {
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
      .then(
        (user) => {
          const newUser = {
            id: user.uid,
            registeredMeetups: [],
          };
          commit('setUser', newUser);
        },
      )
      .catch(
        (error) => {
          // eslint-disable-next-line
          console.log(error);
        },
      );
    },
    signUserIn({ commit }, payload) {
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
      .then(
        (user) => {
          const newUser = {
            id: user.uid,
            registeredMeetups: [],
          };
          commit('setUser', newUser);
        },
      )
      .catch(
        (error) => {
          // eslint-disable-next-line
          console.log(error);
        },
      );
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
  },
});
