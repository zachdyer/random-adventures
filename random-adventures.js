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
      distanceKM: 0,
      maxDistance: 1, // KM
      minDistance: 0.1,
      miles: false
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
      if(localStorage.getItem('maxDistance')) this.maxDistance = parseInt(localStorage.getItem('maxDistance'), 10)
      if(localStorage.getItem('minDistance')) this.minDistance = localStorage.getItem('minDistance') * 1
    },
    watch: {
      mapKey(){
        localStorage.setItem('mapKey', this.mapKey)
      },
      maxDistance(){
        if(this.maxDistance <= this.minDistance ) this.maxDistance = this.minDistance + 0.1
        localStorage.setItem('maxDistance', this.maxDistance)
        this.maxDistance = this.maxDistance * 1
      },
      minDistance(){
        if(this.minDistance >= this.maxDistance ) this.minDistance = this.maxDistance - 0.1
        localStorage.setItem('minDistance', this.minDistance)
        this.minDistance = this.minDistance * 1
      },
    },
    methods: {
      newAdventure(){
        this.setCoords()
        localStorage.setItem('coord', JSON.stringify(this.coord))
        this.update()
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
              this.coord.current.lat = position.coords.latitude
              this.coord.current.long = position.coords.longitude
          })
        } else {
         this.alert.message = "Geolocation is not supported by this browser."
        }
      },
      setRandomLocation(){
        this.coord.random = this.generateRandomPoint(this.coord.current, ((this.maxDistance - this.minDistance) + this.minDistance) * 1000)
        if(this.checkArrivalStatus()) this.setRandomLocation()
      },
      saveLocation(){
        localStorage.setItem('coord', JSON.stringify(this.coord))
      },
      updateMap(){
        this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7C${this.coord.random.lat},${this.coord.random.long}&markers=color:blue%7C${this.coord.current.lat},${this.coord.current.long}&size=540x400&sensor=false&key=${this.mapKey}`
      },
      checkArrivalStatus(){
        this.updateDistance()
        if(this.distanceKM < 0.1){
          return true
        } else {
          return false
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
      generateRandomPoint(center, radius) {
        var x0 = center.long;
        var y0 = center.lat;
        // Convert Radius from meters to degrees.
        var rd = radius/111300;
      
        var u = Math.random();
        var v = Math.random();
      
        var w = rd * Math.sqrt(u);
        var t = 2 * Math.PI * v;
        var x = w * Math.cos(t);
        var y = w * Math.sin(t);
      
        var xp = x/Math.cos(y0);
        
        // Resulting point.
        return {'lat': y+y0, 'long': xp+x0};
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
        if(this.checkArrivalStatus()){
          alert("Congratulations! You've arrived and completed your Random Adventure.")
        }
      }
    }
})