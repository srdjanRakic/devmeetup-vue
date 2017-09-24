<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
        <v-card class="info">
          <v-container fluid>
            <v-layout row>
              <v-flex xs5 sm4 md3>
                <v-card-media src="https://i0.wp.com/www.thesweetestway.com/wp-content/uploads/2015/09/Skopje-7.jpg?resize=1024%2C683" 
                              height="130px">

                </v-card-media>
              </v-flex>
              <v-flex xs7 sm8 md9>
                <v-card-title primary-title>
                  <div>
                    <h5 class="white--text mb-0">My meetup</h5>
                    <div>30 Sep 2017</div>
                  </div>
                </v-card-title>
                <v-card-actions>
                  <v-btn flat>
                    <v-icon left light>arrow_forward</v-icon>
                    View Meetup
                  </v-btn>
                </v-card-actions>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
