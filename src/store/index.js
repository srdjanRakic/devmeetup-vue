import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
/*eslint-disable */
export const store = new Vuex.Store({
/*eslint-enable */
  state: {
    loadedMeetups: [
      {
        imageUrl: 'https://i0.wp.com/www.thesweetestway.com/wp-content/uploads/2015/09/Skopje-7.jpg?resize=1024%2C683',
        id: 'afajfjadfaadfa323',
        title: 'Meetup in Skopje',
        date: '2017-09-30',
      },
      {
        imageUrl: 'http://kongres-magazine.eu/wp-content/uploads/2016/10/Ohrid-3-1024x627.jpg',
        id: 'aadsfhbkhlk1241',
        title: 'Meetup in Ohrid',
        date: '2017-09-27',
      },
    ],
    user: {
      id: 'ajaldslfalsk12',
      registeredMeetups: ['aadsfhbkhlk1241'],
    },
  },
  mutations: {},
  actions: {},
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
  },
});
