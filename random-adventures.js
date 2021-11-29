var randomAdventures = new Vue({
    el: "#app",
    data: {
      coord: {
        current: {
          lat: null,
          long: null
        },
        random: {
          lat: null,
          long: null
        }
      },
      mapKey: null, 
      mapUrl: null,
      mapZoom: 16,
      alert: {
        message: null,
        class: 'alert-primary'
      },
      distanceKM: 0
    },
    mounted(){
      if(localStorage.getItem('mapKey')){
        this.mapKey = localStorage.getItem('mapKey')
      } else {
        this.alert.message = `Please enter your Google Maps API key!`
      }
      if(localStorage.getItem('coord')){
        this.coord = JSON.parse(localStorage.getItem('coord'))
        this.setCurrentLocation()
        this.saveLocation()
        this.updateMap()
        this.updateDistance()
      } else {
        this.newAdventure()
      }
      console.log(this.getDistanceFromLatLonInKm(this.coord.current.lat, this.coord.current.long, this.coord.random.lat, this.coord.random.long))
    },
    watch: {
      mapKey(){
        localStorage.setItem('mapKey', this.mapKey)
      }
    },
    methods: {
      newAdventure(){
        this.setCoords()
        localStorage.setItem('coord', JSON.stringify(this.coord))
        let randCoord = `${this.coord.random.lat},${this.coord.random.long}`
        let currentCoord = `${this.coord.current.lat},${this.coord.current.long}`
        this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${randCoord}&markers=color:green%7C${currentCoord}&size=540x400&sensor=false&key=${this.mapKey}`
      },
      setCoords(){
        this.setCurrentLocation()
        this.setRandomLocation()
      },
      setCurrentLocation(){
        // Check for technology
        if (navigator.geolocation) {    
            navigator.geolocation.getCurrentPosition((position) => {
              //Set current position
              this.coord.current.lat = position.coords.latitude,
              this.coord.current.long = position.coords.longitude
          })
        } else {
         this.alert.message = "Geolocation is not supported by this browser."
        }
      },
      setRandomLocation(){
        // Select random position within 1 mile.
        let mile = 0.01449275362
        let latOffset = (Math.random() * mile) - (mile / 2)
        let longOffset = (Math.random() * mile) - (mile / 2)
        this.coord.random.lat = coord.current.lat + latOffset
        this.coord.random.long = coord.current.long + longOffset
      },
      saveLocation(){
        localStorage.setItem('coord', JSON.stringify(this.coord))
      },
      updateMap(){
        this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${this.coord.random.lat},${this.coord.random.long}&markers=color:green%7C${this.coord.current.lat},${this.coord.current.long}&size=540x400&sensor=false&key=${this.mapKey}`
      },
      checkArrivalStatus(){
        this.updateDistance()
        if(this.distanceKM <= 0.1){
          alert("Congratulations! You made it a random location.")
        }
      },
      getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
      },
      deg2rad(deg) {
        return deg * (Math.PI/180)
      },
      updateDistance(){
        this.distanceKM = this.getDistanceFromLatLonInKm(this.coord.current.lat, this.coord.current.long, this.coord.random.lat, this.coord.random.long)
      },
      refreshDistance(){
        this.setCurrentLocation()
        this.updateDistance()
      },
      refreshMap(){
        this.refreshDistance()
        this.updateMap()
      },
      update(){
        this.refreshMap()
        this.checkArrivalStatus()
      }
    }
})