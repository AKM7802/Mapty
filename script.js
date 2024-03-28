
const inputDistance=document.querySelector('.distanceInp')
const inputDuration=document.querySelector('.durationInp')
const inputCadence=document.querySelector('.cadenceInp')
const inputElevation=document.querySelector('.elevationInp')





//Geolocation API -To get coordinates

// navigator.geolocation.getCurrentPosition(Success_callback_function(It has position attribute which has langitude , longitude etc.) , Error_callback_function)

navigator.geolocation.getCurrentPosition(function(position){
   // console.log(position)
    const {latitude}=position.coords
    const {longitude}=position.coords 
    const coords=[latitude,longitude]

    //Leaflet Library
    
    var map = L.map('map_div'/* id of the div*/).setView(coords /*lattitude and longitude list*/, 13/*Zoom rate*/);
    
   
   
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // //Default Marker
    // L.marker(coords).addTo(map)
    // .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    // .openPopup();
    
    //Marker 
    map.on('click',function(mapEvent){
        // console.log(mapEvent)//Gives the lat and long at the point we click
        const {lat,lng}=mapEvent.latlng
        document.querySelector('.workout-form').classList.remove('hidden');
        document.querySelector('.distanceInp').focus() //To focus on input field

        document.querySelector('.workout-form').addEventListener('submit',function(e){
            e.preventDefault()

            //ClearInput Fields
            inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value=''

            //Marker
            L.marker({lat,lng}).addTo(map).bindPopup(L.popup({
                maxWidth:250,
                minWidth:100,
                autoClose:false,
                closeOnClick:false,
                className:"running-popup"
            })
            ).setPopupContent("Workout").openPopup();
        })
       

    })


    //---------------------------------------------------------------------------------------------------------

},function(){
    alert("didn't get position")
})

//function to show elevation on cycling and cadence on running
document.querySelector('.select').addEventListener('change',function(){
    inputElevation.closest('.form-row').classList.toggle('hidden')
    inputCadence.closest('.form-row').classList.toggle('hidden')
})