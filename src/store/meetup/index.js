import * as firebase from 'firebase';

export default {
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
  },
  mutations: {
    /*eslint-disable */
    setLoadedMeetups(state, payload) {
      state.loadedMeetups = payload;
    },
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload);
    },
    updateMeetup(state, payload) {
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
      // Reach out to firebase and store it
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
          commit('updateMeetup', payload);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log(error);
          commit('setLoading', false);
        });
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
  },
};
