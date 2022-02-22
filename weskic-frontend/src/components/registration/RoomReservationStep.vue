<template>
  <div class="">
    <hr>
    <p>Location de matériel : comme précisé dans le mail, vous pouvez louer du matériel avec un formulaire. <a
        @click="previousStep">Plus d'infos ici</a></p>
    <br>

    <h2 class="subtitle" style="margin-bottom: 0;">Réservation des chambres</h2>
    <h5 class="subtitle" style="font-size: 12pt;">-> Support rapide et questions fréquentes sur <a
        href="https://t.me/+Cb5FPBcnpM1iYjE8" target="_blank">le chat Telegram du WESKIC</a></h5>

    <ul>
      <li>Chambres : notées <i class="fas fa-door-closed" aria-hidden="true"></i>, 1 sanitaire par chambre</li>
      <li>Appartements : notés <i class="fas fa-bed" aria-hidden="true"></i>, plusieurs chambres communicantes et 1
        sanitaire par appartement.
      </li>
    </ul>
    <br>

    <b-button @click="refresh" class="is-small">Actualiser</b-button>
    <hr>

    <b-notification v-if="currentRoomNumber > 0" type="is-success" has-icon :closable="false">
      Vous avez réservé la <strong>chambre n°{{ currentRoomNumber + currentRoomLetter }}</strong>.
      <br>
      <a @click="cancelRoomReservation">Annuler ma réservation</a>
    </b-notification>

    <div class="chalets">
      <div class="panel is-info chalet" v-for="chalet of rooms.chalets" v-bind:key="chalet.id">
        <p class="panel-heading"><i class="fas fa-home" aria-hidden="true"></i> Chalet n°{{ chalet.id }}</p>

        <a :class="{'panel-block': true, room: true, unavailable: !room.available, current: room.number===currentRoomNumber&&room.letter===currentRoomLetter}"
           v-for="room of chalet.rooms" v-bind:key="'r'+room.number+(''||room.letter)" @click="selectRoom(room)">
          <span class="panel-icon">
            <i :class="{fas: true, 'fa-door-closed': !room.letter, 'fa-bed': room.letter}" aria-hidden="true"></i>
          </span>
          <span v-if="room.letter">Ch. <strong>{{ room.number + room.letter }}</strong></span>
          <span v-else>Ch. <strong>{{ room.number }}</strong></span>
          <span style="margin-left: 10px;">
            <i class="fas fa-circle" aria-hidden="true" v-for="n in room.usedSlots" v-bind:key="'c1-'+n"></i>
            <i class="far fa-circle" aria-hidden="true" v-for="n in (room.capacity - room.usedSlots)"
               v-bind:key="'c2-'+n"></i>
            <b-tag style="margin-left: 5px;" v-if="room.mixed">Mixte</b-tag>
          </span>
        </a>
      </div>
    </div>


    <b-modal v-model="modalRoomReservationActive" :width="640">
      <form action="">
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Réservation de {{ selectedRoom.letter ? 'l\'appartement' : 'la chambre' }}
              n°{{ selectedRoom.roomId }}</p>
            <button
                type="button"
                class="delete"
                @click="closeModal"/>
          </header>
          <section class="modal-card-body">
            <div v-if="selectedRoom.usedSlots===0">
              <b-field label="Vous êtes le premier membre : ">
                <b-radio v-model="mixedRoom" native-value="mixed">
                  Laisser la chambre en mixte
                </b-radio>
              </b-field>
              <b-field>
                <b-radio v-model="mixedRoom" native-value="gendered">
                  Définir comme chambre non-mixte
                </b-radio>
              </b-field>
              <hr>
            </div>

            <b-field>
              <b-radio v-model="reservationMode" native-value="single">
                Je réserve cette chambre pour moi
              </b-radio>
            </b-field>
            <b-field>
              <b-radio v-model="reservationMode" native-value="multiple" type="is-info">
                Je réserve pour plusieurs personnes*
              </b-radio>
            </b-field>

            <b-field>
              <div>
                <div v-if="selectedRoom.letter"><p>Cette chambre <strong>fait partie d'un appartement</strong>. La salle
                  de bain est donc commune aux 2 ou 3 chambres.</p></div>
                <div v-else></div>
              </div>
            </b-field>
            <b-field label="N° SCIPER des autres personnes séparés par des virgules"
                     v-if="reservationMode==='multiple'">
              <b-input
                  placeholder="123456,123456,123456" v-model="scipers"
                  type="text" required pattern="^\d{6}(,\d{6})*$" validation-message="Liste invalide">
              </b-input>
            </b-field>

            <b-field v-if="reservationMode==='multiple'">
              <p>* : Marche aussi pour les appartements (ex 5 SCIPER dans un appart. 2+4). Merci
                de <strong>vérifier les SCIPER</strong> avant de réserver.</p>
            </b-field>
          </section>
          <footer class="modal-card-foot">
            <b-button
                label="Fermer"
                @click="closeModal"/>
            <b-button
                label="Réserver"
                :disabled="!modalRoomReservationButtonEnabled"
                @click="reserve"
                type="is-primary"/>
            <span v-if="!openingDateCheck"><em>Réservations à partir de Mardi 12h</em></span>
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
    modalRoomReservationActive: false,
    selectedRoom: {},
    reservationMode: 'single',
    mixedRoom: '',
    scipers: '',
  }),
  computed: {
    modalRoomReservationButtonEnabled: function () {
      return this.openingDateCheck && this.mixedRoom !== '';
    },
    ...mapState({
      rooms: state => state.rooms,
      currentRoomNumber: state => state.userData.step4.roomNumber,
      currentRoomLetter: state => state.userData.step4.roomLetter,
      openingDateCheck: state => {
        if (state.rooms.openingDate === '') return false;
        const opening = new Date(state.rooms.openingDate);
        const now = new Date();
        return opening - now <= 0;
      },
    })
  },
  props: {},
  methods: {
    previousStep() {
      this.$emit('previous');
    },
    refresh() {
      this.$store.dispatch('getRooms').then(res => {
        if (res.success) {
          Toast.open({
            message: 'Liste des chambres à jour',
            type: 'is-success',
            position: 'is-top'
          });
        } else {
          Toast.open({
            message: 'Error lors de la mise à jour des chambres',
            type: 'is-danger',
            position: 'is-top'
          })
        }
      });
    },
    selectRoom(room) {
      if (this.currentRoomNumber > 0) return;
      if (room.available) {
        this.selectedRoom = room;
        this.selectedRoom.roomId = room.number + ('' || room.letter);
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
      setTimeout(function(){
        this.selectedRoom = {};
        this.mixedRoom = '';
        this.reservationMode = 'single';
        this.scipers = '';
      }, 100);
    },
    reserve() {
      if (this.reservationMode === 'multiple' && !this.scipers.match(/^\d{6}(,\d{6})*$/g)) return;
      let scipers = this.reservationMode === 'multiple' ? this.scipers : '';
      if (!scipers.includes(this.$store.state.userData.info.sciper)) scipers = this.$store.state.userData.info.sciper + (scipers.length ? (',' + scipers) : '');
      this.$store.dispatch('reserveRoom',
          {
            scipers,
            mixedRoom: this.mixedRoom,
            number: this.selectedRoom.number,
            letter: this.selectedRoom.letter
          }).then(() => {
        this.closeModal();
        Toast.open({
          message: "Chambre " + this.selectedRoom.number + this.selectedRoom.letter + " réservée !",
          type: 'is-success',
          position: 'is-top',
        })
      }).catch(response => {
        console.error(response);
        Toast.open({
          message: "La chambre n'a pas pu être réservée ...",
          type: 'is-danger',
          position: 'is-top',
        });
      });
    },
    cancelRoomReservation() {
      this.$store.dispatch('reserveRoom', {
        sciper: this.$store.state.userData.info.sciper,
        mixedRoom: '',
        number: -1,
        letter: ''
      }).then(() => {
        Toast.open({
          message: "Réservation annulée",
          type: 'is-warning',
          position: 'is-top',
        })
      }).catch(response => {
        console.error(response);
        Toast.open({
          message: "La réservation n'a pas pu être annulée ...",
          type: 'is-danger',
          position: 'is-top',
        });
      });
    }
  },
  mounted() {
    this.$store.dispatch('getRooms');
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
