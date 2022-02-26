import fetch from "node-fetch";

const origin = process.argv[2];
const mgtKey = process.argv[3];

fetch(origin + '/api/mgt/' + mgtKey + '/getRooms').then(response => {
    response.text().then(text => {
        const rooms = JSON.parse(text);

        for (let chalet of rooms.chalets) {
            console.log('\n______________')
            console.log('Chalet n°'+chalet.id);
            console.log('______________')
            const chaletRooms = chalet.rooms;

            for (let room of chaletRooms) {
                let log = "Chambre " + room.number + room.letter + ' - ';
                for (let i = 0; i < room.members.length; i++) log += `\u2713`;
                for (let i = 0; i < room.capacity - room.members.length; i++) log += `\u23FA`;
                log += '   -   '
                for (let sciper of room.members) log += sciper+' ';

                if (room.gender !== '') log += '   ' + room.gender.toUpperCase();

                console.log(log);
            }

            console.log('______________\n');
        }
    });
});