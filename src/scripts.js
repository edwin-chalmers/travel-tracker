// This is the JavaScript entry file - your code begins here
// Do not delete or rename this file ********

// An example of how you tell webpack to use a CSS (SCSS) file
import './css/styles.scss';

// An example of how you tell webpack to use an image (also need to link to it in the index.html)
import './images/turing-logo.png' //******** */
import {
    displayPastTrips, 
    displayFinalCost, 
    pastTrips,
    pendingTrips,
    upcomingTrips,
    addTrips,
    changePageTitle,
    addDefaultButtonStyling,
    hideTripsDiv,
    displayDestinationsInList,
    populateConfirmTripRequest,
    displayErrorMessage,
    displayNewTripConfirm,
    goBackAddTrip
} from './domUpdates'
import {fetchData} from './apiCalls'

var username = document.getElementById('username')
var password = document.getElementById('pass')
var login = document.getElementById('login')
const loginBox = document.getElementById('loginBox')
const pastButton = document.getElementById('pastButton')
const pendingButton = document.getElementById('pendingButton')
const upcomingButton = document.getElementById('upcomingButton')
const addButton = document.getElementById('addButton')
const navButtons = document.querySelector('.nav-buttons')
const dashTitle = document.getElementById('dashTitle')
const confirmTripBtn = document.getElementById('confirmTripBtn')
const addTripInputs = {
    startDate: document.getElementById('tripStartInput'),
    tripDuration: document.getElementById('tripDurationInput'),
    travelers: document.getElementById('numTravelersInput'),
    destinations: document.getElementById('destinationSelect'),
}
const goBackBtn = document.getElementById('goBackBtn')
const addTripBtn = document.getElementById('addTripBtn')

let destList = []
let newTrip = {
    id: `<number>`, 
    userID: `<number>`, 
    destinationID: `<number>`, 
    travelers: `<number>`, 
    date: `<string 'YYYY/MM/DD'>`, 
    duration: `<number>`, 
    status: "pending", 
    suggestedActivities: []
}

function getTripData(userId) {
    Promise.all([fetchData('trips'), fetchData('destinations')])
    .then(([trips, destinations]) => {
        // --- past trips 

        let chronologicalDates = sortDataById(trips, userId).map(trip => trip.date).sort((a, b) => new Date(b) - new Date(a))
        let tripList = sortDataById(trips, userId).sort((a, b) => a.destinationID - b.destinationID)
        let tripLocations = getDestinationsByIds(destinations, tripList)
        let tripsThisYear = getTripsThisYear(tripList)
        let finalCost = getFinalCost(destinations, tripsThisYear)

        // --- new trips object
        newTrip.id = getMostRecentTripId(trips) + 1
        newTrip.userID = userId

        // --- add trips
        populateDestList(destinations)



        
        // --- dom updates
        displayPastTrips(chronologicalDates, tripLocations)
        displayFinalCost(finalCost)
        displayDestinationsInList(destinations)
        // populateTripConfirmation(destinations)
        
        console.log('newTrip', newTrip)
        console.log('destinations',destinations.destinations)
        console.log('tripList', tripList)
        console.log('trips', trips)
        console.log('tripLocations', tripLocations)
    })
    .catch(error => console.error("Error loading data:", error));
}
console.log('destList', destList)


// ------- event listeners ------- //

document.addEventListener("DOMContentLoaded", () => {
    username.value = ''
    password.value = ''
    addTripInputs.tripDuration.value = ''
    addTripInputs.travelers.value = ''
})

login.addEventListener("click", () => {
    console.log(username.value)
    console.log(password.value)
    getTripData(parseUserId(username.value))
    loginBox.classList.add('hidden')
    username.value = ''
    password.value = ''
})

confirmTripBtn.addEventListener("click", (e) => {
    e.preventDefault()
    
    if (displayErrorMessage()) {
        let dateValue = replaceDashes(addTripInputs.startDate.value)
        let destName = getDestinationNameById()
        let finalCostValue = calculateNewTrip()
        populateConfirmTripRequest(dateValue, finalCostValue, destName)
        displayNewTripConfirm()
    }
})

goBackBtn.addEventListener("click", () => {
    goBackAddTrip()
})

addTripBtn.addEventListener("click", () => {
    populateNewTrip()
    console.log(' populateNewTrip',newTrip)
    // add trip
        // POST trip information
        // bring user to pening trips page
})

// ----- button transitions -----

pastButton.addEventListener("click", () => {
    addDefaultButtonStyling()
    pastButton.classList.add('selected-button')
    hideTripsDiv()
    changePageTitle('past')
    pastTrips.classList.remove('hidden')
})

pendingButton.addEventListener("click", () => {
    addDefaultButtonStyling()
    pendingButton.classList.add('selected-button')
    hideTripsDiv()
    changePageTitle('pending')
    pendingTrips.classList.remove('hidden')
})

upcomingButton.addEventListener("click", () => {
    addDefaultButtonStyling()
    upcomingButton.classList.add('selected-button')
    hideTripsDiv()
    changePageTitle('upcoming')
    upcomingTrips.classList.remove('hidden')
})

addButton.addEventListener("click", () => {
    addDefaultButtonStyling()
    addButton.classList.add('selected-button')
    hideTripsDiv()
    changePageTitle('add')
    addTrips.classList.remove('hidden')
})


// ----- login -----

function parseUserId(username) {
    return Number(username.replace('traveler', ''))
}

function sortDataById(data, userId) {
    return data.trips.filter(data => data.userID === userId && data.status === "approved")
}

// ----- populate page -----


function getDestinationsByIds(data, destIds) {
    let destArray = []
    destIds.forEach(id => {
        data.destinations.forEach(dest => {
         if (dest.id === id.destinationID) {
            destArray.push(dest)
         }
        })
    })
    return destArray
}

function getTripsThisYear(tripList) {
    let tripsThisYear = []
    tripList.forEach(trip => {
        if (trip.date.includes(tripList[0].date.slice(0, 4))) {
            tripsThisYear.push(trip)
        }
    })
    return tripsThisYear
}

function getFinalCost(data, tripsThisYear) {
    let finalCost = 0
    tripsThisYear.forEach(id => {
        data.destinations.forEach(dest => {
            if (dest.id === id.destinationID) {
                let tripTotal = ((id.travelers) + dest.estimatedLodgingCostPerDay) * 1.1
                finalCost += tripTotal
            }
        })
    })
    return finalCost.toFixed(2)
}

function replaceDashes(date) {
    return date.replace(/-/g, '/')
  }

function calculateNewTrip() {
    let tripToal = 0
    let destId = parseInt(addTripInputs.destinations.value)
    let tripDuration = parseInt(addTripInputs.tripDuration.value) 
    let travelers = parseInt(addTripInputs.travelers.value) 
    let selectDest = destList.find(dest => dest.id === destId);
    
    tripToal += selectDest.estimatedLodgingCostPerDay * tripDuration
    tripToal += selectDest.estimatedFlightCostPerPerson * travelers
    return tripToal
}

function getDestinationNameById() {
    let destId = parseInt(addTripInputs.destinations.value)
    let destination = destList.find(dest => dest.id == destId);
    return destination.destination
}

function populateDestList(destData) {
    destList = destData.destinations
}

function getMostRecentTripId(tripsData) {
    return tripsData.trips.length
}

function populateNewTrip() {
    newTrip.destinationID = addTripInputs.destinations.value
    newTrip.travelers = addTripInputs.travelers.value
    newTrip.date = replaceDashes(addTripInputs.startDate.value)
    newTrip.duration = addTripInputs.tripDuration.value
}

getTripData(40)
