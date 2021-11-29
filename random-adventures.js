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
      }
    },
    mounted(){
      if(localStorage.getItem('mapKey')){
        this.mapKey = localStorage.getItem('mapKey')
      } else {
        this.alert.message = `Please enter your Google Maps API key!`
      }
      if(localStorage.getItem('coord')){
        this.coord = JSON.parse(localStorage.getItem('coord'))
        this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${this.coord.random.lat},${this.coord.random.long}&markers=color:green%7C${this.coord.current.lat},${this.coord.current.long}&size=540x400&sensor=false&key=${this.mapKey}`
      } else {
        this.alert.message = `Press the New Adventure button to get a random location within a 1 mile radius`
      }
    },
    watch: {
      mapKey(){
        localStorage.setItem('mapKey', this.mapKey)
      }
    },
    methods: {
      start(){
        // Check for technology
        if (navigator.geolocation) {    
          navigator.geolocation.getCurrentPosition((position) => {
            this.coord = this.setCoord(position)
            localStorage.setItem('coord', JSON.stringify(this.coord))
            // Draw map
            let randPosition = `${this.coord.random.lat},${this.coord.random.long}`
            let currentPosition = `${this.coord.current.lat},${this.coord.current.long}`
            this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${randPosition}&markers=color:green%7C${currentPosition}&size=540x400&sensor=false&key=${this.mapKey}`
          })
        } else {
         this.alert.message = "Geolocation is not supported by this browser."
        }
      },
      setCoord(position){
        //Set current position
        let coord = {
          current: {
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
        }
        
        // Select random position within 1 mile.
        let mile = 0.01449275362
        let latOffset = (Math.random() * mile) - (mile / 2)
        let longOffset = (Math.random() * mile) - (mile / 2)
        coord.random = {
          lat: coord.current.lat + latOffset,
          long: coord.current.long + longOffset
        }
        return coord
      }
    }
})