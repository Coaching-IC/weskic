import dotenv from "dotenv";
import fs from 'fs';
import fsE from 'fs-extra';
import {getLogger} from "./logger.mjs";
import userData from "./userData.mjs";

dotenv.config();

const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);

let rooms = {}; // key: sciper
let roomsDict = {};

if (fs.existsSync('data/rooms.json')) {
    rooms = fsE.readJsonSync('data/rooms.json');
    parseRooms();
} else {
    logger.info('No data/rooms.json file found, creating it ...');
    rooms = fsE.readJsonSync('lib/rooms-default.json');
    writeRooms();
    parseRooms();
}

function parseRooms() {
    roomsDict = {};
    for (let chalet of rooms.chalets) {
        for (let room of chalet.rooms) {
            roomsDict[room.number.toString() + room.letter] = room;
        }
    }
    logger.info(`[ROOMS] Loaded ${Object.keys(roomsDict).length} rooms`);
}

function writeRooms() {
    fsE.writeJson('data/rooms.json', rooms);
}

/* ----------- EXPORTED ---------- */

/**
 * @param userGender ('male', 'female')
 * @returns The client version of the rooms (hide members, mixed or not, available or not, ...)
 */
function getClientRooms(userGender) {
    if (userGender === 'male') {
        userGender = 'm';
    } else if (userGender === 'female') {
        userGender = 'f';
    } else userGender = '';

    const clientRooms = {openingDate: rooms.openingDate, chalets: []};
    for (let chalet of rooms.chalets) {
        let clientChalet = {id: chalet.id, rooms: []};
        for (let room of chalet.rooms) {
            clientChalet.rooms.push({
                number: room.number,
                letter: room.letter,
                capacity: room.capacity,
                //usedSlots: (room.gender !== '' && room.gender !== userGender) ? room.capacity : room.members.length,
                usedSlots: room.members.length,
                available: room.available && (room.gender === '' || room.gender === userGender),
                mixed: room.gender === ''
            });
        }
        clientRooms.chalets.push(clientChalet);
    }
    return clientRooms;
}

/**
 * DOES NOT SAVE TO DISK, MUST BE FOLLOWED BY ADD/REMOVE MEMBER
 */
function roomSetGender(gender, number, letter) {
    if (gender === 'male') {
        roomsDict[number.toString() + letter].gender = 'm';
    } else if (gender === 'female') {
        roomsDict[number.toString() + letter].gender = 'f';
    } else roomsDict[number.toString() + letter].gender = '';
}

function roomAddMember(sciper, number, letter) {
    const room = roomsDict[number.toString() + letter];
    if (room.members.includes(sciper)) return;
    room.members.push(sciper);
    if (room.capacity === room.members.length) {
        room.available = false;
    }
    writeRooms();
}

function roomRemoveMember(sciper, number, letter) {
    const room = roomsDict[number.toString() + letter];
    const members = room.members;
    if (room.members.includes(sciper)) members.splice(members.indexOf(sciper), 1);
    if (members.length === 0) {
        logger.info(`[ROOMS] No members remaining in room ${number}${letter}, gender reset`);
        roomSetGender('', number, letter);
    }
    if (members.length !== room.capacity) {
        room.available = true;
    }
    writeRooms();
}

function roomEmpty(number, letter) {
    return roomsDict[number.toString() + letter].members.length === 0;
}

/**
 * Update the user data with the selected room
 * @param sciper
 * @param number -1 means no room
 * @param letter '' means no letter
 * @param roomGender update the room gender ONLY IF THE ROOM WAS EMPTY, once set it cannot be modified with people inside
 * @returns a promise
 */
function updateUserRoomReservation(sciper, number, letter, roomGender) {
    return new Promise((resolve, reject) => {
        userData.setRoomReservation(sciper, number, letter).then(() => {
            if (roomEmpty(number, letter)) roomSetGender(roomGender, number, letter);
            roomAddMember(sciper, number, letter);
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}

function isRoomCompatible(number, letter, gender) {
    console.log(number, letter, roomsDict);
    const g1 = roomsDict[number.toString() + letter].gender;
    const g2 = gender === 'male' ? 'm' : 'f';
    return g1 === '' || g1 === g2;
}

function cancelReservation(sciper) {
    const ud = userData.getUserDataFromCache(sciper);
    const number = ud.step4.roomNumber;
    const letter = ud.step4.roomLetter;
    return new Promise((resolve, reject) => {
        userData.setRoomReservation(sciper, number, letter).then(() => {
            roomRemoveMember(sciper, number, letter);
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * Check if the room or the apartment (ie all the sub-rooms) has enough space.
 * @param numberOfPeople
 * @param number
 * @param letter
 */
function checkCapacity(numberOfPeople, number, letter) {
    if (letter !== '') {
        let freeSpace = 0;
        for (let roomId in roomsDict) {
            if (number.toString() === roomId.replace(/[abc]/g, '')) {
                //console.log('roomId : ', roomId);
                freeSpace += getFreeSpace(number, roomId.replace(/[1-9]*/g,''));
            }
        }
        //console.log('numberOfPeople', numberOfPeople, '   freeSpace', freeSpace);
        return numberOfPeople <= freeSpace;
    } else {
        return numberOfPeople <= getFreeSpace(number, letter);
    }
}

function getFreeSpace(number, letter) {
    const room = roomsDict[number.toString() + letter];
    //console.log(room.capacity - room.members.length);
    // console.log('room:',room);
    return room.capacity - room.members.length;
}

function roomGender(number, letter) {
    const room = roomsDict[number.toString() + letter];
    return room.gender;
}

export default {getClientRooms, isRoomCompatible, updateUserRoomReservation, cancelReservation, roomSetGender, checkCapacity, getFreeSpace, roomGender};