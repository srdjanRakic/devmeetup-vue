import * as firebase from 'firebase';
import Vue from 'vue';
import Vuetify from 'vuetify';
import './stylus/main.styl';
import App from './App';
import router from './router';
import { store } from './store';
import DateFilter from './filters/date';
import AlertCmp from './components/Shared/Alert';
import EditMeetupDetailsDialog from './components/Meetup/Edit/EditMeetupDetailsDialog';
import EditMeetupDateDialog from './components/Meetup/Edit/EditMeetupDateDialog';
import EditMeetupTimeDialog from './components/Meetup/Edit/EditMeetupTimeDialog';
import RegisterDialog from './components/Meetup/Registration/RegisterDialog';

Vue.use(Vuetify);
Vue.config.productionTip = false;

Vue.filter('date', DateFilter);
Vue.component('app-alert', AlertCmp);
Vue.component('app-edit-meetup-details-dialog', EditMeetupDetailsDialog);
Vue.component('app-edit-meetup-date-dialog', EditMeetupDateDialog);
Vue.component('app-edit-meetup-time-dialog', EditMeetupTimeDialog);
Vue.component('app-meetup-register-dialog', RegisterDialog);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  created() {
    firebase.initializeApp({
      apiKey: 'AIzaSyDbImZ1jGCUsVxeTg3WltMvl5BXSJ95l6U',
      authDomain: 'devmeetup-55085.firebaseapp.com',
      databaseURL: 'https://devmeetup-55085.firebaseio.com',
      projectId: 'devmeetup-55085',
      storageBucket: 'devmeetup-55085.appspot.com',
    });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user);
        this.$store.dispatch('fetchUserData');
      }
    });
    this.$store.dispatch('loadMeetups');
  },
});
