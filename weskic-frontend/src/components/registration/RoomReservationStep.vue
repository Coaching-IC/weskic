<template>
  <div class="">
    <hr>
    <p>Location de matériel : comme précisé dans le mail, vous pouvez louer du matériel avec un formulaire. <a
        @click="previousStep">Plus d'infos ici</a></p>
    <br>

    <div class="is-flex is-flex-direction-row is-justify-content-space-between">
      <h2 class="subtitle" style="margin-bottom: 0;">Réservation des chambres</h2>
      <b-button>Actualiser</b-button>
    </div>
    <ul>
      <li>Chambres : notées <i class="fas fa-door-closed" aria-hidden="true"></i>, 1 sanitaire par chambre</li>
      <li>Appartements : notés <i class="fas fa-bed" aria-hidden="true"></i>, plusieurs chambres communicantes et 1 sanitaire par appartement. </li>
    </ul>
    <br>

    <div class="chalets">
      <div class="panel is-info chalet" v-for="chalet of chalets" v-bind:key="chalet.id">
        <p class="panel-heading"><i class="fas fa-home" aria-hidden="true"></i> Chalet n°{{ chalet.id }}</p>

        <a :class="{'panel-block': true, room: true, unavailable: !room.available, current: currentRoom===room.number}"
           v-for="room of chalet.rooms" v-bind:key="'r'+room.number+(''||room.letter)" @click="selectRoom(room)">
          <span class="panel-icon">
            <i :class="{fas: true, 'fa-door-closed': !room.letter, 'fa-bed': room.letter}" aria-hidden="true"></i>
          </span>
          <span v-if="room.letter">Ch. <strong>{{ room.number+room.letter }}</strong></span>
          <span v-else>Ch. <strong>{{ room.number }}</strong></span>
          <span style="margin-left: 10px;">
            <i class="fas fa-circle" aria-hidden="true" v-for="n in room.usedSlots" v-bind:key="'c1-'+n"></i>
            <i class="far fa-circle" aria-hidden="true" v-for="n in (room.capacity - room.usedSlots)" v-bind:key="'c2-'+n"></i>
            <b-tag style="margin-left: 5px;" v-if="room.mixed">Mixte</b-tag>
          </span>
        </a>
      </div>
    </div>


    <b-modal v-model="modalRoomReservationActive" :width="640" scroll="keep">
      <form action="">
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Réservation de {{selectedRoom.letter ? 'l\'appartement' : 'la chambre'}} n°{{selectedRoom.roomId}}</p>
            <button
                type="button"
                class="delete"
                @click="closeModal"/>
          </header>
          <section class="modal-card-body">

            <b-field>
              <b-radio v-model="reservationMode"
                       native-value="single">
                Je réserve cette chambre pour moi
              </b-radio>
            </b-field>
            <b-field>
              <b-radio v-model="reservationMode"
                       native-value="multiple"
                       type="is-info">
                Je réserve pour plusieurs personnes*
              </b-radio>
            </b-field>

            <b-field>
              <div>
                <div v-if="selectedRoom.letter"><p>Cette chambre <strong>fait partie d'un appartement</strong>. La salle de bain est donc commune aux 2 ou 3 chambres.</p></div>
                <div v-else></div>
              </div>
            </b-field>

            <b-field label="N° SCIPER séparés par des virgules" v-if="reservationMode==='multiple'" :type="{'is-success':false, 'is-danger':true}" message="Liste invalide">
              <b-input
                  placeholder="123456,123456,123456"
                  required>
              </b-input>
            </b-field>

            <b-field v-if="reservationMode==='multiple'">
              <p>* : Toutes les personnes dans la liste des SCIPER doivent être au courant avant la réservation. Merci de <strong>vérifier les SCIPER</strong> avant de réserver.</p>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <b-button
                label="Fermer"
                @click="closeModal" />
            <b-button
                label="Réserver"
                disabled=""
                type="is-primary" />
            <span><em>Réservations à partir de Mardi 12h</em></span>
          </footer>
        </div>
      </form>
    </b-modal>

  </div>
</template>

<script>
import {mapState} from "vuex";
import {ToastProgrammatic as Toast} from 'buefy';

export default {
  name: 'RoomReservationStep',
  components: {},
  data: () => ({
    currentRoom: 4,
    modalRoomReservationActive: false,
    selectedRoom: {},
    reservationMode: 'single',
    chalets: [
      {
        id: 1,
        rooms: [
          {
            number: 1,
            letter: '',
            capacity: 4,
            usedSlots: 1,
            available: true,
            mixed: false,
          },
          {
            number: 2,
            letter: '',
            capacity: 4,
            usedSlots: 4,
            available: false,
            mixed: true,
          },
          {
            number: 3,
            letter: '',
            capacity: 4,
            usedSlots: 4,
            available: false,
            mixed: false,
          },
          {
            number: 4,
            letter: '',
            capacity: 4,
            usedSlots: 3,
            available: true,
            mixed: false,
          },
          {
            number: 5,
            letter: '',
            capacity: 4,
            usedSlots: 4,
            available: false,
            mixed: false,
          },
          {
            number: 6,
            letter: '',
            capacity: 4,
            usedSlots: 3,
            available: true,
            mixed: false,
          },
          {
            number: 7,
            letter: '',
            capacity: 4,
            usedSlots: 4,
            available: false,
            mixed: false,
          },
          {
            number: 8,
            letter: '',
            capacity: 4,
            usedSlots: 3,
            available: true,
            mixed: false,
          },
          {
            number: 9,
            letter: '',
            capacity: 4,
            usedSlots: 1,
            available: true,
            mixed: false,
          },
          {
            number: 10,
            letter: '',
            capacity: 4,
            usedSlots: 3,
            available: true,
            mixed: false,
          },
          {
            number: 12,
            letter: 'a',
            available: true,
            mixed: true,
            capacity: 2,
            usedSlots: 1,
          },
          {
            number: 12,
            letter: 'b',
            available: true,
            mixed: true,
            capacity: 2,
            usedSlots: 0,
          },
          {
            number: 12,
            letter: 'c',
            available: true,
            mixed: true,
            capacity: 1,
            usedSlots: 0,
          },
        ]
      },
      {
        id: 2,
        rooms: [
          {
            number: 15,
            
            capacity: 4,
            usedSlots: 0,
            available: true,
            mixed: true,
          },
          {
            number: 16,
            
            capacity: 4,
            usedSlots: 1,
            available: true,
            mixed: true,
          },
          {
            number: 17,
            
            capacity: 4,
            usedSlots: 0,
            available: true,
            mixed: false,
          }
        ]
      },
      {
        id: 3,
        rooms: [
          {
            number: 41,
            
            capacity: 2,
            usedSlots: 0,
            available: true,
            mixed: true,
          },
          {
            number: 42,
            
            capacity: 2,
            usedSlots: 0,
            available: true,
            mixed: true,
          },
          {
            number: 43,
            
            capacity: 4,
            usedSlots: 0,
            available: true,
            mixed: true,
          },
          {
            number: 44,
            
            capacity: 4,
            usedSlots: 0,
            available: true,
            mixed: true,
          }
        ]
      }
    ]
  }),
  computed: {

    ...mapState({})
  },
  props: {},
  methods: {
    previousStep() {
      this.$emit('previous');
    },
    selectRoom(room) {
      if (room.available) {
        this.selectedRoom = room;
        this.selectedRoom.roomId = room.number + (''||room.letter);
        this.modalRoomReservationActive = true;
      } else {
        Toast.open({
          message: "Cette chambre n'est pas disponible",
          type: 'is-danger',
          position: 'is-top',
        });
      }
    },
    closeModal() {
      this.modalRoomReservationActive = false;
    }
  }
}
</script>

<style scoped>

.chalets {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
}

.chalet {

}

.room {
  display: flex;
  flex-direction: row;
}

.room.unavailable {
  color: #b9b9b9;
  cursor: not-allowed;
}

.room.current {
  color: #177def;
}

</style>
