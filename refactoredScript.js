const inputDistance=document.querySelector('.distanceInp')
const inputDuration=document.querySelector('.durationInp')
const inputCadence=document.querySelector('.cadenceInp')
const inputElevation=document.querySelector('.elevationInp')

class Workout{
    date=new Date();
    id=(Date.now() +'').slice(-10)

    constructor(coords,distance,duration){
        this.distance=distance;
        this.duration=duration;
        this.coords=coords;
        

    }
    _setDescription(){
        const months=['January','February','March','April','May','June','July','August','September','October','November','December']

        this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`

    }
}

class Running extends Workout{
    type="running"
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration);
        this.cadence=cadence
        this.calcPace();
        this._setDescription()
     }

    calcPace(){
        this.pace=this.duration/ this.distance;
        return this.pace
    }
    
}

class Cycling extends Workout{
    type="cycling"
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration);
        this.elevation=elevation;
        this.calcSpeed();
        this._setDescription();
        
    }
    calcSpeed(){
        this.speed=this.distance/(this.duration/60)
        return this.speed
    }
    
}





class App{
    #map;
    #mapEvent;
    #workouts=[]

    constructor(){
        //Get users position
        this._getPosition();

        //Get data from local storage
        this._getLocalStorage();

        //Attach Event Listeners
        document.querySelector('.workout-form').addEventListener('submit',this._newWorkout.bind(this))
        document.querySelector('.select').addEventListener('change',this._toggleElevationField)
        document.querySelector('.workoutlist').addEventListener('click',this._moveToPop.bind(this))
    }

    

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){alert("Didn't get the position")})

    }

    _loadMap(position){
        const {latitude}=position.coords
        const {longitude}=position.coords 
        const coords=[latitude,longitude]

        //Leaflet Library
    
         this.#map = L.map('map_div'/* id of the div*/).setView(coords /*lattitude and longitude list*/, 13/*Zoom rate*/);
    
   
   
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

       this.#map.on('click',this._showForm.bind(this))
    
        this.#workouts.forEach(work=>{
            this._renderWorkoutMarker(work);
        })
    }



    _showForm(mapE){
            this.#mapEvent=mapE;
            // console.log(mapEvent)//Gives the lat and long at the point we click
            const {lat,lng}=this.#mapEvent.latlng
            document.querySelector('.workout-form').classList.remove('hidden');
            document.querySelector('.distanceInp').focus()
    }
    _toggleElevationField(){
        inputElevation.closest('.form-row').classList.toggle('hidden')
        inputCadence.closest('.form-row').classList.toggle('hidden')
    }
    _newWorkout(e){
                e.preventDefault()
                const validInputs=(...input)=>input.every(inp=>Number.isFinite(inp))
                const allPositive=(...inputs)=>inputs.every(inp=>inp>0)
                const{lat,lng}=this.#mapEvent.latlng
                let workout;
                

                //Get Data from form
                const type=document.querySelector('.select').value;
                const distance= +inputDistance.value //+ converts string to number
                const duration=+inputDuration.value

                //If workout running, create running object
                if(type==="running"){
                    const cadence=+inputCadence.value
                    //Check if data is valid
                    if(
                       // !Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence))
                        !validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence)){
                            return alert("Inputs have to be Positive numbers")
                        }
                        workout=new Running([lat,lng],distance,duration,cadence)
                            
                    
                    
                        }

                //If workout cycling, create cycling object
                if(type==="cycling"){
                    const elevation=+inputElevation.value
                    if(!validInputs(distance,duration,elevation) || !allPositive(distance,duration)){
                        return alert("Inputs have to be Positive numbers")
                    }
                    workout=new Cycling([lat,lng],distance,duration,elevation)

                }


                //Add new object to workout array
                this.#workouts.push(workout)
                console.log(this.#workouts)


                //Render workout on map as marker
                
                this._renderWorkoutMarker(workout)

                //Render workout on form
                this._renderWorkout(workout)

                //To hide things 
                this._hideMap()

                //Set local storage

                this._setLocalStorage();
    
               
                
            }
            _renderWorkout(workout){
                let html=`
                <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                  <span class="workout__icon">${
                      workout.type==="running" ? '🏃‍♂️' : '🚴‍♀️'
                  }</span>
                  <span class="workout__value"${workout.distance}</span>
                  <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⏱</span>
                  <span class="workout__value">${workout.duration}</span>
                  <span class="workout__unit">min</span>
                </div>`;

                if(workout.type==="running"){
                    html+=`<div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                  </div>
                  <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                  </div>
                </li>`
                }
                if(workout.type==="cycling"){
                    html+=`<div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value"${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                  </div>
                  <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevation}</span>
                    <span class="workout__unit">m</span>
                  </div>
                </li`
                }
                document.querySelector('.workout-form').insertAdjacentHTML('afterend',html);

            }

            _renderWorkoutMarker(workout){
              
                

                L.marker(workout.coords).addTo(this.#map ).bindPopup(L.popup({
                    maxWidth:250,
                    minWidth:100,
                    autoClose:false,
                    closeOnClick:false,
                    className:`${workout.type }-popup`
                })
                ).setPopupContent(`${ workout.type==="running" ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`).openPopup();

            }

            _hideMap(){
                //ClearInput Fields
                inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value=''
                document.querySelector('.workout-form').classList.add('hidden')
            }

            _moveToPop(e){
                const workoutEl=e.target.closest('.workout')
                
                if(!workoutEl) return;

                const workout=this.#workouts.find(work=>work.id===workoutEl.dataset.id)

                this.#map.setView(workout.coords,13,{ //To focus on the clicked pointer 
                    animate:true,    
                    pan:{duration:1}
                })

            }

            _setLocalStorage(){ //localstorage is an api with set item requiring 2 arguments - the first one should be the key and second one must be the value of that key in string format
                localStorage.setItem('workouts',JSON.stringify(this.#workouts))

            }

            _getLocalStorage(){
                const data=JSON.parse(localStorage.getItem('workouts'))
                if(!data) return;

                this.#workouts=data;

                this.#workouts.forEach(work=>{
                    this._renderWorkout(work) /*This will fetch and show the form */
                    //Loading marker code is placed under loadMap section so that it works properly
                })
            }

            reset(){
                localStorage.removeItem('workouts'); //To remove the key-value workouts from local storage
                location.reload() //Reloads the page
            }

}

const app=new App();

//app.reset() - Removes the local storage files